import { isWeekend, subDays, format } from "date-fns";

export function formatDateToMMddyyyy(date) {
  return format(date, "MMddyyyy");
}

export function generateUrl(dateStr) {
  return `https://www.jcb.jp/rate/usd${dateStr}.html`;
}

export function getScrapUrl() {
  const today = new Date();

  if (isWeekend(today)) {
    const friday = subDays(today, today.getDay() === 0 ? 2 : 1);
    return generateUrl(formatDateToMMddyyyy(friday));
  } else {
    return generateUrl(formatDateToMMddyyyy(today));
  }
}
