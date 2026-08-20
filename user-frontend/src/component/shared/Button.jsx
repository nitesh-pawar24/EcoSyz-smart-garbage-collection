import React from 'react';

const Button = ({
    children,
    onClick,
    primary = true,
    outline = false,
    small = false,
    className = '',
    disabled = false,
    type = 'button',
}) => {
    if (outline) {
        return (
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`btn-outline ${small ? 'text-xs px-4 py-1.5' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {children}
            </button>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn-primary ${small ? 'text-xs px-4 py-1.5' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

export default Button;
