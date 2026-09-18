import { useEffect, useState } from "react";
import {
  ArrowBigUp,
  CheckCircle2,
  Filter,
  MessageSquare,
  MessagesSquare,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Tag,
  ThumbsUp,
  UserCheck,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";

const CATEGORIES = ["All", "Technical Q&A", "Project Showcase", "Interview Advice", "Study Groups"];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // New post modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Technical Q&A");
  const [newTags, setNewTags] = useState("React, Node.js");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [category, sort]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (sort) params.sort = sort;
      if (search) params.search = search;

      const { data } = await api.get("/community/posts", { params });
      setPosts(data.posts || []);
    } catch {
      toast.error("Could not load community discussions");
    } finally {
      setLoading(false);
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    try {
      const { data } = await api.get(`/community/posts/${post._id}`);
      setSelectedPost(data.post);
      setComments(data.comments || []);
    } catch {
      toast.error("Could not load post comments");
    }
  };

  const handleVote = async (postId, e) => {
    e?.stopPropagation();
    try {
      const { data } = await api.post(`/community/posts/${postId}/vote`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, upvotes: data.upvotes } : p))
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({ ...prev, upvotes: data.upvotes }));
      }
      toast.success(data.upvoted ? "Upvoted!" : "Vote removed");
    } catch {
      toast.error("Please sign in to vote");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/community/posts/${selectedPost._id}/comments`, {
        content: newComment
      });
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Could not post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      return toast.error("Please fill in title and description");
    }

    setCreating(true);
    try {
      const { data } = await api.post("/community/posts", {
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean)
      });
      setPosts([data.post, ...posts]);
      setCreateModalOpen(false);
      setNewTitle("");
      setNewContent("");
      toast.success("Discussion started!");
    } catch {
      toast.error("Could not create post");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300">
              <MessagesSquare size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Developer Community Hub</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Community & Peer Discussions</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Collaborate with fellow learners, get answers to complex bugs, showcase your capstone projects, and discuss interview experiences.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-lg text-sm px-5 py-3"
          >
            <Plus size={16} /> Start a Discussion
          </button>
        </div>
      </section>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Categories Sidebar */}
        <div className="space-y-3">
          <div className="card p-3 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-2">Channels</p>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full rounded-xl p-2.5 text-left text-xs font-semibold transition ${
                  category === cat
                    ? "bg-brand-50 text-brand-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Guidelines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              • Provide code snippets and error traces when asking technical questions.<br/>
              • Be respectful, constructive, and celebrate your peers’ project launches!
            </p>
          </div>
        </div>

        {/* Discussions List & Post Detail */}
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadPosts()}
                className="input pl-9 py-2 text-xs"
              />
            </div>
            <div className="flex gap-2">
              {["recent", "trending"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    sort === s ? "bg-slate-900 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading discussions...</div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => openPost(post)}
                  className="card group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Upvote Button */}
                    <button
                      onClick={(e) => handleVote(post._id, e)}
                      className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 shrink-0"
                    >
                      <ArrowBigUp size={20} />
                      <span className="text-xs font-bold">{post.upvotes || 0}</span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="badge bg-slate-100 font-semibold text-slate-700">{post.category}</span>
                        {post.hasAcceptedAnswer && (
                          <span className="badge bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Solved
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">By {post.authorName}</span>
                        <span className="text-slate-400">({post.authorGoal})</span>
                      </div>

                      <h2 className="mt-2 text-base font-bold text-slate-900 group-hover:text-brand-600 transition">
                        {post.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {post.content}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                        <div className="flex flex-wrap gap-1.5">
                          {(post.tags || []).map((t) => (
                            <span key={t} className="badge bg-slate-50 text-[10px] text-slate-500">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 font-medium">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={13} /> {post.commentsCount || 0} replies
                          </span>
                          <span>{post.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <MessagesSquare size={44} className="mx-auto text-slate-400" />
              <h3 className="mt-3 text-lg font-bold">No discussions found</h3>
              <p className="mt-1 text-xs text-slate-500">Be the first to start a conversation in this channel!</p>
              <button onClick={() => setCreateModalOpen(true)} className="btn-primary mt-4">
                Start Discussion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POST DETAILS MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-3xl max-h-[90vh] flex flex-col p-6 shadow-2xl animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="badge bg-brand-50 text-brand-700">{selectedPost.category}</span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedPost.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Posted by <strong className="text-slate-800">{selectedPost.authorName}</strong> ({selectedPost.authorGoal})
                </p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Post Content */}
            <div className="overflow-y-auto space-y-6 py-4 flex-1">
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {selectedPost.content}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(selectedPost.tags || []).map((t) => (
                  <span key={t} className="badge bg-slate-100 text-slate-600 text-xs">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-brand-600" />
                  Replies ({comments.length})
                </h3>

                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div
                        key={c._id}
                        className={`rounded-2xl border p-4 text-xs space-y-2 ${
                          c.isAccepted ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {c.authorName} <span className="font-normal text-slate-500">({c.authorGoal})</span>
                          </span>
                          {c.isAccepted && (
                            <span className="badge bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Accepted Solution
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed text-slate-700 whitespace-pre-line">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No replies yet. Share your thoughts below!</p>
                )}
              </div>
            </div>

            {/* Comment Box */}
            <form onSubmit={submitComment} className="border-t border-slate-100 pt-4 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a helpful reply or solution..."
                className="input py-2 text-xs flex-1"
              />
              <button type="submit" disabled={submittingComment} className="btn-primary py-2 px-4 text-xs">
                <Send size={13} /> {submittingComment ? "Posting..." : "Reply"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Start a Discussion</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Discussion Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to structure high-throughput Kafka consumers in Node?"
                  className="input mt-1 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Channel / Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input mt-1 py-2 text-xs"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="React, TypeScript, MongoDB"
                  className="input mt-1 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Details & Code Context</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Explain your problem, trade-offs, or project description..."
                  className="input mt-1 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary text-xs px-5">
                  {creating ? "Posting..." : "Publish Discussion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
