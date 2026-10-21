import { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
} from "@mui/material";
import { getAllDocuments, updateDocumentStatus } from "../services/AdminAPI";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataTable } from "../components/DataTable";
import {
  DOCUMENT_STATUS_COLOR,
  getStatusColor,
} from "../constants/statusColors";

export const AdminDocuments = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  const columns = [
    { key: "id", label: "Document ID" },
    { key: "companyName", label: "Vendor Name" },
    { key: "documentType", label: "Document Type" },
    { key: "fileName", label: "File Name" },
    {
      key: "uploadedAt",
      label: "Uploaded Date",
      render: (doc) => formatDate(doc.uploadedAt),
    },
    {
      key: "status",
      label: "Status",
      render: (doc) => (
        <Chip
          label={doc.status || "pending"}
          color={getStatusColor(DOCUMENT_STATUS_COLOR, doc.status, "warning")}
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
      render: (doc) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="View">
            <IconButton>
              <VisibilityIcon
                color="primary"
                onClick={() => handleView(doc)}
                fontSize="medium"
              />
            </IconButton>
          </Tooltip>
          {doc.status !== "approved" && (
            <Tooltip title="Approve">
              <IconButton>
                <CheckCircleIcon
                  color="success"
                  onClick={() => handleStatusUpdate(doc.id, "approved")}
                  fontSize="medium"
                />
              </IconButton>
            </Tooltip>
          )}
          {doc.status !== "rejected" && (
            <Tooltip title="Reject">
              <IconButton>
                <CancelIcon
                  color="error"
                  fontSize="medium"
                  onClick={() => handleStatusUpdate(doc.id, "rejected")}
                ></CancelIcon>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vendors documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleStatusUpdate = async (docId, newStatus) => {
    try {
      await updateDocumentStatus(docId, newStatus);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)),
      );
    } catch (err) {
      console.error("Error updating document status:", err);
    }
  };

  const handleView = (doc) => {
    if (doc?.fileData) {
      window.open(doc.fileData, "_blank");
    } else {
      // Fall back to showing the metadata-only card instead of crashing
      setSelectedMetadata(doc);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesStatus = filter === "all" || doc.status === filter;
    const matchesSearch =
      !search ||
      doc.documentType?.toLowerCase().includes(search.toLowerCase()) ||
      doc.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.status?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Documents
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Review and approve documents uploaded by vendors
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
              placeholder="Search documents"
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
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ ml: 1, height: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3 }}>
          {error}
        </Typography>
      ) : filteredDocs.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No documents found.
        </Typography>
      ) : (
        <DataTable columns={columns} rows={filteredDocs} />
      )}

      {/* Metadata Fallback Dialog for records without fileData */}
      <Dialog
        open={Boolean(selectedMetadata)}
        onClose={() => setSelectedMetadata(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Document Metadata</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This document was uploaded before real file storage was enabled.
            Only metadata is available.
          </Alert>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FILE NAME
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.fileName || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FILE TYPE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.fileType || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FILE SIZE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.fileSize
                  ? `${Math.round(selectedMetadata.fileSize / 1024)} KB`
                  : "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                DOCUMENT TYPE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMetadata?.documentType || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                UPLOADED DATE
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(selectedMetadata?.uploadedAt)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedMetadata(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
