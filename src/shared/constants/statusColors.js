export const PO_STATUS_COLOR = {
  accepted: "info",
  pending: "warning",
  completed: "success",
  rejected: "error",
};

export const DELIVERY_STATUS_COLOR = {
  shipped: "info",
  pending: "warning",
  delivered: "success",
  delayed: "error",
};

export const INVOICE_STATUS_COLOR = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export const PAYMENT_STATUS_COLOR = {
  pending: "warning",
  approved: "info",
  paid: "success",
};

export const VENDOR_STATUS_COLOR = {
  active: "success",
  pending: "warning",
  inactive: "error",
};

export const DOCUMENT_STATUS_COLOR = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export const normalizeStatus = (status) =>
  typeof status === "string" ? status.trim().toLowerCase() : "";

export const getStatusColor = (map, status, fallback = "default") =>
  map[normalizeStatus(status)] || fallback;
