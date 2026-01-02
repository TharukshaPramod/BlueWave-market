import { useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Image,
  Button,
  NumberInput,
  NumberInputField,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

const CartPage = () => {
  const { cart, fetchCart, updateCartQuantity, deleteFromCart } = useStore();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (fishItemId, value) => {
    try {
      await updateCartQuantity(fishItemId, value);
      toast({
        title: 'Success',
        description: 'Cart updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveItem = async (fishItemId) => {
    try {
      await deleteFromCart(fishItemId);
      toast({
        title: 'Success',
        description: 'Item removed from cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>Your Cart</Heading>
        <Text>Your cart is empty.</Text>
      </Box>
    );
  }

  const totalBill = cart.totalBill || 0;

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Your Cart</Heading>
      <VStack spacing={4} align="stretch">
        {cart.items.map((item) => (
          <Flex
            key={item.product._id}
            p={4}
            bg="white"
            rounded="md"
            shadow="sm"
            justify="space-between"
            align="center"
          >
            <Flex align="center" gap={4}>
              {item.product.photoUrl && (
                <Image
                  src={`http://localhost:5000${item.product.photoUrl}`}
                  alt={item.product.name}
                  boxSize="100px"
                  objectFit="cover"
                  rounded="md"
                />
              )}
              <Box>
                <Text fontWeight="bold">{item.product.name}</Text>
                <Text>${item.product.price.toFixed(2)}</Text>
                <Text>Subtotal: ${(item.quantity * item.product.price).toFixed(2)}</Text>
              </Box>
            </Flex>
            <Flex align="center" gap={4}>
              <NumberInput
                min={1}
                max={item.product.stock}
                value={item.quantity}
                onChange={(valueString) => handleQuantityChange(item.product._id, parseInt(valueString))}
                w="100px"
              >
                <NumberInputField />
              </NumberInput>
              <Button colorScheme="red" onClick={() => handleRemoveItem(item.product._id)}>
                Remove
              </Button>
            </Flex>
          </Flex>
        ))}
        <Flex justify="space-between" p={4} bg="gray.100" rounded="md">
          <Text fontWeight="bold">Total Bill:</Text>
          <Text fontWeight="bold">${totalBill.toFixed(2)}</Text>
        </Flex>
        <Button
          colorScheme="green"
          size="lg"
          onClick={handleProceedToCheckout}
          isDisabled={cart.items.length === 0}
        >
          Proceed to Checkout
        </Button>
      </VStack>
    </Box>
  );
};

export default CartPage;