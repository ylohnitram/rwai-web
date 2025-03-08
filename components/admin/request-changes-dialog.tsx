import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface RequestChangesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestNotes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => Promise<void>;
  isProcessing: boolean;
}

export function RequestChangesDialog({
  isOpen,
  onOpenChange,
  requestNotes,
  onNotesChange,
  onSubmit,
  isProcessing
}: RequestChangesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Provide feedback to the project owner about what needs to be changed.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Enter your feedback here..."
          className="min-h-[150px] bg-gray-800 border-gray-700"
          value={requestNotes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isProcessing}>
            {isProcessing ? "Sending..." : "Send Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
