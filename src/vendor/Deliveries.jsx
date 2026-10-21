import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { getPurchaseOrders } from "../services/api";
import { formatDate } from "../utils/dateUtils";

export const Deliveries = () => {
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const fetchPurchaseOrders = async () => {
    if (!vendor?.id) return;

    try {
      const data = await getPurchaseOrders(vendor.id);
      setPurchaseOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const DELIVERY_STATUS_COLOR = {
    pending: "warning",
    shipped: "info",
    delivered: "success",
    delayed: "error",
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deliveries = purchaseOrders.filter(
    (po) => po.status === "accepted" || po.status === "completed",
  );

  return (
    <Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Purchase Orders
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : deliveries.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No deliveries yet. Accepted purchase orders will appear here.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="DeliveryTable">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#bbdefb" }}>
                <TableCell>PO Number</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Expected delivery</TableCell>
                <TableCell>Actual delivery</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.poNumber}</TableCell>
                  <TableCell>
                    {(delivery.items || [])
                      .map((item) => `${item.name} (Qty: ${item.qty})`)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{formatDate(delivery.deliveryDate)}</TableCell>
                  <TableCell>{formatDate(delivery.actualDeliveryDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.deliveryStatus}
                      color={
                        DELIVERY_STATUS_COLOR[delivery.deliveryStatus] ||
                        "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={() => {
                        setSelectedPurchaseOrder(delivery);
                        setOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle
          sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, pb: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            PO Number -
            <Typography
              variant="h5"
              component="span"
              sx={{ fontWeight: "bold", flexGrow: 1 }}
            >
              [{selectedPurchaseOrder?.poNumber || ""}]
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#616161", flexGrow: 1 }}
            >
              Order Date: {formatDate(selectedPurchaseOrder?.orderDate)}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text-primary"
              sx={{ fontWeight: "bold" }}
            >
              Expected Delivery:{" "}
              {formatDate(selectedPurchaseOrder?.deliveryDate)}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 1 }} />

        <DialogContent>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 8 }}
          >
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: "#616161" }}>
                Raised by:
              </Typography>
              <Typography
                variant="subtitle1"
                color="text-primary"
                sx={{ fontWeight: "bold" }}
              >
                Admin - {selectedPurchaseOrder?.buyer}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: "#616161" }}>
                Delivery address:
              </Typography>
              <Typography
                variant="subtitle1"
                color="text-primary"
                sx={{ fontWeight: "bold" }}
              >
                {selectedPurchaseOrder?.deliveryAddress}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 1 }} />

          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
            Items :
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedPurchaseOrder?.items || []).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="right">₹{item.unitPrice}</TableCell>
                    <TableCell align="right">₹{item.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                    Grand Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹
                    {(selectedPurchaseOrder?.items || []).reduce(
                      (sum, item) => sum + Number(item.total || 0),
                      0,
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
            Notes :
          </Typography>
          <Typography variant="subtitle2">
            {selectedPurchaseOrder?.notes}
          </Typography>
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: "flex" }}>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
              Delivery Status :
            </Typography>
            <Chip
              label={selectedPurchaseOrder?.deliveryStatus}
              color={
                DELIVERY_STATUS_COLOR[selectedPurchaseOrder?.deliveryStatus] ||
                "warning"
              }
              size="medium"
              sx={{ mt: 1, fontWeight: "bold", ml: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button variant="outlined" size="small" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
