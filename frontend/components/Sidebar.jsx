import { useSubscription } from "../context/SubscriptionContext";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";

import {
  UserPlus,
  LayoutDashboard,
  ContactRound,
  UserCheck,
  PhoneCall,
  FileText,
  UserRound,
  AlertCircle,
  Clock,
  BadgeCheck,
  LogOut,
  GripVertical,
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

import "../styles/sidebar.css";

// ==========================
// Manager Main Menu
// ==========================

const MAIN_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: LayoutDashboard,
    size: 15,
  },
  {
    id: "add-lead",
    label: "Add Lead",
    path: "/manager/add-leads",
    icon: ContactRound,
    size: 12,
  },
  {
    id: "leads",
    label: "Leads",
    path: "/manager/leads",
    icon: ContactRound,
    size: 12,
  },
  {
    id: "employees",
    label: "Employees",
    path: "/manager/employees",
    icon: UserCheck,
    size: 12,
  },
  {
    id: "create-employee",
    label: "Create Employee",
    path: "/manager/create-employee",
    icon: UserPlus,
    size: 12,
  },
  {
    id: "lead-history",
    label: "Lead History",
    path: "/manager/followups",
    icon: PhoneCall,
    size: 12,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/manager/reports",
    icon: FileText,
    size: 12,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/manager/profile",
    icon: UserRound,
    size: 20,
  },
];

// ==========================
// Manager Important Menu
// ==========================

const IMPORTANT_MENU = [
  {
    id: "important-leads",
    label: "Important Leads",
    path: "/manager/important-leads",
    icon: AlertCircle,
  },
  {
    id: "converted-leads",
    label: "Converted Leads",
    path: "/manager/converted-leads",
    icon: BadgeCheck,
  },
  {
    id: "not-interested",
    label: "Not Interested",
    path: "/manager/not-interested",
    icon: Clock,
  },
];

// ==========================
// Storage Helpers
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
  };

  const handleStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    flexShrink: 0,
    padding: "4px",
    color: "inherit",
    opacity: 0.6,
    background: "transparent",
    border: 0,
  };

  return (
    <div
        ref={setNodeRef}
        style={{
          ...style,
          cursor: "grab",
          touchAction: "none",
        }}
        {...attributes}
        {...listeners}
      >
      {important ? (
        <div
          className={`sidebar-important-card ${
            active ? "active-menu" : ""
          }`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          <Link
            to={item.path}
            style={{
              flex: 1,
              minWidth: 0,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center gap-2">
              <Icon size={20} />
              {item.label}
            </div>
          </Link>

          
        </div>
      ) : (
        <div
          className={`sidebar-menu ${
            active ? "active-menu" : ""
          }`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Link
            to={item.path}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Icon
              size={item.size}
              strokeWidth={
                item.id === "profile" ? 2.2 : undefined
              }
            />

            <span>{item.label}</span>
          </Link>

          
        </div>
      )}
    </div>
  );
}

// ==========================
// Manager Sidebar
// ==========================

export default function Sidebar() {
  const location = useLocation();
  const { isReadOnly = false } = useSubscription() || {};
  const { signOut } = useClerk();
  const { user } = useUser();

  const userId = user?.id;

  const mainStorageKey =
    `dgate-manager-sidebar-main-${userId}`;

  const importantStorageKey =
    `dgate-manager-sidebar-important-${userId}`;

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
  // Save Main Menu Order
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
        "Unable to save manager sidebar order:",
        error
      );
    }
  };

  // ==========================
  // Save Important Menu Order
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
  // Reset Sidebar Order
  // ==========================

  const handleResetOrder = () => {
    if (!userId) {
      return;
    }

    const defaultMain =
      getDefaultOrder(MAIN_MENU);

    const defaultImportant =
      getDefaultOrder(IMPORTANT_MENU);

    setMainPreferences({
      userId,
      order: defaultMain,
    });

    setImportantPreferences({
      userId,
      order: defaultImportant,
    });

    try {
      localStorage.removeItem(mainStorageKey);
      localStorage.removeItem(
        importantStorageKey
      );
    } catch (error) {
      console.warn(
        "Unable to reset saved sidebar order:",
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
      await signOut({
        redirectUrl: "/",
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      alert(
        "Failed to logout. Please try again."
      );
    }
  };

  return (
    <div className="sidebar">
      <div>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-brand">
            <span className="logo-d">
              D
            </span>
            GATE
          </span>
        </div>

        {/* Main Menu */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleMainDragEnd}
        >
          <SortableContext
            items={mainOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.1">
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

      {/* Reset Menu Order */}
      <div style={{ marginTop: "12px" }}>
        <button
          type="button"
          onClick={handleResetOrder}
          title="Restore original menu order"
          disabled={!userId}
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
