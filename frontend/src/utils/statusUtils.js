export const normalizeStatus = (status = "") => {
  return status
    .toString()
    .trim()
    .toLowerCase();
};

export const formatStatus = (status = "") => {
  return normalizeStatus(status)
    .split(" ")
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};