import { Resend } from "resend";
import sgMail from "@sendgrid/mail";

export const resend = new Resend(process.env.RESEND_API_KEY!);

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface SendOutreachEmailParams {
  to: string;
  from: string;
  subject: string;
  body: string;
  emailLogId?: string;
}

export async function sendOutreachEmail(params: SendOutreachEmailParams) {
  return sgMail.send({
    to: params.to,
    from: params.from,
    subject: params.subject,
    text: params.body,
    html: params.body.replace(/\n/g, "<br>"),
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
  return resend.emails.send({
    from: "Outreachly <noreply@outreachly.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
