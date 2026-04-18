const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
});

const detailDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatThreadDate(timestamp: number) {
  return shortDateFormatter.format(timestamp);
}

export function formatMessageDate(timestamp: number) {
  return detailDateFormatter.format(timestamp);
}
