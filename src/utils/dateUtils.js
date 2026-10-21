const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";

  let date;
  if (value instanceof Date) {
    date = value;
  } else {
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(String(value));
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      date = new Date(Number(year), Number(month) - 1, Number(day));

      if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
      ) {
        return "N/A";
      }
    } else {
      date = new Date(value);
    }
  }

  if (Number.isNaN(date.getTime())) return "N/A";
  const parts = DATE_FORMATTER.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  return `${day} ${month} ${year}`;
};
