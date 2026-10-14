export const calculateReadingTime = (text="") => Math.max(1, Math.ceil(text.trim().split(/\s+/).length/180));
