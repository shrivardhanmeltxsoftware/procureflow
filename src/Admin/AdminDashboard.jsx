import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReactECharts from "echarts-for-react";
import { useNavigate } from "react-router";
import {
  getAllInvoices,
  getAllPurchaseOrders,
  getVendors,
} from "../services/AdminAPI";
import { formatDate } from "../utils/dateUtils";

const STATUS_COLORS = {
  pending: "#ED6C02",
  accepted: "#1976D2",
  approved: "#1976D2",
  rejected: "#D32F2F",
  completed: "#2E7D32",
  delivered: "#2E7D32",
  shipped: "#0288D1",
  paid: "#2E7D32",
  active: "#2E7D32",
  inactive: "#78909C",
};

const CHART_COLORS = [
  "#4527A0",
  "#1976D2",
  "#00897B",
  "#ED6C02",
  "#D32F2F",
  "#607D8B",
];

const formatCurrency = (amount, maximumFractionDigits = 2) => {
  if (amount === null || amount === undefined || amount === "") return "N/A";
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(numericAmount);
};

const parseDate = (value) => {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  let date;
  if (match) {
    const [, year, month, day] = match;
    date = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }
  } else {
    date = new Date(value);
  }

  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeStatus = (status) =>
  typeof status === "string" ? status.trim().toLowerCase() : "";

const getLabel = (status) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getStatusColor = (status) =>
  STATUS_COLORS[normalizeStatus(status)] || "default";

const buildStatusData = (records, field, statuses) => {
  const counts = records.reduce((result, record) => {
    const status = normalizeStatus(record?.[field]);
    if (status) result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  const statusNames = [
    ...new Set([...(statuses || []), ...Object.keys(counts).sort()]),
  ];

  return statusNames.map((status, index) => ({
    name: getLabel(status),
    value: counts[status] || 0,
    itemStyle: {
      color: STATUS_COLORS[status] || CHART_COLORS[index % CHART_COLORS.length],
    },
  }));
};

const createDonutOption = (title, data) => ({
  title: {
    text: title,
    left: 16,
    top: 12,
    textStyle: { fontSize: 15, fontWeight: 600, color: "#263238" },
  },
  color: CHART_COLORS,
  tooltip: {
    trigger: "item",
    formatter: (item) => `${item.name}: ${item.value} (${item.percent}%)`,
  },
  legend: {
    type: "scroll",
    bottom: 4,
    left: "center",
    textStyle: { color: "#546E7A" },
  },
  series: [
    {
      name: title,
      type: "pie",
      radius: ["42%", "68%"],
      center: ["50%", "55%"],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      label: { show: false },
      emphasis: {
        scale: true,
        label: { show: true, fontSize: 13, fontWeight: 600 },
      },
      data,
    },
  ],
});

const SummaryCard = ({ title, value, icon, tone }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      border: 1,
      borderColor: "divider",
      height: "100%",
      borderRadius: 3,
    }}
  >
    {/* Row 1: icon in front of the title */}
    <Stack direction="row" alignitems="center" spacing={1}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 1.5,
          color: tone,
          bgcolor: `${tone}18`,
          "& .MuiSvgIcon-root": { fontSize: 19 },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        noWrap
        title={title}
        sx={{ minWidth: 0, fontWeight: 500 }}
      >
        {title}
      </Typography>
    </Stack>

    {/* Row 2: number, left-aligned under the icon */}
    <Typography variant="h3" sx={{ fontWeight: 500, lineHeight: 1.2, mt: 1.5 }}>
      {value}
    </Typography>
  </Paper>
);

const ChartPanel = ({ title, empty, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      border: 1,
      borderColor: "divider",
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    {empty ? (
      <Box
        sx={{
          height: 330,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            No data available yet.
          </Typography>
        </Box>
      </Box>
    ) : (
      children
    )}
  </Paper>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [vendorData, purchaseOrderData, invoiceData] = await Promise.all([
          getVendors(),
          getAllPurchaseOrders(),
          getAllInvoices(),
        ]);

        if (isMounted) {
          setVendors(vendorData);
          setPurchaseOrders(purchaseOrderData);
          setInvoices(invoiceData);
        }
      } catch (fetchError) {
        console.error("Failed to load admin dashboard data:", fetchError);
        if (isMounted) {
          setError("Dashboard data could not be loaded. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const vendorMap = useMemo(
    () =>
      new Map(
        vendors.map((vendor) => [
          String(vendor.id ?? vendor._id),
          vendor.businessName || "N/A",
        ]),
      ),
    [vendors],
  );

  const pendingPayments = invoices.filter(
    (invoice) =>
      normalizeStatus(invoice.status) === "approved" &&
      (normalizeStatus(invoice.paymentStatus) || "pending") === "pending",
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) => normalizeStatus(invoice.status) === "pending",
  ).length;

  const poStatusData = buildStatusData(purchaseOrders, "status", [
    "pending",
    "accepted",
    "rejected",
    "completed",
  ]);
  const invoiceStatusData = buildStatusData(invoices, "status");
  const approvedInvoices = invoices.filter(
    (invoice) => normalizeStatus(invoice.status) === "approved",
  );
  const paymentInvoices = approvedInvoices.map((invoice) => ({
    ...invoice,
    paymentStatus: normalizeStatus(invoice.paymentStatus) || "pending",
  }));
  const paymentStatusData = buildStatusData(paymentInvoices, "paymentStatus", [
    "pending",
    "paid",
  ]);
  const deliveryStatusData = buildStatusData(purchaseOrders, "deliveryStatus");
  const vendorStatusData = buildStatusData(vendors, "status");

  const spendingData = useMemo(() => {
    const validOrders = purchaseOrders
      .map((order) => ({ order, date: parseDate(order.orderDate) }))
      .filter(({ date }) => date);

    if (validOrders.length === 0) return [];

    // Show the current month and the five preceding calendar months.
    // This keeps the dashboard useful even when the newest PO is older.
    const now = new Date();
    const latestMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        latestMonth.getFullYear(),
        latestMonth.getMonth() - (5 - index),
        1,
      );
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: new Intl.DateTimeFormat("en", {
          month: "short",
          year: "2-digit",
        }).format(date),
        amount: 0,
      };
    });
    const monthMap = new Map(months.map((month) => [month.key, month]));

    validOrders.forEach(({ order, date }) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = monthMap.get(key);
      const amount = Number(order.amount);
      if (month && Number.isFinite(amount)) month.amount += amount;
    });

    return months;
  }, [purchaseOrders]);

  const spendingOption = {
    title: {
      text: "Monthly Purchase Spending",
      left: 16,
      top: 12,
      textStyle: { fontSize: 15, fontWeight: 600, color: "#263238" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (items) => {
        const item = items[0];
        return `${item.axisValue}<br/>${formatCurrency(item.value)}`;
      },
    },
    grid: { left: 92, right: 24, top: 64, bottom: 54 },
    xAxis: {
      type: "category",
      data: spendingData.map((month) => month.label),
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: "#CFD8DC" } },
      axisLabel: { color: "#546E7A" },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#546E7A",
        formatter: (value) => formatCurrency(value, 0),
      },
      splitLine: { lineStyle: { color: "#ECEFF1" } },
    },
    series: [
      {
        name: "Purchase spending",
        type: "bar",
        data: spendingData.map((month) => month.amount),
        barMaxWidth: 44,
        itemStyle: {
          color: "#4527A0",
          borderRadius: [5, 5, 0, 0],
        },
      },
    ],
  };

  const recentOrders = useMemo(
    () =>
      [...purchaseOrders]
        .sort((first, second) => {
          const firstDate = parseDate(first.orderDate)?.getTime() ?? -Infinity;
          const secondDate =
            parseDate(second.orderDate)?.getTime() ?? -Infinity;
          return secondDate - firstDate;
        })
        .slice(0, 5),
    [purchaseOrders],
  );

  const chartPanels = [
    {
      title: "Purchase Order Status",
      empty: purchaseOrders.length === 0,
      option: createDonutOption("Purchase Order Status", poStatusData),
    },
    {
      title: "Monthly Purchase Spending",
      empty: spendingData.length === 0,
      option: spendingOption,
    },
    {
      title: "Invoice Approval Status",
      empty: invoices.length === 0,
      option: createDonutOption("Invoice Approval Status", invoiceStatusData),
    },
    {
      title: "Payment Status",
      empty: approvedInvoices.length === 0,
      option: createDonutOption("Payment Status", paymentStatusData),
    },
    {
      title: "Delivery Status",
      empty: purchaseOrders.length === 0 || deliveryStatusData.length === 0,
      option: createDonutOption("Delivery Status", deliveryStatusData),
    },
    {
      title: "Vendor Status",
      empty: vendors.length === 0 || vendorStatusData.length === 0,
      option: createDonutOption("Vendor Status", vendorStatusData),
    },
  ];

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <SummaryCard
              title="Total Vendors"
              value={vendors.length}
              icon={<StorefrontOutlinedIcon />}
              tone="#4527A0"
            />
            <SummaryCard
              title="Total Purchase Orders"
              value={purchaseOrders.length}
              icon={<AssignmentOutlinedIcon />}
              tone="#1976D2"
            />
            <SummaryCard
              title="Pending Invoices"
              value={pendingInvoices}
              icon={<ReceiptLongOutlinedIcon />}
              tone="#ED6C02"
            />
            <SummaryCard
              title="Pending Payments"
              value={pendingPayments}
              icon={<AccountBalanceWalletOutlinedIcon />}
              tone="#00897B"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
              mb: 3,
            }}
          >
            {chartPanels.map((panel) => (
              <ChartPanel
                key={panel.title}
                title={panel.title}
                empty={panel.empty}
              >
                <ReactECharts
                  option={panel.option}
                  style={{ width: "100%", height: 330 }}
                  autoResize
                  notMerge
                />
              </ChartPanel>
            ))}
          </Box>

          <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Purchase Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The five newest orders by order date.
              </Typography>
            </Box>
            {recentOrders.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, pb: 2 }}>
                No purchase orders found.
              </Typography>
            ) : (
              <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        "PO Number",
                        "Vendor Name",
                        "Order Date",
                        "Expected Delivery Date",
                        "Amount",
                        "PO Status",
                        "Delivery Status",
                        "View",
                      ].map((heading) => (
                        <TableCell
                          key={heading}
                          sx={{
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                            bgcolor: "#ECEFF1",
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id ?? order.poNumber} hover>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {order.poNumber || "N/A"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {vendorMap.get(String(order.vendorId ?? "")) || "N/A"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(
                            order.deliveryDate || order.expectedDeliveryDate,
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatCurrency(order.amount)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getLabel(order.status || "unknown")}
                            color={getStatusColor(order.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getLabel(order.deliveryStatus || "unknown")}
                            color={getStatusColor(order.deliveryStatus)}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View purchase order">
                            <span>
                              <IconButton
                                aria-label={`View ${order.poNumber || "purchase order"}`}
                                size="small"
                                disabled={!order.id}
                                onClick={() =>
                                  navigate(`/admin/purchase-orders/${order.id}`)
                                }
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};
