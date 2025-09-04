import React from 'react';

const variants = {
  primary:
    'bg-primary-500 hover:bg-primary-600 text-white shadow-button hover:shadow-button-hover hover:scale-[1.02] focus:ring-primary-500',
  secondary:
    'bg-secondary-800 hover:bg-secondary-900 text-white shadow-button hover:shadow-button-hover hover:scale-[1.02] focus:ring-slate-600',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-button hover:shadow-button-hover hover:scale-[1.02] focus:ring-red-500',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 focus:ring-slate-400',
  link:
    'bg-transparent text-primary-500 hover:text-primary-600 underline-offset-2 hover:underline shadow-none',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        btn-base
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
