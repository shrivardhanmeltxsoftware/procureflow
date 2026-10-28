import {
  Box,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import EditNoteIcon from "@mui/icons-material/EditNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getAllPurchaseOrders,
  getVendors,
  deletePurchaseOrder,
} from "../services/AdminAPI";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";
import {
  DELIVERY_STATUS_COLOR,
  getStatusColor,
  PO_STATUS_COLOR,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import SearchFilterBar from "../components/common/SearchFilterBar";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const AdminPurchaseOrders = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = () => Promise.all([getAllPurchaseOrders(), getVendors()]);

  const fetchData = async () => {
    try {
      const [poData, vendorData] = await loadData();
      setError("");
      setPurchaseOrders(poData || []);
      setVendors(vendorData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch purchase orders or vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitialData = async () => {
      try {
        const [poData, vendorData] = await loadData();
        if (!cancelled) {
          setPurchaseOrders(poData || []);
          setVendors(vendorData || []);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to fetch purchase orders or vendors");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  const retryFetchData = () => {
    setLoading(true);
    setError("");
    fetchData();
  };

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      align: "center",
      render: (po) => po.poNumber || "N/A",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      align: "center",
      render: (po) => vendorMap[String(po.vendorId)] || "N/A",
    },
    {
      key: "productName",
      label: "Product / Service",
      align: "center",
      render: (po) =>
        Array.isArray(po.items) && po.items.length > 0
          ? po.items.map((item) => item.name).join(", ")
          : "N/A",
    },
    {
      key: "quantity",
      label: "Quantity",
      align: "center",
      render: (po) =>
        Array.isArray(po.items) && po.items.length > 0
          ? po.items.reduce((total, item) => total + (Number(item.qty) || 0), 0)
          : "N/A",
    },
    {
      key: "amount",
      label: "Total Amount",
      align: "center",
      render: (po) => formatCurrency(po.amount),
    },
    {
      key: "orderDate",
      label: "Order Date",
      align: "center",
      render: (po) => formatDate(po.orderDate),
    },
    {
      key: "deliveryDate",
      label: "Expected Delivery",
      align: "center",
      render: (po) => formatDate(po.deliveryDate || po.expectedDeliveryDate),
    },
    {
      key: "status",
      label: "PO Status",
      align: "center",
      render: (po) => (
        <Chip
          label={po.status || "Pending"}
          color={getStatusColor(PO_STATUS_COLOR, po.status, "warning")}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "deliveryStatus",
      label: "Delivery Status",
      align: "center",
      render: (po) => (
        <Chip
          label={po.deliveryStatus || "N/A"}
          color={getStatusColor(DELIVERY_STATUS_COLOR, po.deliveryStatus)}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sticky: true,
      render: (po) => {
        const id = po.id ?? po._id;

        return (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="View">
              <IconButton
                onClick={() =>
                  navigate(`/admin/purchase-orders/${id}?mode=view`)
                }
              >
                <VisibilityIcon color="primary" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                onClick={() =>
                  navigate(`/admin/purchase-orders/${id}?mode=edit`)
                }
              >
                <EditIcon color="primary" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton onClick={() => confirmDelete(id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  // Vendor lookup — keyed by normalized ID, value is businessName (per spec, never firstName/lastName)
  const vendorMap = vendors.reduce((acc, vendor) => {
    const key = String(vendor.id ?? vendor._id);
    acc[key] = vendor.businessName || "N/A";
    return acc;
  }, {});

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesFilter =
      filter === "all" || po.status?.toLowerCase() === filter.toLowerCase();

    const vendorName = vendorMap[String(po.vendorId)] || "";
    const matchesSearch =
      !search ||
      po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
      vendorName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDelete = async () => {
    try {
      await deletePurchaseOrder(deleteTarget);
      setPurchaseOrders((prev) =>
        prev.filter((po) => (po.id ?? po._id) !== deleteTarget),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete purchase order");
    } finally {
      setDeleteTarget(null);
    }
  };
  const confirmDelete = (id) => {
    setDeleteTarget(id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Fixed Header Section */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Purchase Orders
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Create and manage purchase orders raised to vendors
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              flexGrow: 1,
              minWidth: 0,
              justifyContent: "flex-end",
            }}
          >
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search PO number or vendor"
              status={filter}
              onStatusChange={setFilter}
              statusOptions={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Accepted", value: "accepted" },
                { label: "Rejected", value: "rejected" },
                { label: "Completed", value: "completed" },
              ]}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<EditNoteIcon />}
              sx={{
                textTransform: "none",
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
              }}
              onClick={() => navigate("/admin/purchase-orders/create")}
            >
              Create PO
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Scrollable Table Section */}
      {loading ? (
        <LoadingState message="Loading purchase orders...." />
      ) : error ? (
        // <Typography color="error" sx={{ mt: 3 }}>
        //   {error}
        // </Typography>
        <ErrorState message={error} onRetry={retryFetchData} />
      ) : filteredOrders.length === 0 ? (
        purchaseOrders.length === 0 ? (
          <EmptyState
            title="No purchase orders yet"
            description="Create a purchase order to get started."
            actionLabel="Create PO"
            onAction={() => navigate("/admin/purchase-orders/create")}
          />
        ) : (
          <EmptyState
            title="No purchase orders match your search or filters"
            description="Try changing or clearing your search and filters."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        )
      ) : (
        <DataTable columns={columns} rows={filteredOrders} />
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Purchase Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase order? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
