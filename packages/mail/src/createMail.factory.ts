import { QstashServiceConfig } from "@workspace/lib/qstash";

import { GmailMail } from "./gmail-mail";
import { MailhogMail } from "./mailhog-mail";
import { IMailService } from "./MailService";
import { GmailMailConfig, MailhogMailConfig, MailServiceConfig } from "./types";

interface MailConfig
  extends QstashServiceConfig, MailhogMailConfig, GmailMailConfig {
  isDev: boolean;
}

export function createMail(configs: MailConfig): IMailService {
  const qstashConfig: QstashServiceConfig = {
    redisClient: configs.redisClient,
    baseUrl: configs.baseUrl,
    token: configs.token,
    currentSigningKey: configs.currentSigningKey,
    nextSigningKey: configs.nextSigningKey,
    defaultQueue: configs.defaultQueue,
    defaultTopic: configs.defaultTopic,
    defaultRetries: configs.defaultRetries,
    defaultRetryDelay: configs.defaultRetryDelay,
  };

  const mailConfig: MailServiceConfig = {
    appName: configs.appName,
    supportMail: configs.supportMail,
    fromEmail: configs.fromEmail,
    callbackUrl: configs.callbackUrl,
    dedupWindowSeconds: configs.dedupWindowSeconds,
    minRatelimit: configs.minRatelimit,
    hourRatelimit: configs.hourRatelimit,
    redisClient: configs.redisClient,
    receiptCallbackUrl: configs.receiptCallbackUrl,
    failureCallbackUrl: configs.failureCallbackUrl,
  };

  if (configs.isDev) {
    return new MailhogMail(
      {
        ...mailConfig,
        host: configs.host,
        port: configs.port,
      },
      qstashConfig
    );
  }
  return new GmailMail(
    {
      ...mailConfig,
      user: configs.user,
      pass: configs.pass,
    },
    qstashConfig
  );
}
