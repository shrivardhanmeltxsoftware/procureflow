import {
  Box,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SearchIcon from "@mui/icons-material/Search";
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

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const AdminPurchaseOrders = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [poData, vendorData] = await Promise.all([
        getAllPurchaseOrders(),
        getVendors(),
      ]);
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
    fetchData();
  }, []);

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
  const vendorMap = useMemo(() => {
    return vendors.reduce((acc, v) => {
      const key = String(v.id ?? v._id);
      acc[key] = v.businessName || "N/A";
      return acc;
    }, {});
  }, [vendors]);

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesFilter =
        filter === "all" || po.status?.toLowerCase() === filter.toLowerCase();

      const vendorName = vendorMap[String(po.vendorId)] || "";
      const matchesSearch =
        !search ||
        po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
        vendorName.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [purchaseOrders, filter, search, vendorMap]);

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
        overflow: "hidden",
      }}
    >
      {/* Fixed Header Section */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              alignItems: "center",
              gap: 2,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            <TextField
              placeholder="Search PO number or vendor"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 380 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{
                          fontSize: "0.875rem",
                          color: "text.secondary",
                          fontWeight: 500,
                          "& .MuiSelect-select": {
                            py: 0,
                            pr: "20px !important",
                          },
                        }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="accepted">Accepted</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ ml: 1, height: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<EditNoteIcon />}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3 }}>
          {error}
        </Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No purchase orders found.
        </Typography>
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
