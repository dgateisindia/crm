import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import api from "../../utils/api";

export default function NotesCard({ employeeId }) {

  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {

    if (!employeeId) return;

    api.get(`/employee/notes/${employeeId}`)
      .then((res) => {

        setNote(res.data.note || "");

      })
      .catch(console.error);

  }, [employeeId]);

  const saveNote = async () => {

    try {

      setSaving(true);

      await api.post(`/employee/notes/${employeeId}`, {

        note,

      });

      alert("Note saved successfully.");

    }

    catch (err) {

      console.error(err);

      alert("Failed to save note.");

    }

    finally {

      setSaving(false);

    }

  };

  const clearNote = () => {

    setNote("");

  };
  const deleteNote = async () => {

  const confirmDelete = window.confirm(
    "Delete this note permanently?"
  );

  if (!confirmDelete) return;

  try {

    await api.delete(`/employee/notes/${employeeId}`);

    setNote("");

  }

  catch (err) {

    console.error(err);

    alert("Failed to delete note.");

  }

};

  return (

    <div className="notes-card">

      <div className="notes-header">

        <StickyNote size={22} />

        <h3>

           Notes

        </h3>

      </div>

      <textarea

        className="notes-textarea"

        placeholder="Write your important notes here..."

        value={note}

        maxLength={500}

        onChange={(e) =>

          setNote(e.target.value)

        }

      />

      <div className="notes-footer">

        <span>

          {note.length}/500

        </span>

        <div>

            <button
                className="clear-note-btn"
                onClick={clearNote}
            >
                Clear
            </button>

            <button
                className="delete-note-btn"
                onClick={deleteNote}
            >
                Delete
            </button>

            <button
                className="save-note-btn"
                onClick={saveNote}
                disabled={saving}
            >
                {saving ? "Saving..." : "Save Note"}
            </button>

            </div>

      </div>

    </div>

  );

}