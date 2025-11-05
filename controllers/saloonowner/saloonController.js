// controllers/saloonowner/saloonController.js
const Service = require('../../models/Service');
const Invitation = require('../../models/Invitation');
const Appointment = require('../../models/Appointment');
const sendEmail = require('../../utils/sendEmail');

const addService = async (req, res) => {
  const { name, price, duration, discount, description } = req.body;
  const saloonOwnerId = req.user._id;

  const service = await Service.create({
    saloonOwner: saloonOwnerId,
    name, price, duration, discount, description
  });

  res.status(201).json(service);
};

const inviteCustomer = async (req, res) => {
  const { inviteeEmail, firstName, lastName, serviceId, discount, message } = req.body;
  const saloonOwnerId = req.user._id;

  const invitation = await Invitation.create({
    saloonOwner: saloonOwnerId,
    inviteeEmail, firstName, lastName, service: serviceId,
    discount, message
  });

  const service = await Service.findById(serviceId);
  const saloonName = req.user.saloonName;

  const bookingLink = `https://yourapp.com/book?invite=${invitation._id}`;

  await sendEmail({
    to: inviteeEmail,
    subject: `You're Invited to ${saloonName}!`,
    text: `
Hello ${firstName || ''} ${lastName || ''},

${message || 'We’d love to have you visit us!'}

Service: ${service?.name}
Discount: ${discount}% OFF

Book now: ${bookingLink}

Thank you,
${saloonName}
    `.trim(),
    html: `
      <h3>Hello ${firstName || ''} ${lastName || ''},</h3>
      <p>${message || 'We’d love to have you visit us!'}</p>
      <ul>
        <li><strong>Service:</strong> ${service?.name}</li>
        <li><strong>Discount:</strong> ${discount}% OFF</li>
      </ul>
      <p>
        <a href="${bookingLink}" style="background:#007bff;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Book Now
        </a>
      </p>
      <hr>
      <small>Thank you,<br><strong>${saloonName}</strong></small>
    `.trim(),
  });

  invitation.status = 'sent';
  await invitation.save();

  res.status(201).json(invitation);
};

const viewAppointments = async (req, res) => {
  const appointments = await Appointment.find({ saloonOwner: req.user._id })
    .populate('customer', 'fullName email')
    .populate('service', 'name price');

  res.json(appointments);
};

module.exports = { addService, inviteCustomer, viewAppointments };