import { Breadcrumbs, Link, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink, useLocation } from "react-router";

const routeLabels = {
  overview: "Dashboard",
  documents: "Documents",
  "purchase-orders": "Purchase Orders",
  deliveries: "Deliveries",
  invoices: "Invoices",
  payments: "Payments",
  messages: "Messages",
  profile: "Settings",
  settings: "Settings",
  create: "Create",
  edit: "Edit",
};

const formatSegmentLabel = (segment, previousSegment) => {
  if (routeLabels[segment]) return routeLabels[segment];
  if (/^\d+$/.test(segment) || /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(segment)) {
    return "Details";
  }
  if (previousSegment === "purchase-orders") return "Details";
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const VendorBreadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const routeSegments = segments[0] === "dashboard" ? segments.slice(1) : [];
  const visibleSegments =
    routeSegments.length === 0 || routeSegments[0] === "overview"
      ? ["overview"]
      : routeSegments;

  const crumbs = [
    { label: "Vendor", to: "/dashboard/overview" },
    ...visibleSegments.map((segment, index) => ({
      label: formatSegmentLabel(segment, visibleSegments[index - 1]),
      to: `/dashboard/${visibleSegments.slice(0, index + 1).join("/")}`,
    })),
  ];

  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={<ChevronRightIcon fontSize="small" />}
      sx={{
        color: "text.secondary",
        "& .MuiBreadcrumbs-separator": { mx: 0.75, color: "text.disabled" },
      }}
    >
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1 ? (
          <Typography
            key={crumb.to}
            variant="body2"
            color="text.secondary"
            aria-current="page"
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.to}
            component={RouterLink}
            to={crumb.to}
            underline="hover"
            color="inherit"
            variant="body2"
          >
            {crumb.label}
          </Link>
        ),
      )}
    </Breadcrumbs>
  );
};

export default VendorBreadcrumbs;
