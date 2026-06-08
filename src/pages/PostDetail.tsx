import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import interactionService from '../services/interactionService';
import commentService from '../services/commentService';
import reportService from '../services/reportService';
import authService from '../services/authService';
import HistoryModal from '../components/HistoryModal';
import type { Post, Comment } from '../types/index';
import Layout from '../layouts/Layout';
import './PostDetail.css';

interface CommentItemProps {
  comment: Comment;
  user: any;
  isAuthor: boolean;
  isModerator: boolean;
  onVote: (id: string, type: 'upvote' | 'downvote') => void;
  onLike: (id: string) => void;
  onReport: (id: string, type: 'post' | 'comment') => void;
  onDelete: (id: string) => void;
  onEdit: (comment: Comment) => void;
  onHistory: (id: string, type: 'post' | 'comment') => void;
  onAccept: (id: string) => void;
  onReply: (comment: Comment) => void;
  editingCommentId: string | null;
  editCommentBody: string;
  onEditChange: (value: string) => void;
  onEditSubmit: (e: React.FormEvent) => void;
  onEditCancel: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, user, isAuthor, isModerator, onVote, onLike, onReport, onDelete, onEdit, onHistory, onAccept, onReply,
  editingCommentId, editCommentBody, onEditChange, onEditSubmit, onEditCancel
}) => {
  return (
    <div className="comment-card" style={{ marginLeft: comment.parent_id ? 'var(--spacing-8)' : 0, borderLeft: comment.parent_id ? '2px solid var(--border-color)' : 'none', paddingLeft: comment.parent_id ? 'var(--spacing-4)' : 'var(--spacing-4)' }}>
      <div className="comment-header">
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-color)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          {comment.user?.username.charAt(0).toUpperCase()}
        </div>
        <strong>{comment.user?.username}</strong>
        <span style={{ color: 'var(--text-muted)' }}>• {new Date(comment.created_at).toLocaleDateString()}</span>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-2)' }}>
          <button onClick={() => onHistory(comment.id, 'comment')} className="btn-text" style={{ fontSize: '0.75rem' }}>History</button>
          {user && (user.id === comment.user_id || isModerator) && (
            <>
              {user.id === comment.user_id && (
                <button onClick={() => onEdit(comment)} className="btn-text" style={{ fontSize: '0.75rem' }}>Edit</button>
              )}
              <button onClick={() => onDelete(comment.id)} className="btn-text" style={{ fontSize: '0.75rem', color: '#ef4444' }}>Delete</button>
            </>
          )}
        </div>
      </div>
      
      {comment.is_accepted && (
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          color: '#059669', 
          padding: 'var(--spacing-1) var(--spacing-3)', 
          borderRadius: 'var(--radius)', 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          display: 'inline-block',
          marginBottom: 'var(--spacing-2)'
        }}>
          ✓ Accepted Answer
        </div>
      )}
      
      {editingCommentId === comment.id ? (
        <form onSubmit={onEditSubmit} style={{ marginTop: 'var(--spacing-2)' }}>
          <textarea
            value={editCommentBody}
            onChange={(e) => onEditChange(e.target.value)}
            style={{ minHeight: '80px', marginBottom: 'var(--spacing-2)' }}
            required
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onEditCancel} className="btn btn-outline" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: '0.875rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: '0.875rem' }}>Update</button>
          </div>
        </form>
      ) : (
        <>
          <div className="comment-body">
            {comment.body}
          </div>
          <div className="comment-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-3)' }}>
            <div className="vote-control" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
              <button onClick={() => onVote(comment.id, 'upvote')} className="btn-text" style={{ padding: 0 }}>🔼</button>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{comment.vote_score}</span>
              <button onClick={() => onVote(comment.id, 'downvote')} className="btn-text" style={{ padding: 0 }}>🔽</button>
            </div>

            <button onClick={() => onLike(comment.id)} className="btn-text" style={{ fontSize: '0.875rem' }}>
              ❤️ {comment.likes_count || 0}
            </button>

            <button onClick={() => onReply(comment)} className="btn-text" style={{ fontSize: '0.875rem' }}>Reply</button>
            <button onClick={() => onReport(comment.id, 'comment')} className="btn-text" style={{ fontSize: '0.875rem' }}>Report</button>
            
            {isAuthor && !comment.is_accepted && (
              <button onClick={() => onAccept(comment.id)} className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#059669', borderColor: '#d1fae5' }}>
                Mark as Answer
              </button>
            )}
          </div>
        </>
      )}

      {/* Recursive children rendering */}
      {comment.children && comment.children.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              user={user} 
              isAuthor={isAuthor}
              isModerator={isModerator}
              onVote={onVote}
              onLike={onLike}
              onReport={onReport}
              onDelete={onDelete}
              onEdit={onEdit}
              onHistory={onHistory}
              onAccept={onAccept}
              onReply={onReply}
              editingCommentId={editingCommentId}
              editCommentBody={editCommentBody}
              onEditChange={onEditChange}
              onEditSubmit={onEditSubmit}
              onEditCancel={onEditCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const fetchPost = async () => {
    if (!id) return;
    try {
      const postData = await postService.getPostById(id);
      setPost(postData);
      
      const commentsData = await commentService.getCommentsByPostId(id);
      // Backend returns paginated results with 'data' field or just array
      setComments(Array.isArray(commentsData) ? commentsData : (commentsData as any).data || []);
    } catch (error) {
      console.error('Failed to fetch post', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handlePostDelete = async () => {
    if (!id || !post) return;
    const isModeratorDeletion = user && user.id !== post.user_id && authService.isModerator();
    
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    let reason = '';
    if (isModeratorDeletion) {
      reason = window.prompt('Enter reason for deletion (optional):') || 'Pelanggaran aturan komunitas';
    }

    try {
      await postService.deletePost(id, reason);
      navigate('/');
    } catch (error) {
      console.error('Delete failed');
    }
  };

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user) return alert('Please login to vote');
    if (!id) return;
    try {
      await interactionService.vote(id, 'post', type);
      await fetchPost(); 
    } catch (error) {
      console.error('Vote failed');
    }
  };

  const handleLike = async () => {
    if (!user) return alert('Please login to like');
    if (!id) return;
    try {
      await interactionService.toggleLike(id, 'post');
      await fetchPost(); 
    } catch (error) {
      console.error('Like failed');
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert('Please login to bookmark');
    if (!id) return;
    try {
      await interactionService.toggleBookmark(id);
      await fetchPost(); 
    } catch (error) {
      console.error('Bookmark failed');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try {
      await commentService.createComment({ 
        post_id: id, 
        body: newComment,
        parent_id: replyingTo?.id
      });
      setNewComment('');
      setReplyingTo(null);
      await fetchPost(); 
    } catch (error) {
      console.error('Comment failed');
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    // Cari data komentar yang mau dihapus untuk cek kepemilikan
    const findComment = (list: Comment[]): Comment | undefined => {
      for (const c of list) {
        if (c.id === commentId) return c;
        if (c.children) {
          const found = findComment(c.children);
          if (found) return found;
        }
      }
    };
    
    const commentToDelete = findComment(comments);
    const isModeratorDeletion = user && commentToDelete && user.id !== commentToDelete.user_id && authService.isModerator();

    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    let reason = '';
    if (isModeratorDeletion) {
      reason = window.prompt('Enter reason for deletion (optional):') || 'Pelanggaran aturan komunitas';
    }

    try {
      await commentService.deleteComment(commentId, reason);
      await fetchPost();
    } catch (error) {
      console.error('Comment delete failed');
    }
  };

  const handleCommentVote = async (commentId: string, type: 'upvote' | 'downvote') => {
    if (!user) return alert('Please login to vote');
    try {
      await interactionService.vote(commentId, 'comment', type);
      await fetchPost();
    } catch (error) {
      console.error('Comment vote failed');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return alert('Please login to like');
    try {
      await interactionService.toggleLike(commentId, 'comment');
      await fetchPost();
    } catch (error) {
      console.error('Comment like failed');
    }
  };

  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentBody(comment.body);
  };

  const handleCommentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommentId || !editCommentBody.trim()) return;
    try {
      await commentService.updateComment(editingCommentId, { body: editCommentBody });
      setEditingCommentId(null);
      await fetchPost();
    } catch (error) {
      console.error('Comment update failed');
    }
  };

  const handleReport = async (id: string, type: 'post' | 'comment') => {
    if (!user) return alert('Please login to report');
    const reason = window.prompt(`Why are you reporting this ${type}?`);
    if (!reason) return;
    try {
      await reportService.submitReport(id, type, reason);
      alert('Report submitted successfully. Thank you for keeping the community safe!');
    } catch (error) {
      console.error('Report failed');
    }
  };

  const handleAcceptComment = async (commentId: string) => {
    if (!id) return;
    try {
      await commentService.acceptComment(commentId);
      await fetchPost();
    } catch (error) {
      console.error('Failed to accept comment');
    }
  };

  const showHistory = async (id: string, type: 'post' | 'comment') => {
    try {
      const data = type === 'post' 
        ? await postService.getPostHistory(id)
        : await commentService.getCommentHistory(id);
      setHistory(data);
      setHistoryTitle(type === 'post' ? 'Post' : 'Comment');
      setIsHistoryOpen(true);
    } catch (error) {
      console.error('Failed to fetch history');
    }
  };

  if (loading) return <Layout><div className="loading-spinner">Loading discussion...</div></Layout>;
  if (!post) return <Layout><div className="card">Post not found</div></Layout>;

  const isAuthor = !!(user && user.id === post.user_id);
  const isModerator = authService.isModerator();

  return (
    <Layout>
      <div className="post-detail-container">
        <article className="post-content-section">
          <header className="post-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="post-header-meta">
                <span className="tag-badge">{post.category?.name || 'Discussion'}</span>
                <span>•</span>
                <span>Posted by <Link to={`/profiles/${post.user?.username}`}><strong>{post.user?.username}</strong></Link></span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <button onClick={() => showHistory(post.id, 'post')} className="btn-text" style={{ fontSize: '0.75rem', marginLeft: 'var(--spacing-2)' }}>View History</button>
              </div>
              
              {(isAuthor || isModerator) && (
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  {isAuthor && (
                    <Link to={`/posts/${post.id}/edit`} className="btn btn-outline" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: '0.875rem' }}>
                      Edit
                    </Link>
                  )}
                  <button onClick={handlePostDelete} className="btn btn-outline" style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: '0.875rem', color: '#ef4444', borderColor: '#fee2e2' }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: 0, marginTop: 'var(--spacing-2)' }}>{post.title}</h1>
            
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
                {post.tags.map(tag => (
                  <Link key={tag.id} to={`/search?q=${tag.name}`} className="tag-badge" style={{ backgroundColor: '#f3f4f6', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">
            {post.body}
          </div>

          <div className="post-footer-actions">
            <div className="vote-control">
              <button onClick={() => handleVote('upvote')} className="btn btn-outline" style={{ border: 'none', padding: 'var(--spacing-1) var(--spacing-2)' }}>🔼</button>
              <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{post.vote_score}</span>
              <button onClick={() => handleVote('downvote')} className="btn btn-outline" style={{ border: 'none', padding: 'var(--spacing-1) var(--spacing-2)' }}>🔽</button>
            </div>
            
            <button onClick={handleLike} className="btn btn-outline" style={{ gap: 'var(--spacing-2)' }}>
              ❤️ {post.likes_count} Likes
            </button>

            <button onClick={handleBookmark} className="btn btn-outline" style={{ gap: 'var(--spacing-2)' }}>
              🔖 {post.bookmarks_count} Bookmark
            </button>
            
            <button onClick={() => handleReport(post.id, 'post')} className="btn btn-outline" style={{ color: '#ef4444' }}>
              🚩 Report
            </button>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              👁️ {post.view_count} Views
            </div>
          </div>
        </article>

        <section className="comments-section">
          <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Comments ({comments.length})</h2>
          
          {user ? (
            <div className="card" style={{ marginBottom: 'var(--spacing-8)', border: replyingTo ? '2px solid var(--primary-color)' : '1px solid var(--border-color)' }}>
              {replyingTo && (
                <div style={{ marginBottom: 'var(--spacing-2)', padding: 'var(--spacing-2)', backgroundColor: '#eff6ff', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>Replying to <strong>@{replyingTo.user?.username}</strong></span>
                  <button onClick={() => setReplyingTo(null)} className="btn-text" style={{ fontSize: '0.75rem' }}>Cancel</button>
                </div>
              )}
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder={replyingTo ? "Write your reply..." : "What are your thoughts?"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ minHeight: '120px', marginBottom: 'var(--spacing-4)' }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">{replyingTo ? 'Post Reply' : 'Post Comment'}</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)', backgroundColor: '#f9fafb' }}>
              <p><Link to="/login">Login</Link> or <Link to="/register">Register</Link> to join the conversation.</p>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No comments yet. Start the discussion!</p>
            ) : (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  user={user} 
                  isAuthor={isAuthor}
                  isModerator={isModerator}
                  onVote={handleCommentVote}
                  onLike={handleCommentLike}
                  onReport={handleReport}
                  onDelete={handleCommentDelete}
                  onEdit={startEditingComment}
                  onHistory={showHistory}
                  onAccept={handleAcceptComment}
                  onReply={(c) => {
                    setReplyingTo(c);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  editingCommentId={editingCommentId}
                  editCommentBody={editCommentBody}
                  onEditChange={setEditCommentBody}
                  onEditSubmit={handleCommentUpdate}
                  onEditCancel={() => setEditingCommentId(null)}
                />
              ))
            )}
          </div>
        </section>

        <HistoryModal 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          history={history} 
          title={historyTitle} 
        />
      </div>
    </Layout>
  );
};

export default PostDetail;
