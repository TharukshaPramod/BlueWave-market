import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import useStore from '../store/store';

const MaintenanceManagement = () => {
  const {
    maintenance,
    fleet,
    fetchMaintenance,
    fetchFleet,
    searchMaintenance,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
  } = useStore();
  const [formData, setFormData] = useState({
    fleet_id: '',
    maintenance_date: '',
    description: '',
    cost: '',
    next_due_date: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    fleet_identifier: '',
    maintenance_date: '',
  });
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchMaintenance();
    fetchFleet();
  }, [fetchMaintenance, fetchFleet]);

  // Debug data
  useEffect(() => {
    console.log('Maintenance data:', maintenance);
    console.log('Fleet data:', fleet);
  }, [maintenance, fleet]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await searchMaintenance(searchFilters);
    } catch (err) {
      console.error('Search failed:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Search failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async () => {
    const dataToSend = {
      fleet_id: formData.fleet_id,
      maintenance_date: formData.maintenance_date,
      description: formData.description,
      cost: parseFloat(formData.cost) || 0,
    };
    if (formData.next_due_date) dataToSend.next_due_date = formData.next_due_date;

    console.log('Sending maintenance data:', dataToSend);
    try {
      if (editingId) {
        await updateMaintenance(editingId, dataToSend);
        toast({ title: 'Success', description: 'Maintenance updated', status: 'success', duration: 3000 });
        setEditingId(null);
      } else {
        await createMaintenance(dataToSend);
        toast({ title: 'Success', description: 'Maintenance added', status: 'success', duration: 3000 });
      }
      setFormData({
        fleet_id: '',
        maintenance_date: '',
        description: '',
        cost: '',
        next_due_date: '',
      });
    } catch (err) {
      console.error('Maintenance operation failed:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Operation failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = (maintenanceItem) => {
    setEditingId(maintenanceItem._id);
    setFormData({
      fleet_id: maintenanceItem.fleet_id?._id || '',
      maintenance_date: maintenanceItem.maintenance_date.split('T')[0],
      description: maintenanceItem.description,
      cost: maintenanceItem.cost.toString(),
      next_due_date: maintenanceItem.next_due_date ? maintenanceItem.next_due_date.split('T')[0] : '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaintenance(id);
      toast({ title: 'Success', description: 'Maintenance deleted', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Delete failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Maintenance Management</Heading>
      <VStack spacing={6} align="stretch">
        {/* Search Form */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>Search Maintenance Records</Heading>
          <form onSubmit={handleSearch}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Fleet Identifier</FormLabel>
                <Input
                  name="fleet_identifier"
                  value={searchFilters.fleet_identifier}
                  onChange={handleSearchInputChange}
                  placeholder="Enter fleet identifier"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Maintenance Date</FormLabel>
                <Input
                  type="date"
                  name="maintenance_date"
                  value={searchFilters.maintenance_date}
                  onChange={handleSearchInputChange}
                />
              </FormControl>
              <Button type="submit" colorScheme="teal">
                Search
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Add/Edit Form */}
        <Box bg="white" p={4} rounded="md" shadow="sm">
          <Heading size="md" mb={4}>{editingId ? 'Edit Maintenance' : 'Add Maintenance'}</Heading>
          <FormControl mb={4} isRequired>
            <FormLabel>Fleet</FormLabel>
            <Select
              name="fleet_id"
              value={formData.fleet_id}
              onChange={handleInputChange}
              placeholder="Select Fleet"
            >
              {fleet.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.fleet_id} - {f.vehicle_type}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Maintenance Date</FormLabel>
            <Input
              type="date"
              name="maintenance_date"
              value={formData.maintenance_date}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="At least 10 characters"
            />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Cost</FormLabel>
            <Input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              min="0"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Next Due Date (optional)</FormLabel>
            <Input
              type="date"
              name="next_due_date"
              value={formData.next_due_date}
              onChange={handleInputChange}
              min={formData.maintenance_date || new Date().toISOString().split('T')[0]}
            />
          </FormControl>
          <Button colorScheme="teal" onClick={handleSubmit}>
            {editingId ? 'Update Maintenance' : 'Add Maintenance'}
          </Button>
          {editingId && (
            <Button ml={4} variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          )}
        </Box>

        {/* Maintenance List */}
        <VStack spacing={4} align="stretch">
          {maintenance.length === 0 ? (
            <Text>No maintenance records found.</Text>
          ) : (
            maintenance.map((item) => (
              <Flex
                key={item._id}
                p={4}
                bg="white"
                rounded="md"
                shadow="sm"
                justify="space-between"
                align="center"
              >
                <Box>
                  <Text fontWeight="bold">Fleet Identifier: {item.fleet_identifier}</Text>
                  <Text>Vehicle Type: {item.fleet_id ? item.fleet_id.vehicle_type : 'N/A'}</Text>
                  <Text>Date: {new Date(item.maintenance_date).toLocaleDateString()}</Text>
                  <Text>Description: {item.description}</Text>
                  <Text>Cost: ${item.cost}</Text>
                  <Text>
                    Next Due: {item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A'}
                  </Text>
                </Box>
                <Flex gap={4}>
                  <Button colorScheme="blue" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button colorScheme="red" onClick={() => handleDelete(item._id)}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default MaintenanceManagement;