import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useId } from "react";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { formatCurrency } from "../utils/currencyUtils";
import { formatDate } from "../utils/dateUtils";

const SectionCard = ({ id, title, icon, children }) => (
  <Paper
    elevation={2}
    component="section"
    aria-labelledby={id}
    sx={(theme) => ({
      overflow: "hidden",
      borderRadius: 2,
      minWidth: 0,
      bgcolor: "background.paper",
      "& > header": {
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        color: "primary.main",
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        borderBottom: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.2),
      },
    })}
  >
    <Box component="header">
      {icon}
      <Typography
        id={id}
        variant="subtitle1"
        component="h3"
        sx={{ fontWeight: 600, color: "text.primary" }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>{children}</Box>
  </Paper>
);

const InfoCard = ({ label, children }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: "action.hover",
      borderLeft: 3,
      borderColor: "primary.main",
      minWidth: 0,
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {children}
    </Typography>
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
      <SectionCard
        id={datesHeadingId}
        title="Dates"
        icon={<EventOutlinedIcon sx={{ fontSize: 20 }} />}
      >
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
      </SectionCard>

      <SectionCard
        id={detailsHeadingId}
        title="Order details"
        icon={<InfoOutlinedIcon sx={{ fontSize: 20 }} />}
      >
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
      </SectionCard>

      <SectionCard
        id={itemsHeadingId}
        title="Items"
        icon={<Inventory2OutlinedIcon sx={{ fontSize: 20 }} />}
      >
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
              <TableRow
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                })}
              >
                <TableCell scope="col" sx={{ fontWeight: 600 }}>
                  Item
                </TableCell>
                <TableCell scope="col" align="center" sx={{ fontWeight: 600 }}>
                  Qty
                </TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 600 }}>
                  Unit price
                </TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 600 }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow
                    key={item?.id || `${item?.name || "item"}-${index}`}
                    hover
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
                <TableRow hover>
                  <TableCell colSpan={4} align="center">
                    No item details available.
                  </TableCell>
                </TableRow>
              )}
              <TableRow
                hover
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "& th, & td": {
                    fontWeight: 700,
                    borderBottom: 0,
                  },
                })}
              >
                <TableCell
                  component="th"
                  scope="row"
                  colSpan={3}
                >
                  Grand total
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "primary.main", fontSize: "1rem" }}
                >
                  {formatCurrency(po.amount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard
        id={notesHeadingId}
        title="Notes"
        icon={<StickyNote2OutlinedIcon sx={{ fontSize: 20 }} />}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {po.notes?.trim() || "No notes provided."}
        </Typography>
      </SectionCard>
    </Box>
  );
}
