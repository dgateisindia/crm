import { useSubscription } from "../context/SubscriptionContext";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";

import {
  LayoutGrid,
  BriefcaseBusiness,
  CirclePlus,
  PhoneForwarded,
  UserRound,
  LogOut,
  ShieldAlert,
  BadgeCheck,
  ClipboardCheck,
  CalendarClock,
  FileSpreadsheet,
  CircleOff,
  RotateCcw,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import "../styles/employeesidebar.css";

// ==========================
// Employee Main Menu
// ==========================

const MAIN_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/employee/dashboard",
    icon: LayoutGrid,
  },
  {
    id: "add-lead",
    label: "Add Lead",
    path: "/employee/add-leads",
    icon: CirclePlus,
  },
  {
    id: "total-leads",
    label: "Total Leads",
    path: "/employee/my-leads",
    icon: BriefcaseBusiness,
  },
  {
    id: "new-leads",
    label: "New Leads",
    path: "/employee/tasks",
    icon: ClipboardCheck,
  },
  {
    id: "followups",
    label: "Followups",
    path: "/employee/task-followups",
    icon: CalendarClock,
  },
  {
    id: "lead-history",
    label: "Lead History",
    path: "/employee/followups",
    icon: PhoneForwarded,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/employee/profile",
    icon: UserRound,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/employee/reports",
    icon: FileSpreadsheet,
  },
];

// ==========================
// Employee Important Menu
// ==========================

const IMPORTANT_MENU = [
  {
    id: "important-leads",
    label: "Important Leads",
    path: "/employee/important-leads",
    icon: ShieldAlert,
  },
  {
    id: "converted-leads",
    label: "Converted Leads",
    path: "/employee/converted-leads",
    icon: BadgeCheck,
  },
  {
    id: "not-interested",
    label: "Not Interested",
    path: "/employee/not-interested",
    icon: CircleOff,
  },
];

// ==========================
// Sidebar Order Helpers
// ==========================

const getDefaultOrder = (items) =>
  items.map((item) => item.id);

const getSavedOrder = (key, items) => {
  const defaultOrder = getDefaultOrder(items);

  try {
    const saved = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    if (!Array.isArray(saved)) {
      return defaultOrder;
    }

    const validIds = saved.filter((id) =>
      defaultOrder.includes(id)
    );

    return [
      ...new Set(validIds),
      ...defaultOrder.filter(
        (id) => !validIds.includes(id)
      ),
    ];
  } catch {
    return defaultOrder;
  }
};

// ==========================
// Sortable Menu Item
// ==========================

function SortableMenuItem({
  item,
  active,
  important = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const Icon = item.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: "relative",
    zIndex: isDragging ? 2 : "auto",
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {important ? (
        <div
          className={`sidebar-important-card ${
            active ? "active-menu" : ""
          }`}
        >
          <Link
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        </div>
      ) : (
        <div
          className={`sidebar-menu ${
            active ? "active-menu" : ""
          }`}
        >
          <Link
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

// ==========================
// Employee Sidebar
// ==========================

export default function EmployeeSidebar() {
  const location = useLocation();
  const { isReadOnly = false } = useSubscription() || {};
  const { signOut } = useClerk();
  const { user } = useUser();

  const userId = user?.id;

  const mainStorageKey =
    `dgate-employee-sidebar-main-${userId}`;

  const importantStorageKey =
    `dgate-employee-sidebar-important-${userId}`;

  const [mainPreferences, setMainPreferences] =
    useState({
      userId: null,
      order: getDefaultOrder(MAIN_MENU),
    });

  const [importantPreferences, setImportantPreferences] =
    useState({
      userId: null,
      order: getDefaultOrder(IMPORTANT_MENU),
    });

  const mainOrder =
    mainPreferences.userId === userId
      ? mainPreferences.order
      : userId
        ? getSavedOrder(mainStorageKey, MAIN_MENU)
        : getDefaultOrder(MAIN_MENU);

  const importantOrder =
    importantPreferences.userId === userId
      ? importantPreferences.order
      : userId
        ? getSavedOrder(
            importantStorageKey,
            IMPORTANT_MENU
          )
        : getDefaultOrder(IMPORTANT_MENU);

  const mainItems = mainOrder
    .map((id) =>
      MAIN_MENU.find((item) => item.id === id)
    )
    .filter(Boolean)
    .filter((item) =>
      !isReadOnly || !["add-lead", "create-employee"].includes(item.id)
    );

  const importantItems = importantOrder
    .map((id) =>
      IMPORTANT_MENU.find((item) => item.id === id)
    )
    .filter(Boolean);

  // ==========================
  // Drag Sensors
  // ==========================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    })
  );

  // ==========================
  // Reorder Main Menu
  // ==========================

  const handleMainDragEnd = ({ active, over }) => {
    if (!userId || !over || active.id === over.id) {
      return;
    }

    const oldIndex = mainOrder.indexOf(active.id);
    const newIndex = mainOrder.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(
      mainOrder,
      oldIndex,
      newIndex
    );

    setMainPreferences({
      userId,
      order: newOrder,
    });

    try {
      localStorage.setItem(
        mainStorageKey,
        JSON.stringify(newOrder)
      );
    } catch (error) {
      console.warn(
        "Unable to save employee sidebar order:",
        error
      );
    }
  };

  // ==========================
  // Reorder Important Menu
  // ==========================

  const handleImportantDragEnd = ({
    active,
    over,
  }) => {
    if (!userId || !over || active.id === over.id) {
      return;
    }

    const oldIndex =
      importantOrder.indexOf(active.id);

    const newIndex =
      importantOrder.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(
      importantOrder,
      oldIndex,
      newIndex
    );

    setImportantPreferences({
      userId,
      order: newOrder,
    });

    try {
      localStorage.setItem(
        importantStorageKey,
        JSON.stringify(newOrder)
      );
    } catch (error) {
      console.warn(
        "Unable to save important menu order:",
        error
      );
    }
  };

  // ==========================
  // Reset Menu Order
  // ==========================

  const handleResetOrder = () => {
    if (!userId) {
      return;
    }

    setMainPreferences({
      userId,
      order: getDefaultOrder(MAIN_MENU),
    });

    setImportantPreferences({
      userId,
      order: getDefaultOrder(IMPORTANT_MENU),
    });

    try {
      localStorage.removeItem(mainStorageKey);
      localStorage.removeItem(
        importantStorageKey
      );
    } catch (error) {
      console.warn(
        "Unable to reset employee sidebar order:",
        error
      );
    }
  };

  // ==========================
  // Clerk Logout
  // ==========================

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    try {
      sessionStorage.removeItem(
        "employeeWelcomeShown"
      );

      await signOut({
        redirectUrl: "/",
      });
    } catch (error) {
      console.error(
        "EMPLOYEE LOGOUT ERROR:",
        error
      );

      alert(
        "Failed to logout. Please try again."
      );
    }
  };

  return (
    <div className="sidebar">
      {/* Logo and Main Menu */}
      <div>
        <div className="sidebar-logo">
          <span className="logo-brand">
            <span className="logo-d">D</span>
            GATE
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleMainDragEnd}
        >
          <SortableContext
            items={mainOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {mainItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  active={
                    location.pathname === item.path
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Important Section */}
      <div className="mt-4">
        <h2 className="text-gray-400 uppercase text-sm mb-4">
          Important
        </h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleImportantDragEnd}
        >
          <SortableContext
            items={importantOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {importantItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  active={
                    location.pathname === item.path
                  }
                  important
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Reset Order */}
      <div style={{ marginTop: "12px" }}>
        <button
          type="button"
          onClick={handleResetOrder}
          disabled={!userId}
          title="Restore original menu order"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            color: "#94A3B8",
            border: "none",
            cursor: userId
              ? "pointer"
              : "not-allowed",
            fontSize: "12px",
            padding: "8px",
          }}
        >
          <RotateCcw size={14} />
          Reset Menu Order
        </button>
      </div>

      {/* Logout */}
      <div>
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
