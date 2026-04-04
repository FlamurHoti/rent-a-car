import React from 'react';

export default function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div
      className={`
        rounded-xl border border-slate-200 bg-white shadow-card
        ${padding ? 'p-6' : ''}
        ${hover
          ? 'transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-1 hover:border-slate-300 cursor-pointer'
          : 'transition-shadow duration-200'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
