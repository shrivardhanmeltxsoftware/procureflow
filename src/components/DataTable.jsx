import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const stickyHeadStyle = { position: "sticky", right: 0, zIndex: 3 };
const stickyBodyStyle = {
  position: "sticky",
  right: 0,
  zIndex: 1,
  backgroundColor: "background.paper",
};

export const DataTable = ({
  columns,
  rows,
  getRowId = (row) => row.id ?? row._id,
  minWidth = 900,
  headerBg = "#d1c4e9",
  sx = {},
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        flex: 1,
        overflow: "auto",
        maxWidth: "100%",
        boxShadow: 1,
        borderRadius: 1,
        ...sx,
      }}
    >
      <Table stickyHeader sx={{ minWidth }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || "left"}
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  backgroundColor: headerBg,
                  ...(col.sticky && stickyHeadStyle),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)} hover>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  sx={{
                    whiteSpace: "nowrap",
                    ...(col.sticky && stickyBodyStyle),
                  }}
                >
                  {col.render ? col.render(row) : (row[col.key] ?? "N/A")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
