import Button from "../../components/button/button";
import { description, points, specialTitle, subscriptionDescription, subscriptionPrice, subscriptionTitle, title } from "./subscription.strings";
import styles from "./subscription.module.css";

const Subscription = () => {
    return (
        <section className={styles.subscription}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {title} <span className={styles.highlight}>{specialTitle}</span>
                    </h2>
                    <p className={styles.description}>{description}</p>
                </div>

                <div className={styles.pricingCard}>
                    <h3 className={styles.subscriptionTitle}>{subscriptionTitle}</h3>
                    <div className={styles.price}>{subscriptionPrice}</div>
                    <p className={styles.subscriptionDescription}>{subscriptionDescription}</p>
                    
                    <ul className={styles.features}>
                        {points.map((point, index) => (
                            <li key={index} className={styles.feature}>
                                <span className={styles.checkmark}>✓</span>
                                {point.title}
                            </li>
                        ))}
                    </ul>

                    <div className={styles.buttonContainer}>
                        <Button primary text="Get Started Now" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Subscription;