const sgMail = require('@sendgrid/mail');



const sendMail = async ({ to, templateId, templataData }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId,
    templataData,
  };

  try {
    console.log("from", process.env.SENDGRID_FROM_EMAIL);
    await sgMail.send(msg);
  } catch (error) {
    console.error('SendGrid Error:', error.response?.body || error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = sendMail;
