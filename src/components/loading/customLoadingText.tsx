import React from 'react';
import './customLoadingText.css'; // You'll create this CSS file

// Option 1: Simple component with inline styles
const LoadingTextInline: React.FC = () => {
  const letters = "LOADING...".split("");

  const bounceStyle = {
    display: 'flex',
    gap: '2px',
    fontSize: '3rem',
    fontWeight: 'bold' as const,
    color: '#00d4ff'
  };

  const letterStyle = (index: number) => ({
    display: 'inline-block',
    animation: `bounce 1.5s ease-in-out infinite`,
    animationDelay: `${index * 0.1}s`
  });

  return (
    <div style={bounceStyle}>
      {letters.map((letter, index) => (
        <span key={index} style={letterStyle(index)}>
          {letter}
        </span>
      ))}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

// Option 2: Component using CSS classes (recommended)
const LoadingText: React.FC<{ style?: 'bounce' | 'wave' | 'glitch' | 'pulse' }> = ({ 
  style = 'bounce' 
}) => {
  const letters = "LOADING...".split("");

  return (
    <div className={`loading-${style}`}>
      {letters.map((letter, index) => (
        <span key={index}>{letter}</span>
      ))}
    </div>
  );
};

// Option 3: Customizable component
interface LoadingTextProps {
  text?: string;
  color?: string;
  size?: string;
  animationType?: 'bounce' | 'wave' | 'glitch' | 'pulse';
}

const CustomLoadingText: React.FC<LoadingTextProps> = ({
  text = "LOADING...",
  color = "#00d4ff",
  size = "3rem",
  animationType = "bounce"
}) => {
  const letters = text.split("");

  const containerStyle = {
    display: 'flex',
    gap: '2px',
    fontSize: size,
    fontWeight: 'bold' as const,
    color: color
  };

  return (
    <div className={`loading-${animationType}`} style={containerStyle}>
      {letters.map((letter, index) => (
        <span key={index}>{letter}</span>
      ))}
    </div>
  );
};

export { LoadingTextInline, LoadingText, CustomLoadingText };