import { useState, type JSX } from 'react';
import styles from './AdminDashboard.module.css';

type TabType = 'dashboard' | 'users' | 'content' | 'feedback' | 'workouts';

interface NavItem {
  id: TabType;
  label: string;
  icon: JSX.Element;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      id: 'users',
      label: 'Users & Subscriptions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'content',
      label: 'Content',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      )
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: 'workouts',
      label: 'Workouts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 6.5h11"></path>
          <path d="M6.5 17.5h11"></path>
          <path d="M6.5 12h11"></path>
          <path d="M6.5 6.5L5 5"></path>
          <path d="M6.5 17.5L5 19"></path>
          <path d="M6.5 12L5 12"></path>
          <path d="M17.5 6.5L19 5"></path>
          <path d="M17.5 17.5L19 19"></path>
          <path d="M17.5 12L19 12"></path>
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={styles.contentSection}>
            <h1>Dashboard Overview</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3>Total Users</h3>
                  <p className={styles.statNumber}>2,847</p>
                  <span className={styles.statChange}>+12% from last month</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <h3>Active Sessions</h3>
                  <p className={styles.statNumber}>1,234</p>
                  <span className={styles.statChange}>+5% from yesterday</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <h3>Revenue</h3>
                  <p className={styles.statNumber}>$24,892</p>
                  <span className={styles.statChange}>+18% from last month</span>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3>Workouts Completed</h3>
                  <p className={styles.statNumber}>5,672</p>
                  <span className={styles.statChange}>+23% from last week</span>
                </div>
              </div>
            </div>
            
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3>User Growth</h3>
                <div className={styles.chartPlaceholder}>
                  <svg width="100%" height="200" viewBox="0 0 400 200">
                    <polyline
                      fill="none"
                      stroke="#CBB26A"
                      strokeWidth="3"
                      points="0,150 50,120 100,100 150,80 200,60 250,50 300,40 350,30 400,20"
                    />
                    <circle cx="400" cy="20" r="4" fill="#CBB26A"/>
                  </svg>
                </div>
              </div>
              
              <div className={styles.chartCard}>
                <h3>Recent Activity</h3>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot}></div>
                    <span>New user registered - sarah@example.com</span>
                    <span className={styles.activityTime}>2 min ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot}></div>
                    <span>Workout completed - "Upper Body Blast"</span>
                    <span className={styles.activityTime}>5 min ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot}></div>
                    <span>Subscription upgraded - Premium Plan</span>
                    <span className={styles.activityTime}>12 min ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot}></div>
                    <span>Feedback submitted - 5 stars</span>
                    <span className={styles.activityTime}>18 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className={styles.contentSection}>
            <h1>Users & Subscriptions</h1>
            <p className={styles.sectionDescription}>Manage user accounts and subscription plans</p>
            <div className={styles.placeholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>User management interface coming soon...</p>
            </div>
          </div>
        );
      
      case 'content':
        return (
          <div className={styles.contentSection}>
            <h1>Content Management</h1>
            <p className={styles.sectionDescription}>Create and manage workout content, articles, and media</p>
            <div className={styles.placeholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <p>Content management system coming soon...</p>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className={styles.contentSection}>
            <h1>User Feedback</h1>
            <p className={styles.sectionDescription}>Review and respond to user feedback and support requests</p>
            <div className={styles.placeholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>Feedback management interface coming soon...</p>
            </div>
          </div>
        );
      
      case 'workouts':
        return (
          <div className={styles.contentSection}>
            <h1>Workout Library</h1>
            <p className={styles.sectionDescription}>Manage workout routines, exercises, and training programs</p>
            <div className={styles.placeholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6.5 6.5h11"></path>
                <path d="M6.5 17.5h11"></path>
                <path d="M6.5 12h11"></path>
                <path d="M6.5 6.5L5 5"></path>
                <path d="M6.5 17.5L5 19"></path>
              </svg>
              <p>Workout management interface coming soon...</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.adminDashboard}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(item.id)}
                type="button"
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;