import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";


const SENTIMENTS = ["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"] as const;

const TAGS = [
  "HYGIENE",
  "CLEANLINESS",
  "FOOD_QUALITY",
  "FOOD_TASTE",
  "FOOD_QUANTITY",
  "SERVICE",
  "TIMING",
  "INFRASTRUCTURE",
] as const;



export function FeedbackFilters({
  feedbacks = [],
  search,
  onSearch,
  category,
  onCategory,
  sentiment,
  onSentiment,
  sort,
  onSort,
}: {
  feedbacks: any[];
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  sentiment: string;
  onSentiment: (v: string) => void;
  sort: "newest" | "oldest";
  onSort: (v: "newest" | "oldest") => void;
}) {
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];

  const sentimentCount = (s: string) =>
    s === "ALL"
      ? safeFeedbacks.length
      : safeFeedbacks.filter((f) => f?.sentiment === s).length;

  const tagCount = (tag: string) =>
    tag === "ALL"
      ? safeFeedbacks.length
      : safeFeedbacks.filter(
          (f) => Array.isArray(f?.tags) && f.tags.includes(tag)
        ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        flex flex-col sm:flex-row items-stretch sm:items-center gap-2
        rounded-2xl border
        bg-gradient-to-r from-[#6770d2]/10 via-background to-[#6770d2]/5
        p-3
      "
    >
      {/* 🔍 SEARCH */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6770d2]" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search feedback…"
          className="
            pl-9 h-10 rounded-xl
            bg-background/70
            focus-visible:ring-2 focus-visible:ring-[#6770d2]/40
          "
        />
      </div>

      {/* 😊 SENTIMENT */}
      <Select value={sentiment} onValueChange={onSentiment}>
        <SelectTrigger className="h-10 rounded-xl min-w-[150px]">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          {SENTIMENTS.map((s) => (
            <SelectItem key={s} value={s}>
              <div className="flex justify-between w-full items-center gap-4">
                <span
                  className={cn(
                    "text-sm font-medium",
                    s === "POSITIVE" && "text-emerald-600",
                    s === "NEGATIVE" && "text-rose-600",
                    s === "NEUTRAL" && "text-zinc-500"
                  )}
                >
                  {s === "ALL" ? "All sentiments" : s}
                </span>
                <Badge variant="secondary">{sentimentCount(s)}</Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 🏷 CATEGORY */}
      <Select value={category} onValueChange={onCategory}>
        <SelectTrigger className="h-10 rounded-xl min-w-[170px]">
          <Filter className="mr-2 h-4 w-4 text-[#6770d2]" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">
            <div className="flex justify-between w-full">
              <span>All categories</span>
              <Badge variant="secondary">{safeFeedbacks.length}</Badge>
            </div>
          </SelectItem>

          {TAGS.map((t) => (
            <SelectItem key={t} value={t}>
              <div className="flex justify-between w-full">
                <span>{t.replace("_", " ")}</span>
                <Badge variant="secondary">{tagCount(t)}</Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ↕ SORT */}
      <Select value={sort} onValueChange={onSort}>
        <SelectTrigger className="h-10 rounded-xl min-w-[140px]">
          <ArrowUpDown className="mr-2 h-4 w-4 text-[#6770d2]" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
}
