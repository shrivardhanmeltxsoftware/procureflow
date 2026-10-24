import { Box, CircularProgress, Typography } from "@mui/material";
export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: { xs: 4, sm: 6 },
        width: "100%",
      }}
    >
      <CircularProgress size={32} />
      <Typography color="text.secondary" textalign="center">
        {message}
      </Typography>
    </Box>
  );
};
