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

   const StaffManagement = () => {
     const { staff, fetchStaff, createStaff, updateStaff, deleteStaff, searchStaff, getStaffAssignmentReport } = useStore();
     const [formData, setFormData] = useState({
       staff_id: '',
       full_name: '',
       role: 'Rider',
       email: '',
       phone_number: '',
       address: '',
       salary: '',
       hire_date: '',
       status: 'Active',
     });
     const [searchFilters, setSearchFilters] = useState({
       full_name: '',
       role: '',
     });
     const [assignmentReport, setAssignmentReport] = useState([]);
     const [editingId, setEditingId] = useState(null);
     const toast = useToast();

     useEffect(() => {
       fetchStaff();
       fetchAssignmentReport();
     }, [fetchStaff]);

     const fetchAssignmentReport = async () => {
       try {
         const data = await getStaffAssignmentReport();
         setAssignmentReport(data);
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to fetch staff assignment report',
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
         if (searchFilters.full_name) filters.full_name = searchFilters.full_name;
         if (searchFilters.role) filters.role = searchFilters.role;
         await searchStaff(filters);
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to search staff',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleClearSearch = async () => {
       setSearchFilters({ full_name: '', role: '' });
       await fetchStaff();
     };

     const handleSubmit = async () => {
       const dataToSend = {
         staff_id: formData.staff_id,
         full_name: formData.full_name,
         role: formData.role,
         email: formData.email,
         phone_number: formData.phone_number,
         address: formData.address,
         salary: parseFloat(formData.salary) || 0,
         hire_date: formData.hire_date,
         status: formData.status,
       };

       try {
         if (editingId) {
           await updateStaff(editingId, dataToSend);
           toast({ title: 'Success', description: 'Staff updated', status: 'success', duration: 3000 });
           setEditingId(null);
         } else {
           await createStaff(dataToSend);
           toast({ title: 'Success', description: 'Staff added', status: 'success', duration: 3000 });
         }
         setFormData({
           staff_id: '',
           full_name: '',
           role: 'Rider',
           email: '',
           phone_number: '',
           address: '',
           salary: '',
           hire_date: '',
           status: 'Active',
         });
         fetchAssignmentReport(); // Refresh report after adding/updating
       } catch (err) {
         toast({
           title: 'Error',
           description: err.response?.data?.message || 'Operation failed',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleEdit = (staffItem) => {
       setEditingId(staffItem._id);
       setFormData({
         staff_id: staffItem.staff_id,
         full_name: staffItem.full_name,
         role: staffItem.role,
         email: staffItem.email,
         phone_number: staffItem.phone_number,
         address: staffItem.address,
         salary: staffItem.salary.toString(),
         hire_date: staffItem.hire_date.split('T')[0],
         status: staffItem.status,
       });
     };

     const handleDelete = async (id) => {
       try {
         await deleteStaff(id);
         toast({ title: 'Success', description: 'Staff deleted', status: 'success', duration: 3000 });
         fetchAssignmentReport(); // Refresh report after deleting
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
         <Heading size="lg" mb={6}>Staff Management</Heading>
         <VStack spacing={6} align="stretch">
           {/* Search Filters */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>Search Staff</Heading>
             <Flex gap={4}>
               <FormControl>
                 <FormLabel>Full Name</FormLabel>
                 <Input
                   name="full_name"
                   value={searchFilters.full_name}
                   onChange={handleSearchChange}
                   placeholder="e.g., John Doe"
                 />
               </FormControl>
               <FormControl>
                 <FormLabel>Role</FormLabel>
                 <Input
                   name="role"
                   value={searchFilters.role}
                   onChange={handleSearchChange}
                   placeholder="e.g., Rider"
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

           {/* Staff Assignment Report */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>Staff Assignment Report</Heading>
             {assignmentReport.length === 0 ? (
               <Text>No staff assignments found.</Text>
             ) : (
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
                   {assignmentReport.map((report) => (
                     <Tr key={report.staff_id}>
                       <Td>{report.staff_id}</Td>
                       <Td>{report.full_name}</Td>
                       <Td>{report.role}</Td>
                       <Td>{report.email}</Td>
                       <Td>{report.assigned_fleet_id}</Td>
                       <Td>{report.vehicle_type}</Td>
                     </Tr>
                   ))}
                 </Tbody>
               </Table>
             )}
           </Box>

           {/* Form */}
           <Box bg="white" p={4} rounded="md" shadow="sm">
             <Heading size="md" mb={4}>{editingId ? 'Edit Staff' : 'Add Staff'}</Heading>
             <FormControl mb={4} isRequired>
               <FormLabel>Staff ID (e.g., S-1234)</FormLabel>
               <Input
                 name="staff_id"
                 value={formData.staff_id}
                 onChange={handleInputChange}
                 placeholder="S-XXXX"
                 pattern="S-\d{4}"
                 title="Staff ID must be in format S-XXXX"
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Full Name</FormLabel>
               <Input
                 name="full_name"
                 value={formData.full_name}
                 onChange={handleInputChange}
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Role</FormLabel>
               <Select name="role" value={formData.role} onChange={handleInputChange}>
                 <option value="Warehouse Staff">Warehouse Staff</option>
                 <option value="Fleet Manager">Fleet Manager</option>
                 <option value="Fisherman">Fisherman</option>
                 <option value="Rider">Rider</option>
               </Select>
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Email</FormLabel>
               <Input
                 name="email"
                 type="email"
                 value={formData.email}
                 onChange={handleInputChange}
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Phone Number (10 digits)</FormLabel>
               <Input
                 name="phone_number"
                 value={formData.phone_number}
                 onChange={handleInputChange}
                 pattern="\d{10}"
                 title="Phone number must be 10 digits"
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Address</FormLabel>
               <Input
                 name="address"
                 value={formData.address}
                 onChange={handleInputChange}
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Salary</FormLabel>
               <Input
                 name="salary"
                 type="number"
                 value={formData.salary}
                 onChange={handleInputChange}
                 min="0"
               />
             </FormControl>
             <FormControl mb={4} isRequired>
               <FormLabel>Hire Date</FormLabel>
               <Input
                 type="date"
                 name="hire_date"
                 value={formData.hire_date}
                 onChange={handleInputChange}
                 max={new Date().toISOString().split('T')[0]}
               />
             </FormControl>
             <FormControl mb={4}>
               <FormLabel>Status</FormLabel>
               <Select name="status" value={formData.status} onChange={handleInputChange}>
                 <option value="Active">Active</option>
                 <option value="Inactive">Inactive</option>
               </Select>
             </FormControl>
             <Button colorScheme="teal" onClick={handleSubmit}>
               {editingId ? 'Update Staff' : 'Add Staff'}
             </Button>
             {editingId && (
               <Button ml={4} variant="outline" onClick={() => setEditingId(null)}>
                 Cancel
               </Button>
             )}
           </Box>

           {/* Staff List */}
           <VStack spacing={4} align="stretch">
             {staff.length === 0 ? (
               <Text>No staff found.</Text>
             ) : (
               staff.map((item) => (
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
                     <Text fontWeight="bold">{item.staff_id} - {item.full_name}</Text>
                     <Text>Role: {item.role}</Text>
                     <Text>Email: {item.email}</Text>
                     <Text>Phone: {item.phone_number}</Text>
                     <Text>Status: {item.status}</Text>
                     <Text>Assigned Fleet: {item.assignedFleet ? item.assignedFleet.fleet_id : 'None'}</Text>
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

   export default StaffManagement;