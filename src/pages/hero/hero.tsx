import Button from "../../components/button/button";
import { specialTitle, title, subtitle, primaryButton, SecondaryButton } from "./hero.strings";
import Logo from "../../assets/logo.svg";
import styles from "./hero.module.css";

const Hero = () => {
    return (
        <section className={styles.hero}>
            <img src={Logo} alt="JEDXIO Logo" className={styles.logo} />
            <h1 className={styles.title}>
                {title} <span className={styles.highlight}>{specialTitle}</span>
            </h1>
            <p className={styles.subtitle}>{subtitle}</p>
            <div className={styles.buttons}>
                <Button primary text={primaryButton} />
                <Button primary={false} text={SecondaryButton} />
            </div>
        </section>
    );
};

export default Hero;