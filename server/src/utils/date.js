
export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function addDaysISO(baseISO, days) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}





export function getRollingWeekRangeISO(baseISO = new Date().toISOString()) {
  const date = new Date(baseISO);

  const start = new Date(date);
  start.setDate(date.getDate() - 3);

  const end = new Date(date);
  end.setDate(date.getDate() + 3);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}
