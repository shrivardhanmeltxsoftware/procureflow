import { Breadcrumbs, Link, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink, useLocation } from "react-router";

const makeCrumbs = ({
  pathname,
  basePath,
  dashboardPath,
  rootLabel,
  items,
  routeLabels,
}) => {
  const rootCrumb = { label: rootLabel, to: dashboardPath };
  const currentPath = pathname.replace(/\/+$/, "") || "/";
  const normalizedDashboardPath = dashboardPath.replace(/\/+$/, "");

  if (
    currentPath === basePath ||
    currentPath === normalizedDashboardPath
  ) {
    return [rootCrumb, { label: "Dashboard" }];
  }

  const matchingItem = items
    .filter(
      (item) =>
        currentPath === item.path ||
        currentPath.startsWith(`${item.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  const crumbs = [rootCrumb];
  if (matchingItem) {
    crumbs.push({
      label: matchingItem.text,
      to: currentPath === matchingItem.path ? undefined : matchingItem.path,
    });
  }

  const remainingPath = matchingItem
    ? currentPath.slice(matchingItem.path.length).split("/").filter(Boolean)
    : currentPath.slice(basePath.length).split("/").filter(Boolean);

  let accumulatedPath = matchingItem?.path || basePath;
  for (const [index, segment] of remainingPath.entries()) {
    accumulatedPath = `${accumulatedPath}/${segment}`;
    const explicitRoute = routeLabels.find((route) =>
      route.pattern.test(accumulatedPath),
    );
    const isLast = index === remainingPath.length - 1;
    const label =
      explicitRoute?.label ||
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    const hasValidRoute = items.some((item) => item.path === accumulatedPath);

    crumbs.push({
      label,
      to: !isLast && hasValidRoute ? accumulatedPath : undefined,
    });
  }

  return crumbs;
};

const DashboardBreadcrumbs = ({
  basePath,
  dashboardPath,
  rootLabel,
  items,
  footerItems = [],
  routeLabels = [],
}) => {
  const { pathname } = useLocation();
  const allItems = [...items, ...footerItems];
  const crumbs = makeCrumbs({
    pathname,
    basePath,
    dashboardPath,
    rootLabel,
    items: allItems,
    routeLabels,
  });

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
        index === crumbs.length - 1 || !crumb.to ? (
          <Typography
            key={`${crumb.label}-${index}`}
            variant="body2"
            color="text.secondary"
            aria-current={index === crumbs.length - 1 ? "page" : undefined}
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={`${crumb.label}-${index}`}
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

export default DashboardBreadcrumbs;
