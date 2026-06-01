import { Resend } from "resend";
import sgMail from "@sendgrid/mail";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function initSendGrid() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  return sgMail;
}

interface SendOutreachEmailParams {
  to: string;
  from: string;
  subject: string;
  body: string;
  emailLogId?: string;
  unsubscribeUrl?: string;
}

export async function sendOutreachEmail(params: SendOutreachEmailParams) {
  const footer = params.unsubscribeUrl
    ? `\n\n---\nDon't want to receive these emails? <a href="${params.unsubscribeUrl}">Unsubscribe</a>`
    : "";
  const bodyWithFooter = params.body + footer;

  return initSendGrid().send({
    to: params.to,
    from: params.from,
    subject: params.subject,
    text: params.body + (params.unsubscribeUrl ? `\n\n---\nUnsubscribe: ${params.unsubscribeUrl}` : ""),
    html: bodyWithFooter.replace(/\n/g, "<br>"),
    // emailLogId is passed back in every SendGrid event webhook payload
    ...(params.emailLogId ? { customArgs: { emailLogId: params.emailLogId } } : {}),
    trackingSettings: {
      clickTracking: { enable: true, enableText: false },
      openTracking: { enable: true },
    },
  });
}

interface SendTransactionalEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams
) {
  return getResend().emails.send({
    from: "Outreachly <noreply@outreachly.in>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
