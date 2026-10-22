import { AlertTriangle } from "lucide-react";

export default function SubscriptionBanner({
  accessMode
}) {
  if (accessMode !== "read_only") {
    return null;
  }

  return (
    <div
      role="alert"
      className="
        mx-6 mt-5
        rounded-xl
        border border-amber-300
        bg-amber-50
        px-5 py-4
        flex items-start gap-3
      "
    >
      <AlertTriangle
        size={22}
        className="text-amber-600 shrink-0"
      />

      <div>
        <h3 className="font-semibold text-amber-900">
          Your subscription has expired
        </h3>

        <p className="mt-1 text-sm text-amber-800">
          Your CRM is currently in read-only mode.
          You can view existing records and export
          leads to Excel. Renew your subscription
          to restore editing and other features.
        </p>
      </div>
    </div>
  );
}