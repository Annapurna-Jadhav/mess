import type { StudentMealDay } from "@/types/mess.types";

export default function DateStrip({
  days,
  selected,
  onSelect,
}: {
  days: StudentMealDay[];
  selected: StudentMealDay | null;
  onSelect: (day: StudentMealDay) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
      {days.map((day) => {
        const active = selected?.date === day.date;
        const dateObj = new Date(day.date);

        return (
          <button
            key={day.date}
            onClick={() => onSelect(day)}
            className={`
              min-w-[110px] rounded-2xl px-4 py-3 text-center
              transition-all duration-300
              ${
                active
                  ? "bg-[#6770d2] text-white shadow-xl scale-[1.05]"
                  : "bg-card hover:shadow-lg hover:-translate-y-1"
              }
            `}
          >
            <div className="text-xs opacity-80">
              {dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </div>
            <div className="text-lg font-bold">
              {dateObj.getDate()}
            </div>
            <div className="text-xs opacity-70">
              {dateObj.toLocaleDateString("en-US", {
                month: "short",
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
