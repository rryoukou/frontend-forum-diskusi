import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import interactionService from '../services/interactionService';
import commentService from '../services/commentService';
import reportService from '../services/reportService';
import authService from '../services/authService';
import HistoryModal from '../components/HistoryModal';
import ReportModal from '../components/ReportModal';
import DeleteModal from '../components/DeleteModal';
import type { Post, Comment } from '../types/index';
import Layout from '../layouts/Layout';
import {
  ChevronUp, ChevronDown, Heart, Bookmark, Flag, Eye,
  CornerUpLeft, Pencil, Trash2, CheckCircle2, Clock,
  MessageCircle, Send,
} from 'lucide-react';
import { resolveAvatar } from '../utils/avatar';
import { useAppDispatch } from '../store/hooks';
import { fetchCurrentUser } from '../store/authSlice';
import './PostDetail.css';

interface CommentItemProps {
  comment: Comment; user: any; isAuthor: boolean; isModerator: boolean;
  onVote: (id: string, type: 'upvote' | 'downvote') => void;
  onLike: (id: string) => void;
  onReport: (id: string, type: 'post' | 'comment') => void;
  onDelete: (id: string) => void;
  onEdit: (comment: Comment) => void;
  onHistory: (id: string, type: 'post' | 'comment') => void;
  onAccept: (id: string) => void;
  onReply: (comment: Comment) => void;
  editingCommentId: string | null; editCommentBody: string;
  onEditChange: (v: string) => void;
  onEditSubmit: (e: React.FormEvent) => void;
  onEditCancel: () => void;
}

const Avatar: React.FC<{ url?: string | null; name?: string }> = ({ url, name }) => {
  const [broken, setBroken] = useState(false);
  const resolved = resolveAvatar(url);
  const initial = (name || '?').charAt(0).toUpperCase();
  if (!resolved || broken) return <>{initial}</>;
  return <img src={resolved} alt={name || 'User'} onError={() => setBroken(true)} />;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment, user, isAuthor, isModerator, onVote, onLike, onReport,
  onDelete, onEdit, onHistory, onAccept, onReply,
  editingCommentId, editCommentBody, onEditChange, onEditSubmit, onEditCancel,
}) => (
  <div className={`comment-card${comment.parent_id ? ' comment-card-nested' : ''}`}>
    <div className="comment-header">
      <div className="comment-avatar">
        <Avatar url={comment.user?.avatar_url} name={comment.user?.username} />
      </div>
      <Link to={`/profiles/${comment.user?.username}`} className="comment-author">
        {comment.user?.username}
      </Link>
      <span className="comment-date">
        <Clock size={11} strokeWidth={2} style={{ verticalAlign: 'middle' }} />{' '}
        {new Date(comment.created_at).toLocaleDateString()}
      </span>
      <div className="comment-header-actions">
        <button onClick={() => onHistory(comment.id, 'comment')} className="edit-history-btn">
          <Clock size={11} strokeWidth={2} /> History
        </button>
        {user && (user.id === comment.user_id || isModerator) && (
          <>
            {user.id === comment.user_id && (
              <button onClick={() => onEdit(comment)} className="comment-action-btn">
                <Pencil size={12} strokeWidth={2.5} /> Edit
              </button>
            )}
            <button type="button" onClick={() => onDelete(comment.id)} className="comment-action-btn danger">
              <Trash2 size={12} strokeWidth={2.5} /> Delete
            </button>
          </>
        )}
      </div>
    </div>

    {!!comment.is_accepted && (
      <div className="accepted-badge">
        <CheckCircle2 size={13} strokeWidth={2.5} /> Accepted Answer
      </div>
    )}

    {editingCommentId === comment.id ? (
      <form onSubmit={onEditSubmit} style={{ marginTop: 'var(--sp-3)' }}>
        <textarea value={editCommentBody} onChange={e => onEditChange(e.target.value)}
          style={{ minHeight: 80, marginBottom: 'var(--sp-3)' }} required />
        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onEditCancel} className="btn btn-outline btn-sm">Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm">Update</button>
        </div>
      </form>
    ) : (
      <>
        <div className="comment-body">{typeof comment.body === 'string' ? comment.body : ''}</div>
        <div className="comment-actions">
          <div className="vote-control">
            <button onClick={() => onVote(comment.id, 'upvote')}   className="vote-btn"><ChevronUp   size={15} strokeWidth={2.5} /></button>
            <span className="vote-score">{comment.vote_score ?? 0}</span>
            <button onClick={() => onVote(comment.id, 'downvote')} className="vote-btn"><ChevronDown size={15} strokeWidth={2.5} /></button>
          </div>
          <button onClick={() => onLike(comment.id)} className="comment-action-btn">
            <Heart size={13} strokeWidth={2.5} /> {comment.likes_count ? comment.likes_count : null}
          </button>
          
          {/* HANYA BOLEH REPLY SEKALI & TIDAK BOLEH NESTED REPLY */}
          {!comment.parent_id && (!comment.children || comment.children.length === 0) && (
            <button onClick={() => onReply(comment)} className="comment-action-btn">
              <CornerUpLeft size={13} strokeWidth={2.5} /> Reply
            </button>
          )}

          <button type="button" onClick={() => onReport(comment.id, 'comment')} className="comment-action-btn danger">
            <Flag size={13} strokeWidth={2.5} /> Report
          </button>
          {isAuthor && !comment.is_accepted && (
            <button onClick={() => onAccept(comment.id)} className="action-btn"
              style={{ color: 'var(--success)', borderColor: '#6ee7b7', fontSize: '0.78rem' }}>
              <CheckCircle2 size={13} strokeWidth={2.5} /> Mark as Answer
            </button>
          )}
        </div>
      </>
    )}

    {Array.isArray(comment.children) && comment.children.length > 0 && (
      <div style={{ marginTop: 'var(--sp-4)' }}>
        {comment.children.map(child => (
          <CommentItem key={child.id} comment={child} user={user} isAuthor={isAuthor}
            isModerator={isModerator} onVote={onVote} onLike={onLike} onReport={onReport}
            onDelete={onDelete} onEdit={onEdit} onHistory={onHistory} onAccept={onAccept}
            onReply={onReply} editingCommentId={editingCommentId} editCommentBody={editCommentBody}
            onEditChange={onEditChange} onEditSubmit={onEditSubmit} onEditCancel={onEditCancel} />
        ))}
      </div>
    )}
  </div>
);

/* ── Post Detail Page ── */
const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost]                         = useState<Post | null>(null);
  const [comments, setComments]                 = useState<Comment[]>([]);
  const [newComment, setNewComment]             = useState('');
  const [replyingTo, setReplyingTo]             = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody]   = useState('');
  const [history, setHistory]                   = useState<any[]>([]);
  const [historyTitle, setHistoryTitle]         = useState('');
  const [isHistoryOpen, setIsHistoryOpen]       = useState(false);
  const [reportTarget, setReportTarget]         = useState<{ id: string; type: 'post' | 'comment' } | null>(null);
  const [deleteTarget, setDeleteTarget]         = useState<{ id: string; type: 'post' | 'comment'; showReason: boolean } | null>(null);
  const [loading, setLoading]                   = useState(true);
  const navigate  = useNavigate();
  const user      = authService.getCurrentUser();
  const dispatch  = useAppDispatch();

  const fetchPost = async () => {
    if (!id) return;
    try {
      const pd = await postService.getPostById(id);
      setPost(pd);
      const cd = await commentService.getCommentsByPostId(id);
      setComments(Array.isArray(cd) ? cd : (cd as any).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPost(); }, [id]);

  const handlePostDelete = () => {
    if (!id || !post) return;
    const isMod = user && user.id !== post.user_id && authService.isModerator();
    setDeleteTarget({ id, type: 'post', showReason: !!isMod });
  };
  const confirmPostDelete = async (reason?: string) => {
    if (!id) return;
    try { await postService.deletePost(id, reason); navigate('/'); } catch { console.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const handleVote     = async (type: 'upvote' | 'downvote') => { if (!user) return alert('Login to vote'); try { await interactionService.vote(id!, 'post', type); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ } };
  const handleLike     = async () => { if (!user) return alert('Login to like'); try { await interactionService.toggleLike(id!, 'post'); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ } };
  const handleBookmark = async () => { if (!user) return alert('Login to bookmark'); try { await interactionService.toggleBookmark(id!); await fetchPost(); } catch { /* */ } };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try { await commentService.createComment({ post_id: id, body: newComment, parent_id: replyingTo?.id }); setNewComment(''); setReplyingTo(null); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ }
  };
  const handleCommentDelete = (cid: string) => {
    const findC = (list: Comment[]): Comment | undefined => { for (const c of list) { if (c.id === cid) return c; if (c.children) { const f = findC(c.children); if (f) return f; } } };
    const found = findC(comments);
    const isMod = user && found && user.id !== found.user_id && authService.isModerator();
    setDeleteTarget({ id: cid, type: 'comment', showReason: !!isMod });
  };
  const confirmCommentDelete = async (reason?: string) => {
    if (!deleteTarget) return;
    try { await commentService.deleteComment(deleteTarget.id, reason); await fetchPost(); } catch { /* */ }
    finally { setDeleteTarget(null); }
  };
  const handleCommentVote   = async (cid: string, type: 'upvote' | 'downvote') => { if (!user) return alert('Login to vote'); try { await interactionService.vote(cid, 'comment', type); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ } };
  const handleCommentLike   = async (cid: string) => { if (!user) return alert('Login to like'); try { await interactionService.toggleLike(cid, 'comment'); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ } };
  const startEdit           = (c: Comment) => { setEditingCommentId(c.id); setEditCommentBody(c.body); };
  const handleCommentUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (!editingCommentId || !editCommentBody.trim()) return; try { await commentService.updateComment(editingCommentId, { body: editCommentBody }); setEditingCommentId(null); await fetchPost(); } catch { /* */ } };
  const handleReport = (tid: string, type: 'post' | 'comment') => {
    if (!user) { alert('Login to report'); return; }
    setReportTarget({ id: tid, type });
  };
  const handleAccept        = async (cid: string) => { try { await commentService.acceptComment(cid); await fetchPost(); dispatch(fetchCurrentUser()); } catch { /* */ } };
  const showHistory         = async (tid: string, type: 'post' | 'comment') => {
    try {
      const d = type === 'post' ? await postService.getPostHistory(tid) : await commentService.getCommentHistory(tid);
      setHistory(d); setHistoryTitle(type === 'post' ? 'Post' : 'Comment'); setIsHistoryOpen(true);
    } catch { /* */ }
  };

  if (loading) return <Layout><div className="loading-spinner">Loading discussion...</div></Layout>;
  if (!post)   return <Layout><div className="card">Post not found</div></Layout>;

  const isAuthor    = !!(user && user.id === post.user_id);
  const isModerator = authService.isModerator();

  return (
    <Layout>
      <div className="post-detail-container">
        <article className="post-content-section">
          <header className="post-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="post-header-meta">
                <span className="post-category-badge">{post.category?.name || 'Discussion'}</span>
                <span>·</span>
                <span>By <Link to={`/profiles/${post.user?.username}`}><strong>{post.user?.username}</strong></Link></span>
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <button onClick={() => showHistory(post.id, 'post')} className="edit-history-btn">
                  <Clock size={11} strokeWidth={2} /> History
                </button>
              </div>
              {(isAuthor || isModerator) && (
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexShrink: 0 }}>
                  {isAuthor && (
                    <Link to={`/posts/${post.id}/edit`} className="action-btn" style={{ fontSize: '0.8rem' }}>
                      <Pencil size={13} strokeWidth={2.5} /> Edit
                    </Link>
                  )}
                  <button onClick={handlePostDelete} className="action-btn action-btn-danger" style={{ fontSize: '0.8rem' }}>
                    <Trash2 size={13} strokeWidth={2.5} /> Delete
                  </button>
                </div>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', margin: 'var(--sp-4) 0 0', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="post-tags-row" style={{ padding: 0, marginTop: 'var(--sp-4)' }}>
                {post.tags.map(tag => (
                  <Link key={tag.id} to={`/search?q=${tag.name}`} className="tag-badge">#{tag.name}</Link>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">{post.body}</div>

          <div className="post-footer-actions">
            <div className="vote-control">
              <button onClick={() => handleVote('upvote')}   className="vote-btn"><ChevronUp   size={16} strokeWidth={2.5} /></button>
              <span className="vote-score">{post.vote_score}</span>
              <button onClick={() => handleVote('downvote')} className="vote-btn"><ChevronDown size={16} strokeWidth={2.5} /></button>
            </div>
            <button onClick={handleLike} className="action-btn">
              <Heart size={14} strokeWidth={2.5} /> {post.likes_count} Likes
            </button>
            <button onClick={handleBookmark} className="action-btn">
              <Bookmark size={14} strokeWidth={2.5} /> {post.bookmarks_count} Saves
            </button>
            <button type="button" onClick={() => handleReport(post.id, 'post')} className="action-btn action-btn-danger">
              <Flag size={14} strokeWidth={2.5} /> Report
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-3)' }}>
              <Eye size={13} strokeWidth={2} /> {post.view_count} views
            </div>
          </div>
        </article>

        <section className="comments-section">
          <div className="comments-header">
            <h2>Comments <span className="comments-count-badge" style={{ marginLeft: 8 }}>{comments.length}</span></h2>
          </div>

          {user ? (
            <div className={`comment-form-card${replyingTo ? ' reply-active' : ''}`}>
              {replyingTo && (
                <div className="reply-banner">
                  <span>Replying to <strong>@{replyingTo.user?.username}</strong></span>
                  <button onClick={() => setReplyingTo(null)} className="btn-text" style={{ fontSize: '0.78rem' }}>Cancel</button>
                </div>
              )}
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder={replyingTo ? 'Write your reply...' : 'Share your thoughts...'}
                  value={newComment} onChange={e => setNewComment(e.target.value)}
                  style={{ minHeight: 110, marginBottom: 'var(--sp-3)', width: '100%', borderRadius: 'var(--radius)' }}
                  required
                />
                <div className="comment-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={13} strokeWidth={2.5} /> {replyingTo ? 'Post Reply' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="login-prompt">
              <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to join the conversation.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-3)', fontSize: '0.9375rem' }}>
                <MessageCircle size={32} strokeWidth={1.5} style={{ opacity: .3, display: 'block', margin: '0 auto var(--sp-3)' }} />
                No comments yet — start the discussion!
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} user={user}
                  isAuthor={isAuthor} isModerator={isModerator}
                  onVote={handleCommentVote} onLike={handleCommentLike}
                  onReport={handleReport} onDelete={handleCommentDelete}
                  onEdit={startEdit} onHistory={showHistory} onAccept={handleAccept}
                  onReply={c => { setReplyingTo(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  editingCommentId={editingCommentId} editCommentBody={editCommentBody}
                  onEditChange={setEditCommentBody} onEditSubmit={handleCommentUpdate}
                  onEditCancel={() => setEditingCommentId(null)}
                />
              ))
            )}
          </div>
        </section>

        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} title={historyTitle} />
        <ReportModal
          isOpen={reportTarget !== null}
          targetType={reportTarget?.type ?? 'post'}
          targetId={reportTarget?.id ?? ''}
          onClose={() => setReportTarget(null)}
          onSubmit={async (reason) => {
            if (reportTarget) {
              await reportService.submitReport(reportTarget.id, reportTarget.type, reason);
            }
          }}
        />
        <DeleteModal
          isOpen={deleteTarget !== null}
          targetType={deleteTarget?.type ?? 'post'}
          showReason={deleteTarget?.showReason}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(reason) => {
            if (deleteTarget?.type === 'post') {
              confirmPostDelete(reason);
            } else {
              confirmCommentDelete(reason);
            }
          }}
        />
      </div>
    </Layout>
  );
};

export default PostDetail;
