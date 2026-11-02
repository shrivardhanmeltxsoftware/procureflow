import { Button } from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import StateCard from "./StateCard";

export const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <StateCard
      tone="error"
      accent
      role="alert"
      ariaLive="assertive"
      icon={<ErrorOutlinedIcon />}
      title="Unable to load data"
      description={message}
    >
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </StateCard>
  );
};