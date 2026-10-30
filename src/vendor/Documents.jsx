import { useCallback, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { uploadDocument, getDocuments } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { DataTable } from "../components/DataTable";
import {
  DOCUMENT_STATUS_COLOR,
  getStatusColor,
} from "../constants/statusColors";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

const DOC_TYPE_LABELS = {
  business_license: "Business License",
  insurance_certificate: "Insurance Certificate",
  tax_registration: "Tax Registration",
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const Documents = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    const vendor = JSON.parse(localStorage.getItem("vendor"));
    return vendor?.id ? getDocuments(vendor.id) : [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await loadDocuments();
        if (!cancelled) {
          setDocuments(data || []);
          setLoadError("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError("Failed to load documents. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [loadDocuments]);

  const retryFetchDocuments = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setDocuments((await loadDocuments()) || []);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "documentType",
      label: "Document Type",
      render: (doc) =>
        DOC_TYPE_LABELS[doc.documentType] || doc.documentType || "N/A",
    },
    {
      key: "fileName",
      label: "File Name",
      render: (doc) => doc.fileName || "N/A",
    },
    {
      key: "uploadedAt",
      label: "Uploaded On",
      render: (doc) => formatDate(doc.uploadedAt),
    },
    {
      key: "status",
      label: "Status",
      render: (doc) => {
        const status = doc.status?.toLowerCase() || "pending";

        return (
          <Chip
            label={status}
            color={getStatusColor(DOCUMENT_STATUS_COLOR, status, "warning")}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (doc) =>
        doc.fileData ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.open(doc.fileData, "_blank")}
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

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setDocType("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file || !docType) {
      setError("Please select both document type and file.");
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
      const vendor = JSON.parse(localStorage.getItem("vendor"));

      await uploadDocument({
        vendorId: vendor?.id,
        companyName: vendor?.businessName,
        documentType: docType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileData,
        uploadedAt: new Date().toISOString(),
      });

      handleClose();
      retryFetchDocuments();
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUploadIcon />}
          onClick={() => setOpen(true)}
          sx={{ width: { xs: "100%", sm: "auto" }}}
        >
          Upload document
        </Button>
      </Box>
      {loading ? (
        <LoadingState message="Loading documents..." />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={retryFetchDocuments} />
      ) : documents.length === 0 ? (
        // <Typography color="text.secondary">
        //   No documents uploaded yet.
        // </Typography>
        <EmptyState
          title="No documents yet"
          description="Documents you upload will appear here."
          actionLabel="Upload document"
          onAction={() => setOpen(true)}
        />
      ) : (
        <DataTable columns={columns} rows={documents} headerBg="#bbdefb" />
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: 22, sm: 26 },
            fontWeight: 700,
            pb: 1,
          }}
        >
          Upload Document
        </DialogTitle>

        <DialogContent sx={{ overflowX: "hidden" }}>
          <Typography
            component="label"
            htmlFor="document-type"
            sx={{
              display: "block",
              mb: 1,
              mt: 1,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Document Type
          </Typography>

          <FormControl fullWidth>
            <Select
              id="document-type"
              displayEmpty
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setError("");
              }}
              renderValue={(value) =>
                value ? DOC_TYPE_LABELS[value] : "Select document type"
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem disabled value="">
                Select document type
              </MenuItem>

              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography
            component="label"
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
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                textTransform: "none",
              }}
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

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={uploading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
