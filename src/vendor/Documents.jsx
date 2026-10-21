import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Paper,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { uploadDocument, getDocuments } from "../services/api";
import { formatDate } from "../utils/dateUtils";

const DOC_TYPE_LABELS = {
  business_license: "Business License",
  insurance_certificate: "Insurance Certificate",
  tax_registration: "Tax Registration",
};

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

export const Documents = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const vendor = JSON.parse(localStorage.getItem("vendor"));
      if (vendor?.id) {
        const data = await getDocuments(vendor.id);
        setDocuments(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

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
      fetchDocuments();
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", flexGrow: 1 }}>
          Documents
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUploadIcon />}
          onClick={() => setOpen(true)}
        >
          Upload document
        </Button>
      </Box>
      <Divider sx={{ mt: 2, mb: 3 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Typography color="text.secondary">
          No documents uploaded yet.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#bbdefb" }}>
                <TableCell>Document type</TableCell>
                <TableCell>File name</TableCell>
                <TableCell>Uploaded on</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    {DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                  </TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status || "Pending"}
                      color={STATUS_COLOR[doc.status] || "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {doc.fileData ? (
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
                    )}
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

          {error && (
            <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>
              {error}
            </Typography>
          )}
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
