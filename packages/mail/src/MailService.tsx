import { render } from "react-email";

import { QstashServiceConfig } from "@workspace/lib/qstash";
import { formatEnumValue } from "@workspace/lib/utils";

import AccountLockedMail, {
  AccountLockedMailProps,
} from "./mail-templates/auth/AccountLockedMail";
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
import RoleChangedMail, {
  RoleChangedMailProps,
} from "./mail-templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  SuspiciousLoginMailProps,
} from "./mail-templates/auth/SuspiciousLoginMail";
import WelcomeUserMail, {
  WelcomeUserMailProps,
} from "./mail-templates/auth/WelcomeUserMail";
import ContactSubmittedMail, {
  ContactSubmittedMailProps,
} from "./mail-templates/ContactSubmittedMail";
import DataExportCompleteMail, {
  DataExportCompleteMailProps,
} from "./mail-templates/DataExportCompleteMail";
import FeedbackIssueRepliedMail, {
  FeedbackIssueRepliedMailProps,
} from "./mail-templates/feedback/FeedbackIssueRepliedMail";
import FeedbackIssueStatusChangedMail, {
  FeedbackIssueStatusChangedMailProps,
} from "./mail-templates/feedback/FeedbackIssueStatusChangedMail";
import FeedbackIssueSubmittedMail, {
  FeedbackIssueSubmittedMailProps,
} from "./mail-templates/feedback/FeedbackIssueSubmittedMail";
import IntegrationConnectedMail, {
  IntegrationConnectedMailProps,
} from "./mail-templates/integration/IntegrationConnectedMail";
import IntegrationErrorMail, {
  IntegrationErrorMailProps,
} from "./mail-templates/integration/IntegrationErrorMail";
import EstimateSentMail, {
  EstimateSentMailProps,
} from "./mail-templates/org/EstimateSentMail";
import OrgCreateWelcomeMail, {
  OrgCreateWelcomeMailProps,
} from "./mail-templates/org/OrgCreateWelcomeMail";
import OrgInvitationMail, {
  OrgInvitationMailProps,
} from "./mail-templates/org/OrgInvitationMail";
import UnAuthOrgInvitationMail, {
  UnAuthOrgInvitationMailProps,
} from "./mail-templates/org/UnAuthOrgInvitationMail";
import InvoiceOverdueMail, {
  InvoiceOverdueMailProps,
} from "./mail-templates/payment/InvoiceOverdueMail";
import PaymentFailedMail, {
  PaymentFailedMailProps,
} from "./mail-templates/payment/PaymentFailedMail";
import PaymentMethodAddedMail, {
  PaymentMethodAddedMailProps,
} from "./mail-templates/payment/PaymentMethodAddedMail";
import PaymentMethodExpiringMail, {
  PaymentMethodExpiringMailProps,
} from "./mail-templates/payment/PaymentMethodExpiringMail";
import PaymentProcessedMail, {
  PaymentProcessedMailProps,
} from "./mail-templates/payment/PaymentProcessedMail";
import PlanDowngradedMail, {
  PlanDowngradedMailProps,
} from "./mail-templates/payment/PlanDowngradedMail";
import PlanUpgradedMail, {
  PlanUpgradedMailProps,
} from "./mail-templates/payment/PlanUpgradedMail";
import SubscriptionCancelledMail, {
  SubscriptionCancelledMailProps,
} from "./mail-templates/payment/SubscriptionCancelledMail";
import SubscriptionReactivatedMail, {
  SubscriptionReactivatedMailProps,
} from "./mail-templates/payment/SubscriptionReactivatedMail";
import UsageLimitWarningMail, {
  UsageLimitWarningMailProps,
} from "./mail-templates/payment/UsageLimitWarningMail";
import WeeklySummaryMail, {
  WeeklySummaryMailProps,
} from "./mail-templates/WeeklySummaryMail";
import { IQstashMailService, QstashMailService } from "./QstashMail.service";
import type {
  MailSendResult,
  MailServiceConfig,
  SendMailOption,
} from "./types";

type WelcomeUserEmailOptions = Pick<SendMailOption, "to"> &
  Omit<WelcomeUserMailProps, "appName" | "supportMail">;

type OrgCreateWelcomeMailOptions = Pick<SendMailOption, "to"> &
  Omit<OrgCreateWelcomeMailProps, "appName" | "supportMail">;

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

type EstimateSentMailOptions = Pick<SendMailOption, "to"> &
  Omit<EstimateSentMailProps, "appName" | "supportMail">;

type SuspiciousLoginMailOptions = Pick<SendMailOption, "to"> &
  Omit<SuspiciousLoginMailProps, "appName" | "supportMail">;

type RoleChangedMailOptions = Pick<SendMailOption, "to"> &
  Omit<RoleChangedMailProps, "appName" | "supportMail">;

type AccountLockedMailOptions = Pick<SendMailOption, "to"> &
  Omit<AccountLockedMailProps, "appName" | "supportMail">;

type DataExportCompleteMailOptions = Pick<SendMailOption, "to"> &
  Omit<DataExportCompleteMailProps, "appName" | "supportMail">;

type IntegrationConnectedMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationConnectedMailProps, "appName" | "supportMail">;

type IntegrationErrorMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationErrorMailProps, "appName" | "supportMail">;

type WeeklySummaryMailOptions = Pick<SendMailOption, "to"> &
  Omit<WeeklySummaryMailProps, "appName" | "supportMail">;

type PaymentProcessedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PaymentProcessedMailProps, "appName" | "supportMail">;

type InvoiceOverdueMailOptions = Pick<SendMailOption, "to"> &
  Omit<InvoiceOverdueMailProps, "appName" | "supportMail">;

type PaymentMethodExpiringMailOptions = Pick<SendMailOption, "to"> &
  Omit<PaymentMethodExpiringMailProps, "appName" | "supportMail">;

type UsageLimitWarningMailOptions = Pick<SendMailOption, "to"> &
  Omit<UsageLimitWarningMailProps, "appName" | "supportMail">;

type PlanUpgradedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PlanUpgradedMailProps, "appName" | "supportMail">;

type PaymentFailedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PaymentFailedMailProps, "appName" | "supportMail">;

type SubscriptionReactivatedMailOptions = Pick<SendMailOption, "to"> &
  Omit<SubscriptionReactivatedMailProps, "appName" | "supportMail">;

type PaymentMethodAddedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PaymentMethodAddedMailProps, "appName" | "supportMail">;

type SubscriptionCancelledMailOptions = Pick<SendMailOption, "to"> &
  Omit<SubscriptionCancelledMailProps, "appName" | "supportMail">;

type PlanDowngradedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PlanDowngradedMailProps, "appName" | "supportMail">;

type ContactSubmittedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ContactSubmittedMailProps, "appName" | "supportMail">;

type FeedbackIssueSubmittedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<FeedbackIssueSubmittedMailProps, "appName" | "supportMail">;

type FeedbackIssueRepliedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<FeedbackIssueRepliedMailProps, "appName" | "supportMail">;

type FeedbackIssueStatusChangedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<FeedbackIssueStatusChangedMailProps, "appName" | "supportMail">;

export interface IMailService extends IQstashMailService {
  sendWelcomeUserMail(
    options: WelcomeUserEmailOptions
  ): Promise<MailSendResult>;
  sendOrgCreateWelcomeMail(
    options: OrgCreateWelcomeMailOptions
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
  sendFeedbackIssueSubmittedMail(
    options: FeedbackIssueSubmittedEmailOptions
  ): Promise<MailSendResult>;
  sendFeedbackIssueRepliedMail(
    options: FeedbackIssueRepliedEmailOptions
  ): Promise<MailSendResult>;
  sendFeedbackIssueStatusChangedMail(
    options: FeedbackIssueStatusChangedEmailOptions
  ): Promise<MailSendResult>;
  sendEstimateSentMail(
    options: EstimateSentMailOptions
  ): Promise<MailSendResult>;
  sendSuspiciousLoginMail(
    options: SuspiciousLoginMailOptions
  ): Promise<MailSendResult>;
  sendRoleChangedMail(options: RoleChangedMailOptions): Promise<MailSendResult>;
  sendAccountLockedMail(
    options: AccountLockedMailOptions
  ): Promise<MailSendResult>;
  sendDataExportCompleteMail(
    options: DataExportCompleteMailOptions
  ): Promise<MailSendResult>;
  sendIntegrationConnectedMail(
    options: IntegrationConnectedMailOptions
  ): Promise<MailSendResult>;
  sendIntegrationErrorMail(
    options: IntegrationErrorMailOptions
  ): Promise<MailSendResult>;
  sendWeeklySummaryMail(
    options: WeeklySummaryMailOptions
  ): Promise<MailSendResult>;
  sendPaymentProcessedMail(
    options: PaymentProcessedMailOptions
  ): Promise<MailSendResult>;
  sendInvoiceOverdueMail(
    options: InvoiceOverdueMailOptions
  ): Promise<MailSendResult>;
  sendPaymentMethodExpiringMail(
    options: PaymentMethodExpiringMailOptions
  ): Promise<MailSendResult>;
  sendUsageLimitWarningMail(
    options: UsageLimitWarningMailOptions
  ): Promise<MailSendResult>;
  sendPlanUpgradedMail(
    options: PlanUpgradedMailOptions
  ): Promise<MailSendResult>;
  sendPaymentFailedMail(
    options: PaymentFailedMailOptions
  ): Promise<MailSendResult>;
  sendSubscriptionReactivatedMail(
    options: SubscriptionReactivatedMailOptions
  ): Promise<MailSendResult>;
  sendPaymentMethodAddedMail(
    options: PaymentMethodAddedMailOptions
  ): Promise<MailSendResult>;
  sendSubscriptionCancelledMail(
    options: SubscriptionCancelledMailOptions
  ): Promise<MailSendResult>;
  sendPlanDowngradedMail(
    options: PlanDowngradedMailOptions
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

  public async sendWelcomeUserMail({
    to,
    ...options
  }: WelcomeUserEmailOptions): Promise<MailSendResult> {
    const subject = `Welcome to ${this.mailConfig.appName}`;
    const element = (
      <WelcomeUserMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendOrgCreateWelcomeMail({
    to,
    ...options
  }: OrgCreateWelcomeMailOptions): Promise<MailSendResult> {
    const subject = `${options.orgName} Is Ready - Let's Get Started`;
    const element = (
      <OrgCreateWelcomeMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendEmailVerificationMail({
    to,
    ...options
  }: EmailVerificationMailOptions): Promise<MailSendResult> {
    const subject = `Verify your email for ${this.mailConfig.appName}`;
    const element = (
      <EmailVerificationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordResetMail({
    to,
    ...options
  }: PasswordResetEmailOptions): Promise<MailSendResult> {
    const subject = `Reset your password for ${this.mailConfig.appName}`;
    const element = (
      <ResetPasswordMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendNewDeviceLoginMail({
    to,
    ...options
  }: NewDeviceLoginEmailOptions): Promise<MailSendResult> {
    const subject = `New device login detected for ${this.mailConfig.appName}`;
    const element = (
      <NewDeviceLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordChangedMail({
    to,
    ...options
  }: PasswordChangedMailOptions): Promise<MailSendResult> {
    const subject = `Password changed for ${this.mailConfig.appName}`;

    const element = (
      <PasswordChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendOrgInvitationMail({
    to,
    ...options
  }: OrgInvitationEmailOptions): Promise<MailSendResult> {
    const subject = `${options.inviterName} invited you to join ${options.orgName} on ${this.mailConfig.appName}`;
    const element = (
      <OrgInvitationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendUnAuthOrgInvitationMail({
    to,
    ...options
  }: UnAuthOrgInvitationEmailOptions): Promise<MailSendResult> {
    const subject = `${options.inviterName} invited you to join ${options.orgName} on ${this.mailConfig.appName}`;
    const element = (
      <UnAuthOrgInvitationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendContactSubmittedMail({
    to,
    ...options
  }: ContactSubmittedEmailOptions): Promise<MailSendResult> {
    const subject = `New contact submission from ${this.mailConfig.appName}`;
    const element = (
      <ContactSubmittedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendFeedbackIssueSubmittedMail({
    to,
    ...options
  }: FeedbackIssueSubmittedEmailOptions): Promise<MailSendResult> {
    const subject = `We received your ${formatEnumValue(options.issueType)} - ${options.issueTitle}`;

    const element = (
      <FeedbackIssueSubmittedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendFeedbackIssueRepliedMail({
    to,
    ...options
  }: FeedbackIssueRepliedEmailOptions): Promise<MailSendResult> {
    const subject = `New reply on your ${formatEnumValue(options.issueType)}: ${options.issueTitle}`;
    const element = (
      <FeedbackIssueRepliedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendFeedbackIssueStatusChangedMail({
    to,
    ...options
  }: FeedbackIssueStatusChangedEmailOptions): Promise<MailSendResult> {
    const subject = `Your ${formatEnumValue(options.issueType)} is now ${formatEnumValue(options.newStatus)}`;
    const element = (
      <FeedbackIssueStatusChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendEstimateSentMail({
    to,
    ...options
  }: EstimateSentMailOptions): Promise<MailSendResult> {
    const subject = `'${options.estimateName}' estimate from ${options.orgName} on ${this.mailConfig.appName}`;
    const element = (
      <EstimateSentMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendSuspiciousLoginMail({
    to,
    ...options
  }: SuspiciousLoginMailOptions): Promise<MailSendResult> {
    const subject = `Suspicious login detected for your ${this.mailConfig.appName} account`;
    const element = (
      <SuspiciousLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendRoleChangedMail({
    to,
    ...options
  }: RoleChangedMailOptions): Promise<MailSendResult> {
    const subject = `Your role has been changed for ${this.mailConfig.appName}`;
    const element = (
      <RoleChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendAccountLockedMail({
    to,
    ...options
  }: AccountLockedMailOptions): Promise<MailSendResult> {
    const subject = `Your ${this.mailConfig.appName} account has been locked`;
    const element = (
      <AccountLockedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendDataExportCompleteMail({
    to,
    ...options
  }: DataExportCompleteMailOptions): Promise<MailSendResult> {
    const subject = `Your data export is ready for ${this.mailConfig.appName}`;
    const element = (
      <DataExportCompleteMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendIntegrationConnectedMail({
    to,
    ...options
  }: IntegrationConnectedMailOptions): Promise<MailSendResult> {
    const subject = `Integration connected for ${this.mailConfig.appName}`;
    const element = (
      <IntegrationConnectedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendIntegrationErrorMail({
    to,
    ...options
  }: IntegrationErrorMailOptions): Promise<MailSendResult> {
    const subject = `Integration error detected for ${this.mailConfig.appName}`;
    const element = (
      <IntegrationErrorMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendWeeklySummaryMail({
    to,
    ...options
  }: WeeklySummaryMailOptions): Promise<MailSendResult> {
    const subject = `Your weekly summary for ${this.mailConfig.appName}`;
    const element = (
      <WeeklySummaryMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPaymentProcessedMail({
    to,
    ...options
  }: PaymentProcessedMailOptions): Promise<MailSendResult> {
    const subject = `Payment processed for ${options.tenantName}`;
    const element = (
      <PaymentProcessedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendInvoiceOverdueMail({
    to,
    ...options
  }: InvoiceOverdueMailOptions): Promise<MailSendResult> {
    const subject = `Invoice ${options.invoiceNumber} is overdue`;
    const element = (
      <InvoiceOverdueMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPaymentMethodExpiringMail({
    to,
    ...options
  }: PaymentMethodExpiringMailOptions): Promise<MailSendResult> {
    const subject = `Your payment method is expiring soon`;
    const element = (
      <PaymentMethodExpiringMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendUsageLimitWarningMail({
    to,
    ...options
  }: UsageLimitWarningMailOptions): Promise<MailSendResult> {
    const subject = `Usage limit warning for ${this.mailConfig.appName}`;
    const element = (
      <UsageLimitWarningMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPlanUpgradedMail({
    to,
    ...options
  }: PlanUpgradedMailOptions): Promise<MailSendResult> {
    const subject = `You've been upgraded to ${options.newPlan} on ${this.mailConfig.appName}`;
    const element = (
      <PlanUpgradedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPaymentFailedMail({
    to,
    ...options
  }: PaymentFailedMailOptions): Promise<MailSendResult> {
    const subject = `Payment failed for ${options.tenantName}`;
    const element = (
      <PaymentFailedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendSubscriptionReactivatedMail({
    to,
    ...options
  }: SubscriptionReactivatedMailOptions): Promise<MailSendResult> {
    const subject = `Your subscription has been reactivated for ${this.mailConfig.appName}`;
    const element = (
      <SubscriptionReactivatedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPaymentMethodAddedMail({
    to,
    ...options
  }: PaymentMethodAddedMailOptions): Promise<MailSendResult> {
    const subject = `New payment method added for ${this.mailConfig.appName}`;
    const element = (
      <PaymentMethodAddedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendSubscriptionCancelledMail({
    to,
    ...options
  }: SubscriptionCancelledMailOptions): Promise<MailSendResult> {
    const subject = `Subscription cancelled for ${options.tenantName}`;
    const element = (
      <SubscriptionCancelledMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPlanDowngradedMail({
    to,
    ...options
  }: PlanDowngradedMailOptions): Promise<MailSendResult> {
    const subject = `Your plan has been downgraded to ${options.newPlan} on ${this.mailConfig.appName}`;
    const element = (
      <PlanDowngradedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }
}
