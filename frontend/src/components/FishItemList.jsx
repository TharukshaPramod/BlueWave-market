import { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import useStore from '../store/store';

const FishItemList = () => {
  const [fishItems, setFishItems] = useState([]);
  const { addToCart } = useStore();

  useEffect(() => {
    axios.get('http://localhost:5000/api/fish-items')
      .then(res => setFishItems(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} p={6}>
      {fishItems.map(item => (
        <Box key={item._id} p={4} bg="white" shadow="md" rounded="lg">
          <Heading size="md">{item.name}</Heading>
          <Text color="gray.600">{item.description}</Text>
          <Text color="green.600" fontWeight="bold">${item.price.toFixed(2)}</Text>
          <Text color="gray.500">Stock: {item.stock}</Text>
          <Button
            mt={2}
            colorScheme="blue"
            onClick={() => addToCart(item._id, 1)}
          >
            Add to Cart
          </Button>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default FishItemList;