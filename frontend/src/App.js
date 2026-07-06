import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE?.trim() || "http://localhost:8000";
const MESSAGE_DURATION = 3000;

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingNote, setEditingNote] = useState({ title: "", content: "" });
  const [message, setMessage] = useState("");
  const messageTimer = useRef(null);

  useEffect(() => {
    loadNotes();
    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notes`);
      setNotes(response.data);
    } catch (error) {
      setMessage("Unable to load notes.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }
    messageTimer.current = setTimeout(() => setMessage(""), MESSAGE_DURATION);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) {
      showMessage("Please provide a title or content.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/notes`, {
        title: newNote.title.trim() || "Untitled",
        content: newNote.content.trim(),
      });
      setNewNote({ title: "", content: "" });
      await loadNotes();
      showMessage("Note saved.");
    } catch (error) {
      showMessage("Unable to save the note.");
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditingNote({ title: note.title, content: note.content });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingNote({ title: "", content: "" });
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }
    if (!editingNote.title.trim() && !editingNote.content.trim()) {
      showMessage("Please provide a title or content.");
      return;
    }
    try {
      await axios.put(`${API_BASE}/notes/${editingId}`, {
        title: editingNote.title.trim() || "Untitled",
        content: editingNote.content.trim(),
      });
      cancelEditing();
      await loadNotes();
      showMessage("Note updated.");
    } catch (error) {
      showMessage("Unable to update the note.");
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`${API_BASE}/notes/${noteId}`);
      await loadNotes();
      showMessage("Note deleted.");
    } catch (error) {
      showMessage("Unable to delete the note.");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Note Keeper</h1>
        <p>Jot down private notes and edit them instantly.</p>
      </header>

      <section className="form-card">
        <h2>New note</h2>
        <form onSubmit={handleCreate}>
          <label htmlFor="note-title">Title</label>
          <input
            id="note-title"
            value={newNote.title}
            onChange={(event) => setNewNote((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Optional title"
          />
          <label htmlFor="note-content">Content</label>
          <textarea
            id="note-content"
            value={newNote.content}
            onChange={(event) => setNewNote((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Write your note here..."
            rows={4}
          />
          <button type="submit" className="primary-button">
            Save note
          </button>
        </form>
      </section>

      <section className="notes-panel">
        <div className="notes-panel__header">
          <h2>Your notes</h2>
          {loading && <span className="notes-panel__indicator">Syncing…</span>}
        </div>

        {!notes.length && !loading ? (
          <p className="empty-state">No notes yet. Use the form above to add one.</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article key={note.id} className="note-card">
                {editingId === note.id ? (
                  <>
                    <input
                      className="note-card__title-input"
                      value={editingNote.title}
                      onChange={(event) =>
                        setEditingNote((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Title"
                    />
                    <textarea
                      className="note-card__content-input"
                      value={editingNote.content}
                      onChange={(event) =>
                        setEditingNote((prev) => ({ ...prev, content: event.target.value }))
                      }
                      rows={4}
                    />
                    <div className="actions">
                      <button type="button" className="primary-button" onClick={handleUpdate}>
                        Save
                      </button>
                      <button type="button" className="secondary-button" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="note-card__header">
                      <h3>{note.title || "Untitled"}</h3>
                      <span className="note-card__timestamp">
                        Updated {new Date(note.updated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="note-card__content">{note.content || "No content yet"}</p>
                    <div className="actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditing(note)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary-button secondary-button--danger"
                        onClick={() => handleDelete(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {message && <div className="status-bar">{message}</div>}
    </div>
  );
}

export default App;
