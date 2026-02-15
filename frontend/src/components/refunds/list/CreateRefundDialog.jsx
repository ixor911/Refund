import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateRefundForm from "./CreateRefundForm";

export default function CreateRefundDialog({ open, onClose, onCreated }) {
  const handleClose = () => onClose?.();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        Создать запрос на возврат
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <CreateRefundForm
          onCancel={handleClose}
          onCreated={(created) => {
            onCreated?.(created);
            handleClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
