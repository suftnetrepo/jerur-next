require('dotenv').config();
const nodeMailer = require('nodemailer');
const sendGrid = require('@sendgrid/mail');
import BrevoEmailSender from './EmailService';
import { logger } from '../utils/logger'

const sendSmtpEmail = async (body) => {
  const transporter = nodeMailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, 
    auth: {
      user: process.env.SMTP_Email, 
      pass: process.env.SMTP_KEY
    }
  });
  try {
    const info = await transporter.sendMail(body);
    console.log(`Message sent: ${info.response}`);
    return info;
  } catch (err) {
    logger.error(err, 'Problem sending email through SMTP');
    throw err;
  }
};

const asBrevoRecipients = (recipients) => {
  if (Array.isArray(recipients)) {
    return recipients.map((recipient) => (
      typeof recipient === 'string' ? { email: recipient } : recipient
    ));
  }

  return String(recipients || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
};

const asBrevoOptions = (mailOptions) => ({
  sender: mailOptions.sender || {
    email: mailOptions.from || process.env.USER_NAME,
    name: process.env.TEAM || 'Jerur'
  },
  to: asBrevoRecipients(mailOptions.to),
  subject: mailOptions.subject,
  textContent: mailOptions.textContent || mailOptions.text,
  htmlContent: mailOptions.htmlContent || mailOptions.html
});

const sendBrevoEmail = async (mailOptions) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.BREVA_API_KEY;
  const emailSender = new BrevoEmailSender(apiKey, {
    maxRetries: 3,
    retryDelay: 1000,
    batchSize: 10,
    validateEmails: true,
    logErrors: true
  });

  try {
    const result = await emailSender.sendEmail(asBrevoOptions(mailOptions));
    if (result.success) {
      console.log(`Brevo Email sent successfully, Message ID: ${result.messageId}`);
      return result;
    }

    throw new Error(result.error || 'Brevo API failed to send the email');
  } catch (error) {
    logger.error(error, 'Brevo API email failed');
    throw error;
  }
}

const sendGridEmail = async (mailOptions) => {
  await sendGrid
    .send(mailOptions)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      logger.error(error);
    });
};

const sendEmail = async (mailOptions) => {
  switch (process.env.MAIL_PROVIDER) {
    case 'SEND_GRID':
      return sendGridEmail(mailOptions);
    case 'NODE_MAILER':
      return sendSmtpEmail(mailOptions);
    case 'BREVO':
    case 'BREVO_API':
      return sendBrevoEmail(mailOptions);
    default:
      return sendBrevoEmail(mailOptions);
  }
};

const sendGridMail = (mailOptions) => sendEmail(mailOptions);

export { sendGridMail, sendGridEmail, sendEmail, sendBrevoEmail, sendSmtpEmail };
