import nodemailer from "nodemailer";

import { QstashServiceConfig } from "@workspace/lib/qstash";

import { MailService } from "./MailService";
import type { MailhogMailConfig } from "./types";

export class MailhogMail extends MailService {
  constructor(
    private readonly mailHogConfig: MailhogMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(mailHogConfig, qstashConfig);
  }

  protected async createTransporter() {
    const transporter = nodemailer.createTransport({
      host: this.mailHogConfig.host,
      port: this.mailHogConfig.port,
      secure: false,
      ignoreTLS: true,
    });

    await transporter.verify();

    return transporter;
  }
}
