import { useState, useEffect } from 'react';
   import {
     Box,
     Heading,
     VStack,
     Input,
     Button,
     Flex,
     Text,
     Image,
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

   const FishItemManagement = () => {
     const { fishItems, fetchFishItems, createFishItem, updateFishItem, deleteFishItem, searchFishItems, getLowStockReport } = useStore();
     const [formData, setFormData] = useState({
       name: '',
       price: '',
       stock: '',
       description: '',
       photo: null,
     });
     const [searchFilters, setSearchFilters] = useState({
       name: '',
       description: '',
     });
     const [lowStockItems, setLowStockItems] = useState([]);
     const [editId, setEditId] = useState(null);
     const [photoPreview, setPhotoPreview] = useState(null);
     const toast = useToast();

     useEffect(() => {
       fetchFishItems();
       fetchLowStockReport();
     }, [fetchFishItems]);

     const fetchLowStockReport = async () => {
       try {
         const data = await getLowStockReport();
         setLowStockItems(data);
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to fetch low stock report',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleSearchChange = (e) => {
       const { name, value } = e.target;
       setSearchFilters({ ...searchFilters, [name]: value });
     };

     const handleSearch = async () => {
       try {
         const filters = {};
         if (searchFilters.name) filters.name = searchFilters.name;
         if (searchFilters.description) filters.description = searchFilters.description;
         
         // Only search if at least one filter is provided
         if (Object.keys(filters).length > 0) {
           await searchFishItems(filters);
         } else {
           // If no filters, fetch all items
           await fetchFishItems();
         }
       } catch (err) {
         toast({
           title: 'Error',
           description: 'Failed to search fish items',
           status: 'error',
           duration: 3000,
         });
       }
     };

     const handleClearSearch = async () => {
       setSearchFilters({ name: '', description: '' });
       await fetchFishItems();
     };

     const handleFileChange = (e) => {
       const file = e.target.files[0];
       if (file) {
         setFormData({ ...formData, photo: file });
         setPhotoPreview(URL.createObjectURL(file));
       }
     };

     const handleSubmit = async () => {
       if (!formData.name.trim() || formData.name.length < 2) {
         toast({
           title: 'Error',
           description: 'Name is required and must be at least 2 characters',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
         return;
       }
       if (!formData.price || parseFloat(formData.price) < 0) {
         toast({
           title: 'Error',
           description: 'Price is required and cannot be negative',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
         return;
       }
       if (!formData.stock || parseInt(formData.stock) < 0) {
         toast({
           title: 'Error',
           description: 'Stock is required and cannot be negative',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
         return;
       }
       if (!formData.description.trim() || formData.description.length < 10) {
         toast({
           title: 'Error',
           description: 'Description is required and must be at least 10 characters',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
         return;
       }

       const data = new FormData();
       data.append('name', formData.name);
       data.append('price', parseFloat(formData.price));
       data.append('stock', parseInt(formData.stock));
       data.append('description', formData.description);
       if (formData.photo) data.append('photo', formData.photo);

       try {
         if (editId) {
           await updateFishItem(editId, data);
           toast({
             title: 'Success',
             description: 'Fish item updated successfully',
             status: 'success',
             duration: 3000,
             isClosable: true,
           });
           setEditId(null);
         } else {
           await createFishItem(data);
           toast({
             title: 'Success',
             description: 'Fish item added successfully',
             status: 'success',
             duration: 3000,
             isClosable: true,
           });
         }
         setFormData({ name: '', price: '', stock: '', description: '', photo: null });
         setPhotoPreview(null);
         fetchLowStockReport(); // Refresh report after adding/updating
       } catch (err) {
         toast({
           title: 'Error',
           description: err.response?.data?.message || 'Failed to save fish item',
           status: 'error',
           duration: 3000,
           isClosable: true,
         });
       }
     };

     const handleEdit = (item) => {
       setEditId(item._id);
       setFormData({
         name: item.name || '',
         price: item.price?.toString() || '',
         stock: item.stock?.toString() || '',
         description: item.description || '',
         photo: null,
       });
       setPhotoPreview(item.photoUrl || null);
     };

     const handleDelete = async (id) => {
       try {
         await deleteFishItem(id);
         toast({
           title: 'Success',
           description: 'Fish item deleted successfully',
           status: 'success',
           duration: 3000,
         });
         fetchLowStockReport(); // Refresh report after deleting
       } catch (err) {
         toast({
           title: 'Error',
           description: err.response?.data?.message || 'Failed to delete fish item',
           status: 'error',
           duration: 3000,
         });
       }
     };

     return (
       <Box p={6}>
         <Heading size="lg" mb={6}>Fish Item Management</Heading>

         {/* Search Filters */}
         <Box bg="white" p={4} rounded="md" shadow="sm" mb={6}>
           <Heading size="md" mb={4}>Search Fish Items</Heading>
           <Flex gap={4}>
             <FormControl>
               <FormLabel>Name</FormLabel>
               <Input
                 name="name"
                 value={searchFilters.name}
                 onChange={handleSearchChange}
                 placeholder="e.g., Salmon"
               />
             </FormControl>
             <FormControl>
               <FormLabel>Description</FormLabel>
               <Input
                 name="description"
                 value={searchFilters.description}
                 onChange={handleSearchChange}
                 placeholder="e.g., Fresh"
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

         {/* Low Stock Report */}
         <Box bg="white" p={4} rounded="md" shadow="sm" mb={6}>
           <Heading size="md" mb={4}>Low Stock Report (Stock ≤ 10)</Heading>
           {lowStockItems.length === 0 ? (
             <Text>No low stock items found.</Text>
           ) : (
             <Table variant="simple">
               <Thead>
                 <Tr>
                   <Th>Name</Th>
                   <Th>Stock</Th>
                   <Th>Price</Th>
                   <Th>Description</Th>
                 </Tr>
               </Thead>
               <Tbody>
                 {lowStockItems.map((item) => (
                   <Tr key={item._id}>
                     <Td>{item.name}</Td>
                     <Td>{item.stock}</Td>
                     <Td>${item.price.toFixed(2)}</Td>
                     <Td>{item.description}</Td>
                   </Tr>
                 ))}
               </Tbody>
             </Table>
           )}
         </Box>

         {/* Form */}
         <VStack spacing={4} align="start" mb={8} bg="white" p={6} rounded="md" shadow="sm">
           <FormControl>
             <FormLabel>Fish Name</FormLabel>
             <Input
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               placeholder="Enter fish name"
             />
           </FormControl>
           <FormControl>
             <FormLabel>Price ($)</FormLabel>
             <Input
               type="number"
               step="0.01"
               value={formData.price}
               onChange={(e) => setFormData({ ...formData, price: e.target.value })}
               placeholder="Enter price"
             />
           </FormControl>
           <FormControl>
             <FormLabel>Stock</FormLabel>
             <Input
               type="number"
               value={formData.stock}
               onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
               placeholder="Enter stock quantity"
             />
           </FormControl>
           <FormControl>
             <FormLabel>Description</FormLabel>
             <Input
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="Enter description (min 10 chars)"
             />
           </FormControl>
           <FormControl>
             <FormLabel>Photo</FormLabel>
             <Input type="file" accept="image/*" onChange={handleFileChange} />
             {photoPreview && (
               <Image src={photoPreview} alt="Preview" maxW="200px" mt={2} rounded="md" />
             )}
           </FormControl>
           <Button colorScheme="green" onClick={handleSubmit}>
             {editId ? 'Update Fish Item' : 'Add Fish Item'}
           </Button>
         </VStack>

         {/* List */}
         <VStack spacing={4}>
           {fishItems?.length > 0 ? (
             fishItems.map((item) => (
               <Flex
                 key={item._id}
                 justify="space-between"
                 w="full"
                 p={4}
                 bg="white"
                 rounded="md"
                 shadow="sm"
                 align="center"
               >
                 <Flex align="center" gap={4}>
                   {item.photoUrl && (
                     <Image
                       src={`http://localhost:5000${item.photoUrl}`}
                       alt={item.name}
                       boxSize="100px"
                       objectFit="cover"
                       rounded="md"
                     />
                   )}
                   <Box>
                     <Text fontWeight="bold">{item.name}</Text>
                     <Text>${item.price?.toFixed(2)}</Text>
                     <Text>Stock: {item.stock}</Text>
                     <Text>{item.description}</Text>
                   </Box>
                 </Flex>
                 <Flex gap={2}>
                   <Button colorScheme="blue" onClick={() => handleEdit(item)}>
                     Edit
                   </Button>
                   <Button colorScheme="red" onClick={() => handleDelete(item._id)}>
                     Delete
                   </Button>
                 </Flex>
               </Flex>
             ))
           ) : (
             <Text>No fish items available.</Text>
           )}
         </VStack>
       </Box>
     );
   };

   export default FishItemManagement;