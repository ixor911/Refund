import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const USERS = [
  { username: "admin1", password: "admin1" },
  { username: "admin2", password: "admin2" },
  { username: "user1", password: "user1" },
  { username: "user2", password: "user2" },
];

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

export default function SecretPanel() {
  return (
    <Accordion sx={{ mt: 3, borderRadius: 2, overflow: "hidden" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={700}>Секрет</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Логин</b></TableCell>
                <TableCell><b>Пароль</b></TableCell>
                <TableCell align="right"><b>Copy</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {USERS.map((u) => (
                <TableRow key={u.username} hover>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.password}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Скопировать" arrow>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(`${u.username}`)}
                      >
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}
