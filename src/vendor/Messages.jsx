import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
} from "@mui/material";

export const Messages = () => {
  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box
        component={Paper}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 995,
          height: { xs: "calc(100dvh - 96px)", sm: 540 },
          minHeight: 320,
          maxHeight: 700,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          border: "1px solid #d9d9d9",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: 1, sm: 2 },
            gap: 1,
            borderBottom: "1px solid #d9d9d9",
            bgcolor: "#d4ecff",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 20 }}>
            Messages
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            — Admin
          </Typography>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 2 },
            mt: "auto",
            flexShrink: 0,
            bgcolor: "#d4ecff",
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            size="medium"
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                height: { xs: 48, sm: 56 },
                fontSize: { xs: 16, sm: 18 },
                color: "#333",
              },
            }}
          />

          <Button
            variant="contained"
            disableElevation
            sx={{
              minWidth: { xs: 72, sm: 110 },
              height: { xs: 48, sm: 56 },
              borderRadius: 2,
              bgcolor: "primary",
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: 16, sm: 18 },
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
