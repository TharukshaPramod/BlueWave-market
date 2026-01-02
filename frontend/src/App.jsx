import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FishItemManagement from './pages/FishItemManagement';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import PaymentsPage from './pages/PaymentsPage';
import PaymentManagement from './pages/PaymentManagement';
import FleetManagement from './pages/FleetManagement';
import StaffManagement from './pages/StaffManagement';
import MaintenanceManagement from './pages/MaintenanceManagement';
import Reports from './components/Reports';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UserManagement from './components/UserManagement';
import Inventory from './pages/Inventory'; // Import the new Inventory page
import useStore from './store/store';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useStore();
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { user, fetchUserProfile } = useStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  return (
    <Box>
      <Navbar isAdmin={user?.role === 'admin'} isMobile={isMobile} />
      <Box p={4}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route
            path="/admin/fish-items"
            element={<ProtectedRoute requireAdmin><FishItemManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/payments"
            element={<ProtectedRoute requireAdmin><PaymentManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/fleet"
            element={<ProtectedRoute requireAdmin><FleetManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/staff"
            element={<ProtectedRoute requireAdmin><StaffManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/maintenance"
            element={<ProtectedRoute requireAdmin><MaintenanceManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/reports"
            element={<ProtectedRoute requireAdmin><Reports /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>}
          />
          <Route
            path="/admin/inventory"
            element={<ProtectedRoute requireAdmin><Inventory /></ProtectedRoute>}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;