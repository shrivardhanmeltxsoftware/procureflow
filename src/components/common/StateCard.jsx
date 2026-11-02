import { Box, Fade, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Shared look for the Loading, Empty and Error states.
// tone   - palette key: "primary" or "error"
// dashed - dashed border + faint tint (empty state)
// accent - colored bar on top of the card (error state)
// bare   - no card at all, just centered content (loading state)
export default function StateCard({
  tone = "primary",
  icon,
  title,
  description,
  children,
  role,
  ariaLive,
  dashed = false,
  accent = false,
  bare = false,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: bare ? { xs: 240, sm: 320 } : { xs: 300, sm: 400 },
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      <Fade in appear timeout={300}>
        <Paper
          elevation={0}
          role={role}
          aria-live={ariaLive}
          sx={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: 460,
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 5 },
            borderRadius: 3,
            textAlign: "center",
            boxShadow: "none",
            ...(bare
              ? { bgcolor: "transparent", border: 0 }
              : {
                  border: 1,
                  borderStyle: dashed ? "dashed" : "solid",
                  borderColor: (theme) =>
                    dashed
                      ? alpha(theme.palette[tone].main, 0.35)
                      : theme.palette.divider,
                  bgcolor: (theme) =>
                    dashed
                      ? alpha(theme.palette[tone].main, 0.03)
                      : theme.palette.background.paper,
                }),
            ...(accent &&
              !bare && {
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: `${tone}.main`,
                },
              }),
          }}
        >
          {bare ? (
            <Box sx={{ mb: 2, display: "grid", placeItems: "center" }}>
              {icon}
            </Box>
          ) : (
            // icon with a soft double halo
            <Box
              sx={{
                width: 88,
                height: 88,
                mx: "auto",
                mb: 2.5,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: (theme) => alpha(theme.palette[tone].main, 0.07),
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: `${tone}.main`,
                  bgcolor: (theme) => alpha(theme.palette[tone].main, 0.13),
                  "& .MuiSvgIcon-root": { fontSize: 32 },
                }}
              >
                {icon}
              </Box>
            </Box>
          )}

          <Typography
            variant={bare ? "subtitle1" : "h6"}
            fontWeight={bare ? 600 : 700}
            color="text.primary"
            gutterBottom
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.7,
              overflowWrap: "anywhere",
              maxWidth: 360,
              mx: "auto",
            }}
          >
            {description}
          </Typography>

          {children && (
            <Box
              sx={{
                mt: 3,
                "& .MuiButton-root": {
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": { boxShadow: 2 },
                },
              }}
            >
              {children}
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}