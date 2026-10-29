
import { Box, Button, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
        minHeight: "60vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: "center",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: 2,
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            mx: "auto",
            mb: 2.5,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
            color: "primary.main",
          }}
        >
          <InboxOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7, overflowWrap: "anywhere" }}
        >
          {description}
        </Typography>

        {actionLabel && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              mt: 3,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                boxShadow: 2,
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Paper>
    </Box>
  );
}
