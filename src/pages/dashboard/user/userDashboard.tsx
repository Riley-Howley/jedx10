import { useState, useEffect } from 'react';
import styles from './userDashboard.module.css';

interface WeekData {
  id: number;
  title: string;
  description: string;
  status: 'not-started' | 'locked' | 'in-progress' | 'completed';
  isUnlocked: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}

interface UserStats {
  workoutsCompleted: number;
  minutesWatched: number;
  workoutsRated: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
}

const UserDashboard = () => {
  // Mock user stats - in real app, this would come from API/database
  const [userStats] = useState<UserStats>({
    workoutsCompleted: 12,
    minutesWatched: 180,
    workoutsRated: 3,
    currentStreak: 2,
    longestStreak: 5,
    totalWorkouts: 12
  });

  const [weeks] = useState<WeekData[]>([
    {
      id: 1,
      title: 'Week 1: Foundation & Core',
      description: 'Build your base fitness and core stability.',
      status: 'not-started',
      isUnlocked: true
    },
    {
      id: 2,
      title: 'Week 2: Strength Building',
      description: 'Increase muscular strength and definition.',
      status: 'locked',
      isUnlocked: false
    },
    {
      id: 3,
      title: 'Week 3: Endurance Boost',
      description: 'Improve cardiovascular health and stamina.',
      status: 'locked',
      isUnlocked: false
    },
    {
      id: 4,
      title: 'Week 4: Power & Agility',
      description: 'Develop explosive power and quickness.',
      status: 'locked',
      isUnlocked: false
    },
    {
      id: 5,
      title: 'Week 5: Peak Performance',
      description: 'Challenge your limits and reach new heights.',
      status: 'locked',
      isUnlocked: false
    },
    {
      id: 6,
      title: 'Week 6: Maintenance & Flow',
      description: 'Sustain your fitness and focus on recovery.',
      status: 'locked',
      isUnlocked: false
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'dedication',
      title: 'Dedication',
      description: 'Watch 300 minutes of workouts',
      icon: '⭐',
      isUnlocked: false,
      progress: userStats.minutesWatched,
      target: 300
    },
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      isUnlocked: userStats.workoutsCompleted >= 1
    },
    {
      id: 'fitness-fanatic',
      title: 'Fitness Fanatic',
      description: 'Complete 50 workouts',
      icon: '🏆',
      isUnlocked: false,
      progress: userStats.workoutsCompleted,
      target: 50
    },
    {
      id: 'hour-power',
      title: 'Hour Power',
      description: 'Watch 60 minutes of workouts',
      icon: '⏱️',
      isUnlocked: userStats.minutesWatched >= 60,
      progress: userStats.minutesWatched,
      target: 60
    },
    {
      id: 'reviewer',
      title: 'Reviewer',
      description: 'Rate 5 workouts',
      icon: '⭐',
      isUnlocked: false,
      progress: userStats.workoutsRated,
      target: 5
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day workout streak',
      icon: '🔥',
      isUnlocked: false,
      progress: userStats.longestStreak,
      target: 7
    },
    {
      id: 'streak-starter',
      title: 'Streak Starter',
      description: 'Maintain a 3-day workout streak',
      icon: '🔥',
      isUnlocked: userStats.longestStreak >= 3,
      progress: userStats.longestStreak,
      target: 3
    },
    {
      id: 'workout-warrior',
      title: 'Workout Warrior',
      description: 'Complete 10 workouts',
      icon: '💪',
      isUnlocked: userStats.workoutsCompleted >= 10,
      progress: userStats.workoutsCompleted,
      target: 10
    }
  ]);

  // Check achievements on component mount and stats change
  useEffect(() => {
    setAchievements(prevAchievements =>
      prevAchievements.map(achievement => {
        const updatedAchievement = { ...achievement };
        
        switch (achievement.id) {
          case 'dedication':
            updatedAchievement.isUnlocked = userStats.minutesWatched >= 300;
            updatedAchievement.progress = userStats.minutesWatched;
            break;
          case 'first-steps':
            updatedAchievement.isUnlocked = userStats.workoutsCompleted >= 1;
            break;
          case 'fitness-fanatic':
            updatedAchievement.isUnlocked = userStats.workoutsCompleted >= 50;
            updatedAchievement.progress = userStats.workoutsCompleted;
            break;
          case 'hour-power':
            updatedAchievement.isUnlocked = userStats.minutesWatched >= 60;
            updatedAchievement.progress = userStats.minutesWatched;
            break;
          case 'reviewer':
            updatedAchievement.isUnlocked = userStats.workoutsRated >= 5;
            updatedAchievement.progress = userStats.workoutsRated;
            break;
          case 'streak-master':
            updatedAchievement.isUnlocked = userStats.longestStreak >= 7;
            updatedAchievement.progress = userStats.longestStreak;
            break;
          case 'streak-starter':
            updatedAchievement.isUnlocked = userStats.longestStreak >= 3;
            updatedAchievement.progress = userStats.longestStreak;
            break;
          case 'workout-warrior':
            updatedAchievement.isUnlocked = userStats.workoutsCompleted >= 10;
            updatedAchievement.progress = userStats.workoutsCompleted;
            break;
        }
        
        return updatedAchievement;
      })
    );
  }, [userStats]);

  const handleWeekClick = (week: WeekData) => {
    if (!week.isUnlocked) {
      return;
    }
    
    console.log(`Starting ${week.title}`);
    // Navigate to week details or start workout
  };

  const getStatusText = (status: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'Locked';
    
    switch (status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Locked';
    }
  };

  const getStatusClass = (status: string, isUnlocked: boolean) => {
    if (!isUnlocked) return styles.statusLocked;
    
    switch (status) {
      case 'not-started': return styles.statusNotStarted;
      case 'in-progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusLocked;
    }
  };

  return (
    <div style={{backgroundColor: '#1A1F2E'}} className={styles.dashboard}>
      <div className={styles.leftSection}>
        <h1 className={styles.sectionTitle}>Your Program</h1>
        
        <div className={styles.weeksList}>
          {weeks.map((week) => (
            <div 
              key={week.id}
              className={`${styles.weekCard} ${!week.isUnlocked ? styles.weekCardLocked : ''}`}
              onClick={() => handleWeekClick(week)}
            >
              <div className={styles.weekContent}>
                <div className={styles.weekHeader}>
                  <h3 className={styles.weekTitle}>
                    {week.title}
                    <span className={styles.lockIcon}>
                      {!week.isUnlocked && '🔒'}
                    </span>
                  </h3>
                  <span className={getStatusClass(week.status, week.isUnlocked)}>
                    {getStatusText(week.status, week.isUnlocked)}
                  </span>
                </div>
                <p className={styles.weekDescription}>{week.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rightSection}>
        <h2 className={styles.sectionTitle}>Achievements</h2>
        <p className={styles.sectionSubtitle}>Upcoming</p>
        
        <div className={styles.achievementsList}>
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`${styles.achievementCard} ${achievement.isUnlocked ? styles.achievementUnlocked : ''}`}
            >
              <div className={styles.achievementIcon}>
                {achievement.icon}
              </div>
              <div className={styles.achievementContent}>
                <h4 className={styles.achievementTitle}>{achievement.title}</h4>
                <p className={styles.achievementDescription}>
                  {achievement.description}
                  {achievement.progress !== undefined && achievement.target && (
                    <span className={styles.progressText}>
                      {' '}({achievement.progress}/{achievement.target})
                    </span>
                  )}
                </p>
                {achievement.progress !== undefined && achievement.target && (
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;