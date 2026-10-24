import { Alert, Button, Stack } from "@mui/material";
export const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Alert severity="error">{message}</Alert>
      {onRetry && (
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{ alignSelf: "flex-start" }}
        >
          Retry
        </Button>
      )}
    </Stack>
  );
};
