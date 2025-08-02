import type { MouseEventHandler } from 'react';

interface ButtonProps {
    primary: boolean;
    text: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({primary, text, onClick}: ButtonProps) => {
    return (
        primary ? (
            <button 
                type="button"
                onClick={onClick}
                style={{
                    backgroundColor: "#CBB26A",
                    padding: "16px 32px",
                    borderRadius: "10px",
                }}>
                {text}
            </button>
        ) : (
            <button 
                type="button"
                onClick={onClick}
                style={{
                    border: "2px solid white",
                    borderRadius: "10px",
                    padding: "16px 32px",
                    color: "white"
                }}>
                {text}
            </button>
        )
        
    );
};

export default Button;