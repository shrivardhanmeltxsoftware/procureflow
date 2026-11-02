import { Button } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import StateCard from "./StateCard.jsx";

export default function EmptyState({
  title = "No records found",
  description = "There is no data to display yet.",
  actionLabel,
  onAction,
}) {
  return (
    <StateCard
      tone="primary"
      dashed
      icon={<InboxOutlinedIcon />}
      title={title}
      description={description}
    >
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </StateCard>
  );
}