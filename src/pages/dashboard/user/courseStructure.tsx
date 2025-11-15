import { useState } from "react";
import styles from "./courseStructure.module.css";
import { updateCourseProgress } from "../admin/supabaseHelpers";

interface CourseStructureProps {
    course: {
        id: string;
        title?: string;
        subtitle?: string;
        description?: string;
        duration?: string;
        difficulty?: string;
        focus?: string;
        videos?: any;
        disclaimer?: string;
    };
    userId: string;
}

const CourseStructure = ({ course,userId }: CourseStructureProps) => {
    const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const toggleVideo = (exerciseId: string) => {
        setExpandedVideo(expandedVideo === exerciseId ? null : exerciseId);
    };
    console.log("Course", course)

    function getYouTubeEmbedUrl(url: string) {
        // youtu.be short link
        if (url.includes("youtu.be")) {
          const id = url.split("/").pop();
          return `https://www.youtube.com/embed/${id}`;
        }
      
        // normal watch link
        if (url.includes("watch?v=")) {
          const id = url.split("watch?v=")[1].split("&")[0];
          return `https://www.youtube.com/embed/${id}`;
        }
      
        // shorts link
        if (url.includes("/shorts/")) {
          const id = url.split("/shorts/")[1].split("?")[0];
          return `https://www.youtube.com/embed/${id}`;
        }
      
        // Already an embed link
        if (url.includes("/embed/")) {
          return url;
        }
      
        return "";
      }
      
      function secondsToMinutes(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      }
      

    return (
        <div className={styles.courseStructure}>
            {/* Header Section */}
                {/* Program Stats */}
                {(course.duration || course.difficulty || course.focus) && (
                    <div className={styles.stats}>
                        {course.duration && (
                            <div className={styles.stat}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>{course.duration}</span>
                            </div>
                        )}
                        {course.difficulty && (
                            <div className={styles.stat}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>{course.difficulty}</span>
                            </div>
                        )}
                        {course.focus && (
                            <div className={styles.stat}>
                                <span className={styles.emoji}>💪</span>
                                <span>{course.focus}</span>
                            </div>
                        )}
                    </div>
                )}

            {/* Disclaimer Banner */}
            {course.disclaimer && (
                <div className={styles.disclaimerBanner}>
                    <button
                        className={styles.disclaimerButton}
                        onClick={() => setShowDisclaimer(!showDisclaimer)}
                    >
                        <div className={styles.disclaimerHeader}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>Important Safety Information</span>
                        </div>
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            className={showDisclaimer ? styles.chevronUp : styles.chevronDown}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    {showDisclaimer && (
                        <p className={styles.disclaimerText}>{course.disclaimer}</p>
                    )}
                </div>
            )}

            {/* Exercise List */}
            {course.videos && course.videos.length > 0 && (
                <div className={styles.exercisesSection}>
                    <h2 className={styles.exercisesTitle}>Today's Training</h2>
                    
                    <div className={styles.exerciseList}>
                        {course.videos.map((video: any) => (
                            <div key={video.id} className={styles.exerciseCard}>
                                <button
                                    className={styles.exerciseHeader}
                                    onClick={() => toggleVideo(video.id)}
                                >
                                    <div className={styles.exerciseContent}>
                                        <div className={styles.playButton}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                        </div>
                                        <div className={styles.exerciseInfo}>
                                            <h3 className={styles.exerciseName}>{video.title}</h3>
                                            <div className={styles.videoMeta}>
                                                {video.duration_seconds && (
                                                    <span>⏱️ {secondsToMinutes(video.duration_seconds)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <svg 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                        className={expandedVideo === video.id ? styles.chevronUp : styles.chevronDown}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>

                                {expandedVideo === video.id && (
                                    <div className={styles.videoContainer}>
                                        <div className={styles.videoWrapper}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={getYouTubeEmbedUrl(video.video_url)}
                                                title={video.name}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className={styles.ctaSection}>
                        <button onClick={async () => {
                            const enrollId = await updateCourseProgress(course.id, userId)
                            
                            window.location.href = `/dashboard/program/${enrollId[0].program_enrollment_id}`
                        }} className={styles.completeButton}>
                            Mark as Complete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseStructure;