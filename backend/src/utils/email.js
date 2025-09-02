const nodemailer = require('nodemailer');

function isEmailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send booking confirmation to the customer.
 */
async function sendBookingConfirmation({ reservation, car, company }) {
  if (!isEmailEnabled()) return;
  if (!reservation.customerEmail) return;

  const start = new Date(reservation.startDate).toLocaleString();
  const end = new Date(reservation.endDate).toLocaleString();
  const refCode = reservation.id.slice(-8).toUpperCase();

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#0f172a">
      <h2 style="color:#6366f1">Booking request received</h2>
      <p>Hi <strong>${reservation.customerName}</strong>,</p>
      <p>Your booking request for <strong>${car.brand} ${car.model}</strong> at <strong>${company.name}</strong> has been received.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <tr><td style="padding:6px 0;color:#64748b">Reference</td><td><strong style="font-family:monospace">${refCode}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Car</td><td>${car.brand} ${car.model} (${car.plateNumber})</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Pick-up</td><td>${start}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Return</td><td>${end}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Total</td><td><strong>€${Number(reservation.totalPrice).toFixed(2)}</strong></td></tr>
        ${company.phone ? `<tr><td style="padding:6px 0;color:#64748b">Company phone</td><td>${company.phone}</td></tr>` : ''}
      </table>
      <p style="color:#64748b;font-size:13px">The company will contact you to confirm. Please keep your reference number: <strong style="font-family:monospace">${refCode}</strong></p>
    </div>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@rentacar.com',
    to: reservation.customerEmail,
    subject: `Booking request #${refCode} — ${car.brand} ${car.model}`,
    html,
  });
}

/**
 * Notify the company about a new booking.
 */
async function sendNewBookingAlert({ reservation, car, company }) {
  if (!isEmailEnabled()) return;
  if (!company.email) return;

  const start = new Date(reservation.startDate).toLocaleString();
  const end = new Date(reservation.endDate).toLocaleString();
  const refCode = reservation.id.slice(-8).toUpperCase();

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#0f172a">
      <h2 style="color:#6366f1">New booking request</h2>
      <p>A new booking request has been submitted for <strong>${car.brand} ${car.model}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <tr><td style="padding:6px 0;color:#64748b">Reference</td><td><strong style="font-family:monospace">${refCode}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Customer</td><td>${reservation.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Phone</td><td>${reservation.customerPhone}</td></tr>
        ${reservation.customerEmail ? `<tr><td style="padding:6px 0;color:#64748b">Email</td><td>${reservation.customerEmail}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#64748b">Car</td><td>${car.brand} ${car.model} (${car.plateNumber})</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Pick-up</td><td>${start}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Return</td><td>${end}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Total</td><td><strong>€${Number(reservation.totalPrice).toFixed(2)}</strong></td></tr>
        ${reservation.notes ? `<tr><td style="padding:6px 0;color:#64748b">Notes</td><td>${reservation.notes}</td></tr>` : ''}
      </table>
      <p style="color:#64748b;font-size:13px">Log in to your panel to confirm or manage this reservation.</p>
    </div>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@rentacar.com',
    to: company.email,
    subject: `New booking #${refCode} — ${reservation.customerName}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendNewBookingAlert };