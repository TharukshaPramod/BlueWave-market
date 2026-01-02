import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Image,
  Button,
  Select,
  useToast,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import useStore from '../store/store';
import axios from 'axios';

const PaymentManagement = () => {
  const { payments, fetchAllPayments, searchPayments } = useStore();
  const [filters, setFilters] = useState({ status: '', date: '' });
  const toast = useToast();

  useEffect(() => {
    fetchAllPayments();
  }, [fetchAllPayments]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await searchPayments(filters);
    } catch (err) {
      console.error('Search failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to search payments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/payments/${id}`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: 'Success',
        description: 'Payment status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAllPayments();
    } catch (err) {
      console.error('Update status failed:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/payments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: 'Success',
        description: 'Payment deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAllPayments();
    } catch (err) {
      console.error('Delete failed:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Payment Management</Heading>
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Box width="50%">
            <form onSubmit={handleSearch}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleInputChange}
                    placeholder="Select Status"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <Button type="submit" colorScheme="teal">
                  Search
                </Button>
              </VStack>
            </form>
          </Box>
        </Flex>
      </Box>
      <VStack spacing={4} align="stretch">
        {payments.length === 0 ? (
          <Text>No payments to manage.</Text>
        ) : (
          payments.map((payment) => (
            <Flex
              key={payment._id}
              p={4}
              bg="white"
              rounded="md"
              shadow="sm"
              justify="space-between"
              align="center"
            >
              <Box>
                <Text fontWeight="bold">Amount: ${payment.total.toFixed(2)}</Text>
                <Text>Status: {payment.status}</Text>
                <Text fontSize="sm" color="gray.500">
                  Submitted: {new Date(payment.createdAt).toLocaleString()}
                </Text>
                {payment.customer && (
                  <Text fontSize="sm" color="gray.500">
                    Customer: {payment.customer.fullName || payment.customer.email}
                  </Text>
                )}
              </Box>
              <Flex align="center" gap={4}>
                {payment.paymentSlip && (
                  <Image
                    src={`http://localhost:5000${payment.paymentSlip.replace(/\\/g, '/')}`}
                    alt="Payment Slip"
                    boxSize="100px"
                    objectFit="cover"
                    rounded="md"
                    onError={() =>
                      toast({
                        title: 'Error',
                        description: 'Failed to load payment slip image.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      })
                    }
                  />
                )}
                <Select
                  value={payment.status}
                  onChange={(e) => handleUpdateStatus(payment._id, e.target.value)}
                  w="150px"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Button colorScheme="red" onClick={() => handleDelete(payment._id)}>
                  Delete
                </Button>
              </Flex>
            </Flex>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default PaymentManagement;