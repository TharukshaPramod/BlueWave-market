import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import useStore from '../store/store';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, fetchUserProfile } = useStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const trimmedFormData = {
        email: formData.email.trim(),
        password: formData.password.trim(),
      };
      console.log('Sending login request:', trimmedFormData); // Debug log
      await login(trimmedFormData);
      await fetchUserProfile(); // Fetch user profile after login
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      console.error('Login error:', err.response?.data);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box p={8} maxW="md" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
        <Heading mb={6} textAlign="center" color="teal.600">
          Login
        </Heading>
        {error && (
          <Text color="red.500" mb={4} textAlign="center">
            {error}
          </Text>
        )}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                focusBorderColor="teal.500"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                focusBorderColor="teal.500"
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              Login
            </Button>
          </VStack>
        </form>
        <VStack spacing={4} mt={6}>
          <Text>Or login with</Text>
          <Flex gap={4}>
            <Button
              leftIcon={<Icon as={FaGoogle} />}
              colorScheme="red"
              variant="outline"
              onClick={() => alert('Google login not implemented')}
            >
              Google
            </Button>
            <Button
              leftIcon={<Icon as={FaFacebookF} />}
              colorScheme="facebook"
              variant="outline"
              onClick={() => alert('Facebook login not implemented')}
            >
              Facebook
            </Button>
          </Flex>
          <Text>
            Don't have an account?{' '}
            <ChakraLink color="teal.500" onClick={() => navigate('/register')}>
              Register
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Login;