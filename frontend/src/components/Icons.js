import React from 'react';

const sizeClass = 'h-4 w-4';
const svgProps = (className) => ({ className: className || sizeClass, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' });

export function LayoutDashboard({ className }) {
  return (
    <svg {...svgProps(className)}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
  );
}

export function Car({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L3 7 2 4H1V2h3l2 2h12l2-2h3v2h-1l-1 3c.8.2 1.5 1 1.5 1.9v3c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
  );
}

export function Calendar({ className }) {
  return (
    <svg {...svgProps(className)}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
  );
}

export function CreditCard({ className }) {
  return (
    <svg {...svgProps(className)}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
  );
}

export function Building2({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
  );
}

export function LogOut({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  );
}

export function CheckCircle({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  );
}

export function Euro({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M4 10h12" /><path d="M4 14h9" /><path d="M19 6a7.7 7.7 0 0 0-5.2 2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" /></svg>
  );
}

export function AlertTriangle({ className }) {
  return (
    <svg {...svgProps(className)}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
  );
}

export function Activity({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  );
}

export function Search({ className }) {
  return (
    <svg {...svgProps(className)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  );
}

export function Plus({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  );
}

export function Pencil({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  );
}

export function Trash2({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
  );
}

export function FileText({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
  );
}

export function Loader({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  );
}

export function SlidersHorizontal({ className }) {
  return (
    <svg {...svgProps(className)}><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
  );
}

export function MapPin({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  );
}

export function Phone({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  );
}

export function Mail({ className }) {
  return (
    <svg {...svgProps(className)}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}

export function Star({ className }) {
  return (
    <svg {...svgProps(className)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  );
}

export function Shield({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
  );
}

export function Clock({ className }) {
  return (
    <svg {...svgProps(className)}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  );
}

export function ArrowRight({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  );
}

export function ChevronRight({ className }) {
  return (
    <svg {...svgProps(className)}><path d="m9 18 6-6-6-6" /></svg>
  );
}

export function ChevronLeft({ className }) {
  return (
    <svg {...svgProps(className)}><path d="m15 18-6-6 6-6" /></svg>
  );
}

export function Sparkles({ className }) {
  return (
    <svg {...svgProps(className)}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
  );
}

export function Users({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  );
}

export function Fuel({ className }) {
  return (
    <svg {...svgProps(className)}><path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17" /><path d="M13 10h4a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 4" /><path d="M3 22h10" /><path d="M7 7h4" /></svg>
  );
}

export function Gauge({ className }) {
  return (
    <svg {...svgProps(className)}><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
  );
}
