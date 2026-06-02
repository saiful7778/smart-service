import type Mail from "nodemailer/lib/mailer";

import type { IRatelimit } from "@workspace/lib/rate-limit";
import { ExtendedRedis } from "@workspace/lib/redis";

export interface QstashMailConfig {
  appName: string;
  fromEmail: string;
  redisClient: ExtendedRedis;
  minRatelimit: IRatelimit;
  hourRatelimit: IRatelimit;
  callbackUrl: string;
  receiptCallbackUrl: string;
  failureCallbackUrl: string;
  dedupWindowSeconds?: number;
}

export interface MailServiceConfig extends QstashMailConfig {
  supportMail: string;
}

export interface MailhogMailConfig extends MailServiceConfig {
  host: string;
  port: number;
}

export interface GmailMailConfig extends MailServiceConfig {
  user: string;
  pass: string;
}

export interface TransporterType {
  messageId?: string;
}

export interface MailSendResult extends TransporterType {
  success: boolean;
  error?: string;
}

interface Attachment {
  filename: string;
  content?: string; // base64-encoded string
  path?: string; // URL or file path the mail server can access
  contentType?: string;
  contentDisposition?: "inline" | "attachment";
  cid?: string; // for embedded images: <img src="cid:xxx">
  encoding?: string;
}

interface Alternative {
  contentType: string;
  content: string;
}

type MailPriority = "high" | "normal" | "low";

export interface SendMailOption {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  amp?: string;
  icalEvent?: { method: string; content: string };
  headers?: Mail.Headers;
  list?: Mail.ListHeaders;
  attachments?: Array<Attachment>;
  alternatives?: Array<Alternative>;
  priority?: MailPriority;
  attachDataUrls?: boolean;
  inReplyTo?: string;
}

export interface MailCallbackPayload extends SendMailOption {
  messageId: string;
  deduplicationId: string;
  from: string;
  createdBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface QstashMailResult extends MailSendResult {
  messageId?: string;
  deduplicationId?: string;
  rateLimited?: boolean;
  duplicate?: boolean;
}
