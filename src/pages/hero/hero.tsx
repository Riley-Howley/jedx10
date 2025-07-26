import Button from "../../components/button/button";
import { specialTitle, title, subtitle, primaryButton, SecondaryButton } from "./hero.strings";

import Logo from "../../assets/logo.svg"

const Hero = () => {
    return (
        <section
            style={{
                height: "100vh",
                width: "100%"
            }}
        >
            <img src={Logo} width={300} />
            <h1 style={{
                color: "white",
                fontSize: "3rem",
                fontWeight: "bold",
                marginBottom: "24px",
            }}>{title} <span style={{
                color: "#CBB26A",
            }}>{specialTitle}</span></h1>
            <p style={{
                color: "white",
            }}>{subtitle}</p>
            <div>
                <Button primary text={primaryButton} />
                <Button primary={false} text={SecondaryButton} />
            </div>
        </section>
    );
};

export default Hero;