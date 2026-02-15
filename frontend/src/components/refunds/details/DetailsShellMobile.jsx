import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function DetailsShellMobile({ isAdmin, userContent, adminContent }) {
  const [adminOpen, setAdminOpen] = useState(false);
  const handleSize = 26;

  return (
    <>
      {/* USER */}
      <Box sx={{ p: 2 }}>
        {userContent}
      </Box>

      {/* ADMIN (Accordion) */}
      {isAdmin && (
        <Accordion
          expanded={adminOpen}
          onChange={() => setAdminOpen((v) => !v)}
          disableGutters
          elevation={0}
          square
          sx={{
            m: 0,
            bgcolor: "#e5e7eb",
            borderTop: "1px solid rgba(0,0,0,0.12)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: handleSize,
              py: 1,
              px: 1,
              "&.Mui-expanded": { minHeight: handleSize },
              "& .MuiAccordionSummary-content": { my: 0, alignItems: "center" },
              "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
            }}
          >
            <Typography fontWeight={800}>Manage</Typography>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              p: 2,
              pt: 1,
              borderTop: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            {adminContent}
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
