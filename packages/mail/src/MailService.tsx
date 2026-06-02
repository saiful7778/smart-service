import { render } from "react-email";

import { QstashServiceConfig } from "@workspace/lib/qstash";

import EmailVerificationMail, {
  EmailVerificationMailProps,
} from "./mail-templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  NewDeviceLoginMailProps,
} from "./mail-templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  PasswordChangedMailProps,
} from "./mail-templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  ResetPasswordMailProps,
} from "./mail-templates/auth/ResetPasswordMail";
import WelcomeUserMail, {
  WelcomeUserMailProps,
} from "./mail-templates/auth/WelcomeUserMail";
import ContactSubmittedMail from "./mail-templates/ContactSubmittedMail";
import OrgInvitationMail, {
  OrgInvitationMailProps,
} from "./mail-templates/org/OrgInvitationMail";
import UnAuthOrgInvitationMail, {
  UnAuthOrgInvitationMailProps,
} from "./mail-templates/org/UnAuthOrgInvitationMail";
import { IQstashMailService, QstashMailService } from "./QstashMail.service";
import type {
  MailSendResult,
  MailServiceConfig,
  SendMailOption,
} from "./types";

type WelcomeUserEmailOptions = Pick<SendMailOption, "to"> &
  Omit<WelcomeUserMailProps, "appName" | "supportMail">;

type EmailVerificationMailOptions = Pick<SendMailOption, "to"> &
  Omit<EmailVerificationMailProps, "appName" | "supportMail">;

type PasswordResetEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ResetPasswordMailProps, "appName" | "supportMail">;

type PasswordChangedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PasswordChangedMailProps, "appName" | "supportMail">;

type NewDeviceLoginEmailOptions = Pick<SendMailOption, "to"> &
  Omit<NewDeviceLoginMailProps, "appName" | "supportMail">;

type OrgInvitationEmailOptions = Pick<SendMailOption, "to"> &
  Omit<OrgInvitationMailProps, "appName" | "supportMail">;

type UnAuthOrgInvitationEmailOptions = Pick<SendMailOption, "to"> &
  Omit<UnAuthOrgInvitationMailProps, "appName" | "supportMail">;

export interface ContactSubmittedEmailOptions extends Omit<
  SendMailOption,
  "subject"
> {
  userName: string;
}

export interface IMailService extends IQstashMailService {
  sendWelcomeUserMail(
    options: WelcomeUserEmailOptions
  ): Promise<MailSendResult>;
  sendEmailVerificationMail(
    options: EmailVerificationMailOptions
  ): Promise<MailSendResult>;
  sendPasswordResetMail(
    options: PasswordResetEmailOptions
  ): Promise<MailSendResult>;
  sendNewDeviceLoginMail(
    options: NewDeviceLoginEmailOptions
  ): Promise<MailSendResult>;
  sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<MailSendResult>;
  sendOrgInvitationMail(
    options: OrgInvitationEmailOptions
  ): Promise<MailSendResult>;
  sendUnAuthOrgInvitationMail(
    options: UnAuthOrgInvitationEmailOptions
  ): Promise<MailSendResult>;
  sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<MailSendResult>;
}

export abstract class MailService
  extends QstashMailService
  implements IMailService
{
  constructor(
    private readonly mailConfig: MailServiceConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(mailConfig, qstashConfig);
  }

  public async sendWelcomeUserMail(
    options: WelcomeUserEmailOptions
  ): Promise<MailSendResult> {
    const subject = `Welcome to ${this.mailConfig.appName}`;
    const element = (
      <WelcomeUserMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
        dashboardUrl={options.dashboardUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendEmailVerificationMail(
    options: EmailVerificationMailOptions
  ): Promise<MailSendResult> {
    const subject = `Verify your email for ${this.mailConfig.appName}`;
    const element = (
      <EmailVerificationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
        verifyUrl={options.verifyUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordResetMail(
    options: PasswordResetEmailOptions
  ): Promise<MailSendResult> {
    const subject = `Reset your password for ${this.mailConfig.appName}`;
    const element = (
      <ResetPasswordMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
        resetUrl={options.resetUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendNewDeviceLoginMail(
    options: NewDeviceLoginEmailOptions
  ): Promise<MailSendResult> {
    const subject = `New device login detected for ${this.mailConfig.appName}`;
    const element = (
      <NewDeviceLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
        deviceInfo={options.deviceInfo}
        loginTimestamp={options.loginTimestamp}
        ipAddress={options.ipAddress}
        browser={options.browser}
        approximateLocation={options.approximateLocation}
        secureAccountUrl={options.secureAccountUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<MailSendResult> {
    const subject = `Password changed for ${this.mailConfig.appName}`;

    const element = (
      <PasswordChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
        changeTimestamp={options.changeTimestamp}
        ipAddress={options.ipAddress}
        deviceInfo={options.deviceInfo}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendOrgInvitationMail(
    options: OrgInvitationEmailOptions
  ): Promise<MailSendResult> {
    const subject = `${options.inviterName} invited you to join ${options.orgName} on ${this.mailConfig.appName}`;
    const element = (
      <OrgInvitationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userEmail={options.userEmail}
        inviterName={options.inviterName}
        orgName={options.orgName}
        role={options.role}
        inviteUrl={options.inviteUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendUnAuthOrgInvitationMail(
    options: UnAuthOrgInvitationEmailOptions
  ): Promise<MailSendResult> {
    const subject = `${options.inviterName} invited you to join ${options.orgName} on ${this.mailConfig.appName}`;
    const element = (
      <UnAuthOrgInvitationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userEmail={options.userEmail}
        inviterName={options.inviterName}
        orgName={options.orgName}
        role={options.role}
        registerUrl={options.registerUrl}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }

  public async sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<MailSendResult> {
    const subject = `New contact submission from ${this.mailConfig.appName}`;
    const element = (
      <ContactSubmittedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        userName={options.userName}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to: options.to,
      subject,
      text,
      html,
    });
  }
}
