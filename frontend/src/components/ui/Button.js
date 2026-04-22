import React from 'react';

const variants = {
  primary:
    'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] focus:ring-primary-500',
  secondary:
    'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] focus:ring-slate-600',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] focus:ring-red-500',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 active:scale-[0.98] focus:ring-slate-400',
  link:
    'bg-transparent text-primary-500 hover:text-primary-600 underline-offset-2 hover:underline shadow-none',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export default function Button({
  children, variant = 'primary', size = 'md', className = '',
  type = 'button', disabled, ...props
}) {
  return (
    <button type={type} disabled={disabled}
      className={`btn-base ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} transition-all duration-200 ${className}`}
      {...props}>
      {children}
    </button>
  );
}
