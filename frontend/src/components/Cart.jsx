import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, Flex, Input } from '@chakra-ui/react';
import useStore from '../store/store';

const Cart = () => {
  const { user, cart, fetchCart, updateCartQuantity, deleteFromCart, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setError('Please log in to view your cart.');
        setLoading(false);
        navigate('/login');
        return;
      }
      try {
        setError('');
        await fetchCart();
      } catch (err) {
        setError('Failed to load cart: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user, fetchCart, navigate]);

  const handleQuantityChange = async (fishItemId, quantity) => {
    try {
      setError('');
      await updateCartQuantity(fishItemId, quantity);
    } catch (err) {
      setError('Failed to update quantity: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveItem = async (fishItemId) => {
    try {
      setError('');
      await deleteFromCart(fishItemId);
    } catch (err) {
      setError('Failed to remove item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <Text textAlign="center" p={6}>Loading cart...</Text>;
  if (error) return <Text textAlign="center" p={6} color="red.500">{error}</Text>;

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Your Cart</Heading>
      {cart && cart.items && cart.items.length > 0 ? (
        <Box>
          {cart.items.map(item => (
            <Flex
              key={item.product._id}
              justify="space-between"
              align="center"
              bg="white"
              p={4}
              mb={2}
              rounded="md"
              shadow="sm"
            >
              <Box>
                <Text fontWeight="bold">{item.product.name}</Text>
                <Text>
                  ${item.product.price.toFixed(2)} x {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </Box>
              <Flex gap={2}>
                <Input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))}
                  w="60px"
                />
                <Button
                  colorScheme="red"
                  onClick={() => handleRemoveItem(item.product._id)}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          ))}
          <Text fontSize="xl" fontWeight="bold" mt={4}>Total: ${cart.totalBill.toFixed(2)}</Text>
          <Flex mt={4} gap={4}>
            <Button colorScheme="green" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Button colorScheme="red" onClick={() => clearCart()}>
              Clear Cart
            </Button>
          </Flex>
        </Box>
      ) : (
        <Text>Your cart is empty.</Text>
      )}
    </Box>
  );
};

export default Cart;