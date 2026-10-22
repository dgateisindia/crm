const db = require("../db");

function indiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

async function getTodayNotifications(req, res) {
  try {
    const { id: userId, companyId, role } = req.user || {};
    if (!companyId || !["manager", "owner", "employee"].includes(role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    let employeeId = null;
    if (role === "employee") {
      const [profiles] = await db.promise().query(
        "SELECT employee_id FROM employees WHERE user_id = ? AND company_id = ? AND status = 'active' LIMIT 1",
        [userId, companyId]
      );
      if (profiles.length !== 1) {
        return res.status(403).json({ success: false, message: "Employee profile not active" });
      }
      employeeId = profiles[0].employee_id;
    }
    const today = indiaDate();
    const scope = employeeId === null ? "" : `
      AND tf.employee_id = ?
      AND (l.assigned_employee_id = ? OR
        (l.assigned_employee_id IS NULL AND l.created_by_type = 'employee' AND l.created_by_id = ?))`;
    const [taskRows] = await db.promise().query(`
      SELECT tf.followup_id AS source_id, l.id AS lead_id, l.company_name,
        l.contact_person_name, l.phone, tf.remarks,
        DATE_FORMAT(tf.followup_date,'%Y-%m-%d') AS due_date,
        TIME_FORMAT(tf.followup_time,'%H:%i') AS due_time,
        tf.employee_id, 'task' AS source
      FROM task_followups tf
      JOIN leads l ON l.id = tf.lead_id
      WHERE l.company_id = ? AND DATE(tf.followup_date) = ? ${scope}
      ORDER BY tf.followup_time ASC, tf.followup_id DESC
    `, employeeId === null ? [companyId, today] :
      [companyId, today, employeeId, employeeId, employeeId]);

    const historyScope = employeeId === null ? "" : `
      AND f.employee_id = ?
      AND (l.assigned_employee_id = ? OR
        (l.assigned_employee_id IS NULL AND l.created_by_type = 'employee' AND l.created_by_id = ?))`;
    const [historyRows] = await db.promise().query(`
      SELECT f.followup_id AS source_id, l.id AS lead_id, l.company_name,
        l.contact_person_name, l.phone, f.remarks,
        DATE_FORMAT(f.next_followup_date,'%Y-%m-%d') AS due_date,
        TIME_FORMAT(f.next_followup_date,'%H:%i') AS due_time,
        f.employee_id, 'lead' AS source
      FROM follow_ups f
      JOIN leads l ON l.id = f.lead_id
      WHERE l.company_id = ? AND DATE(f.next_followup_date) = ?
        AND f.status = 'pending' ${historyScope}
      ORDER BY f.next_followup_date ASC, f.followup_id DESC
    `, employeeId === null ? [companyId, today] :
      [companyId, today, employeeId, employeeId, employeeId]);

    // A single scheduled callback may be represented in both tables.
    const unique = new Map();
    for (const item of [...taskRows, ...historyRows]) {
      const key = `${item.lead_id}|${item.employee_id}|${item.due_date}|${item.due_time || ''}`;
      if (!unique.has(key)) unique.set(key, item);
    }
    const items = [...unique.values()].sort((a, b) =>
      (a.due_time || "").localeCompare(b.due_time || ""));
    return res.json({ success: true, date: today, count: items.length, items });
  } catch (error) {
    console.error("TODAY FOLLOWUPS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load today's follow-ups" });
  }
}

module.exports = { getTodayNotifications };
