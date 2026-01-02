import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
} from '@chakra-ui/react';
import useStore from '../store/store';

const Reports = () => {
  const {
    getLowStockReport,
    downloadLowStockReportAsPDF,
    getFleetUsageReport,
    downloadFleetUsageReportAsPDF,
    getStaffAssignmentReport,
    downloadStaffAssignmentReportAsPDF,
    getMaintenanceReport,
    downloadMaintenanceReportAsPDF,
  } = useStore();
  const [threshold, setThreshold] = useState(10);
  const [lowStockData, setLowStockData] = useState([]);
  const [fleetUsageData, setFleetUsageData] = useState([]);
  const [staffAssignmentData, setStaffAssignmentData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(false);
  const [isLoadingFleetUsage, setIsLoadingFleetUsage] = useState(false);
  const [isLoadingStaffAssignment, setIsLoadingStaffAssignment] = useState(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);
  const [isDownloadingLowStock, setIsDownloadingLowStock] = useState(false);
  const [isDownloadingFleetUsage, setIsDownloadingFleetUsage] = useState(false);
  const [isDownloadingStaffAssignment, setIsDownloadingStaffAssignment] = useState(false);
  const [isDownloadingMaintenance, setIsDownloadingMaintenance] = useState(false);
  const toast = useToast();

  // Fetch report data on mount
  useEffect(() => {
    fetchLowStockReport();
    fetchFleetUsageReport();
    fetchStaffAssignmentReport();
    fetchMaintenanceReport();
  }, []);

  const fetchLowStockReport = async () => {
    setIsLoadingLowStock(true);
    try {
      const data = await getLowStockReport(threshold);
      setLowStockData(data);
      toast({
        title: 'Success',
        description: 'Low Stock Report fetched successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch Low Stock Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingLowStock(false);
    }
  };

  const fetchFleetUsageReport = async () => {
    setIsLoadingFleetUsage(true);
    try {
      const data = await getFleetUsageReport();
      setFleetUsageData(data);
      toast({
        title: 'Success',
        description: 'Fleet Usage Report fetched successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch Fleet Usage Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingFleetUsage(false);
    }
  };

  const fetchStaffAssignmentReport = async () => {
    setIsLoadingStaffAssignment(true);
    try {
      const data = await getStaffAssignmentReport();
      setStaffAssignmentData(data);
      toast({
        title: 'Success',
        description: 'Staff Assignment Report fetched successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch Staff Assignment Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingStaffAssignment(false);
    }
  };

  const fetchMaintenanceReport = async () => {
    setIsLoadingMaintenance(true);
    try {
      const data = await getMaintenanceReport();
      setMaintenanceData(data);
      toast({
        title: 'Success',
        description: 'Maintenance Report fetched successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch Maintenance Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  const handleDownloadLowStock = async () => {
    setIsDownloadingLowStock(true);
    try {
      const result = await downloadLowStockReportAsPDF(threshold);
      if (!result.success) {
        toast({
          title: 'No Data',
          description: result.message,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Low Stock Report downloaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download Low Stock Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingLowStock(false);
    }
  };

  const handleDownloadFleetUsage = async () => {
    setIsDownloadingFleetUsage(true);
    try {
      const result = await downloadFleetUsageReportAsPDF();
      if (!result.success) {
        toast({
          title: 'No Data',
          description: result.message,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Fleet Usage Report downloaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download Fleet Usage Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingFleetUsage(false);
    }
  };

  const handleDownloadStaffAssignment = async () => {
    setIsDownloadingStaffAssignment(true);
    try {
      const result = await downloadStaffAssignmentReportAsPDF();
      if (!result.success) {
        toast({
          title: 'No Data',
          description: result.message,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Staff Assignment Report downloaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download Staff Assignment Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingStaffAssignment(false);
    }
  };

  const handleDownloadMaintenanceReport = async () => {
    setIsDownloadingMaintenance(true);
    try {
      const result = await downloadMaintenanceReportAsPDF();
      if (!result.success) {
        toast({
          title: 'No Data',
          description: result.message,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Maintenance Report downloaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download Maintenance Report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingMaintenance(false);
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Reports</Heading>
      <VStack spacing={6} align="stretch">
        {/* Low Stock Report */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>Low Stock Report</Heading>
          <FormControl mb={4}>
            <FormLabel>Stock Threshold</FormLabel>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
              min="1"
              placeholder="Enter stock threshold (default: 10)"
            />
          </FormControl>
          <Tooltip label="Refresh the report data with the current threshold">
            <Button
              colorScheme="teal"
              onClick={fetchLowStockReport}
              mr={4}
              isLoading={isLoadingLowStock}
            >
              Refresh Report
            </Button>
          </Tooltip>
          <Button
            colorScheme="teal"
            onClick={handleDownloadLowStock}
            isLoading={isDownloadingLowStock}
            loadingText="Downloading..."
          >
            Download as PDF
          </Button>
          {lowStockData.length > 0 ? (
            <TableContainer mt={4}>
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
                  {lowStockData.map((item) => (
                    <Tr key={item._id}>
                      <Td>{item._id}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.stock}</Td>
                      <Td>{item.price}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box mt={4}>No data available. Try refreshing the report.</Box>
          )}
        </Box>

        {/* Fleet Usage Report */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>Fleet Usage Report</Heading>
          <Tooltip label="Refresh the report data">
            <Button
              colorScheme="teal"
              onClick={fetchFleetUsageReport}
              mr={4}
              isLoading={isLoadingFleetUsage}
            >
              Refresh Report
            </Button>
          </Tooltip>
          <Button
            colorScheme="teal"
            onClick={handleDownloadFleetUsage}
            isLoading={isDownloadingFleetUsage}
            loadingText="Downloading..."
          >
            Download as PDF
          </Button>
          {fleetUsageData.length > 0 ? (
            <TableContainer mt={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Fleet ID</Th>
                    <Th>Vehicle Type</Th>
                    <Th>Status</Th>
                    <Th>Assigned Driver</Th>
                    <Th>Maintenance Count</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {fleetUsageData.map((item) => (
                    <Tr key={item.fleet_id}>
                      <Td>{item.fleet_id}</Td>
                      <Td>{item.vehicle_type}</Td>
                      <Td>{item.status}</Td>
                      <Td>{item.assigned_driver || 'N/A'}</Td>
                      <Td>{item.maintenanceCount || 0}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box mt={4}>No data available. Try refreshing the report.</Box>
          )}
        </Box>

        {/* Staff Assignment Report */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>Staff Assignment Report</Heading>
          <Tooltip label="Refresh the report data">
            <Button
              colorScheme="teal"
              onClick={fetchStaffAssignmentReport}
              mr={4}
              isLoading={isLoadingStaffAssignment}
            >
              Refresh Report
            </Button>
          </Tooltip>
          <Button
            colorScheme="teal"
            onClick={handleDownloadStaffAssignment}
            isLoading={isDownloadingStaffAssignment}
            loadingText="Downloading..."
          >
            Download as PDF
          </Button>
          {staffAssignmentData.length > 0 ? (
            <TableContainer mt={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Staff ID</Th>
                    <Th>Full Name</Th>
                    <Th>Role</Th>
                    <Th>Email</Th>
                    <Th>Assigned Fleet ID</Th>
                    <Th>Vehicle Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {staffAssignmentData.map((item) => (
                    <Tr key={item.staff_id}>
                      <Td>{item.staff_id}</Td>
                      <Td>{item.full_name}</Td>
                      <Td>{item.role}</Td>
                      <Td>{item.email}</Td>
                      <Td>{item.assigned_fleet_id || 'N/A'}</Td>
                      <Td>{item.vehicle_type || 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box mt={4}>No data available. Try refreshing the report.</Box>
          )}
        </Box>

        {/* Maintenance Report */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>Maintenance Report</Heading>
          <Tooltip label="Refresh the report data">
            <Button
              colorScheme="teal"
              onClick={fetchMaintenanceReport}
              mr={4}
              isLoading={isLoadingMaintenance}
            >
              Refresh Report
            </Button>
          </Tooltip>
          <Button
            colorScheme="teal"
            onClick={handleDownloadMaintenanceReport}
            isLoading={isDownloadingMaintenance}
            loadingText="Downloading..."
          >
            Download as PDF
          </Button>
          {maintenanceData.length > 0 ? (
            <TableContainer mt={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Maintenance ID</Th>
                    <Th>Fleet ID</Th>
                    <Th>Fleet Identifier</Th>
                    <Th>Vehicle Type</Th>
                    <Th>Maintenance Date</Th>
                    <Th>Description</Th>
                    <Th>Cost</Th>
                    <Th>Next Due Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {maintenanceData.map((item) => (
                    <Tr key={item.maintenanceId}>
                      <Td>{item.maintenanceId}</Td>
                      <Td>{item.fleetId}</Td>
                      <Td>{item.fleetIdentifier}</Td>
                      <Td>{item.vehicleType}</Td>
                      <Td>{new Date(item.maintenanceDate).toLocaleDateString()}</Td>
                      <Td>{item.description}</Td>
                      <Td>{item.cost}</Td>
                      <Td>{item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box mt={4}>No data available. Try refreshing the report.</Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default Reports;