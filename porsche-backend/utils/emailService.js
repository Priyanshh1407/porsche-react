import nodemailer from "nodemailer";
import { modelLabel } from "../config/contactOptions.js";

// email config
// ERR-03: bounded waits. nodemailer's defaults are minutes (2 min to connect, 30 s for the
// greeting, 10 min socket idle), so a hung SMTP server could hold a send open for a very long time.
const createTransporter = () => {
    const timeoutMs = Number(process.env.EMAIL_TIMEOUT_MS) || 10000;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs * 2
    });
};

// SEC-02: output encoding. Every value interpolated into email HTML goes through escapeHtml via
// the safeHtml tag, so visitor input (message, names, ...) can never become live markup or links.
const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const safeHtml = (strings, ...values) =>
    strings.reduce((out, part, i) => out + part + (i < values.length ? escapeHtml(values[i]) : ''), '');

// email template
const getCustomerEmailTemplate = (contact) => {
    const modelName = contact.modelInterest !== 'Not_specified'
        ? modelLabel(contact.modelInterest)
        : 'our vehicles';

    return {
        subject: 'Thank you for your interest in Porsche',
        html: safeHtml`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">PORSCHE</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Dear ${contact.firstName} ${contact.lastName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in ${modelName}. We have received your inquiry and our team will contact you within 24 hours.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
            <p style="margin: 5px 0;"><strong>Inquiry Type:</strong> ${contact.inquiryType.replace('_', ' ').toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Model Interest:</strong> ${modelName}</p>
            <p style="margin: 5px 0;"><strong>Preferred Contact:</strong> ${contact.preferredContactMethod}</p>
            <!-- The visitor's free-text message is deliberately not echoed: this email goes to
                 whatever address was typed into the form (SEC-02). The admin email has it. -->

          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Our experienced team looks forward to helping you find the perfect Porsche that matches your driving passion.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Porsche Team<br>
              <a href="mailto:${process.env.EMAIL_FROM}" style="color: #666;">${process.env.EMAIL_FROM}</a>
            </p>
          </div>
        </div>
      </div>
    `

    };
};

const getAdminEmailTemplate = (contact) => {
    return {
        subject: `New Contact Inquiry - ${contact.inquiryType.toUpperCase()} - ${contact.firstName} ${contact.lastName}`,
        html: safeHtml`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; padding: 20px; color: white;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Priority: ${contact.inquiryType === 'Sales' ? 'HIGH' : 'NORMAL'}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: white;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${contact.firstName} ${contact.lastName}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${contact.email}">${contact.email}</a></td>
            </tr>
            <tr style="background-color: white;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${contact.phone}">${contact.phone}</a></td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Inquiry Type:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${contact.inquiryType.replace('_', ' ').toUpperCase()}</td>
            </tr>
            <tr style="background-color: white;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Model Interest:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${modelLabel(contact.modelInterest)}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Preferred Contact:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${contact.preferredContactMethod} (${contact.preferredContactTime})</td>
            </tr>
            <tr style="background-color: white;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Submitted:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(contact.createdAt).toLocaleString()}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${contact.message}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #28a745;">
            <p style="margin: 0; font-weight: bold; color: #28a745;">Action Required:</p>
            <p style="margin: 5px 0 0 0;">Follow up with this lead within 24 hours for optimal conversion.</p>
          </div>
        </div>
      </div>
    `
    };
};

// UPG-03: one email at a time. The outbox (utils/emailOutbox.js) decides WHICH emails a lead needs
// and retries each one separately, so a failed admin notification never re-sends the customer's.
const isDemoMode = () => !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_specific_password_here';

/** The message for one outbox row: { to, subject, html }. */
const buildEmail = (kind, contact) => {
    if (kind === 'customer_confirmation') return { to: contact.email, ...getCustomerEmailTemplate(contact) };
    if (kind === 'admin_notification') return { to: process.env.ADMIN_EMAIL, ...getAdminEmailTemplate(contact) };
    throw new Error(`Unknown email kind: ${kind}`);
};

/** Sends one message. Throws on failure so the outbox can retry it. */
const sendEmail = async (message) => {
    if (isDemoMode()) {
        // No SMTP password configured: log instead of sending (local development / demos).
        console.log(`DEMO MODE: email not sent. To: ${message.to} | Subject: ${message.subject}`);
        return;
    }
    await createTransporter().sendMail({ from: process.env.EMAIL_FROM, ...message });
};

export { buildEmail, sendEmail, getAdminEmailTemplate, getCustomerEmailTemplate };
