import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Divider,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function SearchFilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  status,
  onStatusChange,
  statusOptions = [],
  allValue = "all", // the option that means "no filter"
  width = { xs: "100%", sm: 380 },
}) {
  const showFilter =
    statusOptions.length > 0 && typeof onStatusChange === "function";
  const isFiltered = showFilter && status !== undefined && status !== allValue;

  return (
    <TextField
      placeholder={searchPlaceholder}
      size="small"
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && searchValue) onSearchChange("");
      }}
      sx={{
        width,
        maxWidth: "100%",
        "& .MuiOutlinedInput-root": {
          borderRadius: 1,
          bgcolor: "background.paper",
          pl: 0.5,
          transition: "box-shadow 0.2s ease",
          "&.Mui-focused": {
            boxShadow: (theme) =>
              `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        },
      }}
      slotProps={{
        htmlInput: { "aria-label": searchPlaceholder },
        input: {
          startAdornment: showFilter ? (
            <InputAdornment position="start" sx={{ ml: 0.5, mr: 0.5 }}>
              <FilterListIcon
                fontSize="small"
                color={isFiltered ? "primary" : "action"}
                sx={{ mr: 0.5 }}
              />
              <Select
                value={status ?? allValue}
                onChange={(e) => onStatusChange(e.target.value)}
                variant="standard"
                disableUnderline
                SelectDisplayProps={{ "aria-label": "Filter by status" }}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: isFiltered ? 600 : 500,
                  color: isFiltered ? "primary.main" : "text.secondary",
                  "& .MuiSelect-select": {
                    py: 0.5,
                    pl: 0.5,
                    pr: "22px !important",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ ml: 1, my: 0.5 }}
              />
            </InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position="end">
              {searchValue && (
                <IconButton
                  size="small"
                  aria-label="Clear search"
                  onClick={() => onSearchChange("")}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <SearchIcon
                fontSize="small"
                sx={{ color: "text.secondary", ml: 0.5, mr: 0.5 }}
              />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
