
export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function addDaysISO(baseISO, days) {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Returns Monday → Sunday of current week
 */
export function getWeekRangeISO(baseISO) {
  const date = new Date(baseISO);
  const day = date.getDay(); // 0=Sun, 1=Mon

  // move to Monday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  // Sunday = Monday + 6
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}
