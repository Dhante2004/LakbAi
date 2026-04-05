import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Planner from './pages/Planner';
import Dashboard from './pages/Dashboard';
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
              <Route path="/dashboard" element={
                <ProtectedRoute role="tourism_office">
                  <Dashboard />
                </ProtectedRoute>
              } /><Route path="/requests" element={
                <ProtectedRoute role="admin">
                  <Requests />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute role="admin">
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
