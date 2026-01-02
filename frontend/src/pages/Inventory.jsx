import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from '@chakra-ui/react';
import useStore from '../store/store';

const Inventory = () => {
  const { fishItems, fetchFishItems } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchFishItems();
        toast({
          title: 'Success',
          description: 'Inventory fetched successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch inventory',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchFishItems, toast]);

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Inventory</Heading>
      {isLoading ? (
        <Box>Loading inventory...</Box>
      ) : fishItems.length > 0 ? (
        <TableContainer bg="white" p={4} rounded="md" shadow="sm">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Stock</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fishItems.map((item) => (
                <Tr key={item._id}>
                  <Td>{item._id}</Td>
                  <Td>{item.name}</Td>
                  <Td>{item.stock}</Td>
                  <Td>${item.price.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Box>No inventory items available.</Box>
      )}
    </Box>
  );
};

export default Inventory;