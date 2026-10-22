import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import SubscriptionBanner from "../components/SubscriptionBanner";
import { useSubscription } from "../context/SubscriptionContext";

export default function ManagerLayout({
  children
}) {

  const subscription = useSubscription();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (

    <div className="crm-app-shell flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="crm-mobile-nav">
      <button
        type="button"
        className="crm-menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="crm-mobile-sidebar"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "Close" : "? Menu"}
      </button>
    </div>

    {menuOpen && (
      <button
        type="button"
        className="crm-nav-backdrop"
        aria-label="Close navigation"
        onClick={() => setMenuOpen(false)}
      />
    )}

    <div
      id="crm-mobile-sidebar"
      className={`crm-sidebar-holder ${menuOpen ? "is-open" : ""}`}
      onClickCapture={(event) => {
        if (event.target.closest("a[href]")) {
          setMenuOpen(false);
        }
      }}
    >
      <Sidebar />
    </div>

      {/* Main Content */}
      <div
        className="
          crm-main
          flex-1
          h-screen
          overflow-y-auto
          overflow-x-hidden
        "
      >

        {/* Topbar */}
        <Topbar />

        {/* Subscription Notification */}
        {false && <SubscriptionBanner accessMode={subscription?.accessMode} />}

        {/* Page Content */}
        <div className="crm-page-content p-6">
          {children}
        </div>

      </div>

    </div>

  );

}

