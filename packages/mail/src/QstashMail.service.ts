import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

import {
  IQstashService,
  QstashError,
  QstashService,
  QstashServiceConfig,
} from "@workspace/lib/qstash";

import { MailError } from "./MailError";
import type {
  MailCallbackPayload,
  MailSendResult,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
  TransporterType,
} from "./types";

export interface IQstashMailService extends IQstashService {
  sendMail(
    options: SendMailOption,
    metadata?: {
      createdBy?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<QstashMailResult>;
  processMailCallback(
    payload: MailCallbackPayload,
    context: {
      messageId: string;
    }
  ): Promise<MailSendResult>;
  handleMailReceipt(
    messageId: Parameters<IQstashService["handleDeliveryReceipt"]>[0]
  ): Promise<void>;
  retryMail(messageId: string): Promise<QstashMailResult>;
}

export abstract class QstashMailService
  extends QstashService
  implements IQstashMailService
{
  private readonly qstashMailConfig: QstashMailConfig & {
    dedupWindowSeconds: number;
  };
  protected transporter: nodemailer.Transporter<TransporterType> | null = null;

  protected abstract createTransporter(): Promise<
    nodemailer.Transporter<TransporterType>
  >;

  protected async ensureTransporter(): Promise<
    nodemailer.Transporter<TransporterType>
  > {
    if (!this.transporter) {
      this.transporter = await this.createTransporter();
    }
    return this.transporter;
  }

  constructor(
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(qstashConfig);
    this.qstashMailConfig = this.normalizeQstashMailConfig(qstashMailConfig);

    this.registerCallbackHandler<MailCallbackPayload>(
      "mail",
      this.processMailCallback.bind(this)
    );
    this.registerReceiptHandler("mail", this.handleMailReceipt.bind(this));
  }

  private normalizeQstashMailConfig(
    config: QstashMailConfig
  ): QstashMailConfig & {
    dedupWindowSeconds: number;
  } {
    return {
      ...config,
      dedupWindowSeconds: config.dedupWindowSeconds ?? 300,
    };
  }

  private generateMailDedupKey(options: SendMailOption): string {
    const to = Array.isArray(options.to)
      ? [...options.to].sort().join(",")
      : options.to;
    return this.generateDedupKey(`mail:${to}|${options.subject}`, "mail");
  }

  private async checkMailRateLimit(recipient: string) {
    const [minute, hour] = await Promise.all([
      this.qstashMailConfig.minRatelimit.limit(recipient),
      this.qstashMailConfig.hourRatelimit.limit(recipient),
    ]);

    const firstFailure = [minute, hour].find((r) => !r.success);
    if (firstFailure) {
      throw new MailError(
        `Rate limit exceeded. Resets at ${new Date(
          firstFailure.reset * 1000
        ).toISOString()}`,
        "MAIL_RATE_LIMITED",
        429
      );
    }
  }

  private toMailCallbackPayload(
    options: SendMailOption,
    messageId: string,
    deduplicationId: string,
    metadata?: { createdBy?: string; ipAddress?: string; userAgent?: string }
  ): MailCallbackPayload {
    return {
      ...options,
      messageId,
      deduplicationId,
      to: options.to,
      subject: options.subject,
      from: `"${this.qstashMailConfig.appName}" <${this.qstashMailConfig.fromEmail}>`,
      ...metadata,
    };
  }

  private extractPrimaryRecipient(to: SendMailOption["to"]): string {
    const recipient = Array.isArray(to) ? to[0] : to;
    if (!recipient) {
      throw new MailError(
        "No valid recipient provided",
        "MAIL_RECIPIENT_INVALID",
        400
      );
    }
    return recipient;
  }

  private async isDuplicate(key: string): Promise<boolean> {
    return (await this.qstashMailConfig.redisClient.get(key)) !== null;
  }

  private async markProcessed(key: string, value: string): Promise<void> {
    await this.qstashMailConfig.redisClient.set(key, value, {
      ex: this.qstashMailConfig.dedupWindowSeconds,
    });
  }

  public async sendMail(
    options: SendMailOption,
    metadata?: { createdBy?: string; ipAddress?: string; userAgent?: string }
  ): Promise<QstashMailResult> {
    try {
      if (!options.html && !options.text) {
        throw new MailError(
          "Either 'html' or 'text' must be provided",
          "MAIL_INVALID_PAYLOAD",
          400
        );
      }

      const recipient = this.extractPrimaryRecipient(options.to);

      await this.checkMailRateLimit(recipient);

      const dedupKey = this.generateMailDedupKey(options);
      const isDuplicate = await this.isDuplicate(dedupKey);

      if (isDuplicate) {
        throw new MailError(
          "Duplicate email suppressed within dedup window.",
          "MAIL_DUPLICATE_SUPPRESSED",
          409
        );
      }

      const emailPayload = this.toMailCallbackPayload(
        options,
        "",
        "",
        metadata
      );
      const { messageId, deduplicationId } =
        await this.publish<MailCallbackPayload>({
          url: this.qstashMailConfig.callbackUrl,
          body: emailPayload,
          callback: this.qstashMailConfig.receiptCallbackUrl,
          failureCallback: this.qstashMailConfig.failureCallbackUrl,
          routeKey: "mail",
        });

      await Promise.all([
        this.markProcessed(dedupKey, messageId),
        this.updateMessage(messageId, {
          deduplicationId,
        }),
      ]);

      return { success: true, messageId, deduplicationId };
    } catch (err) {
      if (err instanceof MailError || err instanceof QstashError) throw err;

      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }

  public async processMailCallback(
    payload: MailCallbackPayload,
    context: { messageId: string }
  ): Promise<MailSendResult> {
    try {
      await this.sendDirectMail(payload);
      return { success: true };
    } catch (error) {
      throw new MailError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId: context.messageId }
      );
    }
  }

  public async handleMailReceipt(
    messageId: Parameters<IQstashService["handleDeliveryReceipt"]>[0]
  ): Promise<void> {
    await this.handleDeliveryReceipt(messageId, "mail");
  }

  public async retryMail(messageId: string): Promise<QstashMailResult> {
    try {
      const result = await this.retryMessage(messageId, {
        routeKey: "mail",
      });
      return {
        success: true,
        messageId: result.messageId,
        deduplicationId: result.deduplicationId,
      };
    } catch (err) {
      if (err instanceof QstashError || err instanceof QstashError) {
        throw err;
      }
      throw new MailError(
        err instanceof Error ? err.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId }
      );
    }
  }
  protected buildNodemailerOptions(options: SendMailOption): Mail.Options {
    const mailOptions: Mail.Options = {
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
      amp: options.amp,
      icalEvent: options.icalEvent,
      headers: options.headers,
      list: options.list,
      priority: options.priority,
      attachDataUrls: options.attachDataUrls,
      inReplyTo: options.inReplyTo,

      // Service-controlled — callers cannot override
      from: `"${this.qstashMailConfig.appName}" <${this.qstashMailConfig.fromEmail}>`,
      xMailer: false,
      disableFileAccess: true,
      disableUrlAccess: false,
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }
    if (options.alternatives) {
      mailOptions.alternatives = options.alternatives;
    }

    return mailOptions;
  }

  protected async sendDirectMail(
    options: SendMailOption
  ): Promise<MailSendResult> {
    if (!options.html && !options.text) {
      return {
        success: false,
        error: "Either 'html' or 'text' must be provided.",
      };
    }

    try {
      if (!this.transporter) {
        this.transporter = await this.createTransporter();
      }
      const info = await this.transporter.sendMail(
        this.buildNodemailerOptions(options)
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.transporter = await this.createTransporter();
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Transporter verification failed:", error);
      return false;
    }
  }
}
