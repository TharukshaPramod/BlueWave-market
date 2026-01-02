import { create } from 'zustand';
import axios from 'axios';
import { jsPDF } from 'jspdf';

// Axios Interceptor to add JWT token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Axios response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', {
      message: error.message,
      status: error.response?.status,
      data: JSON.stringify(error.response?.data, null, 2),
    });
    return Promise.reject(error);
  }
);

// Helper function to truncate long text for PDF
const truncateText = (text, maxLength) => {
  const str = String(text || 'N/A');
  return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
};

// Helper function to add a styled header to PDFs
const addPDFHeader = (doc, title) => {
  doc.setFontSize(20);
  doc.setTextColor(44, 93, 99); // Ocean Blue (#2C5D63)
  doc.text('Seafood Marketplace', 20, 15);
  doc.setFontSize(16);
  doc.text(title, 20, 25);
  doc.setDrawColor(44, 93, 99);
  doc.line(20, 30, 190, 30); // Horizontal line under header
};

const useStore = create((set, get) => ({
  user: null, // Store authenticated user
  cart: null,
  payments: [],
  fleet: [],
  maintenance: [],
  staff: [],
  fishItems: [],
  users: [], // Store list of users for admin

  // User Management Actions
  setUser: (user) => set({ user }),
  login: async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = res.data;
      console.log('Login response user:', user); // Debug log
      localStorage.setItem('token', token);
      const updatedUser = { ...user, id: user.id || user._id }; // Ensure id is set
      set({ user: updatedUser });
      return updatedUser;
    } catch (err) {
      console.error('Failed to login:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  register: async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
    } catch (err) {
      console.error('Failed to register:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, cart: null, payments: [] });
  },
  fetchUserProfile: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      const user = res.data;
      console.log('Fetched user profile:', user); // Debug log
      const updatedUser = { ...user, id: user.id || user._id }; // Ensure id is set
      set({ user: updatedUser });
    } catch (err) {
      console.error('Failed to fetch user profile:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      if (err.response?.status === 401) {
        get().logout();
      }
      throw err;
    }
  },
  updateUserProfile: async (formData) => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/me', formData);
      const user = res.data;
      const updatedUser = { ...user, id: user.id || user._id }; // Ensure id is set
      set({ user: updatedUser });
    } catch (err) {
      console.error('Failed to update user profile:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  fetchAllUsers: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      set({ users: res.data });
    } catch (err) {
      console.error('Failed to fetch users:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateUser: async (id, userData) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${id}`, userData);
      await get().fetchAllUsers();
    } catch (err) {
      console.error('Failed to update user:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteUser: async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
      await get().fetchAllUsers();
    } catch (err) {
      console.error('Failed to delete user:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },

  // Customer Actions (Updated to use user ID)
  fetchCart: async () => {
    try {
      const user = get().user;
      console.log('Fetching cart for user:', user); // Debug log
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
      set({ cart: res.data });
    } catch (err) {
      console.error('Failed to fetch cart:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ cart: null }); // Reset cart on failure
    }
  },
  addToCart: async (fishItemId, quantity) => {
    try {
      const user = get().user;
      console.log('Adding to cart for user:', user); // Debug log
      
      // Wait for user state to be available
      if (!user || !user.id) {
        // Try to fetch user profile first
        await get().fetchUserProfile();
        const updatedUser = get().user;
        if (!updatedUser || !updatedUser.id) {
          throw new Error('User not authenticated or missing ID');
        }
      }
      
      console.log('Adding to cart with payload:', { customerId: user.id, fishItemId, quantity }); // Debug log
      await axios.post('http://localhost:5000/api/cart', { customerId: user.id, fishItemId, quantity });
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to add to cart:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateCartQuantity: async (fishItemId, quantity) => {
    try {
      const user = get().user;
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      const parsedQuantity = parseInt(quantity) || 0;
      await axios.put('http://localhost:5000/api/cart', {
        customerId: user.id,
        fishItemId,
        quantity: parsedQuantity,
      });
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to update cart:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteFromCart: async (fishItemId) => {
    try {
      const user = get().user;
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      await axios.delete(`http://localhost:5000/api/cart/${user.id}/${fishItemId}`);
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to delete from cart:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  checkout: async (formData) => {
    try {
      const user = get().user;
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      
      // Ensure formData is properly formatted
      if (!(formData instanceof FormData)) {
        throw new Error('FormData is required for checkout');
      }
      
      // Log the form data for debugging
      console.log('Checkout form data:', {
        customerId: formData.get('customerId'),
        totalAmount: formData.get('totalAmount'),
        hasPaymentSlip: formData.has('paymentSlip'),
        paymentSlipName: formData.get('paymentSlip')?.name
      });
      
      const res = await axios.post('http://localhost:5000/api/payments/checkout', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      console.log('Checkout successful:', res.data);
      set({ cart: null }); // Clear cart on successful checkout
      return res.data; // Return response for the frontend to handle
    } catch (err) {
      console.error('Failed to checkout:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  fetchPayments: async () => {
    try {
      const user = get().user;
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      const res = await axios.get(`http://localhost:5000/api/payments/${user.id}`);
      set({ payments: res.data });
    } catch (err) {
      console.error('Failed to fetch payments:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ payments: [] }); // Reset payments on failure
    }
  },
  fetchAllPayments: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const res = await axios.get('http://localhost:5000/api/payments/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set({ payments: res.data });
    } catch (err) {
      console.error('Failed to fetch all payments:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ payments: [] }); // Reset payments on failure
    }
  },
  searchPayments: async (filters) => {
    try {
      const user = get().user;
      if (!user || !user.id) throw new Error('User not authenticated or missing ID');
      
      // Use admin search endpoint if user is admin
      const endpoint = user.role === 'admin' 
        ? 'http://localhost:5000/api/payments/search/all'
        : `http://localhost:5000/api/payments/search/${user.id}`;
      
      const res = await axios.get(endpoint, { params: filters });
      set({ payments: res.data });
    } catch (err) {
      console.error('Failed to search payments:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  clearCart: () => set({ cart: null }),

  // Admin Actions - Fish Items
  fetchFishItems: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fish-items');
      set({ fishItems: res.data });
    } catch (err) {
      console.error('Failed to fetch fish items:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ fishItems: [] }); // Reset fish items on failure
    }
  },
  searchFishItems: async (searchTermOrFilters) => {
    try {
      let params = {};
      
      // Handle both string search term and object with filters
      if (typeof searchTermOrFilters === 'string') {
        params = { name: searchTermOrFilters };
      } else if (typeof searchTermOrFilters === 'object') {
        params = { ...searchTermOrFilters };
      }
      
      const res = await axios.get(`http://localhost:5000/api/fish-items/search`, {
        params
      });
      set({ fishItems: res.data });
    } catch (err) {
      console.error('Failed to search fish items:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ fishItems: [] }); // Reset fish items on failure
    }
  },
  getLowStockReport: async (threshold = 10) => {
    try {
      const res = await axios.get('http://localhost:5000/api/fish-items/report/low-stock', {
        params: { threshold },
      });
      console.log('Low Stock Report Data:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch low stock report:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  downloadLowStockReportAsPDF: async (threshold = 10) => {
    try {
      const reportData = await get().getLowStockReport(threshold);
      console.log('Rendering Low Stock PDF with data:', reportData);
      if (!reportData || reportData.length === 0) {
        return { success: false, message: 'No low stock data available to generate PDF' };
      }

      const doc = new jsPDF();

      addPDFHeader(doc, 'Low Stock Report');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const startX = 20;
      const colWidths = { id: 50, name: 60, stock: 30, price: 30 };
      let x = startX;
      doc.text('ID', x, 40); x += colWidths.id;
      doc.text('Name', x, 40); x += colWidths.name;
      doc.text('Stock', x, 40); x += colWidths.stock;
      doc.text('Price', x, 40);

      let y = 50;
      reportData.forEach((item) => {
        x = startX;
        doc.text(truncateText(item._id, 25), x, y); x += colWidths.id;
        doc.text(truncateText(item.name, 30), x, y); x += colWidths.name;
        doc.text(String(item.stock), x, y); x += colWidths.stock;
        doc.text(String(item.price), x, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save('low-stock-report.pdf');
      return { success: true };
    } catch (err) {
      console.error('Failed to download low stock report as PDF:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      return { success: false, message: err.message };
    }
  },
  createFishItem: async (fishItemData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/fish-items', fishItemData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchFishItems();
      console.log('Fish item created successfully:', response.data);
    } catch (err) {
      console.error('Failed to create fish item:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateFishItem: async (id, fishItemData) => {
    try {
      await axios.put(`http://localhost:5000/api/fish-items/${id}`, fishItemData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchFishItems();
    } catch (err) {
      console.error('Failed to update fish item:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteFishItem: async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/fish-items/${id}`);
      await get().fetchFishItems();
    } catch (err) {
      console.error('Failed to delete fish item:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },

  // Admin Actions - Fleet
  fetchFleet: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fleet');
      set({ fleet: res.data });
    } catch (err) {
      console.error('Failed to fetch fleet:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ fleet: [] }); // Reset fleet on failure
    }
  },
  searchFleet: async (filters) => {
    try {
      const res = await axios.get('http://localhost:5000/api/fleet/search', { params: filters });
      set({ fleet: res.data });
    } catch (err) {
      console.error('Failed to search fleet:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  getFleetUsageReport: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fleet/report/usage');
      console.log('Fleet Usage Report Data:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch fleet usage report:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  downloadFleetUsageReportAsPDF: async () => {
    try {
      const reportData = await get().getFleetUsageReport();
      console.log('Rendering Fleet Usage PDF with data:', reportData);
      if (!reportData || reportData.length === 0) {
        return { success: false, message: 'No fleet usage data available to generate PDF' };
      }

      const doc = new jsPDF();

      addPDFHeader(doc, 'Fleet Usage Report');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const startX = 20;
      const colWidths = { fleetId: 35, vehicleType: 35, status: 30, driver: 50, maintenance: 30 };
      let x = startX;
      doc.text('Fleet ID', x, 40); x += colWidths.fleetId;
      doc.text('Vehicle Type', x, 40); x += colWidths.vehicleType;
      doc.text('Status', x, 40); x += colWidths.status;
      doc.text('Assigned Driver', x, 40); x += colWidths.driver;
      doc.text('Maintenance Count', x, 40);

      let y = 50;
      reportData.forEach((item) => {
        x = startX;
        doc.text(truncateText(item.fleet_id, 18), x, y); x += colWidths.fleetId;
        doc.text(truncateText(item.vehicle_type, 18), x, y); x += colWidths.vehicleType;
        doc.text(truncateText(item.status, 15), x, y); x += colWidths.status;
        doc.text(truncateText(item.assigned_driver, 25), x, y); x += colWidths.driver;
        doc.text(String(item.maintenanceCount || 0), x, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save('fleet-usage-report.pdf');
      return { success: true };
    } catch (err) {
      console.error('Failed to download fleet usage report as PDF:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      return { success: false, message: err.message };
    }
  },
  createFleet: async (fleetData) => {
    try {
      await axios.post('http://localhost:5000/api/fleet', fleetData);
      await get().fetchFleet();
    } catch (err) {
      console.error('Failed to create fleet:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateFleet: async (id, fleetData) => {
    try {
      await axios.put(`http://localhost:5000/api/fleet/${id}`, fleetData);
      await get().fetchFleet();
    } catch (err) {
      console.error('Failed to update fleet:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteFleet: async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/fleet/${id}`);
      await get().fetchFleet();
    } catch (err) {
      console.error('Failed to delete fleet:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },

  // Admin Actions - Staff
  fetchStaff: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      set({ staff: res.data });
    } catch (err) {
      console.error('Failed to fetch staff:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ staff: [] }); // Reset staff on failure
    }
  },
  searchStaff: async (filters) => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff/search', { params: filters });
      set({ staff: res.data });
    } catch (err) {
      console.error('Failed to search staff:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  getStaffAssignmentReport: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff/report/assignments');
      console.log('Staff Assignment Report Data:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch staff assignment report:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  downloadStaffAssignmentReportAsPDF: async () => {
    try {
      const reportData = await get().getStaffAssignmentReport();
      console.log('Rendering Staff Assignment PDF with data:', reportData);
      if (!reportData || reportData.length === 0) {
        return { success: false, message: 'No staff assignment data available to generate PDF' };
      }

      const doc = new jsPDF();

      addPDFHeader(doc, 'Staff Assignment Report');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const startX = 20;
      const colWidths = { staffId: 35, name: 35, role: 25, email: 35, fleetId: 35, vehicleType: 35 };
      let x = startX;
      doc.text('Staff ID', x, 40); x += colWidths.staffId;
      doc.text('Full Name', x, 40); x += colWidths.name;
      doc.text('Role', x, 40); x += colWidths.role;
      doc.text('Email', x, 40); x += colWidths.email;
      doc.text('Assigned Fleet ID', x, 40); x += colWidths.fleetId;
      doc.text('Vehicle Type', x, 40);

      let y = 50;
      reportData.forEach((item) => {
        x = startX;
        doc.text(truncateText(item.staff_id, 18), x, y); x += colWidths.staffId;
        doc.text(truncateText(item.full_name, 18), x, y); x += colWidths.name;
        doc.text(truncateText(item.role, 12), x, y); x += colWidths.role;
        doc.text(truncateText(item.email, 18), x, y); x += colWidths.email;
        doc.text(truncateText(item.assigned_fleet_id, 18), x, y); x += colWidths.fleetId;
        doc.text(truncateText(item.vehicle_type, 18), x, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save('staff-assignment-report.pdf');
      return { success: true };
    } catch (err) {
      console.error('Failed to download staff assignment report as PDF:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      return { success: false, message: err.message };
    }
  },
  createStaff: async (staffData) => {
    try {
      await axios.post('http://localhost:5000/api/staff', staffData);
      await get().fetchStaff();
    } catch (err) {
      console.error('Failed to create staff:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateStaff: async (id, staffData) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/${id}`, staffData);
      await get().fetchStaff();
    } catch (err) {
      console.error('Failed to update staff:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteStaff: async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/staff/${id}`);
      await get().fetchStaff();
    } catch (err) {
      console.error('Failed to delete staff:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },

  // Admin Actions - Maintenance
  fetchMaintenance: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/maintenance');
      set({ maintenance: res.data });
    } catch (err) {
      console.error('Failed to fetch maintenance:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      set({ maintenance: [] }); // Reset maintenance on failure
    }
  },
  searchMaintenance: async (filters) => {
    try {
      const res = await axios.get('http://localhost:5000/api/maintenance/search', { params: filters });
      set({ maintenance: res.data });
    } catch (err) {
      console.error('Failed to search maintenance:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  getMaintenanceReport: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/maintenance/report');
      console.log('Maintenance Report Data:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch maintenance report:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  downloadMaintenanceReportAsPDF: async () => {
    try {
      const reportData = await get().getMaintenanceReport();
      console.log('Rendering Maintenance PDF with data:', reportData);
      if (!reportData || reportData.length === 0) {
        return { success: false, message: 'No maintenance data available to generate PDF' };
      }

      const doc = new jsPDF();

      addPDFHeader(doc, 'Maintenance Report');

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const startX = 10;
      const colWidths = { maintenanceId: 30, fleetId: 25, fleetIdentifier: 25, vehicleType: 25, date: 30, description: 30, cost: 15, nextDue: 30 };
      let x = startX;
      doc.text('Maintenance ID', x, 40); x += colWidths.maintenanceId;
      doc.text('Fleet ID', x, 40); x += colWidths.fleetId;
      doc.text('Fleet Identifier', x, 40); x += colWidths.fleetIdentifier;
      doc.text('Vehicle Type', x, 40); x += colWidths.vehicleType;
      doc.text('Date', x, 40); x += colWidths.date;
      doc.text('Description', x, 40); x += colWidths.description;
      doc.text('Cost', x, 40); x += colWidths.cost;
      doc.text('Next Due Date', x, 40);

      let y = 50;
      reportData.forEach((item) => {
        x = startX;
        doc.text(truncateText(item.maintenanceId, 15), x, y); x += colWidths.maintenanceId;
        doc.text(truncateText(item.fleetId, 12), x, y); x += colWidths.fleetId;
        doc.text(truncateText(item.fleetIdentifier, 12), x, y); x += colWidths.fleetIdentifier;
        doc.text(truncateText(item.vehicleType, 12), x, y); x += colWidths.vehicleType;
        doc.text(truncateText(new Date(item.maintenanceDate).toLocaleDateString(), 15), x, y); x += colWidths.date;
        doc.text(truncateText(item.description, 15), x, y); x += colWidths.description;
        doc.text(String(item.cost), x, y); x += colWidths.cost;
        doc.text(truncateText(item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString() : 'N/A', 15), x, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save('maintenance-report.pdf');
      return { success: true };
    } catch (err) {
      console.error('Failed to download maintenance report as PDF:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      return { success: false, message: err.message };
    }
  },
  createMaintenance: async (maintenanceData) => {
    try {
      await axios.post('http://localhost:5000/api/maintenance', maintenanceData);
      await get().fetchMaintenance();
    } catch (err) {
      console.error('Failed to create maintenance:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  updateMaintenance: async (id, maintenanceData) => {
    try {
      await axios.put(`http://localhost:5000/api/maintenance/${id}`, maintenanceData);
      await get().fetchMaintenance();
    } catch (err) {
      console.error('Failed to update maintenance:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
  deleteMaintenance: async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/maintenance/${id}`);
      await get().fetchMaintenance();
    } catch (err) {
      console.error('Failed to delete maintenance:', {
        message: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
      });
      throw err;
    }
  },
}));

export default useStore;