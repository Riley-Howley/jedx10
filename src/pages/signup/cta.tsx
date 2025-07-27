import Button from "../../components/button/button";
import styles from "./cta.module.css";

const CallToAction = () => {
    return (
        <section className={styles.cta}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Ready to <span className={styles.highlight}>Transform</span> Your Body?
                </h2>
                <p className={styles.description}>
                    Join thousands who have already changed their lives with our 6-week program.
                </p>
                <div className={styles.buttonContainer}>
                    <Button primary text="Start Your Transformation Today" />
                </div>
            </div>
        </section>
    );
};

export default CallToAction;