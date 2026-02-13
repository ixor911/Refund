import { Container, Box } from "@mui/material";
import NavPanel from "./NavPanel";

export default function AppLayout({ children }) {
  return (
    <>
      <NavPanel />
      <Box sx={{ py: 0 }}>
        <Container maxWidth={false}>{children}</Container>
      </Box>
    </>
  );
}
