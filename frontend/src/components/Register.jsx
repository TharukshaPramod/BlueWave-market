import { useState } from 'react';
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

const Register = () => {
  const navigate = useNavigate();
  const register = useStore((state) => state.register);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box p={8} maxW="md" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
        <Heading mb={6} textAlign="center" color="teal.600">
          Register
        </Heading>
        {error && (
          <Text color="red.500" mb={4} textAlign="center">
            {error}
          </Text>
        )}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                focusBorderColor="teal.500"
              />
            </FormControl>
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
            <FormControl id="phoneNumber" isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                focusBorderColor="teal.500"
                placeholder="e.g., 1234567890"
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              Register
            </Button>
          </VStack>
        </form>
        <VStack spacing={4} mt={6}>
          <Text>Or register with</Text>
          <Flex gap={4}>
            <Button
              leftIcon={<Icon as={FaGoogle} />}
              colorScheme="red"
              variant="outline"
              onClick={() => alert('Google register not implemented')}
            >
              Google
            </Button>
            <Button
              leftIcon={<Icon as={FaFacebookF} />}
              colorScheme="facebook"
              variant="outline"
              onClick={() => alert('Facebook register not implemented')}
            >
              Facebook
            </Button>
          </Flex>
          <Text>
            Already have an account?{' '}
            <ChakraLink color="teal.500" onClick={() => navigate('/login')}>
              Login
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Register;