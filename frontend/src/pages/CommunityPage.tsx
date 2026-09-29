import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Plus, Search, Tag, Send, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Post, Comment } from '../types';

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Post create state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Frontend');

  // Active post comments modal
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await api.getCommunityPosts({
        tag: selectedTag !== 'all' ? selectedTag : undefined,
        search: searchQuery || undefined
      });
      setPosts(res.posts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag, searchQuery]);

  const handleVote = async (postId: number) => {
    try {
      const res = await api.votePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes_count: res.upvotes_count, has_upvoted: res.has_upvoted } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenComments = async (post: Post) => {
    setActivePost(post);
    try {
      const res = await api.getPostComments(post.id);
      setComments(res.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentInput.trim()) return;
    try {
      const res = await api.addComment(activePost.id, commentInput);
      setComments(prev => [...prev, res.comment]);
      setCommentInput('');
      setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCommunityPost({ title, content, tag });
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const tagsList = ['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'Career', 'System Design'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>DEVELOPER FORUM & SHOWCASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineer Community & Discussions
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Ask technical architecture questions, share optimization tips, and peer-review fullstack projects.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-violet-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Discussion
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              selectedTag === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            All Tags
          </button>
          {tagsList.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                selectedTag === t ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 hover:border-slate-700 transition backdrop-blur-xl shadow-xl flex items-start gap-4"
          >
            {/* Upvote Button */}
            <button
              onClick={() => handleVote(post.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition shrink-0 ${
                post.has_upvoted
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-mono font-bold mt-1">{post.upvotes_count}</span>
            </button>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="font-bold text-white">@{post.author_username}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-violet-300">
                  #{post.tag}
                </span>
                <span className="text-[11px] text-slate-500">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <h3
                onClick={() => handleOpenComments(post)}
                className="font-bold text-base text-white hover:text-violet-300 cursor-pointer transition leading-snug"
              >
                {post.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <button
                  onClick={() => handleOpenComments(post)}
                  className="flex items-center gap-1.5 hover:text-violet-400 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments_count} comments</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Start Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. How to handle WebSocket reconnection backoff in React 19?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tag Category</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {tagsList.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Body Details</label>
                <textarea
                  rows={4}
                  placeholder="Provide context, code snippets or problem breakdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Thread Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="font-mono text-xs text-violet-400">#{activePost.tag} Discussion</span>
                <button onClick={() => setActivePost(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{activePost.title}</h3>
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 leading-relaxed mb-4">
                {activePost.content}
              </p>

              {/* Comments List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">No responses yet. Be the first to answer!</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between font-bold text-violet-300 mb-1">
                        <span>@{c.author_username}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                placeholder="Write a constructive response..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
