/** Créneaux de prise en charge, de 8h à 19h30. */
export const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  return `${String(h).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
});

/** Date locale au format AAAA-MM-JJ. */
export const toIso = (d: Date) => d.toLocaleDateString("sv-SE");

export function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toIso(d);
}

/** Les `count` prochaines dates (à partir de demain) dont le jour de semaine est autorisé. */
export function nextDates(weekdays: readonly number[], count: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 1; out.length < count && i < 120; i++) {
    d.setDate(d.getDate() + 1);
    if (weekdays.includes(d.getDay())) out.push(toIso(d));
  }
  return out;
}

export const weekdayOf = (iso: string) => new Date(`${iso}T12:00`).getDay();
