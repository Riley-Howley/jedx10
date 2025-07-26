interface ContainerProps {
    logo: string;
    title: string;
    description: string;
};

const Container = ({logo, title, description}: ContainerProps) => {
    return (
        <div 
            style={{
                padding: 32,
                border: "2px solid white",
                borderRadius: "10px",
                color: "white",
                width: "200px",
                height: "300px",
            }}
        >
            {logo}
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    );
};

export default Container;