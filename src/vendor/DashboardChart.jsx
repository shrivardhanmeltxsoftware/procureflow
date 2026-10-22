import { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, CircularProgress } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { getPurchaseOrders, getInvoices } from "../services/api";

const STATUS_COLORS = {
  Pending: "#ED6C02",
  Accepted: "#1565C0",
  Completed: "#2E7D32",
  Rejected: "#D32F2F",
};

const PAYMENT_COLORS = {
  Pending: "#ED6C02",
  Approved: "#1565C0",
  Paid: "#2E7D32",
};

export const DashboardChart = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const vendor = JSON.parse(localStorage.getItem("vendor"));
        if (!vendor?.id) {
          setLoading(false);
          return;
        }

        const [poData, invData] = await Promise.all([
          getPurchaseOrders(vendor.id),
          getInvoices(vendor.id),
        ]);
        setPurchaseOrders(poData);
        setInvoices(invData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statusCounts = purchaseOrders.reduce((acc, po) => {
    const status = po.status?.toLowerCase() || "pending";
    const formattedLabel = status.charAt(0).toUpperCase() + status.slice(1);
    acc[formattedLabel] = (acc[formattedLabel] || 0) + 1;
    return acc;
  }, {});

  const poStatusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: STATUS_COLORS[name] || "#999999" },
  }));

  const paymentTotals = invoices.reduce((acc, inv) => {
    const status = inv.paymentStatus?.toLowerCase() || "pending";
    const formattedLabel = status.charAt(0).toUpperCase() + status.slice(1);
    acc[formattedLabel] = (acc[formattedLabel] || 0) + (inv.amount || 0);
    return acc;
  }, {});

  const paymentStatusData = Object.entries(paymentTotals).map(
    ([name, value]) => ({
      name,
      value,
      itemStyle: { color: PAYMENT_COLORS[name] || "#999999" },
    }),
  );

  // ECharts Option Configuration Generator
  const getPieOption = (data, valueFormatter) => ({
    tooltip: {
      trigger: "item",
      formatter: valueFormatter,
    },
    legend: {
      orient: "horizontal",
      bottom: "-1%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data,
      },
    ],
  });

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: { xs: 1.5, sm: 3 }, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Purchase Order Status
          </Typography>
          {poStatusData.length === 0 ? (
            <Typography color="text.secondary">
              No purchase orders yet.
            </Typography>
          ) : (
            <Box sx={{ height: { xs: 260, sm: 300 }, minWidth: 0 }}>
              <ReactECharts
                option={getPieOption(poStatusData)}
                style={{ height: "100%", width: "100%" }}
                autoResize
              />
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: { xs: 1.5, sm: 3 }, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Payment Status (₹)
          </Typography>
          {paymentStatusData.length === 0 ? (
            <Typography color="text.secondary">No invoices yet.</Typography>
          ) : (
            <Box sx={{ height: { xs: 260, sm: 300 }, minWidth: 0 }}>
              <ReactECharts
                option={getPieOption(
                  paymentStatusData,
                  (params) =>
                    `${params.name}: <b>₹${params.value.toLocaleString("en-IN")}</b> (${params.percent}%)`,
                )}
                style={{ height: "100%", width: "100%" }}
                autoResize
              />
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
