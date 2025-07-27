import Container from "../../components/container/container";
import { specialTitle, title, purposes } from "./purpose.strings";
import styles from "./purpose.module.css";

const Purpose = () => {
    return (
        <section className={styles.purpose}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    {title} <span className={styles.highlight}>{specialTitle}</span>
                </h2>
                <div className={styles.grid}>
                    {purposes.map((p, idx) => (
                        <Container
                            key={idx}
                            logo={p.icon}
                            title={p.title}
                            description={p.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Purpose;