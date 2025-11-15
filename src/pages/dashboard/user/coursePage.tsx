import { useParams } from "react-router-dom";

import styles from "./coursePage.module.css";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../context/UserContext";
import { loadCourseWithVideos } from "../admin/supabaseHelpers";
import CourseStructure from "./courseStructure";

type CourseProp = {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    duration?: string;
    difficulty?: string;
    focus?: string;
    exercises?: any;
    disclaimer?: string;
}[] | null;

const CoursePage = () => {
    const { courseId } = useParams();

    const [course, setCourse] = useState<CourseProp>(null);

    const { user } = useCurrentUser();


    const handleLoadCourse = async (courseId: string) => {
        if (!user) return
        const data = await loadCourseWithVideos(courseId);
        if (data) setCourse(data as any)
    }

    useEffect(() => {
        handleLoadCourse(courseId as string);
    }, [courseId]);

    console.log('course', course)

    return (
        <div style={{ backgroundColor: '#121214' }} className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        {course && <h1 className={styles.headerTitle}>{course[0].title ?? "Loading..."}</h1>}
                        <div className={styles.headerSubtitle}>
                            <h4 className={styles.headerText}>YOUR TRAINING HUB</h4>
                        </div>
                    </div>
                </div>
            </div>
            {course && user && <CourseStructure course={course[0]} userId={user?.id} />}
        </div>
    );

};

export default CoursePage;