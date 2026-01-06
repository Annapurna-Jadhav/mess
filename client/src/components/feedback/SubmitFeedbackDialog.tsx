import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareText } from "lucide-react";

const MAX_CHARS = 400;

export function SubmitFeedbackDialog({
  open,
  onOpen,
  message,
  setMessage,
  submitting,
  onSubmit,
  feedbackCount = 0, // 👈 pass total feedback count from parent
}: any) {
  const remaining = MAX_CHARS - message.length;

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent className="rounded-2xl">
        {/* HEADER */}
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-[#6770d2]" />
            Share your feedback
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            This will be your{" "}
            <span className="font-medium text-foreground">
              {feedbackCount + 1}
              {feedbackCount === 0 ? "st" : feedbackCount === 1 ? "nd" : "th"}
            </span>{" "}
            feedback. It helps improve food quality, hygiene, and services.
          </p>
        </DialogHeader>

        {/* TEXTAREA */}
        <div className="space-y-2">
          <Textarea
            rows={4}
            maxLength={MAX_CHARS}
            placeholder="Write honestly about food, hygiene, staff behavior, timing…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="
              resize-none
              rounded-xl
              focus-visible:ring-2 focus-visible:ring-[#6770d2]/40
            "
          />

          <div className="flex items-center justify-between text-xs">
            
            <span
              className={
                remaining < 50
                  ? "text-rose-500"
                  : "text-muted-foreground"
              }
            >
              {remaining} chars left
            </span>
          </div>
        </div>

        {/* ACTION */}
        <Button
          onClick={onSubmit}
          disabled={submitting || !message.trim()}
          className="
            mt-2
            rounded-xl
            bg-[#6770d2]
            hover:bg-[#5a62c9]
          "
        >
          {submitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit feedback
        </Button>
      </DialogContent>
    </Dialog>
  );
}
