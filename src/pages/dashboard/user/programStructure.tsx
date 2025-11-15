import styles from './programStructure.module.css';

interface ProgramStructureProps {
    courses: any,
}

const ProgramStructure = ({courses}: ProgramStructureProps) => {

  return (
    <div className={styles.programStructure}>
      <div className={styles.phasesContainer}>
        {courses.map((course: any, index: number) => (
          <div
            key={course.id}
            className={`${styles.phaseItem} ${course.locked ? styles.locked : styles.active} ${index === 0 ? styles.first : ''}`}
            onClick={() => {
              window.location.href = `/dashboard/course/${course.course.id}`
            }}
          >
            <div className={styles.courseLeft}>
              <div className={styles.courseNumber}>{String(index+=1).padStart(2, '0')}</div>
            </div>
            <div className={styles.courseRight}>
              <div className={styles.courseContent}>
                <h3 className={styles.courseTitle}>{course.course.title}</h3>
              </div>
              {course.locked && (
                <div className={styles.lockIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="9" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 9V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V9" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramStructure;