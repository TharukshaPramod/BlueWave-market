import { useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Button,
  Icon,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdShoppingCart,
  MdDirectionsBoat,
  MdBuild,
  MdPeople,
  MdPerson,
  MdPayment,
  MdAssessment,
  MdInventory, // Added for Inventory icon
} from 'react-icons/md';
import useStore from '../store/store';

const AdminDashboard = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w={{ base: 'full', md: '250px' }}
        bg={sidebarBg}
        p={4}
        borderRight="1px"
        borderColor={bg}
      >
        <VStack spacing={4} align="stretch">
          <Heading size="md" mb={6}>
            Admin Dashboard
          </Heading>
          <Button
            as={Link}
            to="/admin/dashboard"
            leftIcon={<Icon as={MdDashboard} />}
            variant="ghost"
            justifyContent="start"
          >
            Dashboard
          </Button>
          <Button
            as={Link}
            to="/admin/fish-items"
            leftIcon={<Icon as={MdShoppingCart} />}
            variant="ghost"
            justifyContent="start"
          >
            Fish Items
          </Button>
          <Button
            as={Link}
            to="/admin/fleet"
            leftIcon={<Icon as={MdDirectionsBoat} />}
            variant="ghost"
            justifyContent="start"
          >
            Fleet Management
          </Button>
          <Button
            as={Link}
            to="/admin/maintenance"
            leftIcon={<Icon as={MdBuild} />}
            variant="ghost"
            justifyContent="start"
          >
            Maintenance
          </Button>
          <Button
            as={Link}
            to="/admin/staff"
            leftIcon={<Icon as={MdPeople} />}
            variant="ghost"
            justifyContent="start"
          >
            Staff Management
          </Button>
          <Button
            as={Link}
            to="/admin/users"
            leftIcon={<Icon as={MdPerson} />}
            variant="ghost"
            justifyContent="start"
          >
            User Management
          </Button>
          <Button
            as={Link}
            to="/admin/payments"
            leftIcon={<Icon as={MdPayment} />}
            variant="ghost"
            justifyContent="start"
          >
            Payment Management
          </Button>
          <Button
            as={Link}
            to="/admin/reports"
            leftIcon={<Icon as={MdAssessment} />}
            variant="ghost"
            justifyContent="start"
          >
            Reports
          </Button>
          <Button
            as={Link}
            to="/admin/inventory"
            leftIcon={<Icon as={MdInventory} />}
            variant="ghost"
            justifyContent="start"
          >
            Inventory
          </Button>
          <Button onClick={toggleColorMode} variant="ghost" justifyContent="start">
            Toggle Theme
          </Button>
          <Button onClick={handleLogout} variant="ghost" justifyContent="start" colorScheme="red">
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" p={6} bg={bg}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Welcome, {user?.fullName || 'Admin'}</Heading>
          <Text>Role: Admin</Text>
        </Flex>
        <Outlet />
      </Box>
    </Flex>
  );
};

export default AdminDashboard;