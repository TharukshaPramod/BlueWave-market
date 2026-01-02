import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Heading,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { FaShoppingCart, FaCreditCard, FaUserShield, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useStore from "../store/store";

const Navbar = ({ isMobile }) => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex
      as="nav"
      bg="#2C5D63" // Ocean Blue for both admin and customer
      p={4}
      color="#F4E4BC" // Sandy Beige text
      align="center"
      boxShadow="md"
      flexWrap={isMobile ? 'wrap' : 'nowrap'}
    >
      <Heading size="md">
        <Link to="/" style={{ color: '#F4E4BC', textDecoration: 'none' }}>
          Seafood Marketplace
        </Link>
      </Heading>
      <Spacer />
      <Flex gap={isMobile ? 2 : 4} flexWrap={isMobile ? 'wrap' : 'nowrap'} align="center">
        {/* Links for All Users */}
        {isMobile ? (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="outline"
              borderColor="#F4E4BC"
              color="#F4E4BC"
            />
            <MenuList bg="#2C5D63" color="#F4E4BC" border="none">
              <MenuItem as={Link} to="/" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                Home
              </MenuItem>
              {user && (
                <>
                  <MenuItem as={Link} to="/cart" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Cart
                  </MenuItem>
                  <MenuItem as={Link} to="/checkout" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Checkout
                  </MenuItem>
                  <MenuItem as={Link} to="/payments" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Payments
                  </MenuItem>
                  <MenuItem as={Link} to="/profile" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Profile
                  </MenuItem>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <MenuItem as={Link} to="/admin/fish-items" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Fish Items
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/payments" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Payments
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/fleet" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Fleet
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/staff" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Staff
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/maintenance" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Maintenance
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/reports" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Reports
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/users" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Users
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/inventory" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Inventory
                  </MenuItem>
                </>
              )}
              {user ? (
                <MenuItem onClick={handleLogout} bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                  Logout
                </MenuItem>
              ) : (
                <>
                  <MenuItem as={Link} to="/login" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Login
                  </MenuItem>
                  <MenuItem as={Link} to="/register" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Register
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        ) : (
          <>
            <Button
              as={Link}
              to="/"
              variant="ghost"
              color="#F4E4BC"
              leftIcon={<HamburgerIcon />}
              _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
            >
              Home
            </Button>
            {user && (
              <>
                <Button
                  as={Link}
                  to="/cart"
                  variant="ghost"
                  color="#F4E4BC"
                  leftIcon={<FaShoppingCart />}
                  _hover={{ bg: '#4A878A', color: '#4E4BC' }}
                >
                  Cart
                </Button>
                <Button
                  as={Link}
                  to="/checkout"
                  variant="ghost"
                  color="#F4E4BC"
                  leftIcon={<FaCreditCard />}
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Checkout
                </Button>
                <Button
                  as={Link}
                  to="/payments"
                  variant="ghost"
                  color="#F4E4BC"
                  leftIcon={<FaCreditCard />}
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Payments
                </Button>
                <Button
                  as={Link}
                  to="/profile"
                  variant="ghost"
                  color="#F4E4BC"
                  leftIcon={<FaUser />}
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Profile
                </Button>
              </>
            )}
            {user?.role === 'admin' && (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="outline"
                  borderColor="#F4E4BC"
                  color="#F4E4BC"
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Admin
                </MenuButton>
                <MenuList bg="#2C5D63" color="#F4E4BC" border="none">
                  <MenuItem as={Link} to="/admin/fish-items" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Fish Items
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/payments" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Payments
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/fleet" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Fleet
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/staff" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Staff
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/maintenance" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Maintenance
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/reports" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Reports
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/users" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Users
                  </MenuItem>
                  <MenuItem as={Link} to="/admin/inventory" bg="#2C5D63" _hover={{ bg: '#4A878A' }}>
                    Inventory
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
            {user ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                borderColor="#F4E4BC"
                color="#F4E4BC"
                _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline"
                  borderColor="#F4E4BC"
                  color="#F4E4BC"
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline"
                  borderColor="#F4E4BC"
                  color="#F4E4BC"
                  _hover={{ bg: '#4A878A', color: '#F4E4BC' }}
                >
                  Register
                </Button>
              </>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Navbar;