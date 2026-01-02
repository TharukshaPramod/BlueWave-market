import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Image,
  useToast,
} from '@chakra-ui/react';
import useStore from '../store/store';

const PaymentsPage = () => {
  const { user, payments, fetchPayments } = useStore();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      if (!user || !user.id) {
        setError('Please log in to view your payment history.');
        setLoading(false);
        return;
      }
      try {
        setError('');
        await fetchPayments();
      } catch (err) {
        setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, [user, fetchPayments]);

  if (loading) return <Text textAlign="center" p={6}>Loading payments...</Text>;
  if (error) return <Text textAlign="center" p={6} color="red.500">{error}</Text>;

  if (!payments || payments.length === 0) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>Payment History</Heading>
        <Text>No payments found.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Payment History</Heading>
      <VStack spacing={4} align="stretch">
        {payments.map((payment) => (
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
            </Box>
            {payment.paymentSlip && (
              <Image
                src={`http://localhost:5000${payment.paymentSlip.replace(/\\/g, '/')}`}
                alt="Payment Slip"
                boxSize="100px"
                objectFit="cover"
                rounded="md"
                fallback={<Text>Failed to load image</Text>}
                onError={(e) => {
                  console.error('Failed to load payment slip:', payment.paymentSlip);
                  e.target.style.display = 'none';
                  toast({
                    title: 'Error',
                    description: 'Failed to load payment slip image.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              />
            )}
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default PaymentsPage;