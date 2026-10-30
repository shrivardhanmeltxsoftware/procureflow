import { useCallback, useState, useEffect } from "react";
import { Navigate } from "react-router";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getPurchaseOrders } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";
import DetailsDrawer from "../components/common/DetailsDrawer";
import PurchaseOrderDetails from "../components/PurchaseOrderDetails";
import {
  DELIVERY_STATUS_COLOR,
  getStatusColor,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export const Deliveries = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [open, setOpen] = useState(false);

  // read the logged-in vendor once, not on every render
  const [vendor] = useState(() => JSON.parse(localStorage.getItem("vendor")));
  const vendorId = vendor?.id;

  const loadPurchaseOrders = useCallback(
    () => getPurchaseOrders(vendorId),
    [vendorId],
  );

  useEffect(() => {
    if (!vendorId) return;

    let cancelled = false;
    const loadDeliveries = async () => {
      try {
        const data = await loadPurchaseOrders();
        if (!cancelled) {
          setPurchaseOrders(data);
          setError("");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setError("Failed to load deliveries. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDeliveries();
    return () => {
      cancelled = true;
    };
  }, [loadPurchaseOrders, vendorId]);

  const retryFetchPurchaseOrders = async () => {
    setLoading(true);
    setError("");
    try {
      setPurchaseOrders(await loadPurchaseOrders());
    } catch (error) {
      console.error(error);
      setError("Failed to load deliveries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (delivery) => {
    setSelectedPurchaseOrder(delivery);
    setOpen(true);
  };

  // keep selectedPurchaseOrder so the content doesn't blank during slide-out
  const handleClose = () => setOpen(false);

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (delivery) => delivery.poNumber || "N/A",
    },
    {
      key: "items",
      label: "Items",
      render: (delivery) =>
        (delivery.items || [])
          .map((item) => `${item.name} (Qty: ${item.qty})`)
          .join(", ") || "N/A",
    },
    {
      key: "deliveryDate",
      label: "Expected Delivery",
      render: (delivery) => formatDate(delivery.deliveryDate),
    },
    {
      key: "actualDeliveryDate",
      label: "Actual Delivery",
      render: (delivery) => formatDate(delivery.actualDeliveryDate),
    },
    {
      key: "deliveryStatus",
      label: "Status",
      render: (delivery) => (
        <Chip
          label={delivery.deliveryStatus || "N/A"}
          color={getStatusColor(
            DELIVERY_STATUS_COLOR,
            delivery.deliveryStatus?.toLowerCase(),
            "warning",
          )}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (delivery) => (
        <Tooltip title="View details">
          <IconButton
            color="primary"
            aria-label={`View delivery for ${delivery.poNumber}`}
            onClick={() => handleOpen(delivery)}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (!vendorId) {
    return <Navigate to="/" replace />;
  }

  const deliveries = purchaseOrders.filter((po) => {
    const status = po.status?.toLowerCase();
    return status === "accepted" || status === "completed";
  });

  return (
    <Box>
      {loading ? (
        <LoadingState message="Loading deliveries..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retryFetchPurchaseOrders} />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          description="Deliveries will appear here after a purchase order is accepted."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={deliveries}
          headerBg="#bbdefb"
          sx={{ mt: 3 }}
        />
      )}

      <DetailsDrawer
        open={open}
        onClose={handleClose}
        title={selectedPurchaseOrder?.poNumber || "Delivery"}
        titleAdornment={
          <Chip
            label={selectedPurchaseOrder?.deliveryStatus || "N/A"}
            color={getStatusColor(
              DELIVERY_STATUS_COLOR,
              selectedPurchaseOrder?.deliveryStatus?.toLowerCase(),
              "warning",
            )}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        }
        actions={
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="outlined" size="small" onClick={handleClose}>
              Close
            </Button>
          </Stack>
        }
      >
        <PurchaseOrderDetails po={selectedPurchaseOrder} showActualDelivery />
      </DetailsDrawer>
    </Box>
  );
};