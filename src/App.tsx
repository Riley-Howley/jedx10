import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login/login'
import { useEffect, useState, type JSX } from 'react';
import { supabase } from './lib/superbase';
import Register from './pages/register/register';

function PrivateRoute({ element }: { element: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>; // Optional: Add a loading state
  return isAuthenticated ? element : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute element={<></>} />
          } 
        />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App