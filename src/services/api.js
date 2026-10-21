import axios from "axios";

 const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Register new vendor
export const registerVendor = async (vendorData) => {
  try {
    const response = await api.post("/vendors", vendorData);

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};



// Find vendor by email and password (login)
export const loginVendor = async (email, password) => {
  try {
    const response = await api.get("/vendors", {
      params: {
        email,
        password,
      },
    });

    if (response.data.length === 0) {
      throw new Error("Invalid email or password");
    }

    return response.data[0];
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Update vendor
export const updateVendor = async (id, vendorData) => {
  try {
    const response = await api.patch(`/vendors/${id}`, vendorData);

    return response.data;
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
};

// Save uploaded document metadata
export const uploadDocument = async (documentData) => {
  try {
    const response = await api.post("/documents", documentData);

    return response.data;
  } catch (error) {
    console.error("Document upload error:", error);
    throw error;
  }
};

// Fetch uploaded documents for a vendor
export const getDocuments = async (vendorId) => {
  try {
    const response = await api.get("/documents", {
      params: { vendorId },
    });

    return response.data;
  } catch (error) {
    console.error("Fetch documents error:", error);
    throw error;
  }
};



// Get all purchase orders
export const getPurchaseOrders = async (vendorId) => {
  try {
    const response = await api.get("/purchaseOrders", { params: { vendorId } });
    return response.data;
  } catch (error) {
    console.error("Purchase orders error :", error);
    throw error;
  }
};
// update PO status
export const updatePOStatus = async (id, status) => {
  try {
    const response = await api.patch(`/purchaseOrders/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Update PO status error:", error);
    throw error;
  }
};

// get invoice
export const getInvoices = async (vendorId) => {
  try {
    const response = await api.get("/invoices", { params: { vendorId } });
    return response.data;
  } catch (error) {
    console.error("Invoice error :", error);
    throw error;
  }
};

//upload invoice
export const uploadInvoice = async (invoiceData) => {
  try {
    const response = await api.post("/invoices", invoiceData);
    return response.data;
  } catch (error) {
    console.error("Invoice upload error:", error);
    throw error;
  }
};
export default api;