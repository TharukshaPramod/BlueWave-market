import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  VStack,
} from '@chakra-ui/react';
import useStore from '../store/store';

const PaymentHistory = () => {
  const { payments, fetchPayments, searchPayments } = useStore();
  const [filters, setFilters] = useState({ status: '', date: '' });

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await searchPayments(filters);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Payment History</Heading>
      <Box mb={6}>
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
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
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
      {payments.length === 0 ? (
        <Text>No payments found.</Text>
      ) : (
        <VStack spacing={4}>
          {payments.map((payment) => (
            <Box key={payment._id} p={4} bg="white" rounded="md" shadow="sm">
              <Text>
                <strong>Amount:</strong> ${payment.totalAmount.toFixed(2)}
              </Text>
              <Text>
                <strong>Status:</strong> {payment.status}
              </Text>
              <Text>
                <strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}
              </Text>
              <Image
                src={`http://localhost:5000/${payment.paymentSlip}`}
                alt="Payment Slip"
                mt={2}
                w="120px"
                h="120px"
                objectFit="cover"
                rounded="md"
              />
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PaymentHistory;