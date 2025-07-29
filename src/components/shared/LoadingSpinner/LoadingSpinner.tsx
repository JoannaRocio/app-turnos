import React from 'react';
import './LoadingSpinner.scss';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  type?: 'border' | 'grow';
  color?: string;
  centered?: boolean;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<Props> = ({
  size = 'md',
  text = 'Cargando...',
  type = 'border',
  color = 'primary',
  centered = true,
  fullHeight = false,
}) => {
  const sizeStyle =
    size === 'sm'
      ? { width: '1.5rem', height: '1.5rem' }
      : size === 'lg'
        ? { width: '4rem', height: '4rem' }
        : { width: '2.5rem', height: '2.5rem' };

  const spinnerClass = type === 'grow' ? 'spinner-grow' : 'spinner-border';

  const containerClasses = [
    'loading-spinner-container',
    centered ? 'centered' : '',
    fullHeight ? 'full-height' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className={`${spinnerClass} text-${color}`} role="status" style={sizeStyle}>
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
