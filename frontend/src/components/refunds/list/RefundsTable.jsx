import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Skeleton, Typography, Box
  } from "@mui/material";
  
  function StatusChip({ status }) {
    const s = (status || "").toLowerCase();
    const label = s || "unknown";
  
    if (s === "approved") return <Chip label={label} size="small" color="success" />;
    if (s === "rejected") return <Chip label={label} size="small" color="error" />;
    if (s === "pending") return <Chip label={label} size="small" color="warning" />;
    return <Chip label={label} size="small" />;
  }
  
  function LoadingRows() {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton width={40} /></TableCell>
        <TableCell><Skeleton width={70} /></TableCell>
        <TableCell><Skeleton width={150} /></TableCell>
        <TableCell><Skeleton width={150} /></TableCell>
        <TableCell align="right"><Skeleton width={50} /></TableCell>
      </TableRow>
    ));
  }
  
  export default function RefundsTable({ rows, loading, onDetails }) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>Country</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Created</b></TableCell>
              <TableCell><b>Updated</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
  
          <TableBody>
            {loading ? (
              <LoadingRows />
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Пока нет запросов.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.country}</TableCell>
                  <TableCell><StatusChip status={r.status} /></TableCell>
                  <TableCell>{r.created_at || "-"}</TableCell>
                  <TableCell>{r.updated_at || "-"}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => onDetails(r.id)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  