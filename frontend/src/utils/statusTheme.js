
// 1. Centralized lead status values
export const LEAD_STATUSES = {
  NEW: "new",
  INTERESTED: "interested",
  PROPOSED: "proposed",
  OFFERED: "offered",
  MEETING_SCHEDULED: "meeting scheduled",
  CONVERTED: "converted",
  NOT_INTERESTED: "not interested",
  NOT_RESPONDED: "not responded",
  SPONSORSHIP: "sponsorship",
  INVALID: "invalid",
};

// 2. Centralized status colors and labels
export const STATUS_THEME = {
  [LEAD_STATUSES.NEW]: {
    label: "New",
    color: "#2563EB",
    bg: "#DBEAFE",
  },

  [LEAD_STATUSES.INTERESTED]: {
    label: "Interested",
    color: "#D97706",
    bg: "#FEF3C7",
  },

  [LEAD_STATUSES.PROPOSED]: {
    label: "Proposed",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },

  [LEAD_STATUSES.OFFERED]: {
    label: "Offered",
    color: "#4F46E5",
    bg: "#EEF2FF",
  },

  [LEAD_STATUSES.MEETING_SCHEDULED]: {
    label: "Meeting Scheduled",
    color: "#DB2777",
    bg: "#FCE7F3",
  },

  [LEAD_STATUSES.CONVERTED]: {
    label: "Converted",
    color: "#16A34A",
    bg: "#DCFCE7",
  },

  [LEAD_STATUSES.NOT_INTERESTED]: {
    label: "Not Interested",
    color: "#DC2626",
    bg: "#FEE2E2",
  },

  [LEAD_STATUSES.NOT_RESPONDED]: {
    label: "Not Responded",
    color: "#64748B",
    bg: "#F1F5F9",
  },

  [LEAD_STATUSES.SPONSORSHIP]: {
    label: "Sponsorship",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },

  [LEAD_STATUSES.INVALID]: {
    label: "Invalid",
    color: "#DC2626",
    bg: "#FEE2E2",
  },
};

// 3. Normalize spelling variations into canonical statuses
export const normalizeLeadStatus = (status) => {
  if (!status) return LEAD_STATUSES.NEW;

  const value = String(status)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const aliases = {
    proposal: LEAD_STATUSES.PROPOSED,
    "not interested": LEAD_STATUSES.NOT_INTERESTED,
    "not responded": LEAD_STATUSES.NOT_RESPONDED,
  };

  return aliases[value] || value;
};

// 4. Return the correct theme for any status
export const getStatusTheme = (status) => {
  const normalizedStatus = normalizeLeadStatus(status);

  return (
    STATUS_THEME[normalizedStatus] || {
      label: normalizedStatus.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ),
      color: "#4B5563",
      bg: "#F3F4F6",
    }
  );
};