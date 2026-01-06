import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { MessageSquarePlus } from "lucide-react";

import { getMyFeedbacks, submitFeedback } from "@/api/feedback.api";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { FeedbackFilters } from "@/components/feedback/FeedbackFilters";
import { SubmitFeedbackDialog } from "@/components/feedback/SubmitFeedbackDialog";

export default function StudentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [sentiment, setSentiment] = useState("ALL");


  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setFeedbacks(await getMyFeedbacks());
    } catch {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

 const filtered = useMemo(() => {
  let list = [...feedbacks];


  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (f) =>
        f.message.toLowerCase().includes(q) ||
        f.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (category !== "ALL") {
    list = list.filter((f) => f.tags.includes(category));
  }

  if (sentiment !== "ALL") {
    list = list.filter((f) => f.sentiment === sentiment);
  }

  list.sort((a, b) =>
    sort === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return list;
}, [feedbacks, search, category, sentiment, sort]);

  const submit = async () => {
    if (!message.trim()) {
      toast.error("Please write feedback");
      return;
    }

    try {
      setSubmitting(true);
      await submitFeedback({ message });
      toast.success("Feedback submitted");
      setMessage("");
      setOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  {/* LEFT */}
  <div className="space-y-0.5">
    <h2 className="text-xl font-semibold tracking-tight">
      Your Feedback
    </h2>

    <p className="text-sm text-muted-foreground">
      Anonymous insights to improve food quality, hygiene, and services.
    </p>
  </div>
  


  {/* RIGHT */}
  <Button
    onClick={() => setOpen(true)}
    className="
      rounded-xl
      bg-[#6770d2]
      hover:bg-[#5a62c9]
      shadow-sm
      self-start sm:self-auto
    "
  >
    <MessageSquarePlus className="mr-2 h-4 w-4" />
    Add feedback
  </Button>
</div>


  <FeedbackFilters
  feedbacks={feedbacks}
  search={search}
  onSearch={setSearch}
  category={category}
  onCategory={setCategory}
  sentiment={sentiment}
  onSentiment={setSentiment}
  sort={sort}
  onSort={setSort}
/>



      {loading ? (
        <div className="text-center text-muted-foreground">Loading…</div>
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map((fb) => (
            <FeedbackCard key={fb.id} fb={fb} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No feedbacks found
        </div>
      )}

     <SubmitFeedbackDialog
  open={open}
  onOpen={setOpen}
  message={message}
  setMessage={setMessage}
  submitting={submitting}
  onSubmit={submit}
  feedbackCount={feedbacks.length}
/>

    </div>
  );
}
