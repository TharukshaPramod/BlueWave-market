import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Button,
  VStack,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import useStore from '../store/store';

const Home = () => {
  const { fishItems, fetchFishItems, searchFishItems, addToCart, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchFishItems();
  }, [fetchFishItems]);

  // Debounce search function
  const debouncedSearch = useCallback(
    (term) => {
      if (term.trim()) {
        searchFishItems(term);
      } else {
        fetchFishItems();
      }
    },
    [searchFishItems, fetchFishItems]
  );

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set new timeout
    window.searchTimeout = setTimeout(() => {
      debouncedSearch(value);
    }, 500); // 500ms debounce
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    debouncedSearch(searchTerm);
  };

  const handleAddToCart = async (fishItemId) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to cart',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addToCart(fishItemId, 1);
      toast({
        title: 'Success',
        description: 'Item added to cart',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} textAlign="center">
        Welcome to Seafood Marketplace
      </Heading>
      
      <form onSubmit={handleSearch}>
        <HStack mb={6} maxW="600px" mx="auto">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search fish items..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>
          <IconButton
            type="submit"
            aria-label="Search"
            icon={<SearchIcon />}
            colorScheme="teal"
          />
        </HStack>
      </form>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {fishItems?.length > 0 ? (
          fishItems.map((item) => (
            <Box
              key={item._id}
              bg="white"
              p={4}
              rounded="md"
              shadow="md"
              _hover={{ shadow: 'lg', transform: 'scale(1.02)' }}
              transition="all 0.2s"
            >
              {item.photoUrl && (
                <Image
                  src={`http://localhost:5000${item.photoUrl}`}
                  alt={item.name}
                  boxSize="200px"
                  objectFit="cover"
                  rounded="md"
                  mx="auto"
                />
              )}
              <VStack spacing={2} mt={4} align="start">
                <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
                <Text color="gray.600">${item.price.toFixed(2)}</Text>
                <Text fontSize="sm">Stock: {item.stock}</Text>
                <Text fontSize="sm" noOfLines={2}>{item.description}</Text>
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => handleAddToCart(item._id)}
                  isDisabled={item.stock === 0}
                >
                  {user ? 'Add to Cart' : 'Login to Add to Cart'}
                </Button>
              </VStack>
            </Box>
          ))
        ) : (
          <Text w="full" textAlign="center" color="gray.500">
            No fish items available at the moment.
          </Text>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default Home;