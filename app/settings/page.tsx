'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { toast } from 'sonner';
import {
  // Navigasi
  ArrowLeft, Save, Loader2, Check, X,
  
  // Icons menu
  User, Lock, Bell, Palette, Shield, AlertTriangle,
  Moon, Sun, Globe, Smartphone, Mail, Eye, EyeOff,
  LogOut, Trash2, CheckCircle, XCircle, Info, Users,
  
  // Tambahan icons
  Key, MessageCircle, Star, Monitor, Languages,
  HelpCircle, LogIn, Eye as ViewIcon, Heart,
  Calendar, Search
} from 'lucide-react';

/* =======================================================
   TYPES
======================================================= */
interface Preferences {
  // Notifikasi
  email_notifications: boolean;
  push_notifications: boolean;
  notif_likes: boolean;
  notif_comments: boolean;
  notif_follows: boolean;
  notif_nasa_updates: boolean;
  
  // Tampilan
  theme: 'dark' | 'light' | 'system';
  language: 'id' | 'en';
  font_size: 'small' | 'medium' | 'large';
  
  // Privasi
  private_account: boolean;
  hide_stats: boolean;
}

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
}

/* =======================================================
   SETTINGS PAGE
======================================================= */
export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(); // ← PINDAHKAN KE SINI (SATU AJA!)
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('account');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  
  // Profile data dari user
  const [profile, setProfile] = useState<{
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  } | null>(null);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Search di blocked users
  const [blockedSearch, setBlockedSearch] = useState('');
  
  // =====================================================
  // FETCH DATA
  // =====================================================
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchSettings();
    fetchProfile();
    
    // Apply theme dari localStorage saat load
    const savedTheme = localStorage.getItem('stellarhub_theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [user]);
  
  // ... (lanjutkan dengan kode selanjutnya)
  
  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', user!.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // 1. Fetch preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error('Error fetching preferences:', prefsError);
      }
      
      if (prefs) {
        setPreferences(prefs as Preferences);
        // Sync theme dari database ke state
        setCurrentTheme(prefs.theme);
        localStorage.setItem('stellarhub_theme', prefs.theme);
        document.documentElement.setAttribute('data-theme', prefs.theme);
      } else {
        // Set default preferences
        setPreferences({
          email_notifications: true,
          push_notifications: true,
          notif_likes: true,
          notif_comments: true,
          notif_follows: true,
          notif_nasa_updates: true,
          theme: 'dark',
          language: 'id',
          font_size: 'medium',
          private_account: false,
          hide_stats: false
        });
      }
      
      // 2. Fetch blocked users
      const { data: blocked } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          profiles:blocked_user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('user_id', user!.id);
      
      if (blocked) {
        const formattedBlocked: BlockedUser[] = blocked.map((item: any) => ({
          id: item.id,
          blocked_user_id: item.blocked_user_id,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        }));
        setBlockedUsers(formattedBlocked);
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };
  
  // =====================================================
  // SAVE PREFERENCES
  // =====================================================
  const savePreferences = async () => {
    if (!preferences || !user) return;
    
    setSaving(true);
    try {
      // Simpan theme ke localStorage dan apply
      localStorage.setItem('stellarhub_theme', preferences.theme);
      document.documentElement.setAttribute('data-theme', preferences.theme);
      
      // Cek apakah sudah ada preferences
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        // Update
        const { error } = await supabase
          .from('user_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...preferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      toast.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };
  
  // =====================================================
  // CHANGE PASSWORD
  // =====================================================
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Password baru tidak cocok');
      return;
    }
    
    if (passwordForm.new.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new
      });
      
      if (error) throw error;
      
      toast.success('Password berhasil diubah!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah password');
    } finally {
      setChangingPassword(false);
    }
  };
  
  // =====================================================
  // UNBLOCK USER
  // =====================================================
  const unblockUser = async (blockedUserId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user!.id)
        .eq('blocked_user_id', blockedUserId);
      
      if (error) throw error;
      
      setBlockedUsers(prev => prev.filter(b => b.blocked_user_id !== blockedUserId));
      toast.success('User berhasil dibuka blokirannya');
    } catch (error) {
      toast.error('Gagal membuka blokiran');
    }
  };
  
  // =====================================================
  // DELETE ACCOUNT
  // =====================================================
  const deleteAccount = async () => {
    if (deleteText !== 'HAPUS AKUN SAYA') {
      toast.error('Teks konfirmasi tidak sesuai');
      return;
    }
    
    setDeleting(true);
    try {
      // Hapus data user (butuh fungsi server-side)
      // Ini harus pake Edge Function atau API route
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      // Redirect ke home
      window.location.href = '/';
      toast.success('Akun berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus akun');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // =====================================================
  // PREVIEW THEME
  // =====================================================
  const previewTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="settings-page">
        <style>{STYLES}</style>
        <div className="settings-loading">
          <div className="spinner-large" />
          <p>Memuat pengaturan...</p>
        </div>
      </div>
    );
  }
  
  // Filter blocked users berdasarkan search
  const filteredBlocked = blockedUsers.filter(b => 
    b.profiles?.username?.toLowerCase().includes(blockedSearch.toLowerCase()) ||
    b.profiles?.full_name?.toLowerCase().includes(blockedSearch.toLowerCase())
  );
  
  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="settings-page">
      <style>{STYLES}</style>
      
      <div className="settings-container">
        {/* Header dengan breadcrumb */}
        <div className="settings-header">
          <div className="header-left">
            <Link href="/profile" className="back-button">
              <ArrowLeft size={18} />
            </Link>
            <div className="header-title">
              <h1>Pengaturan</h1>
              <p>Kelola akun dan preferensi kamu</p>
            </div>
          </div>
          
          <button
            className="save-button"
            onClick={savePreferences}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="spin" size={16} /> Menyimpan...</>
            ) : (
              <><Save size={16} /> Simpan Perubahan</>
            )}
          </button>
        </div>
        
        {/* Main layout dengan card design */}
        <div className="settings-layout">
          {/* Sidebar navigasi */}
          <div className="settings-sidebar">
            <div className="sidebar-profile">
              <div className="profile-mini">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username || ''} className="mini-avatar" />
                ) : (
                  <div className="mini-avatar-fallback">
                    {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="mini-info">
                  <div className="mini-name">{profile?.username || user?.email?.split('@')[0] || 'User'}</div>
                  <div className="mini-email">{user?.email}</div>
                </div>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <User size={18} />
                <span>Informasi Akun</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={18} />
                <span>Keamanan</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} />
                <span>Notifikasi</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette size={18} />
                <span>Tampilan & Tema</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <Shield size={18} />
                <span>Privasi & Blokir</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => setActiveTab('help')}
              >
                <HelpCircle size={18} />
                <span>Bantuan</span>
              </button>
            </nav>
            
            <div className="sidebar-footer">
              <div className="version-info">
                <span>StellarHub v1.0</span>
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="settings-content">
            
            {/* ========== TAB AKUN ========== */}
            {activeTab === 'account' && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Informasi Akun</h2>
                  <p>Detail dasar akun kamu</p>
                </div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">
                      <Mail size={16} />
                      <span>Email</span>
                    </div>
                    <div className="info-value">{user?.email}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <User size={16} />
                      <span>Username</span>
                    </div>
                    <div className="info-value">{profile?.username || '-'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <User size={16} />
                      <span>Nama Lengkap</span>
                    </div>
                    <div className="info-value">{profile?.full_name || '-'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <Calendar size={16} />
                      <span>Bergabung</span>
                    </div>
                    <div className="info-value">
                      {new Date().toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <Link href="/profile" className="action-button">
                    <User size={16} />
                    Lihat Profil
                  </Link>
                </div>
                
                <div className="warning-box">
                  <AlertTriangle size={20} />
                  <div>
                    <h3>Zona Berbahaya</h3>
                    <p>Menghapus akun akan menghilangkan semua data Anda secara permanen.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* ========== TAB KEAMANAN ========== */}
            {activeTab === 'security' && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Keamanan Akun</h2>
                  <p>Atur password dan keamanan akun kamu</p>
                </div>
                
                <div className="security-section">
                  <h3>Ganti Password</h3>
                  
                  <form onSubmit={changePassword} className="password-form">
                    <div className="form-group">
                      <label>Password Saat Ini</label>
                      <div className="password-input">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        >
                          {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Password Baru</label>
                      <div className="password-input">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          placeholder="Minimal 6 karakter"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        >
                          {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="password-strength">
                        {passwordForm.new.length > 0 && (
                          <div className="strength-meter">
                            <div className={`strength-bar ${passwordForm.new.length < 6 ? 'weak' : passwordForm.new.length < 10 ? 'medium' : 'strong'}`} />
                            <span>
                              {passwordForm.new.length < 6 ? 'Lemah' : passwordForm.new.length < 10 ? 'Sedang' : 'Kuat'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Konfirmasi Password Baru</label>
                      <div className="password-input">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          placeholder="Ketik ulang password baru"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        >
                          {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                        <div className="error-message">Password tidak cocok</div>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <><Loader2 className="spin" size={16} /> Mengubah...</>
                      ) : (
                        <><Key size={16} /> Ubah Password</>
                      )}
                    </button>
                  </form>
                </div>
                
                <div className="security-section">
                  <h3>Sesi Login</h3>
                  <div className="session-card">
                    <div className="session-info">
                      <Smartphone size={20} />
                      <div>
                        <div className="session-device">Browser saat ini</div>
                        <div className="session-detail">Chrome • Windows</div>
                      </div>
                    </div>
                    <div className="session-badge">Aktif</div>
                  </div>
                  <p className="info-note">
                    <Info size={12} />
                    Fitur lihat semua perangkat akan segera hadir
                  </p>
                </div>
              </div>
            )}
            
            {/* ========== TAB NOTIFIKASI ========== */}
            {activeTab === 'notifications' && preferences && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Notifikasi</h2>
                  <p>Atur notifikasi yang ingin kamu terima</p>
                </div>
                
                <div className="notif-section">
                  <h3>Saluran Notifikasi</h3>
                  
                  <div className="toggle-group">
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Mail size={18} />
                        <div>
                          <span className="toggle-title">Notifikasi Email</span>
                          <span className="toggle-desc">Terima notifikasi melalui email</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.email_notifications}
                          onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                    
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Smartphone size={18} />
                        <div>
                          <span className="toggle-title">Notifikasi Push</span>
                          <span className="toggle-desc">Terima notifikasi di browser</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.push_notifications}
                          onChange={(e) => setPreferences({ ...preferences, push_notifications: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="notif-section">
                  <h3>Jenis Notifikasi</h3>
                  
                  <div className="toggle-group">
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Heart size={18} color="#f472b6" />
                        <div>
                          <span className="toggle-title">Like</span>
                          <span className="toggle-desc">Seseorang menyukai postinganmu</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.notif_likes}
                          onChange={(e) => setPreferences({ ...preferences, notif_likes: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                    
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <MessageCircle size={18} color="#38bdf8" />
                        <div>
                          <span className="toggle-title">Komentar</span>
                          <span className="toggle-desc">Seseorang mengomentari postinganmu</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.notif_comments}
                          onChange={(e) => setPreferences({ ...preferences, notif_comments: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                    
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Users size={18} color="#34d399" />
                        <div>
                          <span className="toggle-title">Follow</span>
                          <span className="toggle-desc">Seseorang mengikutimu</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.notif_follows}
                          onChange={(e) => setPreferences({ ...preferences, notif_follows: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                    
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Star size={18} color="#fbbf24" />
                        <div>
                          <span className="toggle-title">NASA Update</span>
                          <span className="toggle-desc">Gambar NASA baru tersedia</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.notif_nasa_updates}
                          onChange={(e) => setPreferences({ ...preferences, notif_nasa_updates: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* ========== TAB TAMPILAN ========== */}
            {activeTab === 'appearance' && preferences && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Tampilan & Tema</h2>
                  <p>Sesuaikan tampilan StellarHub sesuai keinginanmu</p>
                </div>
                
                <div className="theme-section">
                  <h3>Tema</h3>
                  
                  <div className="theme-grid">
                    <button
                      className={`theme-card ${preferences.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => {
                        setPreferences({ ...preferences, theme: 'dark' });
                        previewTheme('dark');
                      }}
                    >
                      <div className="theme-preview dark-preview">
                        <div className="preview-header" />
                        <div className="preview-content">
                          <div className="preview-line" />
                          <div className="preview-line" />
                        </div>
                      </div>
                      <div className="theme-info">
                        <Moon size={16} />
                        <span>Dark Mode</span>
                      </div>
                      {preferences.theme === 'dark' && (
                        <div className="theme-check">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                    
                    <button
                      className={`theme-card ${preferences.theme === 'light' ? 'active' : ''}`}
                      onClick={() => {
                        setPreferences({ ...preferences, theme: 'light' });
                        previewTheme('light');
                      }}
                    >
                      <div className="theme-preview light-preview">
                        <div className="preview-header" />
                        <div className="preview-content">
                          <div className="preview-line" />
                          <div className="preview-line" />
                        </div>
                      </div>
                      <div className="theme-info">
                        <Sun size={16} />
                        <span>Light Mode</span>
                      </div>
                      {preferences.theme === 'light' && (
                        <div className="theme-check">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                    
                    <button
                      className={`theme-card ${preferences.theme === 'system' ? 'active' : ''}`}
                      onClick={() => {
                        setPreferences({ ...preferences, theme: 'system' });
                        // System theme mengikuti preferensi OS
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        previewTheme(systemTheme);
                      }}
                    >
                      <div className="theme-preview system-preview">
                        <div className="preview-header" />
                        <div className="preview-content">
                          <div className="preview-line" />
                          <div className="preview-line" />
                        </div>
                      </div>
                      <div className="theme-info">
                        <Monitor size={16} />
                        <span>Ikuti Sistem</span>
                      </div>
                      {preferences.theme === 'system' && (
                        <div className="theme-check">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="appearance-section">
                  <h3>Bahasa</h3>
                  
                  <div className="language-selector">
                    <button
                      className={`language-option ${preferences.language === 'id' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, language: 'id' })}
                    >
                      <span className="language-flag">🇮🇩</span>
                      <span className="language-name">Indonesia</span>
                      {preferences.language === 'id' && <Check size={14} className="language-check" />}
                    </button>
                    
                    <button
                      className={`language-option ${preferences.language === 'en' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, language: 'en' })}
                    >
                      <span className="language-flag">🇬🇧</span>
                      <span className="language-name">English</span>
                      {preferences.language === 'en' && <Check size={14} className="language-check" />}
                    </button>
                  </div>
                </div>
                
                <div className="appearance-section">
                  <h3>Ukuran Font</h3>
                  
                  <div className="font-selector">
                    <button
                      className={`font-option ${preferences.font_size === 'small' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, font_size: 'small' })}
                    >
                      <span className="font-preview small">Aa</span>
                      <span>Kecil</span>
                    </button>
                    
                    <button
                      className={`font-option ${preferences.font_size === 'medium' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, font_size: 'medium' })}
                    >
                      <span className="font-preview medium">Aa</span>
                      <span>Sedang</span>
                    </button>
                    
                    <button
                      className={`font-option ${preferences.font_size === 'large' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, font_size: 'large' })}
                    >
                      <span className="font-preview large">Aa</span>
                      <span>Besar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* ========== TAB PRIVASI & BLOKIR ========== */}
            {activeTab === 'privacy' && preferences && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Privasi & Blokir</h2>
                  <p>Atur privasi akun dan kelola pengguna yang diblokir</p>
                </div>
                
                <div className="privacy-section">
                  <h3>Privasi Akun</h3>
                  
                  <div className="toggle-group">
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <Shield size={18} />
                        <div>
                          <span className="toggle-title">Akun Private</span>
                          <span className="toggle-desc">Hanya pengikut yang bisa melihat postinganmu</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.private_account}
                          onChange={(e) => setPreferences({ ...preferences, private_account: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                    
                    <label className="toggle-item">
                      <div className="toggle-info">
                        <EyeOff size={18} />
                        <div>
                          <span className="toggle-title">Sembunyikan Statistik</span>
                          <span className="toggle-desc">Sembunyikan jumlah likes dan views dari publik</span>
                        </div>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={preferences.hide_stats}
                          onChange={(e) => setPreferences({ ...preferences, hide_stats: e.target.checked })}
                        />
                        <span className="toggle-slider" />
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="blocked-section">
                  <div className="blocked-header">
                    <h3>Pengguna Diblokir</h3>
                    <div className="blocked-search">
                      <Search size={14} />
                      <input
                        type="text"
                        placeholder="Cari pengguna..."
                        value={blockedSearch}
                        onChange={(e) => setBlockedSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {filteredBlocked.length === 0 ? (
                    <div className="empty-blocked">
                      {blockedSearch ? (
                        <>
                          <Search size={32} />
                          <p>Tidak ada hasil untuk "{blockedSearch}"</p>
                        </>
                      ) : (
                        <>
                          <Shield size={32} />
                          <p>Belum ada pengguna yang diblokir</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="blocked-list">
                      {filteredBlocked.map((blocked) => (
                        <div key={blocked.id} className="blocked-item">
                          <div className="blocked-user-info">
                            {blocked.profiles?.avatar_url ? (
                              <img
                                src={blocked.profiles.avatar_url}
                                alt={blocked.profiles.username}
                                className="blocked-avatar"
                              />
                            ) : (
                              <div className="blocked-avatar-fallback">
                                {blocked.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="blocked-details">
                              <div className="blocked-name">
                                {blocked.profiles?.full_name || blocked.profiles?.username}
                              </div>
                              <div className="blocked-username">
                                @{blocked.profiles?.username}
                              </div>
                            </div>
                          </div>
                          <button
                            className="unblock-button"
                            onClick={() => unblockUser(blocked.blocked_user_id)}
                          >
                            <X size={14} />
                            Buka Blokir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Danger Zone */}
                <div className="danger-zone">
                  <h3>Zona Berbahaya</h3>
                  
                  {!showDeleteConfirm ? (
                    <button
                      className="delete-button"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 size={16} />
                      Hapus Akun
                    </button>
                  ) : (
                    <div className="delete-confirm">
                      <div className="delete-warning">
                        <AlertTriangle size={24} />
                        <div>
                          <h4>Hapus Akun Permanen</h4>
                          <p>Tindakan ini tidak dapat dibatalkan. Semua data akan hilang.</p>
                        </div>
                      </div>
                      <p className="delete-instruction">
                        Ketik <strong>HAPUS AKUN SAYA</strong> untuk konfirmasi
                      </p>
                      <input
                        type="text"
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                        placeholder="HAPUS AKUN SAYA"
                        className="delete-input"
                      />
                      <div className="delete-actions">
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteText('');
                          }}
                        >
                          Batal
                        </button>
                        <button
                          className="confirm-delete-button"
                          onClick={deleteAccount}
                          disabled={deleting || deleteText !== 'HAPUS AKUN SAYA'}
                        >
                          {deleting ? (
                            <><Loader2 className="spin" size={16} /> Menghapus...</>
                          ) : (
                            <>Hapus Permanen</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* ========== TAB BANTUAN ========== */}
            {activeTab === 'help' && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Bantuan & Dukungan</h2>
                  <p>Temukan bantuan untuk akun kamu</p>
                </div>
                
                <div className="help-section">
                  <div className="help-item">
                    <HelpCircle size={20} />
                    <div>
                      <h4>Pusat Bantuan</h4>
                      <p>Dapatkan jawaban untuk pertanyaan umum</p>
                    </div>
                    <button className="help-button">Kunjungi</button>
                  </div>
                  
                  <div className="help-item">
                    <MessageCircle size={20} />
                    <div>
                      <h4>Hubungi Kami</h4>
                      <p>Butuh bantuan lebih lanjut? Hubungi tim kami</p>
                    </div>
                    <button className="help-button">Hubungi</button>
                  </div>
                  
                  <div className="help-item">
                    <LogIn size={20} />
                    <div>
                      <h4>Laporkan Masalah</h4>
                      <p>Temukan bug? Laporkan ke tim pengembang</p>
                    </div>
                    <button className="help-button">Laporkan</button>
                  </div>
                </div>
                
                <div className="feedback-section">
                  <h3>Beri Masukan</h3>
                  <p>Kami ingin mendengar pendapatmu tentang StellarHub</p>
                  <button className="feedback-button">
                    Kirim Masukan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================================================
   STYLES
======================================================= */
const STYLES = `
  /* ===== THEME VARIABLES ===== */
  :root {
    /* Dark theme (default) */
    --bg-primary: #0a0a0f;
    --bg-secondary: #121218;
    --bg-card: rgba(18,18,24,0.8);
    --bg-card-hover: rgba(28,28,36,0.9);
    --text-primary: #ffffff;
    --text-secondary: rgba(203,213,225,0.8);
    --text-muted: rgba(160,165,215,0.6);
    --border-color: rgba(255,255,255,0.08);
    --border-hover: rgba(255,255,255,0.12);
    --accent: #8b5cf6;
    --accent-hover: #7c3aed;
    --danger: #ef4444;
    --success: #10b981;
    --warning: #f59e0b;
  }

  [data-theme="light"] {
    --bg-primary: #f8fafc;
    --bg-secondary: #f1f5f9;
    --bg-card: #ffffff;
    --bg-card-hover: #f8fafc;
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --border-hover: #cbd5e1;
    --accent: #7c3aed;
    --accent-hover: #6d28d9;
  }

  /* ===== MAIN STYLES ===== */
  .settings-page {
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: 80px 20px 40px;
    font-family: 'DM Sans', sans-serif;
    transition: background-color 0.3s ease, color 0.2s ease;
  }
  
  .settings-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* ===== HEADER ===== */
  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 16px 24px;
    backdrop-filter: blur(10px);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  
  .back-button:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-hover);
    color: var(--text-primary);
  }
  
  .header-title h1 {
    font-size: 24px;
    font-weight: 700;
    font-family: 'Archivo Black', sans-serif;
    margin: 0 0 4px 0;
  }
  
  .header-title p {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
  }
  
  .save-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 30px;
    background: var(--accent);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .save-button:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139,92,246,0.3);
  }
  
  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* ===== LAYOUT ===== */
  .settings-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
  }
  
  @media (max-width: 768px) {
    .settings-layout {
      grid-template-columns: 1fr;
    }
  }
  
  /* ===== SIDEBAR ===== */
  .settings-sidebar {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 20px 12px;
    height: fit-content;
    backdrop-filter: blur(10px);
    position: sticky;
    top: 100px;
  }
  
  .sidebar-profile {
    padding: 0 8px 16px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 16px;
  }
  
  .profile-mini {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .mini-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
  }
  
  .mini-avatar-fallback {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    color: white;
  }
  
  .mini-info {
    flex: 1;
    min-width: 0;
  }
  
  .mini-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .mini-email {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }
  
  .nav-item:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }
  
  .nav-item.active {
    background: var(--accent);
    color: white;
  }
  
  .nav-item.active svg {
    color: white;
  }
  
  .nav-item svg {
    width: 18px;
    height: 18px;
    color: var(--text-muted);
  }
  
  .sidebar-footer {
    padding: 16px 8px 0;
    border-top: 1px solid var(--border-color);
  }
  
  .version-info {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
  }
  
  /* ===== CONTENT ===== */
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .content-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 24px;
    backdrop-filter: blur(10px);
  }
  
  .card-header {
    margin-bottom: 24px;
  }
  
  .card-header h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }
  
  .card-header p {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
  }
  
  /* ===== INFO GRID ===== */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .info-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 16px;
  }
  
  .info-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .info-value {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    word-break: break-all;
  }
  
  .info-value.mono {
    font-family: monospace;
    font-size: 13px;
  }
  
  .badge-active {
    display: inline-block;
    padding: 4px 8px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 20px;
    color: var(--success);
    font-size: 12px;
    font-weight: 600;
  }
  
  .action-buttons {
    margin-bottom: 24px;
  }
  
  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 30px;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .action-button:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-hover);
  }
  
  /* ===== WARNING BOX ===== */
  .warning-box {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 16px;
    padding: 16px;
  }
  
  .warning-box h3 {
    color: var(--warning);
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
  
  .warning-box p {
    color: var(--text-secondary);
    font-size: 13px;
    margin: 0;
  }
  
  /* ===== SECURITY SECTION ===== */
  .security-section,
  .notif-section,
  .privacy-section,
  .blocked-section,
  .danger-zone,
  .help-section {
    margin-bottom: 32px;
  }
  
  .security-section h3,
  .notif-section h3,
  .privacy-section h3,
  .blocked-section h3,
  .danger-zone h3,
  .help-section h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  /* ===== PASSWORD FORM ===== */
  .password-form {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 6px;
  }
  
  .password-input {
    position: relative;
  }
  
  .password-input input {
    width: 100%;
    padding: 12px 40px 12px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }
  
  .password-input input:focus {
    border-color: var(--accent);
  }
  
  .toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
  }
  
  .password-strength {
    margin-top: 6px;
  }
  
  .strength-meter {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .strength-bar {
    height: 4px;
    width: 80px;
    border-radius: 2px;
    background: var(--bg-card);
    position: relative;
  }
  
  .strength-bar::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 2px;
  }
  
  .strength-bar.weak::after {
    width: 33%;
    background: var(--danger);
  }
  
  .strength-bar.medium::after {
    width: 66%;
    background: var(--warning);
  }
  
  .strength-bar.strong::after {
    width: 100%;
    background: var(--success);
  }
  
  .strength-meter span {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .error-message {
    color: var(--danger);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    border-radius: 30px;
    background: var(--accent);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139,92,246,0.3);
  }
  
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* ===== SESSION CARD ===== */
  .session-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .session-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .session-device {
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .session-detail {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .session-badge {
    padding: 4px 8px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 20px;
    color: var(--success);
    font-size: 11px;
    font-weight: 600;
  }
  
  .info-note {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
    font-size: 12px;
    margin: 12px 0 0;
  }
  
  /* ===== TOGGLE GROUP ===== */
  .toggle-group {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 8px;
  }
  
  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
  }
  
  .toggle-item:last-child {
    border-bottom: none;
  }
  
  .toggle-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .toggle-title {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .toggle-desc {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    transition: .3s;
    border-radius: 24px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 2px;
    background-color: var(--text-muted);
    transition: .3s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: var(--accent);
    border-color: var(--accent);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(20px);
    background-color: white;
  }
  
  /* ===== THEME SELECTOR ===== */
  .theme-section {
    margin-bottom: 32px;
  }
  
  .theme-section h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .theme-card {
    position: relative;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  .theme-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }
  
  .theme-card.active {
    border-color: var(--accent);
    background: rgba(139, 92, 246, 0.05);
  }
  
  .theme-preview {
    height: 80px;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  
  .dark-preview {
    background: #1a1a2e;
    border: 1px solid #2d2d44;
  }
  
  .dark-preview .preview-header {
    height: 20px;
    background: #26263b;
    margin-bottom: 8px;
  }
  
  .dark-preview .preview-content {
    padding: 0 8px;
  }
  
  .dark-preview .preview-line {
    height: 8px;
    background: #2d2d44;
    border-radius: 4px;
    margin-bottom: 6px;
  }
  
  .light-preview {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  
  .light-preview .preview-header {
    height: 20px;
    background: #e2e8f0;
    margin-bottom: 8px;
  }
  
  .light-preview .preview-content {
    padding: 0 8px;
  }
  
  .light-preview .preview-line {
    height: 8px;
    background: #cbd5e1;
    border-radius: 4px;
    margin-bottom: 6px;
  }
  
  .system-preview {
    background: linear-gradient(45deg, #1a1a2e 50%, #f8fafc 50%);
    border: 1px solid var(--border-color);
  }
  
  .system-preview .preview-header {
    height: 20px;
    background: linear-gradient(90deg, #26263b 50%, #e2e8f0 50%);
    margin-bottom: 8px;
  }
  
  .system-preview .preview-content {
    padding: 0 8px;
  }
  
  .system-preview .preview-line {
    height: 8px;
    background: linear-gradient(90deg, #2d2d44 50%, #cbd5e1 50%);
    border-radius: 4px;
    margin-bottom: 6px;
  }
  
  .theme-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .theme-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* ===== LANGUAGE SELECTOR ===== */
  .language-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .language-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    flex: 1;
  }
  
  .language-option.active {
    border-color: var(--accent);
    background: rgba(139, 92, 246, 0.05);
  }
  
  .language-flag {
    font-size: 20px;
  }
  
  .language-name {
    font-weight: 500;
  }
  
  .language-check {
    margin-left: auto;
    color: var(--accent);
  }
  
  /* ===== FONT SELECTOR ===== */
  .font-selector {
    display: flex;
    gap: 12px;
  }
  
  .font-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .font-option.active {
    border-color: var(--accent);
    background: rgba(139, 92, 246, 0.05);
  }
  
  .font-preview {
    font-weight: 700;
  }
  
  .font-preview.small {
    font-size: 14px;
  }
  
  .font-preview.medium {
    font-size: 18px;
  }
  
  .font-preview.large {
    font-size: 22px;
  }
  
  /* ===== BLOCKED USERS ===== */
  .blocked-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .blocked-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 30px;
    padding: 8px 16px;
  }
  
  .blocked-search input {
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    width: 200px;
  }
  
  .blocked-search input::placeholder {
    color: var(--text-muted);
  }
  
  .empty-blocked {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    color: var(--text-muted);
    text-align: center;
  }
  
  .empty-blocked svg {
    opacity: 0.5;
  }
  
  .blocked-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 4px;
  }
  
  .blocked-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
  }
  
  .blocked-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .blocked-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
  }
  
  .blocked-avatar-fallback {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: white;
  }
  
  .blocked-details {
    flex: 1;
  }
  
  .blocked-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .blocked-username {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .unblock-button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: var(--danger);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .unblock-button:hover {
    background: rgba(239, 68, 68, 0.2);
  }
  
  /* ===== DANGER ZONE ===== */
  .danger-zone {
    border-top: 1px solid var(--border-color);
    padding-top: 24px;
  }
  
  .delete-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 30px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: var(--danger);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .delete-button:hover {
    background: rgba(239, 68, 68, 0.2);
  }
  
  .delete-confirm {
    background: var(--bg-secondary);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 20px;
    padding: 20px;
  }
  
  .delete-warning {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .delete-warning h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--danger);
  }
  
  .delete-warning p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }
  
  .delete-instruction {
    font-size: 13px;
    margin-bottom: 12px;
  }
  
  .delete-instruction strong {
    color: var(--danger);
  }
  
  .delete-input {
    width: 100%;
    padding: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 14px;
    margin-bottom: 16px;
    outline: none;
  }
  
  .delete-input:focus {
    border-color: var(--danger);
  }
  
  .delete-actions {
    display: flex;
    gap: 12px;
  }
  
  .cancel-button {
    flex: 1;
    padding: 12px;
    border-radius: 30px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .confirm-delete-button {
    flex: 1;
    padding: 12px;
    border-radius: 30px;
    background: var(--danger);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .confirm-delete-button:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  .confirm-delete-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* ===== HELP SECTION ===== */
  .help-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .help-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
  }
  
  .help-item div {
    flex: 1;
  }
  
  .help-item h4 {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 2px 0;
  }
  
  .help-item p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
  
  .help-button {
    padding: 8px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
  }
  
  .feedback-section {
    text-align: center;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
  }
  
  .feedback-section h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
  
  .feedback-section p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0 0 16px 0;
  }
  
  .feedback-button {
    padding: 10px 24px;
    background: var(--accent);
    border: none;
    border-radius: 30px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  
  /* ===== LOADING ===== */
  .settings-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(139, 92, 246, 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;