import { formatDateLong, formatTime } from "./formatDate";

export const formatDate = (date = new Date()) => formatDateLong(date);

export const formatDateTime = (date = new Date()) => {
  const d = new Date(date);
  return `${formatDateLong(d)}, ${formatTime(d)}`;
};