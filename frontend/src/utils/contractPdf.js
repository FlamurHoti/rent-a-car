/**
 * Basic contract/PDF: open a new window with printable contract content,
 * user can use browser Print -> Save as PDF.
 */
import { formatDate } from './format';

export function printContract(reservation, company) {
  const r = reservation;
  const car = r.car || {};
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to print the contract.');
    return;
  }
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rental Contract - ${r.customerName}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; color: #1e293b; }
    h1 { font-size: 1.25rem; border-bottom: 2px solid #334155; padding-bottom: 0.5rem; }
    .party { margin: 1rem 0; }
    .terms { margin-top: 1.5rem; font-size: 0.9rem; color: #64748b; }
    @media print { body { margin: 1rem; } }
  </style>
</head>
<body>
  <h1>Rental contract</h1>
  <p><strong>${company?.name || 'Rent-a-Car'}</strong><br>${company?.address || ''} | ${company?.phone || ''} | ${company?.email || ''}</p>
  <div class="party">
    <strong>Customer:</strong> ${r.customerName}<br>
    <strong>Phone:</strong> ${r.customerPhone}
  </div>
  <div class="party">
    <strong>Vehicle:</strong> ${car.brand} ${car.model} (${car.plateNumber})<br>
    <strong>Period:</strong> ${formatDate(r.startDate)} – ${formatDate(r.endDate)}<br>
    <strong>Total price:</strong> €${Number(r.totalPrice).toFixed(2)}
  </div>
  <div class="terms">
    This document serves as a basic rental agreement. Terms and conditions apply as per company policy.
  </div>
  <p style="margin-top: 2rem;"><small>Generated on ${new Date().toLocaleString()}</small></p>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
  `);
  win.document.close();
}
