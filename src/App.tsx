import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import Home from './pages/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import Dashboard from './pages/dashboard/dashboard';
import AdminDashboard from './pages/dashboard/admin/adminDashboard';
import UserDashboard from './pages/dashboard/user/userDashboard';
import { useCurrentUser } from './context/UserContext';
import { useEffect, type JSX } from 'react';
import ProgramPage from './pages/dashboard/user/programPage';
import CoursePage from './pages/dashboard/user/coursePage';
import { supabase } from './lib/superbase';

function useLastSeen() {
  useEffect(() => {
    const upsertLastSeen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id);
    };

    // run on load
    upsertLastSeen();

    // run when auth state changes (login/logout/refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      upsertLastSeen();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);
}

function PrivateRoute({ element }: { element: JSX.Element }) {
  const { user, loading } = useCurrentUser(); 
  useLastSeen();


  if (loading) return <div>Loading...</div>;
  return user ? element : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useCurrentUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        >
          <Route
            path="home"
            element={
              user?.user_metadata?.role === 'admin'
                ? <AdminDashboard />
                : <UserDashboard />
            }
          />
          <Route path="program/:programId" element={<ProgramPage />} />
          <Route path="course/:courseId" element={<CoursePage />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}