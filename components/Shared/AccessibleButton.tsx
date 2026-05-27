
import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  onClick,
  disabled,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  ...props
}) => {
  const baseStyles = "font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition ease-in-out duration-150 rounded-md shadow-sm inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-light text-textLight disabled:bg-gray-400',
    secondary: 'bg-secondary hover:bg-opacity-80 text-primary disabled:bg-gray-300 border border-primary',
    danger: 'bg-error hover:bg-red-700 text-textLight disabled:bg-red-300',
    ghost: 'bg-transparent hover:bg-gray-200 text-primary disabled:text-gray-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle}`}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};
