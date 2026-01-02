import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

const Checkout = () => {
  const { user, cart, fetchCart, checkout, clearCart } = useStore();
  const [paymentSlip, setPaymentSlip] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      if (!user || !user.id) {
        toast({
          title: 'Error',
          description: 'Please log in to checkout.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }
      try {
        await fetchCart();
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to load cart: ' + (err.response?.data?.message || err.message),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    loadCart();
  }, [user, fetchCart, navigate, toast]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPaymentSlip(file);
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: 'Error',
        description: 'Cart is empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!paymentSlip) {
      toast({
        title: 'Error',
        description: 'Payment slip is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('customerId', user.id);
    formData.append('paymentSlip', paymentSlip);
    formData.append('totalAmount', cart.totalBill.toFixed(2)); // Optional, for consistency

    console.log('Sending checkout request:', {
      customerId: user.id,
      totalAmount: cart.totalBill.toFixed(2),
      paymentSlip: paymentSlip.name,
    });

    try {
      await checkout(formData);
      toast({
        title: 'Success',
        description: 'Payment submitted successfully. Awaiting verification.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      clearCart();
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Payment submission failed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>Checkout</Heading>
        <Text>Your cart is empty. Add items to proceed.</Text>
      </Box>
    );
  }

  const totalBill = cart.totalBill || 0;

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Checkout</Heading>
      <VStack spacing={6} align="stretch">
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Text fontWeight="bold" mb={2}>Order Summary</Text>
          {cart.items.map((item) => (
            <Flex key={item.product._id} justify="space-between" mb={2}>
              <Text>{item.product.name} (x{item.quantity})</Text>
              <Text>${(item.quantity * item.product.price).toFixed(2)}</Text>
            </Flex>
          ))}
          <Flex justify="space-between" fontWeight="bold" mt={4}>
            <Text>Total:</Text>
            <Text>${totalBill.toFixed(2)}</Text>
          </Flex>
        </Box>
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <FormControl isRequired>
            <FormLabel>Upload Payment Slip</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </FormControl>
        </Box>
        <Button colorScheme="green" size="lg" onClick={handleCheckout}>
          Submit Payment
        </Button>
      </VStack>
    </Box>
  );
};

export default Checkout;