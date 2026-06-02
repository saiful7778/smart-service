import nodemailer from "nodemailer";

import { QstashServiceConfig } from "@workspace/lib/qstash";

import { MailService } from "./MailService";
import type { GmailMailConfig } from "./types";

export class GmailMail extends MailService {
  constructor(
    private readonly gmailConfig: GmailMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(gmailConfig, qstashConfig);
  }

  protected async createTransporter() {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: this.gmailConfig.user,
        pass: this.gmailConfig.pass,
      },
    });

    await transporter.verify();

    return transporter;
  }
}
