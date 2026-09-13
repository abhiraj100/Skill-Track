import { useEffect, useMemo, useState } from "react";
import { BookMarked, Edit3, Pin, Plus, Search, Tag, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const emptyForm = { title: "", content: "", course: "", tags: "", pinned: false };

export default function StudyNotes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const [{ data: noteData }, { data: courseData }] = await Promise.all([api.get("/notes"), api.get("/courses")]); setNotes(noteData.notes); setCourses(courseData.courses); }
    catch { toast.error("Could not load your study notes"); }
  }
  useEffect(() => { load(); }, []);
  const visibleNotes = useMemo(() => notes.filter((note) => (!onlyPinned || note.pinned) && `${note.title} ${note.content} ${(note.tags || []).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [notes, onlyPinned, query]);

  function openNew() { setEditing(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(note) { setEditing(note); setForm({ title: note.title, content: note.content, course: note.course?._id || "", tags: (note.tags || []).join(", "), pinned: note.pinned }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    const payload = { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    try {
      const { data } = editing ? await api.put(`/notes/${editing._id}`, payload) : await api.post("/notes", payload);
      setNotes((current) => editing ? current.map((note) => note._id === editing._id ? data.note : note) : [data.note, ...current]);
      toast.success(editing ? "Note updated" : "Note saved"); closeForm();
    } catch (error) { toast.error(error.response?.data?.message || "Could not save note"); }
    finally { setSaving(false); }
  }
  async function remove(note) {
    if (!window.confirm(`Delete “${note.title}”?`)) return;
    try { await api.delete(`/notes/${note._id}`); setNotes((current) => current.filter((item) => item._id !== note._id)); toast.success("Note deleted"); }
    catch { toast.error("Could not delete note"); }
  }
  async function togglePin(note) {
    try {
      const { data } = await api.put(`/notes/${note._id}`, { title: note.title, content: note.content, course: note.course?._id || "", tags: note.tags || [], pinned: !note.pinned });
      setNotes((current) => current.map((item) => item._id === note._id ? data.note : item));
    } catch { toast.error("Could not update note"); }
  }

  return <div className="mx-auto max-w-6xl space-y-6"><section className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><BookMarked/></div><div><h1 className="section-title">Study notes</h1><p className="mt-1 text-sm text-slate-500">Capture takeaways, ideas, and revision notes while you learn.</p></div></div></div><button onClick={openNew} className="btn-primary"><Plus size={17}/>New note</button></section>
    <section className="card p-3 sm:p-4"><div className="flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className="input py-2.5 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes"/></div><button onClick={() => setOnlyPinned((value) => !value)} className={`btn-secondary px-3 py-2.5 ${onlyPinned ? "border-brand-300 bg-brand-50 text-brand-700" : ""}`}><Pin size={16}/>{onlyPinned ? "Pinned" : "All notes"}</button></div></section>
    {showForm && <form onSubmit={save} className="card border-brand-200 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{editing ? "Edit note" : "Create a study note"}</h2><p className="mt-1 text-sm text-slate-500">Use tags to find this idea later.</p></div><button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close note editor"><X size={18}/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><input required maxLength="120" className="input sm:col-span-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Note title"/><select className="input" value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}><option value="">No linked course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><input className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Tags, separated by commas"/><textarea required maxLength="8000" className="input min-h-40 sm:col-span-2" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write the key idea, example, or next action…"/><label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={form.pinned} onChange={(event) => setForm({ ...form, pinned: event.target.checked })}/>Pin this note</label></div><div className="mt-5 flex gap-3"><button disabled={saving} className="btn-primary">{saving ? "Saving…" : editing ? "Save changes" : "Save note"}</button><button type="button" onClick={closeForm} className="btn-secondary">Cancel</button></div></form>}
    {visibleNotes.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleNotes.map((note) => <article key={note._id} className={`card group flex min-h-56 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${note.pinned ? "border-brand-200 bg-gradient-to-br from-white to-brand-50" : ""}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2">{note.pinned && <Pin size={14} className="text-brand-600" fill="currentColor"/>}{note.course && <span className="badge bg-slate-100 text-slate-600">{note.course.title}</span>}</div><h2 className="mt-3 break-words text-lg font-bold">{note.title}</h2></div><div className="flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><button onClick={() => togglePin(note)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Toggle pin"><Pin size={16}/></button><button onClick={() => openEdit(note)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Edit note"><Edit3 size={16}/></button><button onClick={() => remove(note)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete note"><Trash2 size={16}/></button></div></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{note.content}</p><div className="mt-auto flex flex-wrap items-center gap-2 pt-4">{note.tags?.map((tag) => <span className="badge bg-brand-50 text-brand-700" key={tag}><Tag className="mr-1" size={11}/>{tag}</span>)}</div><p className="mt-4 text-xs text-slate-400">Updated {new Date(note.updatedAt).toLocaleDateString()}</p></article>)}</section> : <section className="card p-12 text-center"><BookMarked className="mx-auto text-brand-500"/><h2 className="mt-3 font-bold">{query || onlyPinned ? "No matching notes" : "Your notes start here"}</h2><p className="mt-1 text-sm text-slate-500">{query || onlyPinned ? "Try a different search or show all notes." : "Save useful ideas from your courses so they are ready for revision."}</p>{!query && !onlyPinned && <button onClick={openNew} className="btn-primary mt-5"><Plus size={17}/>Create your first note</button>}</section>}</div>;
}
