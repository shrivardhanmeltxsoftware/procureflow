import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useId } from "react";

export default function DetailsDrawer({
  open,
  onClose,
  title,
  titleAdornment,
  children,
  actions,
  width = { xs: "100%", sm: 560 },
  topOffset = { xs: "56px", sm: "64px" },
}) {
  const titleId = useId();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": titleId,
          sx: {
            display: "flex",
            flexDirection: "column",
            width,
            maxWidth: "100vw",
            top: topOffset,
            bottom: 0,
            height: "auto",
            boxSizing: "border-box",
            overflow: "hidden",
            minWidth: 0,
          },
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, sm: 3 },
          pt: 2,
          pb: 1.5,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          id={titleId}
          component="h2"
          variant="h5"
          sx={{
            flex: "0 1 auto",
            minWidth: 0,
            m: 0,
            fontWeight: "bold",
            overflowWrap: "anywhere",
          }}
        >
          {title || "Details"}
        </Typography>
        {titleAdornment}
        <IconButton
          aria-label="Close details"
          onClick={onClose}
          size="small"
          sx={{ flexShrink: 0, ml: "auto" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </Box>

      {actions && (
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            flexShrink: 0,
            borderTop: 1,
            borderColor: "divider",
            minWidth: 0,
          }}
        >
          {actions}
        </Box>
      )}
    </Drawer>
  );
}
