
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const LoadingState = ({
  message = "Loading...",
}) => {
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
        role="status"
        aria-live="polite"
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
          }}
        >
          <CircularProgress
            size={36}
            thickness={4}
            color="primary"
            aria-label={message}
          />
        </Box>

        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          Please wait
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7, overflowWrap: "anywhere" }}
        >
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};
