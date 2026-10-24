import { Box, Button, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export default function EmptyState({
  title = "No records found",
  description = "There is no data to display yet.",
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "center",
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <InboxOutlinedIcon
        sx={{ fontSize: 44, color: "text.secondary", mb: 1 }}
      />

      <Typography variant="h6">{title}</Typography>

      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
