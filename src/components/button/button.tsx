interface ButtonProps {
    primary: boolean;
    text: string;
}

const Button = ({primary, text}: ButtonProps) => {
    return (
        primary ? (
            <button style={{
                backgroundColor: "#CBB26A",
                padding: "16px 32px",
                borderRadius: "10px",
            }}>
                {text}
            </button>
        ) : (
            <button style={{
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