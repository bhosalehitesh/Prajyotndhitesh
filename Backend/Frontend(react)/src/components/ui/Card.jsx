import React from 'react';

/**
 * Reusable Card Component
 */
const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const classes = [
    'card',
    hover && 'card-hover',
    onClick && 'card-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;

