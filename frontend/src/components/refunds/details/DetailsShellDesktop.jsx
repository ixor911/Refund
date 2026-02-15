import { useMemo, useState } from "react";
import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function DetailsShellDesktop({ isAdmin, userContent, adminContent }) {
  const [adminOpen, setAdminOpen] = useState(false);

  const handleSize = 26;
  const adminWidth = useMemo(() => "45%", []);

  const rightWidth = isAdmin
    ? adminOpen
      ? adminWidth
      : `${handleSize}px`
    : "0px";

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 370, gap: 0 }}>
      {/* LEFT */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 2,
          ...(isAdmin
            ? {
                flexBasis: `calc(100% - ${rightWidth})`,
                maxWidth: `calc(100% - ${rightWidth})`,
                transition: "flex-basis 250ms ease, max-width 250ms ease",
              }
            : { flexBasis: "100%", maxWidth: "100%" }),
        }}
      >
        {userContent}
      </Box>

      {/* RIGHT */}
      {isAdmin && (
        <Box
          sx={{
            width: rightWidth,
            transition: "width 250ms ease",
            minWidth: 0,
            bgcolor: "#e5e7eb",
            position: "relative",
            borderLeft: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          {/* Handle */}
          <Tooltip title={adminOpen ? "Скрыть админ-панель" : "Показать админ-панель"} placement="left">
            <IconButton
              onClick={() => setAdminOpen((v) => !v)}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: handleSize,
                height: "100%",
                borderRadius: 0,
                borderRight: "1px solid rgba(0,0,0,0.12)",
                bgcolor: "rgba(0,0,0,0.03)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {adminOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>

          {/* Content */}
          {adminOpen && <Box sx={{ p: 2, pl: `${handleSize + 12}px` }}>{adminContent}</Box>}
        </Box>
      )}
    </Box>
  );
}
