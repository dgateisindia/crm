import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/todayFollowups.css";

export default function TodayFollowups({ role }) {
  const navigate = useNavigate();
  const wrapper = useRef(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ count: 0, items: [] });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await api.get("/tasks/notifications/today");
      setData(response.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.key === "Escape" ||
          (event.type === "pointerdown" && !wrapper.current?.contains(event.target))) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const items = data?.items || [];
  return (
    <div className="crm-today-strip">
      <div className="crm-today-widget" ref={wrapper}>
        <button className="crm-today-button" type="button"
          aria-expanded={open} aria-label="Today's follow-up notifications"
          onClick={() => { setOpen(value => !value); load(); }}>
          <Bell size={17} />
          <span>{loading ? "Loading follow-ups..." : error ? "Follow-ups unavailable" :
            data.count ? `Today's follow-ups: ${data.count}` : "No follow-ups today"}</span>
          {data.count > 0 && <span className="crm-today-count">{data.count}</span>}
          <ChevronDown size={15} />
        </button>
        {open && <section className="crm-today-panel" aria-label="Today's follow-up list">
          <div className="crm-today-heading">
            <strong>Today's Follow-ups</strong>
            <button type="button" onClick={load} aria-label="Refresh notifications"><RefreshCw size={16}/></button>
          </div>
          {error ? <p className="crm-today-empty">Unable to load. Try refreshing.</p> :
            items.length === 0 ? <p className="crm-today-empty">No follow-ups scheduled for today.</p> :
            <div className="crm-today-list">{items.map(item => (
              <button type="button" className="crm-today-item"
                key={`${item.source}-${item.source_id}-${item.employee_id}`}
                onClick={() => { setOpen(false); navigate(`/${role}/lead/${item.lead_id}`); }}>
                <span className="crm-today-line"><strong>{item.company_name || "Unnamed lead"}</strong>
                  <time>{item.due_time || "Time not set"}</time></span>
                <small>{item.contact_person_name || item.phone || "Lead follow-up"}</small>
                {item.remarks && <small className="crm-today-remarks">{item.remarks}</small>}
              </button>
            ))}</div>}
        </section>}
      </div>
    </div>
  );
}
