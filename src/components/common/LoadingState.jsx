import { CircularProgress } from "@mui/material";
import StateCard from "./StateCard";

export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <StateCard
      tone="primary"
      bare
      role="status"
      ariaLive="polite"
      icon={
        <CircularProgress
          size={40}
          thickness={4}
          color="primary"
          aria-label={message}
        />
      }
      title="Please wait"
      description={message}
    />
  );
};