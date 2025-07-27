import styles from "./testimonials.module.css";

const Testimonials = () => {
    const testimonials = [
        {
            rating: 5,
            quote: "I've tried many fitness programs before, but JEDX10 was the first one where I actually stuck with it for the full 6 weeks and saw real results!",
            name: "Sarah T.",
            achievement: "Lost 12 lbs in 6 weeks"
        },
        {
            rating: 5,
            quote: "The structured approach made it easy to follow along, and the video guidance ensured I was doing exercises with proper form. Game changer!",
            name: "Mike R.",
            achievement: "Gained significant strength"
        },
        {
            rating: 5,
            quote: "As a busy professional, I needed something efficient and effective. This program delivered exactly that - workouts I could do anywhere.",
            name: "Jamie L.",
            achievement: "Improved energy & focus"
        }
    ];

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span 
                key={index} 
                className={index < rating ? styles.starFilled : styles.starEmpty}
            >
                ⭐
            </span>
        ));
    };

    return (
        <section className={styles.testimonials}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Success <span className={styles.highlight}>Stories</span>
                </h2>

                <div className={styles.testimonialsGrid}>
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className={styles.testimonialCard}>
                            <div className={styles.rating}>
                                {renderStars(testimonial.rating)}
                            </div>
                            
                            <blockquote className={styles.quote}>
                                "{testimonial.quote}"
                            </blockquote>
                            
                            <div className={styles.author}>
                                <h4 className={styles.name}>{testimonial.name}</h4>
                                <p className={styles.achievement}>{testimonial.achievement}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;