import Container from "../../components/container/container";
import { specialTitle, title, purposes } from "./purpose.strings";

const Purpose = () => {
    return (
        <section style={{
            height: "100vh",
            width: "100%",
        }}>
            <h1 style={{
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "24px",
            }}>{title} <span style={{
                color: "#CBB26A",
            }}>{specialTitle}</span></h1>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                }}
            >
                {purposes.map((p) => 
                    <Container logo={p.icon} title={p.title} description={p.description} />
                )}
            </div>
        </section>
    );
};

export default Purpose;