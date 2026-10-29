import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useId } from "react";
import { formatCurrency } from "../utils/currencyUtils";
import { formatDate } from "../utils/dateUtils";

const InfoCard = ({ label, children }) => (
  <Box
    sx={{
      p: 2,
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      minWidth: 0,
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{children}</Typography>
  </Box>
);

export default function PurchaseOrderDetails({
  po,
  showActualDelivery = false,
}) {
  const uid = useId();

  if (!po) return null;

  const items = Array.isArray(po.items) ? po.items : [];
  const datesHeadingId = `${uid}-dates`;
  const detailsHeadingId = `${uid}-details`;
  const itemsHeadingId = `${uid}-items`;
  const notesHeadingId = `${uid}-notes`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box
        component="section"
        aria-labelledby={datesHeadingId}
        sx={{ minWidth: 0 }}
      >
        <Typography
          id={datesHeadingId}
          variant="h6"
          component="h3"
          sx={{ mb: 1.5 }}
        >
          Order dates
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <InfoCard label="Order date">{formatDate(po.orderDate)}</InfoCard>
          <InfoCard label="Expected delivery">
            {formatDate(po.deliveryDate)}
          </InfoCard>
          {showActualDelivery && (
            <InfoCard label="Actual delivery">
              {po.actualDeliveryDate
                ? formatDate(po.actualDeliveryDate)
                : "Not delivered yet"}
            </InfoCard>
          )}
        </Box>
      </Box>

      <Box
        component="section"
        aria-labelledby={detailsHeadingId}
        sx={{ minWidth: 0 }}
      >
        <Typography
          id={detailsHeadingId}
          variant="h6"
          component="h3"
          sx={{ mb: 1.5 }}
        >
          Order details
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <InfoCard label="Buyer">{po.buyer || "Not provided"}</InfoCard>
          <InfoCard label="Delivery address">
            {po.deliveryAddress || "Not provided"}
          </InfoCard>
        </Box>
      </Box>

      <Box
        component="section"
        aria-labelledby={itemsHeadingId}
        sx={{ minWidth: 0 }}
      >
        <Typography
          id={itemsHeadingId}
          variant="h6"
          component="h3"
          sx={{ mb: 1.5 }}
        >
          Items
        </Typography>
        <TableContainer
          role="region"
          aria-label="Purchase order items"
          tabIndex={0}
          sx={{
            maxWidth: "100%",
            overflowX: "auto",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
          <Table size="small" sx={{ minWidth: 420 }}>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Item</TableCell>
                <TableCell scope="col" align="center">
                  Qty
                </TableCell>
                <TableCell scope="col" align="right">
                  Unit price
                </TableCell>
                <TableCell scope="col" align="right">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow
                    key={item?.id || `${item?.name || "item"}-${index}`}
                  >
                    <TableCell>{item?.name || "Unnamed item"}</TableCell>
                    <TableCell align="center">{item?.qty ?? "—"}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item?.unitPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item?.total)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No item details available.
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  colSpan={3}
                  sx={{ fontWeight: 600 }}
                >
                  Grand total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(po.amount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box
        component="section"
        aria-labelledby={notesHeadingId}
        sx={{ minWidth: 0 }}
      >
        <Typography
          id={notesHeadingId}
          variant="h6"
          component="h3"
          sx={{ mb: 1 }}
        >
          Notes
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {po.notes?.trim() || "No notes provided."}
        </Typography>
      </Box>
    </Box>
  );
}
