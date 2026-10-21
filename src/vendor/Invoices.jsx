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
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { getInvoices, uploadInvoice, getPurchaseOrders } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";

const STATUS_COLOR = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const Invoices = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedPO, setSelectedPO] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const fetchInvoices = async () => {
    if (!vendor?.id) return;

    try {
      const data = await getInvoices(vendor.id);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPOs = async () => {
    if (!vendor?.id) return;

    try {
      const data = await getPurchaseOrders(vendor.id);
      setPurchaseOrders(
        data.filter(
          (po) => po.status === "accepted" || po.status === "completed",
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPOs();
  }, []);

  if (!vendor?.id) {
    return <Navigate to="/" replace />;
  }

  const columns = [
    {
      key: "poNumber",
      label: "PO Number",
      render: (invoice) => invoice.poNumber || "N/A",
    },
    {
      key: "invoiceNumber",
      label: "Invoice Number",
      render: (invoice) => invoice.invoiceNumber || "N/A",
    },
    {
      key: "uploadedDate",
      label: "Uploaded Date",
      render: (invoice) => formatDate(invoice.uploadedDate),
    },
    {
      key: "amount",
      label: "Amount",
      render: (invoice) =>
        invoice.amount === null || invoice.amount === undefined
          ? "N/A"
          : `₹${Number(invoice.amount).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => {
        const status = invoice.status?.toLowerCase() || "pending";

        return (
          <Chip
            label={status}
            color={STATUS_COLOR[status] || "warning"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (invoice) =>
        invoice.fileData ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.open(invoice.fileData, "_blank")}
          >
            View
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Metadata only
          </Typography>
        ),
    },
  ];

  const handleUploadClose = () => {
    setUploadOpen(false);
    setFile(null);
    setSelectedPO("");
    setInvoiceNumber("");
    setAmount("");
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedPO || !invoiceNumber || !amount || !file) {
      setError("Please fill all fields and attach a file.");
      return;
    }

    const MAX_FILE_SIZE = 500 * 1024; // 500KB
    if (file.size > MAX_FILE_SIZE) {
      setError(
        "File too large for demo storage, please use a file under 500KB",
      );
      return;
    }

    try {
      setUploading(true);
      const fileData = await toBase64(file);
      const po = purchaseOrders.find((p) => p.id === selectedPO);

      await uploadInvoice({
        vendorId: vendor.id,
        poId: po.id,
        poNumber: po.poNumber,
        invoiceNumber,
        amount: Number(amount),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileData,
        uploadedDate: new Date().toISOString(),
        status: "pending",
      });

      handleUploadClose();
      fetchInvoices();
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload invoice.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", flexGrow: 1 }}>
          Invoices
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUploadIcon />}
          onClick={() => setUploadOpen(true)}
        >
          Upload invoice
        </Button>
      </Box>
      <Divider sx={{ mt: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : invoices.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No invoices uploaded yet.
        </Typography>
      ) : (
        <DataTable columns={columns} rows={invoices} headerBg="#bbdefb" sx={{ mt: 3 }}/>
      )}

      <Dialog
        open={uploadOpen}
        onClose={handleUploadClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, pb: 1 }}
        >
          Upload Invoice
        </DialogTitle>

        <DialogContent sx={{ overflowX: "hidden" }}>
          <Typography
            sx={{
              display: "block",
              mb: 1,
              mt: 1,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Purchase order
          </Typography>
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={selectedPO}
              onChange={(e) => setSelectedPO(e.target.value)}
              renderValue={(value) => {
                if (!value) return "Select purchase order";
                const po = purchaseOrders.find((p) => p.id === value);
                return po ? `${po.poNumber} — ${po.buyer}` : "";
              }}
            >
              <MenuItem disabled value="">
                Select purchase order
              </MenuItem>
              {purchaseOrders.map((po) => (
                <MenuItem key={po.id} value={po.id}>
                  {po.poNumber} — {po.buyer}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography
            sx={{
              display: "block",
              mt: 3,
              mb: 1,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Invoice number
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. INV-2003"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />

          <Typography
            sx={{
              display: "block",
              mt: 3,
              mb: 1,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Amount (₹)
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Typography
            sx={{
              display: "block",
              mt: 3,
              mb: 1,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            File
          </Typography>
          <Box
            component="label"
            sx={{
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              border: "1px dashed",
              borderColor: "grey.400",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <InsertDriveFileOutlinedIcon color="action" />
            <Typography
              sx={{
                flex: 1,
                fontSize: 15,
                color: file ? "text.primary" : "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file ? file.name : "No file chosen"}
            </Typography>
            <Button
              component="span"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Choose File
            </Button>
            <input
              type="file"
              hidden
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setError("");
                }
                e.target.value = null;
              }}
            />
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleUploadClose}
            disabled={uploading}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
