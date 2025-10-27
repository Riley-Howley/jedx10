import { useState, useEffect } from 'react';
import styles from './userDashboard.module.css';
import { Lock } from 'lucide-react';
import { enrollUserInProgram, getAvailablePrograms, getUserEnrolledPrograms, type DBProgram } from '../admin/supabaseHelpers';
import { useCurrentUser } from '../../../context/UserContext';

const EnrolledPrograms = ({ userId }: { userId: string }) => {
  const [userPrograms, setUserPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPrograms = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const programs = await getUserEnrolledPrograms(userId);
        setUserPrograms(programs);
      } catch (err) {
        console.error("Error fetching user programs:", err);
        setError("Failed to load your programs");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPrograms();
  }, [userId]);


  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;

  return (
    <div>
      {userPrograms.map((program) => (
        <div className={styles.enrollProgram}>
          <div className={styles.enrollProgramRow}>
            <div>
              <h1>{program.programs.title}</h1>
              <p style={{
                color: '#52525b',
              }}>ELITE TRAINING SYSTEM</p>
            </div>
            <div>
              <p style={{
                textAlign: 'right',
                fontSize: 30,
              }}>16%</p>
              <p style={{
                color: '#52525b',
                fontSize: 12,
              }}>COMPLETE</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBarFill}
              // TODO - Add progress to enrollment
              // style={{ width: `${enrolledPrograms[0].progress || 10}%` }}
              style={{ width: `${50}%` }} 

            />
          </div>
          <div>
            {/* Show the next course */}
            <div className={styles.enrollProgramNextCourse}>
              <div>
                <h4>NEXT WORKOUT</h4>
                <p style={{
                  color: '#52525b',
                }}>Core Stability Flow</p>
              </div>
              <button className={styles.startButton}>
                START
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AvailablePrograms = ({ userId }: { userId: string }) => {
  const [programs, setPrograms] = useState<DBProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null); // Track which program is being enrolled

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const programs = await getAvailablePrograms(userId);
        setPrograms(programs);
      } catch (err) {
        console.error("Error fetching programs:", err)
        setError("Failed to load programs")
      } finally {
        setLoading(false)
      }

    }
    fetchPrograms();
  }, [])

  const handleEnroll = async (programId: string) => {
    try {
      setEnrolling(programId);

      await enrollUserInProgram(userId, programId)

      setPrograms(programs.filter(p => p.id !== programId));

    } catch (err) {
      console.error("Error enrolling in program:", err);
      setError("Failed to enroll in program");
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;

  return (
    <div>
      <div className={styles.availableHeader}>
        <h1 className={styles.availableTitle}>Discover Programs</h1>
        <p className={styles.availableDescription}>Find your next fitness challenge</p>
      </div>
      {programs.map((prog) => (
        <div key={prog.id} className={styles.programContainer}>
          <div className={styles.programContent}>
            <h1 className={styles.programTitle}>{prog.title}</h1>
            <p className={styles.programDescription}>{prog.description || "ADVANCED PERFORMANCE"}</p>
            <div className={styles.programDetailsContainer}>
              <div className={styles.programDetailItems}>
                <h4>Duration</h4>
                <h4>Difficulty</h4>
                <h4>Focus</h4>
              </div>
              <div className={styles.programDetailValues}>
                <h4>8 Weeks</h4>
                <h4>{'Advanced'}</h4>
                <h4>{'Strength & Power'}</h4>
              </div>
            </div>
          </div>
          <div className={styles.programFooter}>
            <hr className={styles.line} />
            <button
              className={styles.enrollButton}
              onClick={() => handleEnroll(prog.id)}
              disabled={enrolling === prog.id || !prog.is_active}
            >
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
              }}>
                {!prog.is_active && <Lock />}
                {enrolling === prog.id ? 'ENROLLING...' : 'ENROLL NOW'}
              </div>
            </button>
          </div>
        </div>
      ))}
    </div>);
};

const UserDashboard = () => {
  const tabs = ['enrolled', 'available'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div style={{ backgroundColor: '#121214' }} className={styles.dashboard}>
        <div className={styles.tabContent}>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ backgroundColor: '#121214' }} className={styles.dashboard}>
        <div className={styles.tabContent}>
          <h1>Please log in</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#121214' }} className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>FITNESS</h1>
            <div className={styles.headerSubtitle}>
              <hr className={styles.headerLine} />
              <h4 className={styles.headerText}>YOUR TRAINING HUB</h4>
            </div>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`${styles.tab} ${activeTab === 'enrolled' ? styles.tabActive : ''}`}
          >
            Enrolled Programs
            {activeTab === 'enrolled' && <div className={styles.tabIndicator} />}
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`${styles.tab} ${activeTab === 'available' ? styles.tabActive : ''}`}
          >
            Available Programs
            {activeTab === 'available' && <div className={styles.tabIndicator} />}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'enrolled' ? (
          <EnrolledPrograms userId={user.id} />
        ) : (
          <AvailablePrograms userId={user.id} />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;