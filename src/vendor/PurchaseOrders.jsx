import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getPurchaseOrders, updatePOStatus } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/currencyUtils";
import { DataTable } from "../components/DataTable";
import PurchaseOrderDetails from "../components/PurchaseOrderDetails";
import DetailsDrawer from "../components/common/DetailsDrawer";
import { getStatusColor, normalizeStatus, PO_STATUS_COLOR } from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const fetchPurchaseOrders = useCallback(
    () => getPurchaseOrders(vendor.id),
    [vendor?.id],
  );

  useEffect(() => {
    if (!vendor?.id) return;

    let cancelled = false;
    const loadOrders = async () => {
      try {
        const data = await fetchPurchaseOrders();
        if (!cancelled) {
          setPurchaseOrders(data);
          setError("");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setError("Failed to load purchase orders. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [fetchPurchaseOrders, vendor?.id]);

  const retryFetchPurchaseOrders = async () => {
    setLoading(true);
    setError("");
    try {
      setPurchaseOrders(await fetchPurchaseOrders());
    } catch (error) {
      console.error(error);
      setError("Failed to load purchase orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (po) => po.poNumber || "N/A",
    },
    {
      key: "buyer",
      label: "Buyer",
      render: (po) => po.buyer || "N/A",
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (po) => formatDate(po.orderDate),
    },
    {
      key: "deliveryDate",
      label: "Delivery Date",
      render: (po) => formatDate(po.deliveryDate),
    },
    {
      key: "amount",
      label: "Amount",
      render: (po) => formatCurrency(po.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (po) => {
        const status = normalizeStatus(po.status) || "pending";

        return (
          <Chip
            label={status}
            color={getStatusColor(PO_STATUS_COLOR, status, "warning")}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (po) => (
        <Tooltip title="View purchase order details">
          <IconButton
            aria-label={`View purchase order ${po.poNumber || ""}`}
            onClick={() => {
              setSelectedPurchaseOrder(po);
              setOpen(true);
              setConfirmReject(false);
              setUpdateError("");
            }}
          >
            <VisibilityIcon fontSize="medium" color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const handleClose = () => {
    setOpen(false);
    setConfirmReject(false);
    setUpdateError("");
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedPurchaseOrder) return;

    setUpdating(true);
    setUpdateError("");
    try {
      await updatePOStatus(selectedPurchaseOrder.id, status);
      setPurchaseOrders(await fetchPurchaseOrders());
      handleClose();
    } catch (error) {
      console.error(error);
      setUpdateError("Could not update the purchase order. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const isPending =
    normalizeStatus(selectedPurchaseOrder?.status) === "pending";

  const drawerActions =
    isPending && confirmReject ? (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
      >
        <Typography sx={{ flex: 1 }}>Reject this purchase order?</Typography>
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="outlined"
            onClick={() => setConfirmReject(false)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={updating}
            onClick={() => handleStatusUpdate("rejected")}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Yes, reject
          </Button>
        </Stack>
      </Stack>
    ) : (
      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Close
        </Button>
        {isPending && (
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              variant="outlined"
              color="error"
              disabled={updating}
              onClick={() => setConfirmReject(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={updating}
              onClick={() => handleStatusUpdate("accepted")}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Accept
            </Button>
          </Stack>
        )}
      </Stack>
    );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        Purchase Orders
      </Typography>
      <Divider sx={{ mt: 2 }} />

      {loading ? (
        <LoadingState message="Loading purchase orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchPurchaseOrders} />
      ) : purchaseOrders.length === 0 ? (
        <EmptyState
          title="No purchase orders yet"
          description="Purchase orders assigned to you will appear here."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={purchaseOrders}
          headerBg="#bbdefb"
          sx={{ mt: 3 }}
        />
      )}

      <DetailsDrawer
        open={open}
        onClose={handleClose}
        title={selectedPurchaseOrder?.poNumber || "Purchase Order"}
        titleAdornment={
          <Chip
            label={selectedPurchaseOrder?.status || "Pending"}
            color={getStatusColor(
              PO_STATUS_COLOR,
              selectedPurchaseOrder?.status,
              "warning",
            )}
            size="small"
            sx={{ textTransform: "capitalize", flexShrink: 0 }}
          />
        }
        actions={drawerActions}
      >
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}
        <PurchaseOrderDetails po={selectedPurchaseOrder} />
      </DetailsDrawer>
    </Box>
  );
};
