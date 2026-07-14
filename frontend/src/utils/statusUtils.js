export const normalizeStatus = (status = "") => {

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

};

export const formatStatus = (status = "") => {

  return normalizeStatus(status)

    .split("_")

    .map(word =>
      word.charAt(0).toUpperCase() +
      word.slice(1)
    )

    .join(" ");

};