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
