import { ReactNode, MouseEvent } from 'react';

export interface ButtonProps {
  color?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'indigo' | 'purple' | 'gradient';
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface ContainerProps {
  border?: boolean;
  children: ReactNode;
  className?: string;
}

export interface InputProps {
  name: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  t?: any; // i18next translation function
  value?: string;
  type?: string;
  className?: string;
  required?: boolean;
}

export interface SvgIconProps {
  src: string;
  width: string;
  height: string;
  className?: string;
}

export interface ValidationTypeProps {
  [key: string]: {
    required?: boolean;
    validator?: {
      regEx: RegExp;
      error: string;
    };
  };
}
