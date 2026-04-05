import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Planner from './pages/Planner';
import Destinations from './pages/Destinations'; // Renamed from Dashboard
import Requests from './pages/Requests'; 
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user, userData, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  // Note: Admins inherently bypass this block so they can see shared agency routes
  if (role && userData?.role !== role && userData?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<Home />} />
              
              <Route path="/explore" element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } />
              
              <Route path="/planner" element={
                <ProtectedRoute>
                  <Planner />
                </ProtectedRoute>
              } />
              
              <Route path="/destinations" element={
                <ProtectedRoute role="tourism_office">
                  <Destinations />
                </ProtectedRoute>
              } />
              
              <Route path="/requests" element={
                <ProtectedRoute role="admin">
                  <Requests />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                // role="tourism_office" ensures that both agencies and admins can access it
                <ProtectedRoute role="tourism_office">
                  <Analytics />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}