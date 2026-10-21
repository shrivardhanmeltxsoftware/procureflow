import api from "./api";
export { updatePOStatus } from "./api";

export const loginAdmin = async (email, password) => {
  try {
    const response = await api.get("/admins", {
      params: { email, password },
    });

    if (response.data.length === 0) {
      throw new Error("Invalid admin email or password");
    }

    return response.data[0];
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

// Get all vendors
export const getVendors = async () => {
  try {
    const response = await api.get("/vendors");
    return response.data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const getVendorById = async (id) => {
  try {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    throw error;
  }
};

// Update vendor details
export const updateVendor = async (id, data) => {
  try {
    const response = await api.patch(`/vendors/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw error;
  }
};

// Delete vendor
export const deleteVendor = async (id) => {
  try {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vendor:", error);
    throw error;
  }
};

export const updateVendorStatus = async (id, status) => {
  try {
    const response = await api.patch(`/vendors/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error in updating vendor status : ", error);
    throw error;
  }
};

// Documents (admin reviewing)
export const getAllDocuments = async () => {
  try {
    const response = await api.get("/documents");
    return response.data;
  } catch (error) {
    console.error("Error in getting all documents : ", error);
    throw error;
  }
};
export const getVendorDocuments = async (vendorId) => {
  try {
    const response = await api.get("/documents", { params: { vendorId } });
    return response.data;
  } catch (error) {
    console.error("cant get vendors document : ", error);
    throw error;
  }
};
export const updateDocumentStatus = async (docId, status) => {
  try {
    const response = await api.patch(`/documents/${docId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error in updating document status : ", error);
    throw error;
  }
};

// Purchase Orders (admin creates)
export const createPurchaseOrder = async (poData) => {
  try {
    const response = await api.post("/purchaseOrders", poData);
    return response.data;
  } catch (error) {
    console.error("Error in creating purchase orders : ", error);
    throw error;
  }
};
export const getAllPurchaseOrders = async () => {
  // no vendorId param — admin sees everything

  try {
    const response = await api.get("/purchaseOrders");
    return response.data;
  } catch (error) {
    console.error("Error in getting all purchase orders : ", error);
    throw error;
  }
};
// Delete purchase order
export const deletePurchaseOrder = async (id) => {
  try {
    const response = await api.delete(`/purchaseOrders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleting purchase order : ", error);
    throw error;
  }
};

export const getPurchaseOrderById = async (id) => {
  try {
    const response = await api.get(`/purchaseOrders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetch PO error:", error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id, poData) => {
  try {
    const response = await api.patch(`/purchaseOrders/${id}`, poData);
    return response.data;
  } catch (error) {
    console.error("Update PO error:", error);
    throw error;
  }
};

// Invoices (admin approving)
export const getAllInvoices = async () => {
  try {
    const response = await api.get("/invoices");
    return response.data;
  } catch (error) {
    console.error("Error in getting all invoices : ", error);
    throw error;
  }
};

export const updateInvoiceStatus = async (id, status, paymentFields = {}) => {
  try {
    const response = await api.patch(`/invoices/${id}`, {
      status,
      ...paymentFields,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updating invoices status : ", error);
    throw error;
  }
};

// Payments (admin marking paid)
export const updatePaymentStatus = async (
  invoiceId,
  paymentStatus,
  paymentDate,
) => {
  try {
    const response = await api.patch(`/invoices/${invoiceId}`, {
      paymentStatus,
      paymentDate,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updating Payment status : ", error);
    throw error;
  }
};
