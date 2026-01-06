import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import { getMessFeedbacks } from "@/api/feedback.api";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { FeedbackFilters } from "@/components/feedback/FeedbackFilters";

export default function MessFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sentiment, setSentiment] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    load();
  }, []);


//     try {
//       setLoading(true);
//       const data = await getMessFeedbacks();
//       setFeedbacks(Array.isArray(data) ? data : []);
//     } catch {
//       toast.error("Failed to load mess feedbacks");
//     } finally {
//       setLoading(false);
//     }
//   };

 const load = async () => {
  

  try {
    setLoading(true);
    
    const data = await getMessFeedbacks();

   

    if (!Array.isArray(data)) {
      console.warn("⚠️ Data is not an array, setting empty array");
    }

    setFeedbacks(Array.isArray(data) ? data : []);
   
  } catch (err) {
    
    toast.error("Failed to load mess feedbacks");
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

    list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [feedbacks, search, category, sentiment, sort]);


 
  return (
    <div className="max-w-5xl mx-auto space-y-6">
  
     <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Mess Feedback Overview
        </h2>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Anonymous student feedback to monitor food quality, hygiene, service,
          and overall mess experience.
        </p>

       
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
        <div className="py-10 text-center text-muted-foreground">
          Loading feedbacks…
        </div>
      ) : filtered.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {filtered.map((fb) => (
            <FeedbackCard key={fb.id} fb={fb} />
          ))}
        </motion.div>
      ) : (
        <div className="py-10 text-center text-muted-foreground">
          No feedbacks found for selected filters
        </div>
      )}
    </div>
  );
}



