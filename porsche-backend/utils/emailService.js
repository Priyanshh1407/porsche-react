import nodemailer, { createTransport } from "nodemailer";

// email config
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// email template
const getCustomerEmailTemplate = (contact) => {
    const modelName = contact.modelInterest !== 'Not_specified'
        ? contact.modelInterest.replace('_', '')
        : 'our vehicles';

    return {
        subject: 'Thank you for your interest in Porsche',
        html: `
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
            <p style="margin: 5px 0;"><strong>Message:</strong> ${contact.message}</p>
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
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; padding: 20px; color: white;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Priority: ${contact.inquiryType === 'sales' ? 'HIGH' : 'NORMAL'}</p>
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
              <td style="padding: 10px; border: 1px solid #ddd;">${contact.modelInterest.replace('_', ' ')}</td>
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

// email functions
const sendContactEmails = async (contact) => {
    // If no real password is provided, fallback to console log for demo purposes
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_specific_password_here' || process.env.EMAIL_PASS === '') {
        console.log("==========================================");
        console.log("DEMO MODE: Email sending is stubbed.");
        console.log("CUSTOMER EMAIL WOULD BE SENT TO:", contact.email);
        console.log("ADMIN EMAIL WOULD BE SENT TO:", process.env.ADMIN_EMAIL);
        console.log("==========================================");
        return true;
    }

    const transporter = createTransporter();

    try {
        // send customer confirmation mail
        const customerEmail = getCustomerEmailTemplate(contact);
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: contact.email,
            subject: customerEmail.subject,
            html: customerEmail.html
        });

        // send admin notification email
        const adminEmail = getAdminEmailTemplate(contact);
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: adminEmail.subject,
            html: adminEmail.html
        });

        console.log("Contact Emails successfully sent.");
        return true;
    } catch (error) {
        console.log("Error sending contact emails:", error);
        throw error;
    }
};

export { sendContactEmails, getAdminEmailTemplate, getCustomerEmailTemplate };