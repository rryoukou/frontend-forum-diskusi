import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import CategoryPosts from './pages/CategoryPosts';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import ModerationLogs from './pages/moderator/ModerationLogs';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ReputationHistory from './pages/ReputationHistory';
import Follows from './pages/Follows';
import Bookmarks from './pages/Bookmarks';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import { AuthModalProvider } from './context/AuthModalContext';
import { ConfirmProvider } from './context/ConfirmContext';
import './App.css';

/**
 * Komponen Utama App: Mengatur Routing Aplikasi menggunakan React Router.
 * AuthModalProvider membungkus seluruh app agar modal bisa dibuka dari mana saja.
 */
function App() {
  return (
    <AuthModalProvider>
      <ConfirmProvider>
        <Router>
          {/* Modal auth global — muncul di atas semua halaman */}
          <AuthModal />

        <Routes>
          {/* Route Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/categories/:slug" element={<CategoryPosts />} />
          <Route path="/profiles/:username" element={<Profile />} />

          {/* Route yang Membutuhkan Login (Protected) */}
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profiles/:username/followers" element={<Follows />} />
          <Route path="/profiles/:username/following" element={<Follows />} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/reputation-history" element={<ProtectedRoute><ReputationHistory /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />

          {/* Route Khusus Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute role="admin">
              <AdminCategories />
            </ProtectedRoute>
          } />

          {/* Route Khusus Moderator */}
          <Route path="/moderator" element={
            <ProtectedRoute role="moderator">
              <ModeratorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/moderation-logs" element={
            <ProtectedRoute role="moderator">
              <ModerationLogs />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      </ConfirmProvider>
    </AuthModalProvider>
  );
}

export default App;
