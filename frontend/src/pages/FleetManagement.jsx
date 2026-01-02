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
     Table,
     Thead,
     Tbody,
     Tr,
     Th,
     Td,
   } from '@chakra-ui/react';
   import useStore from '../store/store';

   const FleetManagement = () => {
     const { fleet, staff, fetchFleet, fetchStaff, createFleet, updateFleet, deleteFleet, searchFleet, getFleetUsageReport } = useStore();
     const [formData, setFormData] = useState({
       fleet_id: '',
       vehicle_type: 'Boat',
       status: 'Available',
       assigned_driver_id: '',
       last_serviced_date: '',
     });
     const [searchFilters, setSearchFilters] = useState({
       fleet_id: '',
       vehicle_type: '',
     });
     const [usageReport, setUsageReport] = useState([]);
     const [editingId, setEditingId] = useState(null);
     const toast = useToast();

     useEffect(() => {
       fetchFleet();
       fetchStaff();
       fetchUsageReport();
     }, [fetchFleet, fetchStaff]);

     const fetchUsageReport = async () => {
       try {
         const data = await getFleetUsageReport();
         setUsageReport(data);
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to fetch fleet usage report',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleInputChange = (e) => {
       const { name, value } = e.target;
       setFormData({ ...formData, [name]: value });
     };

     const handleSearchChange = (e) => {
       const { name, value } = e.target;
       setSearchFilters({ ...searchFilters, [name]: value });
     };

     const handleSearch = async () => {
       try {
         const filters = {};
         if (searchFilters.fleet_id) filters.fleet_id = searchFilters.fleet_id;
         if (searchFilters.vehicle_type) filters.vehicle_type = searchFilters.vehicle_type;
         await searchFleet(filters);
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to search fleet',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleClearSearch = async () => {
       setSearchFilters({ fleet_id: '', vehicle_type: '' });
       await fetchFleet();
     };

     const handleSubmit = async () => {
       const dataToSend = {
         fleet_id: formData.fleet_id,
         vehicle_type: formData.vehicle_type,
         status: formData.status,
       };
       if (formData.assigned_driver_id) dataToSend.assigned_driver_id = formData.assigned_driver_id;
       if (formData.last_serviced_date) dataToSend.last_serviced_date = formData.last_serviced_date;

       console.log('Sending fleet data:', dataToSend);
       try {
         if (editingId) {
           await updateFleet(editingId, dataToSend);
           toast({ title: 'Success', description: 'Fleet updated', status: 'success', duration: 3000 });
           setEditingId(null);
         } else {
           await createFleet(dataToSend);
           toast({ title: 'Success', description: 'Fleet added', status: 'success', duration: 3000 });
         }
         setFormData({
           fleet_id: '',
           vehicle_type: 'Boat',
           status: 'Available',
           assigned_driver_id: '',
           last_serviced_date: '',
         });
         fetchUsageReport(); // Refresh report after adding/updating
       } catch (err) {
         console.error('Fleet operation failed:', {
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

     const handleEdit = (fleetItem) => {
       setEditingId(fleetItem._id);
       setFormData({
         fleet_id: fleetItem.fleet_id,
         vehicle_type: fleetItem.vehicle_type,
         status: fleetItem.status,
         assigned_driver_id: fleetItem.assigned_driver_id?._id || '',
         last_serviced_date: fleetItem.last_serviced_date ? fleetItem.last_serviced_date.split('T')[0] : '',
       });
     };

     const handleDelete = async (id) => {
       try {
         await deleteFleet(id);
         toast({ title: 'Success', description: 'Fleet deleted', status: 'success', duration: 3000 });
         fetchUsageReport(); // Refresh report after deleting
       } catch (err) {
         toast({
           title: 'Error',
           description: err.response?.data?.message || 'Delete failed',
           status: 'error',
           duration: 3000,
         });
       }
     };

     // Filter staff to only include Riders
     const riders = staff.filter((s) => s.role === 'Rider');

     return (
       <Box p={6}>
         <Heading size="lg" mb={6}>Fleet Management</Heading>
         <VStack spacing={6} align="stretch">
           {/* Search Filters */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>Search Fleet</Heading>
             <Flex gap={4}>
               <FormControl>
                 <FormLabel>Fleet ID</FormLabel>
                 <Input
                   name="fleet_id"
                   value={searchFilters.fleet_id}
                   onChange={handleSearchChange}
                   placeholder="e.g., F-1234"
                 />
               </FormControl>
               <FormControl>
                 <FormLabel>Vehicle Type</FormLabel>
                 <Input
                   name="vehicle_type"
                   value={searchFilters.vehicle_type}
                   onChange={handleSearchChange}
                   placeholder="e.g., Boat"
                 />
               </FormControl>
             </Flex>
             <Flex gap={4} mt={4}>
               <Button colorScheme="teal" onClick={handleSearch}>
                 Search
               </Button>
               <Button variant="outline" onClick={handleClearSearch}>
                 Clear
               </Button>
             </Flex>
           </Box>

           {/* Fleet Usage Report */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>Fleet Usage Report</Heading>
             {usageReport.length === 0 ? (
               <Text>No fleet usage data available.</Text>
             ) : (
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
                   {usageReport.map((report) => (
                     <Tr key={report.fleet_id}>
                       <Td>{report.fleet_id}</Td>
                       <Td>{report.vehicle_type}</Td>
                       <Td>{report.status}</Td>
                       <Td>{report.assigned_driver}</Td>
                       <Td>{report.maintenanceCount}</Td>
                     </Tr>
                   ))}
                 </Tbody>
               </Table>
             )}
           </Box>

           {/* Form */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>{editingId ? 'Edit Fleet' : 'Add Fleet'}</Heading>
             <FormControl mb={4} isRequired>
               <FormLabel>Fleet ID (e.g., F-1234)</FormLabel>
               <Input
                 name="fleet_id"
                 value={formData.fleet_id}
                 onChange={handleInputChange}
                 placeholder="F-XXXX"
                 pattern="F-\d{4}"
                 title="Fleet ID must be in the format F-XXXX (e.g., F-1234)"
               />
             </FormControl>
             <FormControl mb={4}>
               <FormLabel>Vehicle Type</FormLabel>
               <Select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange}>
                 <option value="Boat">Boat</option>
                 <option value="Truck">Truck</option>
                 <option value="Bike">Bike</option>
               </Select>
             </FormControl>
             <FormControl mb={4}>
               <FormLabel>Status</FormLabel>
               <Select name="status" value={formData.status} onChange={handleInputChange}>
                 <option value="Available">Available</option>
                 <option value="In Use">In Use</option>
                 <option value="Under Maintenance">Under Maintenance</option>
               </Select>
             </FormControl>
             <FormControl mb={4}>
               <FormLabel>Assigned Driver (optional)</FormLabel>
               <Select
                 name="assigned_driver_id"
                 value={formData.assigned_driver_id}
                 onChange={handleInputChange}
                 placeholder="Select Rider"
               >
                 {riders.map((rider) => (
                   <option key={rider._id} value={rider._id}>
                     {rider.full_name} ({rider.staff_id})
                   </option>
                 ))}
               </Select>
             </FormControl>
             <FormControl mb={4}>
               <FormLabel>Last Serviced Date (optional)</FormLabel>
               <Input
                 type="date"
                 name="last_serviced_date"
                 value={formData.last_serviced_date}
                 onChange={handleInputChange}
               />
             </FormControl>
             <Button colorScheme="teal" onClick={handleSubmit}>
               {editingId ? 'Update Fleet' : 'Add Fleet'}
             </Button>
             {editingId && (
               <Button ml={4} variant="outline" onClick={() => setEditingId(null)}>
                 Cancel
               </Button>
             )}
           </Box>

           {/* Fleet List */}
           <VStack spacing={4} align="stretch">
             {fleet.length === 0 ? (
               <Text>No fleet items found.</Text>
             ) : (
               fleet.map((item) => (
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
                     <Text fontWeight="bold">{item.fleet_id}</Text>
                     <Text>Type: {item.vehicle_type}</Text>
                     <Text>Status: {item.status}</Text>
                     <Text>
                       Driver: {item.assigned_driver_id ? item.assigned_driver_id.full_name : 'None'}
                     </Text>
                     <Text>
                       Last Serviced: {item.last_serviced_date ? new Date(item.last_serviced_date).toLocaleDateString() : 'N/A'}
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

   export default FleetManagement;