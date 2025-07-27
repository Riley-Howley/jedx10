import Button from "../../components/button/button";
import styles from "./journey.module.css";

const Journey = () => {
    const timelines = [
        { title: "Week 1-2: Foundation", description: "Build proper form and fundamental movements" },
        { title: "Week 3-4: Progression", description: "Increase intensity and add challenging variations" },
        { title: "Week 5-6: Transformation", description: "Push your limits with advanced combinations" },
    ];

    return (
        <section className={styles.journey}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Your <span className={styles.highlight}>6-Week Journey</span>
                </h2>

                <div className={styles.layout}>
                    {/* Image Placeholder */}
                    <div className={styles.imageSection}>
                        <div className={styles.imagePlaceholder}>Image Placeholder</div>
                    </div>

                    {/* Timeline Section */}
                    <div className={styles.timelineSection}>
                        <div className={styles.timeline}>
                            {timelines.map((time, idx) => (
                                <div key={idx} className={styles.card}>
                                    <h3 className={styles.cardTitle}>{time.title}</h3>
                                    <p className={styles.cardDescription}>{time.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.buttonContainer}>
                            <Button primary text="Start Now" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Journey;