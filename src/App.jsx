import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

// --- CUSTOM SVG ICONS (Lucide style) ---
const Icon = ({ name, className = "icon" }) => {
  const icons = {
    feed: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    map: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" x2="9" y1="3" y2="18" />
        <line x1="15" x2="15" y1="6" y2="21" />
      </svg>
    ),
    add: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    ),
    user: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    logout: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
    ),
    location: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    calendar: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    coffee: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" />
        <line x1="10" x2="10" y1="2" y2="4" />
        <line x1="14" x2="14" y1="2" y2="4" />
      </svg>
    ),
    cart: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    tag: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.01-8.01a1 1 0 0 0 0-1.41L12 2z" />
        <line x1="7" x2="7.01" y1="7" y2="7" />
      </svg>
    ),
    dollar: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
    settings: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  };
  return icons[name] || null;
};

// --- INITIAL MOCK DATA ---
const INITIAL_VISITS = [
  {
    id: 'mock-1',
    name: 'Metropolis Coffee',
    rating: 5,
    review: 'Had the absolute smoothest vanilla latte of my life! The retro neon aesthetic is incredible for working.',
    photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    boughtPhoto: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    menuPhoto: 'https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?auto=format&fit=crop&w=600&q=80',
    lat: 40.7128,
    lng: -74.0060,
    user: 'Alex',
    date: new Date().toISOString(),
    orderedItems: 'Vanilla Iced Latte, Blueberry Scone',
    priceSpent: '115.000',
    foodPriceRange: 2,
    beveragePriceRange: 2,
    address: 'Jl. Pangeran No. 24, New York'
  },
  {
    id: 'mock-2',
    name: 'The Roasted Brew',
    rating: 4,
    review: 'Tried their pistachio croissant and signature pour-over. A little busy on weekends, but totally worth the visit!',
    photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80',
    boughtPhoto: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    menuPhoto: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80',
    lat: 40.7250,
    lng: -73.9960,
    user: 'Sam',
    date: new Date(Date.now() - 86400000).toISOString(),
    orderedItems: 'V60 Pour-Over, Pistachio Croissant',
    priceSpent: '140.000',
    foodPriceRange: 2,
    beveragePriceRange: 2,
    address: 'Jl. Antara No. 8, New York'
  }
];

// --- VIEWPORT & ORIENTATION DETECTOR HOOK ---
function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewport.width <= 900;
  const isLandscape = viewport.width > viewport.height;
  const isMobileLandscape = isMobile && isLandscape;

  return {
    ...viewport,
    isMobile,
    isLandscape,
    isMobileLandscape
  };
}

export default function App() {
  const viewport = useViewport();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [visits, setVisits] = useState([]);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'map' | 'add'
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeAuthTab, setActiveAuthTab] = useState('member'); // 'member' | 'guest'
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [mapCenterOverride, setMapCenterOverride] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [revisitPreFill, setRevisitPreFill] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleOpenLightbox = (photos, title, initialIndex = 0) => {
    const photoArray = ensureArray(photos);
    if (photoArray.length > 4) {
      setLightboxData({
        photos: photoArray,
        title: title,
        activeIndex: null, // null represents "show all" gallery grid view
        showAllFirst: true
      });
    } else {
      setLightboxData({
        photos: photoArray,
        title: title,
        activeIndex: initialIndex,
        showAllFirst: false
      });
    }
  };

  const [isProfilePopoutOpen, setIsProfilePopoutOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Editor form states
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [editBannerColor, setEditBannerColor] = useState('#8B5CF6');
  const [editBio, setEditBio] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const avatarInputRef = useRef(null);
  const backdropMouseDownRef = useRef(false);

  // Initialize edit form states when editor modal opens
  useEffect(() => {
    if (isProfileEditorOpen && currentUser) {
      setEditName(currentUser.name || '');
      setEditAvatar(currentUser.avatar || null);
      setEditBannerColor(currentUser.banner_color || '#8B5CF6');
      setEditBio(currentUser.bio || '');
      setEditCustomStatus(currentUser.custom_status || 'Partner in Caffeine');
    }
  }, [isProfileEditorOpen, currentUser]);

  const fetchUserProfile = async (email) => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${email}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfileData(data);
        // Sync the current user session in local storage and react state if updating self
        if (currentUser && currentUser.email === email) {
          const updatedUser = { 
            ...currentUser, 
            name: data.name, 
            avatar: data.avatar, 
            banner_color: data.banner_color, 
            bio: data.bio, 
            custom_status: data.custom_status 
          };
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile details:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        // Compress avatar to 256x256 for optimal profile picture size
        const compressed = await compressImage(event.target.result, 256, 256, 0.85);
        setEditAvatar(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName) return;
    setIsSavingProfile(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${currentUser.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          name: editName,
          avatar: editAvatar,
          banner_color: editBannerColor,
          bio: editBio,
          custom_status: editCustomStatus,
          requestingUserEmail: currentUser.email
        })
      });

      if (response.ok) {
        setIsProfileEditorOpen(false);
        // Refresh profile stats/details
        await fetchUserProfile(currentUser.email);
        // Refresh the visits list so display name/avatar updates inside feed cards
        await fetchVisits();
      } else {
        const errData = await response.json();
        alert('Failed to update profile: ' + (errData.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Network error saving profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/visits`);
      if (response.ok) {
        const data = await response.json();
        setVisits(data);
        return data;
      } else {
        console.error('Failed to fetch visits');
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  // Fetch visits on mount and when currentUser changes
  useEffect(() => {
    fetchVisits();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Handle Authentication (Tikum Member - Admin Access)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail || !loginPassword) return;

    if (isRegisterMode) {
      if (!registerName) {
        setAuthError('Please enter your name.');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail.toLowerCase(),
            password: loginPassword,
            name: registerName,
            role: 'admin'
          })
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
          setLoginEmail('');
          setLoginPassword('');
          setRegisterName('');
        } else {
          setAuthError(data.error || 'Registration failed.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setAuthError('Failed to connect to the server.');
      }
    } else {
      // Login mode
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail.toLowerCase(),
            password: loginPassword
          })
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
          setLoginEmail('');
          setLoginPassword('');
        } else {
          setAuthError(data.error || 'Incorrect email or password.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setAuthError('Failed to connect to the server.');
      }
    }
  };

  // Handle Guest Login (View Only Access)
  const handleGuestLogin = () => {
    setAuthError('');
    setCurrentUser({
      email: 'guest@tikum.com',
      name: 'Guest Explorer',
      role: 'guest' // View Only Access
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthError('');
    setActiveTab('feed');
  };

  const handleNavigateToMap = (visit) => {
    setMapCenterOverride({ lat: visit.lat, lng: visit.lng, zoom: 16 });
    setSelectedVisit(null); // Close the detail modal
    setActiveTab('map');    // Switch to Map tab
  };

  // If not logged in, show Auth
  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="glass auth-card">
          <div className="auth-header">
            <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Icon name="coffee" className="icon" style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.5px' }}>Tikum Cafe Tracker</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Select Access Role</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Choose your role to explore or log coffee spots.
            </p>
          </div>

          {/* Segmented Tab Control */}
          <div className="auth-segmented-control">
            <button 
              className={`auth-tab-btn ${activeAuthTab === 'member' ? 'active' : ''}`}
              onClick={() => {
                setActiveAuthTab('member');
                setAuthError('');
              }}
            >
              ☕ Tikum Member
            </button>
            <button 
              className={`auth-tab-btn ${activeAuthTab === 'guest' ? 'active' : ''}`}
              onClick={() => {
                setActiveAuthTab('guest');
                setAuthError('');
              }}
            >
              👤 Guest Explorer
            </button>
          </div>

          {/* Beautiful Glassmorphic Error Alert */}
          {authError && (
            <div className="auth-error-alert">
              <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {activeAuthTab === 'member' ? (
            <div className="auth-form-wrapper" style={{ animation: 'guestFadeIn 0.3s ease-out' }}>
              <form onSubmit={handleAuthSubmit}>
                {isRegisterMode && (
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Alex Forester" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="member@tikum.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem' }}>Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary" style={{ padding: '0.85rem' }}>
                  {isRegisterMode ? 'Register & Access Journal' : 'Login as Tikum Member'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
                {isRegisterMode ? 'Already have an account?' : "Don't have a member account yet?"}{' '}
                <span 
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                  }}
                >
                  {isRegisterMode ? 'Log In' : 'Sign Up'}
                </span>
              </p>
            </div>
          ) : (
            <div className="auth-guest-wrapper" style={{ textAlign: 'center', padding: '1rem 0', animation: 'guestFadeIn 0.3s ease-out' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👤</div>
                <h4 style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem', marginBottom: '0.5rem' }}>Read-Only Guest Mode</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  You can explore the live feed, interact with Leaflet map markers, and view item grids/detailed menus. Creating, editing, or uploading visits will be locked.
                </p>
              </div>

              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleGuestLogin} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, var(--accent), #f59e0b)',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
                  padding: '0.85rem',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Icon name="user" style={{ width: '18px', height: '18px', color: '#fff' }} />
                <span style={{ fontWeight: 700 }}>Continue as Guest Explorer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout ${viewport.isMobileLandscape ? 'pwa-mobile-landscape' : ''}`}>
      {/* Sidebar - Desktop */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <Icon name="coffee" style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
            <span>Tikum Cafe Tracker</span>
          </div>
          
          <nav className="nav-links">
            <button 
              className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <Icon name="feed" />
              <span>Feed</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <Icon name="map" />
              <span>Cafe Spot</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <Icon name="add" />
              <span>Log Visit</span>
            </button>
            {isInstallable && (
              <button 
                className="nav-item install-nav-btn" 
                onClick={handleInstallPWA}
                style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', color: 'var(--primary)', marginTop: '0.5rem' }}
              >
                <span style={{ fontSize: '18px', marginRight: '8px' }}>📱</span>
                <span>Install App</span>
              </button>
            )}
          </nav>
        </div>

        <div 
          className="user-profile" 
          onClick={() => {
            fetchUserProfile(currentUser.email);
            setIsProfilePopoutOpen(true);
          }}
          style={{ cursor: 'pointer' }}
          title="View User Profile"
        >
          <div className="user-info">
            <div className="avatar">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={currentUser.name} />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div>
              <div className="username">{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.custom_status || 'Partner in Caffeine'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="nav-item" 
              style={{ padding: '0.5rem', minWidth: 'auto' }} 
              onClick={() => {
                fetchUserProfile(currentUser.email);
                setIsProfilePopoutOpen(true);
              }} 
              title="User Profile"
            >
              <Icon name="settings" style={{ width: '20px', height: '20px' }} />
            </button>
            <button className="nav-item" style={{ padding: '0.5rem', minWidth: 'auto' }} onClick={handleLogout} title="Log Out">
              <Icon name="logout" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* PWA Compact Sidebar - Mobile Landscape */}
      {viewport.isMobileLandscape && (
        <aside className="pwa-landscape-sidebar">
          <div className="pwa-sidebar-top">
            <div className="pwa-brand" title="Tikum Cafe Tracker">
              <Icon name="coffee" style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
            </div>
            
            <nav className="pwa-nav-links">
              <button 
                className={`pwa-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveTab('feed')}
                title="Feed"
              >
                <Icon name="feed" style={{ width: '20px', height: '20px' }} />
              </button>
              <button 
                className={`pwa-nav-item ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
                title="Interactive Map"
              >
                <Icon name="map" style={{ width: '20px', height: '20px' }} />
              </button>
              <button 
                className={`pwa-nav-item ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
                title="Log Visit"
              >
                <Icon name="add" style={{ width: '20px', height: '20px' }} />
              </button>
            </nav>
          </div>

          <div 
            className="pwa-user-profile" 
            onClick={() => {
              fetchUserProfile(currentUser.email);
              setIsProfilePopoutOpen(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="pwa-avatar" title={`${currentUser.name} (${currentUser.role === 'admin' ? 'Member' : 'Guest'})`}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={currentUser.name} />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <button className="pwa-logout-btn" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Log Out">
              <Icon name="logout" style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {!viewport.isMobileLandscape && (
        <header className="mobile-header">
          <div className="brand" style={{ marginBottom: 0 }}>
            <Icon name="coffee" style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
            <span>Tikum Cafe Tracker</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isInstallable && (
              <button 
                className="nav-item" 
                style={{ padding: '0.5rem', minWidth: 'auto', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }} 
                onClick={handleInstallPWA}
                title="Install App"
              >
                <span style={{ fontSize: '1.1rem' }}>📱</span>
              </button>
            )}
            <button 
              className="nav-item" 
              style={{ padding: '0.4rem', minWidth: 'auto', background: 'transparent' }} 
              onClick={() => {
                fetchUserProfile(currentUser.email);
                setIsProfilePopoutOpen(true);
              }}
              title="View Profile"
            >
              <div className="avatar" style={{ width: '26px', height: '26px', fontSize: '0.8rem', margin: 0 }}>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={currentUser.name} />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
            </button>
            <button 
              className="nav-item" 
              style={{ padding: '0.5rem', minWidth: 'auto', background: 'transparent' }} 
              onClick={handleLogout}
              title="Log Out"
            >
              <Icon name="logout" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace */}
      <main className="workspace">
        {activeTab === 'feed' && <FeedView visits={visits} onSelectVisit={setSelectedVisit} onNavigateToMap={handleNavigateToMap} />}
        {activeTab === 'map' && <MapView visits={visits} mapCenterOverride={mapCenterOverride} setMapCenterOverride={setMapCenterOverride} />}
        {activeTab === 'add' && (
          currentUser.role === 'guest'
            ? <LockedGuestView onLogout={handleLogout} />
            : <AddVisitView 
                onVisitAdded={fetchVisits} 
                currentUser={currentUser} 
                setActiveTab={setActiveTab} 
                revisitPreFill={revisitPreFill}
                clearRevisitPreFill={() => setRevisitPreFill(null)}
              />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {!viewport.isMobileLandscape && (
        <nav className="mobile-nav">
          <button 
            className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Icon name="feed" />
            <span>Feed</span>
          </button>
          <button 
            className={`mobile-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Icon name="map" />
            <span>Map</span>
          </button>
          <button 
            className={`mobile-nav-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Icon name="add" />
            <span>Add</span>
          </button>
        </nav>
      )}

      {/* Detail Modal Overlay */}
      {selectedVisit && (
        <VisitDetailModal 
          visit={selectedVisit} 
          visits={visits}
          currentUser={currentUser}
          onClose={() => setSelectedVisit(null)} 
          onNavigateToMap={handleNavigateToMap} 
          onOpenLightbox={handleOpenLightbox}
          onAddRevisit={(preFillData) => {
            setRevisitPreFill(preFillData);
            setActiveTab('add');
            setSelectedVisit(null);
          }}
          onVisitDeleted={async () => {
            setSelectedVisit(null);
            await fetchVisits();
          }}
          onVisitUpdated={async (updatedVisitId) => {
            const updatedVisits = await fetchVisits();
            if (updatedVisits) {
              const match = updatedVisits.find(v => v.id === updatedVisitId);
              if (match) {
                setSelectedVisit(match);
              }
            }
          }}
        />
      )}

      {/* Full-Screen Zoom & Gallery Lightbox */}
      {lightboxData && (
        <LightboxModal 
          data={lightboxData} 
          onClose={() => setLightboxData(null)} 
        />
      )}

      {/* Discord User Popout Modal */}
      {isProfilePopoutOpen && userProfileData && (
        <div 
          className="modal-backdrop" 
          onMouseDown={(e) => {
            backdropMouseDownRef.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              setIsProfilePopoutOpen(false);
            }
          }}
        >
          <div className="discord-popout-container" onClick={(e) => e.stopPropagation()}>
            <div 
              className="discord-banner" 
              style={{ backgroundColor: userProfileData.banner_color || '#8B5CF6' }}
            >
              {currentUser && currentUser.email === userProfileData.email && (
                <button 
                  className="discord-banner-edit-btn" 
                  onClick={() => {
                    setIsProfilePopoutOpen(false);
                    setIsProfileEditorOpen(true);
                  }}
                  title="Edit Profile"
                >
                  <Icon name="settings" style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
            
            <div className="discord-avatar-area">
              <div className="discord-avatar-wrapper">
                {userProfileData.avatar ? (
                  <img src={userProfileData.avatar} alt={userProfileData.name} className="discord-avatar" />
                ) : (
                  <div className="discord-avatar-letter">
                    {userProfileData.name.charAt(0)}
                  </div>
                )}
                <div className="discord-status-dot"></div>
              </div>
              
              {currentUser && currentUser.email === userProfileData.email && (
                <button 
                  className="discord-edit-btn"
                  onClick={() => {
                    setIsProfilePopoutOpen(false);
                    setIsProfileEditorOpen(true);
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="discord-popout-body">
              <div className="discord-display-name">{userProfileData.name}</div>
              <div className="discord-username">@{userProfileData.email.split('@')[0]}</div>
              
              {userProfileData.custom_status && (
                <div className="discord-status-bubble">
                  <span style={{ fontSize: '14px', marginRight: '6px' }}>💬</span>
                  <span className="discord-status-text">{userProfileData.custom_status}</span>
                </div>
              )}

              <hr className="discord-divider" />

              <div className="discord-section">
                <div className="discord-section-title">About Me</div>
                <div className="discord-bio" style={{ whiteSpace: 'pre-wrap' }}>
                  {userProfileData.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No bio written yet.</span>}
                </div>
              </div>

              <div className="discord-section">
                <div className="discord-section-title">Tikum Statistics</div>
                <div className="discord-stats-grid">
                  <div className="discord-stat-card">
                    <span className="discord-stat-icon">☕</span>
                    <div>
                      <div className="discord-stat-value">{userProfileData.stats?.visitedSpotCount || 0}</div>
                      <div className="discord-stat-label">Spots Visited</div>
                    </div>
                  </div>
                </div>
              </div>

              {currentUser && currentUser.email === userProfileData.email && (
                <button 
                  className="btn-danger" 
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setIsProfilePopoutOpen(false);
                    handleLogout();
                  }}
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discord Profile Editor Modal */}
      {isProfileEditorOpen && (
        <div 
          className="modal-backdrop" 
          onMouseDown={(e) => {
            backdropMouseDownRef.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropMouseDownRef.current) {
              setIsProfileEditorOpen(false);
            }
          }}
        >
          <div className="glass modal-content profile-editor-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '95%' }}>
            <div className="modal-body" style={{ maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)', margin: 0 }}>Profile Settings</h2>
                <button className="close-modal-btn" onClick={() => setIsProfileEditorOpen(false)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div className="profile-editor-layout">
                {/* Left: Edit Form */}
                <form className="profile-editor-form" onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Avatar Upload */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Profile Picture</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="discord-avatar-wrapper" style={{ width: '64px', height: '64px', fontSize: '1.5rem', flexShrink: 0 }}>
                        {editAvatar ? (
                          <img src={editAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="Avatar Preview" />
                        ) : (
                          <div className="discord-avatar-letter" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '50%' }}>
                            {editName.charAt(0) || currentUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          Change Avatar
                        </button>
                        {editAvatar && (
                          <button 
                            type="button" 
                            className="btn-danger" 
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                            onClick={() => setEditAvatar(null)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={avatarInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Display Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      maxLength={30}
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                    />
                  </div>

                  {/* Banner Color */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Banner Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <input 
                        type="color" 
                        value={editBannerColor} 
                        onChange={(e) => setEditBannerColor(e.target.value)}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['#8B5CF6', '#EC4899', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#1E1F22'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditBannerColor(color)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: color,
                              border: editBannerColor === color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              transform: editBannerColor === color ? 'scale(1.15)' : 'none',
                              transition: 'transform 0.15s ease'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Custom Status */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Custom Status</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="What is on your mind?"
                      maxLength={100}
                      value={editCustomStatus}
                      onChange={(e) => setEditCustomStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                    />
                  </div>

                  {/* Bio */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justify: 'space-between', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>About Me (Bio)</label>
                      <span style={{ fontSize: '0.75rem', color: editBio.length >= 190 ? '#ef4444' : 'var(--text-muted)' }}>{editBio.length}/190</span>
                    </div>
                    <textarea 
                      className="form-input" 
                      rows={3}
                      placeholder="Write a little about yourself..."
                      maxLength={190}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff', resize: 'none' }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" disabled={isSavingProfile} style={{ flex: 1 }}>
                      {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsProfileEditorOpen(false)} style={{ flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Right: Live Preview */}
                <div className="profile-editor-preview">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Preview</div>
                  <div className="discord-popout-container preview-mode" style={{ margin: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <div className="discord-banner" style={{ backgroundColor: editBannerColor }}></div>
                    <div className="discord-avatar-area">
                      <div className="discord-avatar-wrapper">
                        {editAvatar ? (
                          <img src={editAvatar} alt={editName} className="discord-avatar" />
                        ) : (
                          <div className="discord-avatar-letter">
                            {editName.charAt(0) || currentUser.name.charAt(0)}
                          </div>
                        )}
                        <div className="discord-status-dot"></div>
                      </div>
                    </div>
                    <div className="discord-popout-body">
                      <div className="discord-display-name">{editName || currentUser.name}</div>
                      <div className="discord-username">@{currentUser.email.split('@')[0]}</div>
                      
                      {editCustomStatus && (
                        <div className="discord-status-bubble">
                          <span style={{ fontSize: '14px', marginRight: '6px' }}>💬</span>
                          <span className="discord-status-text">{editCustomStatus}</span>
                        </div>
                      )}

                      <hr className="discord-divider" />

                      <div className="discord-section">
                        <div className="discord-section-title">About Me</div>
                        <div className="discord-bio" style={{ whiteSpace: 'pre-wrap' }}>
                          {editBio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No bio written yet.</span>}
                        </div>
                      </div>

                      <div className="discord-section">
                        <div className="discord-section-title">Tikum Statistics</div>
                        <div className="discord-stats-grid">
                          <div className="discord-stat-card">
                            <span className="discord-stat-icon">☕</span>
                            <div>
                              <div className="discord-stat-value">{userProfileData?.stats?.visitedSpotCount || 0}</div>
                              <div className="discord-stat-label">Spots Visited</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEWS ---

function FeedView({ visits, onSelectVisit, onNavigateToMap }) {
  return (
    <div>
      <div className="section-header">
        <h1>Cafe Feed</h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing {visits.length} coffee spots (Click cards to view details)
        </div>
      </div>

      <div className="feed-grid">
        {visits.map((visit) => {
          const dateStr = new Date(visit.date).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div 
              className="glass cafe-card" 
              key={visit.id} 
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectVisit(visit)}
            >
              <div className="card-img-wrapper">
                {visit.photo && (
                  <img src={visit.photo} alt={visit.name} className="card-img" />
                )}
                <div className="card-badge rating">
                  ☕ {visit.rating}.0
                </div>
              </div>

              <div className="card-content">
                <h3 className="card-title">{visit.name}</h3>
                <div className="card-meta" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Icon name="calendar" style={{ width: '14px', height: '14px' }} />
                    <span>{dateStr}</span>
                  </div>
                  {visit.priceSpent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontWeight: 600 }}>
                      <Icon name="dollar" style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
                      <span>IDR {Number(visit.priceSpent).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {(visit.foodPriceRange || visit.beveragePriceRange) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <span>•</span>
                      <span>Food: <strong style={{ color: 'var(--accent)' }}>{formatPriceRange(visit.foodPriceRange || 1)}</strong></span>
                      <span>Bev: <strong style={{ color: 'var(--primary)' }}>{formatPriceRange(visit.beveragePriceRange || 1)}</strong></span>
                    </div>
                  )}
                </div>
                <p className="card-review">"{(visit.review || '').replace(/\/n/g, ' ').substring(0, 110)}{(visit.review || '').length > 110 ? '...' : ''}"</p>
                
                {/* Micro preview of what was ordered */}
                {visit.orderedItems && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <Icon name="cart" style={{ width: '12px', height: '12px', color: 'var(--primary)' }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{visit.orderedItems}</span>
                  </div>
                )}

                {/* Clickable Address & GPS Badge */}
                {visit.address && (
                  <div 
                    className="card-address-badge"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop parent onClick (onSelectVisit) from firing
                      onNavigateToMap(visit);
                    }}
                    title="Click to locate on interactive map 🗺️"
                  >
                    <Icon name="location" />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {visit.address}
                    </span>
                  </div>
                )}

                <div className="card-footer">
                  <div 
                    className="card-user" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the visit detail modal
                      fetchUserProfile(visit.userEmail);
                      setIsProfilePopoutOpen(true);
                    }}
                    style={{ cursor: 'pointer' }}
                    title={`View ${visit.user}'s profile`}
                  >
                    <div className="avatar" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                      {visit.userAvatar ? (
                        <img src={visit.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={visit.user} />
                      ) : (
                        visit.user.charAt(0)
                      )}
                    </div>
                    <span>Visited by {visit.user}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>View Details →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapView({ visits, mapCenterOverride, setMapCenterOverride }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Leaflet Map
    let centerLat = 40.7128;
    let centerLng = -74.0060;
    
    if (visits.length > 0) {
      centerLat = visits[0].lat;
      centerLng = visits[0].lng;
    }

    const map = L.map(containerRef.current).setView([centerLat, centerLng], 12);
    mapRef.current = map;

    // Add beautiful clean Voyager map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Custom glowing dive-icon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--primary); width: 16px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 15px var(--primary);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const bounds = [];

    // Render Markers
    visits.forEach(visit => {
      if (visit.lat && visit.lng) {
        const marker = L.marker([visit.lat, visit.lng], { icon: customIcon }).addTo(map);
        
        const popupContent = `
          <div class="popup-details">
            <h4>${visit.name}</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; font-size: 0.8rem;">
              <span style="color: var(--text-muted)">Rating: <strong>☕ ${visit.rating}.0</strong></span>
              ${visit.priceSpent ? `<span style="color: var(--accent)">• Spent: <strong>IDR ${Number(visit.priceSpent).toLocaleString('id-ID')}</strong></span>` : ''}
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.5rem;">
                Food: <strong style="color: var(--accent)">${formatPriceRange(visit.foodPriceRange || 1)}</strong> | 
                Bev: <strong style="color: var(--primary)">${formatPriceRange(visit.beveragePriceRange || 1)}</strong>
              </div>
            </div>
            ${visit.address ? `<p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.25rem;">📍 <i>${visit.address}</i></p>` : ''}
            ${visit.orderedItems ? `<p style="font-size: 0.8rem; color: #c084fc; margin-bottom: 0.5rem;">🛒 Ordered: <i>${visit.orderedItems}</i></p>` : ''}
            <p style="font-size: 0.8rem; line-height: 1.4; color: var(--text-muted)">"${(visit.review || '').replace(/\/n/g, ' ').substring(0, 100)}${(visit.review || '').length > 100 ? '...' : ''}"</p>
            ${visit.photo ? `<img src="${visit.photo}" alt="${visit.name}"/>` : ''}
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem; text-align: right;">By: ${visit.user}</div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
        bounds.push([visit.lat, visit.lng]);
      }
    });

    // Check if there is an override animation triggered
    if (mapCenterOverride) {
      map.flyTo([mapCenterOverride.lat, mapCenterOverride.lng], mapCenterOverride.zoom, {
        animate: true,
        duration: 1.5
      });
      
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - mapCenterOverride.lat) < 0.0001 &&
               Math.abs(pos.lng - mapCenterOverride.lng) < 0.0001;
      });
      
      if (marker) {
        // Wait for flyTo swooping transition to finish
        setTimeout(() => {
          marker.openPopup();
        }, 1500);
      }
      setMapCenterOverride(null); // Clear override
    } else if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [visits, mapCenterOverride]);

  return (
    <div className="map-screen-wrapper">
      <div className="section-header">
        <h1>Cafe Spot</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore all the spots you and your friend have logged</p>
      </div>
      <div ref={containerRef} className="map-viewport" id="map-container"></div>
    </div>
  );
}

// Helper to compress uploaded images via Canvas to avoid LocalStorage Quota Exceeded exceptions
function compressImage(base64Str, maxWidth = 1020, maxHeight = 1020, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

// Helper to promote string image data to single-element array for backward compatibility
function ensureArray(photoData) {
  if (!photoData) return [];
  if (Array.isArray(photoData)) return photoData;
  return [photoData];
}

// Helper to encode range of min and max (1 to 5) into a single integer
function encodeRange(min, max) {
  const mn = Math.min(min, max);
  const mx = Math.max(min, max);
  if (mn === 1) return mx;
  if (mn === 2) return mx + 4;
  if (mn === 3) return mx + 7;
  if (mn === 4) return mx + 9;
  if (mn === 5) return 15;
  return 1;
}

// Helper to decode a single integer back into min and max range (1 to 5)
function decodeRange(val) {
  const v = parseInt(val) || 1;
  if (v >= 1 && v <= 5) return { min: 1, max: v };
  if (v >= 6 && v <= 9) return { min: 2, max: v - 4 };
  if (v >= 10 && v <= 12) return { min: 3, max: v - 7 };
  if (v >= 13 && v <= 14) return { min: 4, max: v - 9 };
  if (v === 15) return { min: 5, max: 5 };
  return { min: 1, max: 1 };
}

// Helper to format price range to USD symbols
function formatPriceRange(val) {
  const { min, max } = decodeRange(val);
  const formatSymbol = (v) => {
    if (v >= 5) return '$$$$$+';
    return '$'.repeat(v);
  };
  if (min === max) {
    return formatSymbol(min);
  }
  return `${formatSymbol(min)} - ${formatSymbol(max)}`;
}

// Component to render a single photo or a beautiful 4-grid gallery of photos
function PhotoGallery({ photos, onRemove, onPhotoClick }) {
  const photoArray = ensureArray(photos);
  if (photoArray.length === 0) return null;

  if (photoArray.length === 1) {
    return (
      <div className="single-photo-wrapper" style={{ position: 'relative', width: '100%' }}>
        <img 
          src={photoArray[0]} 
          alt="Preview" 
          className="upload-preview" 
          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          onClick={() => {
            if (onPhotoClick) onPhotoClick(0);
            else if (!onRemove) window.open(photoArray[0], '_blank');
          }}
        />
        {onRemove && (
          <button
            type="button"
            className="remove-photo-btn"
            onClick={() => onRemove(0)}
            title="Remove Photo"
          >
            &times;
          </button>
        )}
      </div>
    );
  }

  // If multiple photos
  const displayedPhotos = photoArray.slice(0, 4);
  const extraCount = photoArray.length - 4;

  return (
    <div className={`gallery-grid gallery-grid-${displayedPhotos.length}`}>
      {displayedPhotos.map((p, idx) => {
        const isLast = idx === 3 && extraCount > 0;
        return (
          <div 
            key={idx} 
            className="gallery-item" 
            style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => {
              if (onPhotoClick) onPhotoClick(idx);
              else if (!onRemove) window.open(p, '_blank');
            }}
          >
            <img 
              src={p} 
              alt={`Preview ${idx + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {isLast && (
              <div className="gallery-grid-overlay">
                +{extraCount}
              </div>
            )}
            {onRemove && (
              <button
                type="button"
                className="remove-photo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                title="Remove Photo"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- LOCKED GUEST VIEW FOR VIEW-ONLY ROLE ---
function LockedGuestView({ onLogout }) {
  return (
    <div className="locked-guest-container">
      <div className="glass locked-guest-card">
        <div className="lock-icon-wrapper">
          <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2>Member Access Required</h2>
        <p>
          You are currently exploring as a <strong>Guest Explorer</strong>. Logging visits, dropping map pins, and uploading multiple cafe and menu photos is reserved for registered Tikum Members.
        </p>
        <button className="btn-primary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', width: 'auto', marginInline: 'auto', padding: '0.8rem 1.5rem' }}>
          <Icon name="logout" style={{ width: '16px', height: '16px' }} />
          <span>Log In as Tikum Member</span>
        </button>
      </div>
    </div>
  );
}

function AddVisitView({ onVisitAdded, currentUser, setActiveTab, revisitPreFill, clearRevisitPreFill }) {
  const [name, setName] = useState(revisitPreFill?.name || '');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [photo, setPhoto] = useState('');
  const [boughtPhotos, setBoughtPhotos] = useState([]);
  const [menuPhotos, setMenuPhotos] = useState(revisitPreFill?.menuPhoto ? ensureArray(revisitPreFill.menuPhoto) : []);
  const [lat, setLat] = useState(revisitPreFill?.lat || '');
  const [lng, setLng] = useState(revisitPreFill?.lng || '');
  const [orderedItems, setOrderedItems] = useState('');
  const [priceSpent, setPriceSpent] = useState('');
  const [foodPriceRange, setFoodPriceRange] = useState(revisitPreFill?.foodPriceRange || 1);
  const [beveragePriceRange, setBeveragePriceRange] = useState(revisitPreFill?.beveragePriceRange || 1);
  const [address, setAddress] = useState(revisitPreFill?.address || '');
  const [locationStatus, setLocationStatus] = useState(revisitPreFill ? 'Location and cafe details pre-filled! ✓' : '');

  useEffect(() => {
    if (revisitPreFill) {
      clearRevisitPreFill();
    }
  }, [revisitPreFill]);

  const fileInputRef = useRef(null);
  const boughtFileInputRef = useRef(null);
  const menuFileInputRef = useRef(null);

  const miniMapRef = useRef(null);
  const miniContainerRef = useRef(null);
  const miniMarkerRef = useRef(null);

  const handlePriceSelect = (val, currentEncodedVal, setEncodedVal) => {
    const { min, max } = decodeRange(currentEncodedVal);
    if (min === max) {
      if (val < min) {
        setEncodedVal(encodeRange(val, min));
      } else if (val > min) {
        setEncodedVal(encodeRange(min, val));
      } else {
        setEncodedVal(encodeRange(val, val));
      }
    } else {
      setEncodedVal(encodeRange(val, val));
    }
  };

  // Initialize mini interactive map for manual pin drop
  useEffect(() => {
    if (!miniContainerRef.current) return;

    const initialLat = lat || 40.7128;
    const initialLng = lng || -74.0060;

    const map = L.map(miniContainerRef.current).setView([initialLat, initialLng], 12);
    miniMapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--accent); width: 16px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 15px var(--accent);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const marker = L.marker([initialLat, initialLng], { 
      icon: customIcon,
      draggable: true 
    }).addTo(map);
    miniMarkerRef.current = marker;

    // Handle map click to drop pin manually
    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setLat(clickLat);
      setLng(clickLng);
      marker.setLatLng([clickLat, clickLng]);
      setLocationStatus('Pin placed manually! ✓');
    });

    // Handle pin dragging manually
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLat(position.lat);
      setLng(position.lng);
      setLocationStatus('Pin dragged & updated! ✓');
    });

    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
      }
    };
  }, []);

  // Get GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('Pinpointing your caffeine spot...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const retrievedLat = position.coords.latitude;
        const retrievedLng = position.coords.longitude;
        setLat(retrievedLat);
        setLng(retrievedLng);
        setLocationStatus('Location locked in! ✓');

        // Center mini-map and move marker
        if (miniMapRef.current && miniMarkerRef.current) {
          miniMapRef.current.flyTo([retrievedLat, retrievedLng], 15);
          miniMarkerRef.current.setLatLng([retrievedLat, retrievedLng]);
        }
      },
      (error) => {
        setLocationStatus('Unable to retrieve location (we will fallback to default NYC coords)');
      }
    );
  };

  const handleCoordinatesChange = (latVal, lngVal) => {
    const nextLat = parseFloat(latVal);
    const nextLng = parseFloat(lngVal);
    
    if (!isNaN(nextLat)) setLat(latVal);
    if (!isNaN(nextLng)) setLng(lngVal);

    if (!isNaN(nextLat) && !isNaN(nextLng)) {
      if (miniMarkerRef.current && miniMapRef.current) {
        miniMarkerRef.current.setLatLng([nextLat, nextLng]);
        miniMapRef.current.panTo([nextLat, nextLng]);
      }
    }
  };

  const handleCoordsPaste = (val) => {
    const parts = val.split(/[\s,]+/);
    if (parts.length >= 2) {
      const parsedLat = parseFloat(parts[0]);
      const parsedLng = parseFloat(parts[1]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLat(parsedLat);
        setLng(parsedLng);
        if (miniMarkerRef.current && miniMapRef.current) {
          miniMarkerRef.current.setLatLng([parsedLat, parsedLng]);
          miniMapRef.current.flyTo([parsedLat, parsedLng], 15);
        }
        setLocationStatus('Coordinates parsed successfully! ✓');
      }
    }
  };

  // Handle Cover Photo Loading
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const compressed = await compressImage(event.target.result);
        setPhoto(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Items Bought Photo Loading
  const handleBoughtFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      Promise.all(files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const compressed = await compressImage(event.target.result);
            resolve(compressed);
          };
          reader.readAsDataURL(file);
        });
      })).then(newImages => {
        setBoughtPhotos(prev => [...prev, ...newImages]);
      });
    }
  };

  // Handle Restaurant Menu Photo Loading
  const handleMenuFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      Promise.all(files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const compressed = await compressImage(event.target.result);
            resolve(compressed);
          };
          reader.readAsDataURL(file);
        });
      })).then(newImages => {
        setMenuPhotos(prev => [...prev, ...newImages]);
      });
    }
  };

  // Submit Visit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || rating === 0) return;

    // Default Fallback coordinates (NYC Center)
    const finalLat = lat || 40.7128 + (Math.random() - 0.5) * 0.05;
    const finalLng = lng || -74.0060 + (Math.random() - 0.5) * 0.05;

    const payload = {
      name,
      rating,
      review,
      photo,
      boughtPhoto: boughtPhotos,
      menuPhoto: menuPhotos,
      lat: parseFloat(finalLat),
      lng: parseFloat(finalLng),
      userEmail: currentUser.email,
      orderedItems,
      priceSpent: priceSpent ? parseFloat(priceSpent.replace(/[^0-9]/g, '')) : null,
      foodPriceRange,
      beveragePriceRange,
      address: address || 'Cozy Corner, New York'
    };

    try {
      const response = await fetch(`${API_BASE}/api/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await onVisitAdded();
        setActiveTab('feed');
      } else {
        const data = await response.json();
        alert('Failed to save visit: ' + (data.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className="add-container">
      <div className="glass form-panel" style={{ padding: '1rem' }}>
        <h2 style={{ margin: '1rem', fontFamily: 'Outfit', fontSize: '1.75rem' }}>Log New Coffee Spot</h2>
        
        <form onSubmit={handleSubmit} className="pwa-landscape-form-grid">
          <div className="form-left-col">
            <div className="form-group">
              <label>Cafe Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Blue Bottle Coffee" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`rating-star-btn ${val <= rating ? 'active' : ''}`}
                    onClick={() => setRating(val)}
                  >
                    ☕
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Address / Location Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Jl. Pangeran No. 12, Manhattan" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Items Ordered / Menu items</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Pistachio Croissant, Matcha Latte, V60 Brew" 
                value={orderedItems}
                onChange={(e) => setOrderedItems(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Total Price (IDR)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 120.000" 
                value={priceSpent}
                onChange={(e) => setPriceSpent(e.target.value)}
              />
            </div>

            <div className="price-ranges-row">
              <div className="form-group">
                <label>Food Price Range</label>
                <div className="price-range-container">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const { min, max } = decodeRange(foodPriceRange);
                    const isActive = val >= min && val <= max;
                    return (
                      <button
                        key={val}
                        type="button"
                        style={{ flex: 1 }}
                        className={`price-range-btn food ${isActive ? 'active' : ''}`}
                        onClick={() => handlePriceSelect(val, foodPriceRange, setFoodPriceRange)}
                      >
                        {val === 5 ? '$$$$$+' : '$'.repeat(val)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Beverages Price Range</label>
                <div className="price-range-container">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const { min, max } = decodeRange(beveragePriceRange);
                    const isActive = val >= min && val <= max;
                    return (
                      <button
                        key={val}
                        type="button"
                        style={{ flex: 1 }}
                        className={`price-range-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handlePriceSelect(val, beveragePriceRange, setBeveragePriceRange)}
                      >
                        {val === 5 ? '$$$$$+' : '$'.repeat(val)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>What did you buy? / Thoughts</label>
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="Amazing latte art, and the roast was exceptionally bright!" 
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
          </div>

          <div className="form-right-col">
            {/* Photos Upload Section */}
            <div className="form-group">
              <label>Primary Cafe Cover Photo</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleFileChange}
              />
              {photo ? (
                <div style={{ position: 'relative' }}>
                  <img src={photo} alt="Preview" className="upload-preview" />
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ position: 'absolute', bottom: '10px', right: '10px', width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => setPhoto('')}
                  >
                    Remove Cover Photo
                  </button>
                </div>
              ) : (
                <div className="upload-dropzone" onClick={() => fileInputRef.current.click()}>
                  <Icon name="add" style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Upload Main Cover Photo</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Select a beautiful picture of the cafe store front</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
              {/* Bought Photos */}
              <div className="form-group">
                <label>What you bought / Cafe Vibe</label>
                <input 
                  type="file" 
                  ref={boughtFileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  multiple
                  onChange={handleBoughtFileChange}
                />
                {boughtPhotos.length > 0 ? (
                  <div>
                    <PhotoGallery photos={boughtPhotos} onRemove={(idx) => setBoughtPhotos(prev => prev.filter((_, i) => i !== idx))} />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ marginTop: '0.5rem', width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginInline: 'auto' }}
                      onClick={() => boughtFileInputRef.current.click()}
                    >
                      <Icon name="add" style={{ width: '12px', height: '12px' }} />
                      <span>Add More</span>
                    </button>
                  </div>
                ) : (
                  <div className="upload-dropzone" style={{ padding: '1.25rem' }} onClick={() => boughtFileInputRef.current.click()}>
                    <Icon name="add" style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Upload Item Photos</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>E.g. Latte cups, croissants (multiple allowed)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Photos */}
              <div className="form-group">
                <label>Menu</label>
                <input 
                  type="file" 
                  ref={menuFileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  multiple
                  onChange={handleMenuFileChange}
                />
                {menuPhotos.length > 0 ? (
                  <div>
                    <PhotoGallery photos={menuPhotos} onRemove={(idx) => setMenuPhotos(prev => prev.filter((_, i) => i !== idx))} />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ marginTop: '0.5rem', width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginInline: 'auto' }}
                      onClick={() => menuFileInputRef.current.click()}
                    >
                      <Icon name="add" style={{ width: '12px', height: '12px' }} />
                      <span>Add More</span>
                    </button>
                  </div>
                ) : (
                  <div className="upload-dropzone" style={{ padding: '1.25rem' }} onClick={() => menuFileInputRef.current.click()}>
                    <Icon name="add" style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Upload Menu Cards</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>E.g. Blackboard list, brochure (multiple allowed)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pin Drop Map Section */}
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem' }}>
              <label style={{ marginBottom: '0.25rem' }}>Pinpoint Location / Drop Map Pin</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                Enter coordinates manually, drop a pin by clicking/dragging on the map below, or click "Get GPS Location"!
              </p>

              {/* Paste coordinates parser */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Paste Coordinates (e.g. from Google Maps)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Paste coordinates here (e.g., -6.2088, 106.8456)" 
                  onChange={(e) => handleCoordsPaste(e.target.value)}
                />
              </div>
              
              <div className="coordinates-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="Latitude" 
                    value={lat}
                    onChange={(e) => handleCoordinatesChange(e.target.value, lng)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="Longitude" 
                    value={lng}
                    onChange={(e) => handleCoordinatesChange(lat, e.target.value)}
                    required
                  />
                </div>
                <div className="gps-btn-container" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.1rem' }}
                    onClick={handleGetLocation}
                  >
                    <Icon name="location" style={{ width: '16px', height: '16px' }} />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              <div ref={miniContainerRef} className="mini-map-viewport"></div>

              {locationStatus && (
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 500, color: locationStatus.includes('✓') ? 'var(--success)' : 'var(--text-muted)' }}>
                  {locationStatus}
                </p>
              )}
            </div>
          </div>

          <div className="form-submit-row">
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              Save Cafe Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// --- VISIT DETAIL MODAL OVERLAY ---

function VisitDetailModal({ visit, visits, currentUser, onClose, onNavigateToMap, onOpenLightbox, onAddRevisit, onVisitDeleted, onVisitUpdated }) {
  const [currentVisit, setCurrentVisit] = useState(visit);
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const backdropMouseDownRef = useRef(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(1);
  const [editReview, setEditReview] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOrderedItems, setEditOrderedItems] = useState('');
  const [editPriceSpent, setEditPriceSpent] = useState('');
  const [editFoodPriceRange, setEditFoodPriceRange] = useState(1);
  const [editBeveragePriceRange, setEditBeveragePriceRange] = useState(1);
  const [editPhoto, setEditPhoto] = useState(null);
  const [editBoughtPhotos, setEditBoughtPhotos] = useState([]);
  const [editMenuPhotos, setEditMenuPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Refs for file inputs
  const editCoverInputRef = useRef(null);
  const editBoughtInputRef = useRef(null);
  const editMenuInputRef = useRef(null);

  useEffect(() => {
    setCurrentVisit(visit);
  }, [visit]);

  useEffect(() => {
    if (currentVisit) {
      setEditName(currentVisit.name || '');
      setEditRating(currentVisit.rating || 1);
      setEditReview(currentVisit.review || '');
      setEditLat(currentVisit.lat || '');
      setEditLng(currentVisit.lng || '');
      setEditAddress(currentVisit.address || '');
      setEditOrderedItems(currentVisit.orderedItems || '');
      setEditPriceSpent(currentVisit.priceSpent ? String(Math.round(currentVisit.priceSpent)) : '');
      setEditFoodPriceRange(currentVisit.foodPriceRange || 1);
      setEditBeveragePriceRange(currentVisit.beveragePriceRange || 1);
      setEditPhoto(currentVisit.photo || null);
      setEditBoughtPhotos(ensureArray(currentVisit.boughtPhoto));
      setEditMenuPhotos(ensureArray(currentVisit.menuPhoto));
    }
  }, [currentVisit, isEditing]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSessionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const siblingVisits = visits.filter(v => v.name.toLowerCase() === visit.name.toLowerCase());
  // Sort chronologically (earliest first) to find the absolute first visit
  const chronologicalSiblings = [...siblingVisits].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldestSibling = chronologicalSiblings[0];

  // Sort siblings reverse-chronologically (latest first) for dropdown menu list
  const sortedSiblings = [...siblingVisits].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatSessionDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAddRevisit = () => {
    onAddRevisit({
      name: currentVisit.name,
      lat: currentVisit.lat,
      lng: currentVisit.lng,
      address: currentVisit.address,
      menuPhoto: currentVisit.menuPhoto,
      foodPriceRange: currentVisit.foodPriceRange,
      beveragePriceRange: currentVisit.beveragePriceRange
    });
  };

  const handlePriceSelect = (val, currentEncodedVal, setEncodedVal) => {
    const { min, max } = decodeRange(currentEncodedVal);
    if (min === max) {
      if (val < min) {
        setEncodedVal(encodeRange(val, min));
      } else if (val > min) {
        setEncodedVal(encodeRange(min, val));
      } else {
        setEncodedVal(encodeRange(val, val));
      }
    } else {
      setEncodedVal(encodeRange(val, val));
    }
  };

  const handleDeleteLog = async () => {
    if (!window.confirm("Are you sure you want to delete this visit log? This cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/visits/${currentVisit.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      });
      if (response.ok) {
        onVisitDeleted && onVisitDeleted();
      } else {
        const errData = await response.json();
        alert('Failed to delete log: ' + (errData.error || 'Server error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting log.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName || editRating === 0) return;
    setIsSaving(true);
    setEditError('');

    const payload = {
      name: editName,
      rating: editRating,
      review: editReview,
      photo: editPhoto,
      boughtPhoto: editBoughtPhotos,
      menuPhoto: editMenuPhotos,
      lat: parseFloat(editLat),
      lng: parseFloat(editLng),
      address: editAddress,
      orderedItems: editOrderedItems,
      priceSpent: editPriceSpent ? parseFloat(String(editPriceSpent).replace(/[^0-9]/g, '')) : null,
      foodPriceRange: editFoodPriceRange,
      beveragePriceRange: editBeveragePriceRange,
      userEmail: currentUser.email
    };

    try {
      const response = await fetch(`${API_BASE}/api/visits/${currentVisit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditing(false);
        onVisitUpdated && onVisitUpdated(currentVisit.id);
      } else {
        const errData = await response.json();
        setEditError(errData.error || 'Server error saving edits');
      }
    } catch (err) {
      console.error(err);
      setEditError('Network error saving edits.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div 
        className="modal-backdrop" 
        onMouseDown={(e) => {
          backdropMouseDownRef.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && backdropMouseDownRef.current) {
            onClose();
          }
        }}
      >
        <div className="glass modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
          <div className="modal-body" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Edit Visit Log</h2>
            
            {editError && (
              <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Cafe Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Coffee Rating</label>
                <div className="rating-container" style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`rating-star-btn ${val <= editRating ? 'active' : ''}`}
                      onClick={() => setEditRating(val)}
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', opacity: val <= editRating ? 1 : 0.25, transition: 'var(--transition)' }}
                    >
                      ☕
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Location Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Items Ordered</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Matcha Latte, Cinnamon Roll"
                  value={editOrderedItems}
                  onChange={(e) => setEditOrderedItems(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Total Spent (IDR)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 75.000"
                  value={editPriceSpent}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setEditPriceSpent(cleanVal ? Number(cleanVal).toLocaleString('id-ID') : '');
                  }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Food Price Range</label>
                  <div className="price-range-container" style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const { min, max } = decodeRange(editFoodPriceRange);
                      const isActive = val >= min && val <= max;
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`price-range-btn food ${isActive ? 'active' : ''}`}
                          onClick={() => handlePriceSelect(val, editFoodPriceRange, setEditFoodPriceRange)}
                          style={{ flex: 1, padding: '0.45rem 0.25rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: isActive ? '#000' : 'var(--text-muted)', fontWeight: 700 }}
                        >
                          {val === 5 ? '$$$$$+' : '$'.repeat(val)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Beverages Price Range</label>
                  <div className="price-range-container" style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const { min, max } = decodeRange(editBeveragePriceRange);
                      const isActive = val >= min && val <= max;
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`price-range-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handlePriceSelect(val, editBeveragePriceRange, setEditBeveragePriceRange)}
                          style={{ flex: 1, padding: '0.45rem 0.25rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: isActive ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}
                        >
                          {val === 5 ? '$$$$$+' : '$'.repeat(val)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Thoughts & Experience</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  value={editReview}
                  onChange={(e) => setEditReview(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: '#fff', resize: 'vertical' }}
                />
              </div>

              {/* Cover Photo */}
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Cover Photo</label>
                {editPhoto ? (
                  <div className="edit-photo-item cover" style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <img src={editPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                    <button 
                      type="button" 
                      onClick={() => setEditPhoto(null)} 
                      className="remove-photo-badge"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => editCoverInputRef.current?.click()}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.65rem' }}
                    >
                      📷 Upload Cover Photo
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={editCoverInputRef}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const compressed = await compressImage(event.target.result);
                            setEditPhoto(compressed);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>

              {/* Bought Photos */}
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>📸 What was bought photos</label>
                <div className="edit-photo-grid">
                  {editBoughtPhotos.map((pUrl, idx) => (
                    <div key={idx} className="edit-photo-item" style={{ width: '80px', height: '80px' }}>
                      <img src={pUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Bought" />
                      <button 
                        type="button" 
                        onClick={() => setEditBoughtPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="remove-photo-badge"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => editBoughtInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.65rem', width: 'auto' }}
                >
                  ➕ Add Photos
                </button>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  ref={editBoughtInputRef}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      const newImages = await Promise.all(files.map(file => {
                        return new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const compressed = await compressImage(event.target.result);
                            resolve(compressed);
                          };
                          reader.readAsDataURL(file);
                        });
                      }));
                      setEditBoughtPhotos(prev => [...prev, ...newImages]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Menu Photos */}
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>📋 Restaurant Menu photos</label>
                <div className="edit-photo-grid">
                  {editMenuPhotos.map((pUrl, idx) => (
                    <div key={idx} className="edit-photo-item" style={{ width: '80px', height: '80px' }}>
                      <img src={pUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Menu" />
                      <button 
                        type="button" 
                        onClick={() => setEditMenuPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="remove-photo-badge"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => editMenuInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.65rem', width: 'auto' }}
                >
                  ➕ Add Menu Photos
                </button>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  ref={editMenuInputRef}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      const newImages = await Promise.all(files.map(file => {
                        return new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const compressed = await compressImage(event.target.result);
                            resolve(compressed);
                          };
                          reader.readAsDataURL(file);
                        });
                      }));
                      setEditMenuPhotos(prev => [...prev, ...newImages]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ flex: 1 }}>
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="modal-backdrop" 
      onMouseDown={(e) => {
        backdropMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && backdropMouseDownRef.current) {
          onClose();
        }
      }}
    >
      <div className="glass modal-content" onClick={(e) => e.stopPropagation()}>
        {currentVisit.photo && (
          <img 
            src={currentVisit.photo} 
            alt={currentVisit.name} 
            className="modal-header-img" 
            style={{ cursor: 'pointer' }}
            onClick={() => onOpenLightbox && onOpenLightbox([currentVisit.photo], "Cover Photo", 0)}
          />
        )}
        
        <div className="modal-body">
          <div className="modal-title-row">
            <h2 className="modal-title">{currentVisit.name}</h2>
            
            <div className="card-badge rating" style={{ position: 'relative', top: 'auto', left: 'auto', flexShrink: 0 }}>
              ☕ {currentVisit.rating}.0
            </div>
          </div>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="session-selector-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="session-dropdown-btn" 
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  color: '#c084fc',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <Icon name="calendar" style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                <span>{formatSessionDate(currentVisit.date)}</span>
                <span style={{ fontSize: '0.65rem', marginLeft: '0.25rem', opacity: 0.8 }}>▼</span>
              </button>
              
              {isSessionDropdownOpen && (
                <div 
                  className="glass session-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: '0',
                    zIndex: 100,
                    minWidth: '280px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-panel-solid)',
                    border: '1px solid var(--border-color)',
                    padding: '0.5rem 0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  <div style={{ padding: '0.35rem 0.85rem', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                    Select Session / Revisit
                  </div>
                  
                  {sortedSiblings.map((sibling) => {
                    const isSelected = sibling.id === currentVisit.id;
                    const isFirstVisit = sibling.id === oldestSibling?.id;
                    const label = isFirstVisit ? ' (First Visit)' : ' (Revisit)';
                    
                    return (
                      <button
                        key={sibling.id}
                        onClick={() => {
                          setCurrentVisit(sibling);
                          setIsSessionDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 0.85rem',
                          background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                          border: 'none',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.15rem',
                          transition: 'var(--transition)'
                        }}
                        className="session-menu-item"
                      >
                        <span>{formatSessionDate(sibling.date)}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          by {sibling.user}{label}
                        </span>
                      </button>
                    );
                  })}
                  
                  {currentUser.role !== 'guest' && (
                    <button
                      onClick={() => {
                        setIsSessionDropdownOpen(false);
                        handleAddRevisit();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: 'none',
                        borderTop: '1px solid var(--border-color)',
                        marginTop: '0.35rem',
                        color: '#34d399',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'var(--transition)'
                      }}
                      className="session-menu-add-btn"
                    >
                      <span>➕ Add Revisit Log</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Clickable Address & GPS Box */}
          {currentVisit.address && (
            <div 
              className="address-click-box" 
              style={{ 
                background: 'rgba(139, 92, 246, 0.04)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem 1.1rem', 
                marginBottom: '1.5rem', 
                cursor: 'pointer' 
              }}
              onClick={() => onNavigateToMap(currentVisit)}
              title="Click to view on interactive map 🗺️"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>
                    📍 Location Address & GPS
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                    {currentVisit.address}
                  </span>
                  <code style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(139, 92, 246, 0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.15)', fontFamily: 'monospace' }}>
                    {parseFloat(currentVisit.lat).toFixed(5)}, {parseFloat(currentVisit.lng).toFixed(5)}
                  </code>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Show on Map 🗺️
                </span>
              </div>
            </div>
          )}

          {/* Details Pill Row - Ordered Items gets its own row/container to allow full-width wrapping */}
          {currentVisit.orderedItems && (
            <div className="detail-pill-container">
              <div className="detail-pill ordered" title="Ordered Items">
                <Icon name="cart" style={{ width: '14px', height: '14px' }} />
                <span>{currentVisit.orderedItems}</span>
              </div>
            </div>
          )}

          {/* Pricing & Ranges Row */}
          {(currentVisit.priceSpent || currentVisit.foodPriceRange || currentVisit.beveragePriceRange) && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {currentVisit.priceSpent && (
                <div className="detail-pill spent" title="Total Spent">
                  <Icon name="dollar" style={{ width: '14px', height: '14px' }} />
                  <span>IDR {Number(currentVisit.priceSpent).toLocaleString('id-ID')}</span>
                </div>
              )}
              {(currentVisit.foodPriceRange || currentVisit.beveragePriceRange) && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {currentVisit.foodPriceRange && (
                    <div className="detail-pill food-price" title="Food Price Range" style={{ background: 'rgba(245, 158, 11, 0.04)', borderColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                      <span style={{ fontWeight: 600, opacity: 0.8 }}>Food: </span>
                      <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>{formatPriceRange(currentVisit.foodPriceRange)}</span>
                    </div>
                  )}
                  {currentVisit.beveragePriceRange && (
                    <div className="detail-pill beverage-price" title="Beverages Price Range" style={{ background: 'rgba(139, 92, 246, 0.04)', borderColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                      <span style={{ fontWeight: 600, opacity: 0.8 }}>Beverages: </span>
                      <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>{formatPriceRange(currentVisit.beveragePriceRange)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Thoughts & Experience</h4>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-main)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
              "{(currentVisit.review || '').replace(/\/n/g, '\n')}"
            </p>
          </div>

          {/* Secondary Photos: Items Bought & Restaurant Menu */}
          {(ensureArray(currentVisit.boughtPhoto).length > 0 || ensureArray(currentVisit.menuPhoto).length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: (ensureArray(currentVisit.boughtPhoto).length > 0 && ensureArray(currentVisit.menuPhoto).length > 0) ? '1fr 1fr' : '1fr', gap: '1.25rem', marginBottom: '2rem' }}>
              {ensureArray(currentVisit.boughtPhoto).length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>📸 What was bought</h4>
                  <PhotoGallery 
                    photos={currentVisit.boughtPhoto} 
                    onPhotoClick={(idx) => onOpenLightbox && onOpenLightbox(currentVisit.boughtPhoto, "What Was Bought", idx)}
                  />
                </div>
              )}
              {ensureArray(currentVisit.menuPhoto).length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>📋 Restaurant Menu</h4>
                  <PhotoGallery 
                    photos={currentVisit.menuPhoto} 
                    onPhotoClick={(idx) => onOpenLightbox && onOpenLightbox(currentVisit.menuPhoto, "Restaurant Menu", idx)}
                  />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div 
              className="card-user" 
              onClick={() => {
                fetchUserProfile(currentVisit.userEmail);
                setIsProfilePopoutOpen(true);
              }}
              style={{ cursor: 'pointer' }}
              title={`View ${currentVisit.user}'s profile`}
            >
              <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                {currentVisit.userAvatar ? (
                  <img src={currentVisit.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt={currentVisit.user} />
                ) : (
                  currentVisit.user.charAt(0)
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>{currentVisit.user}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{currentVisit.userStatus || 'Partner in Caffeine'}</span>
              </div>
            </div>
            
            {/* Show Coordinates details - fully interactive */}
            <div 
              className="gps-click-link"
              onClick={() => onNavigateToMap(currentVisit)}
              title="Click to locate on interactive map 🗺️"
              style={{ textAlign: 'right' }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>GPS Coordinates</div>
              <code style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                {parseFloat(currentVisit.lat).toFixed(6)}, {parseFloat(currentVisit.lng).toFixed(6)}
              </code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1, minWidth: '100px' }}>
              Close Details
            </button>
            {currentUser && currentUser.email === currentVisit.userEmail && (
              <>
                <button 
                  className="btn-primary edit-btn" 
                  onClick={() => setIsEditing(true)} 
                  style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-danger delete-btn" 
                  onClick={handleDeleteLog} 
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FULL-SCREEN ZOOM & GALLERY LIGHTBOX MODAL ---

function LightboxModal({ data, onClose }) {
  const { photos, title, showAllFirst } = data;
  const [localActiveIndex, setLocalActiveIndex] = useState(data.activeIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [localActiveIndex]);

  // Keyboard navigation & close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (localActiveIndex !== null && showAllFirst) {
          setLocalActiveIndex(null);
        } else {
          onClose();
        }
      } else if (localActiveIndex !== null) {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localActiveIndex, showAllFirst]);

  const handlePrev = () => {
    if (localActiveIndex === null) return;
    setLocalActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    if (localActiveIndex === null) return;
    setLocalActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.4, 3.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const nextScale = Math.max(prev - 0.4, 1.0);
      if (nextScale === 1.0) {
        setPanOffset({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleToggleZoom = (e) => {
    e.stopPropagation();
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2.2);
    }
  };

  // Mouse drag-to-pan handlers
  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch drag-to-pan handlers
  const handleTouchStart = (e) => {
    if (zoomScale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - panOffset.x,
      y: e.touches[0].clientY - panOffset.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || zoomScale <= 1 || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Render Mode A: All Photos Grid View
  if (localActiveIndex === null) {
    return (
      <div className="lightbox-backdrop grid-mode" onClick={onClose}>
        <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
          <header className="lightbox-header">
            <div>
              <h3 className="lightbox-title">{title}</h3>
              <span className="lightbox-meta">{photos.length} Photos in Gallery</span>
            </div>
            <button className="lightbox-close-btn" onClick={onClose} title="Close Lightbox (Esc)">
              &times;
            </button>
          </header>

          <div className="lightbox-full-grid custom-scrollbar">
            {photos.map((photo, idx) => (
              <div 
                key={idx} 
                className="lightbox-grid-item"
                onClick={() => setLocalActiveIndex(idx)}
              >
                <img src={photo} alt={`Gallery item ${idx + 1}`} />
                <div className="grid-item-hover-overlay">
                  <span>View Photo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Mode B: Focused Zoom View
  const activePhoto = photos[localActiveIndex];

  return (
    <div className="lightbox-backdrop focus-mode" onClick={() => {
      if (showAllFirst) {
        setLocalActiveIndex(null);
      } else {
        onClose();
      }
    }}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <header className="lightbox-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {showAllFirst && (
              <button 
                className="lightbox-back-btn" 
                onClick={() => setLocalActiveIndex(null)}
                title="Back to Gallery Grid"
              >
                ← Back
              </button>
            )}
            <div>
              <h3 className="lightbox-title">{title}</h3>
              <span className="lightbox-meta">Photo {localActiveIndex + 1} of {photos.length}</span>
            </div>
          </div>
          <button className="lightbox-close-btn" onClick={onClose} title="Close Lightbox (Esc)">
            &times;
          </button>
        </header>

        {/* Floating Side Arrows */}
        {photos.length > 1 && (
          <>
            <button 
              className="lightbox-nav-btn prev" 
              onClick={handlePrev}
              title="Previous Photo (Left Arrow)"
            >
              ‹
            </button>
            <button 
              className="lightbox-nav-btn next" 
              onClick={handleNext}
              title="Next Photo (Right Arrow)"
            >
              ›
            </button>
          </>
        )}

        {/* Focused Photo Area */}
        <div className="lightbox-focus-container">
          <div 
            className={`lightbox-image-wrapper ${zoomScale > 1 ? 'zoomed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleToggleZoom}
          >
            <img 
              src={activePhoto} 
              alt={`${title} - Photo ${localActiveIndex + 1}`}
              className="lightbox-main-img"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              draggable="false"
            />
          </div>
        </div>

        {/* Bottom Zoom & Control Toolbar Capsule */}
        <div className="lightbox-zoom-toolbar">
          <button className="toolbar-arrow-btn" onClick={handlePrev} disabled={photos.length <= 1} title="Previous Photo">
            ◀
          </button>
          <button className="toolbar-zoom-btn" onClick={handleZoomOut} disabled={zoomScale <= 1} title="Zoom Out">
            ➖
          </button>
          <span className="scale-badge" onClick={handleResetZoom} title="Reset Zoom">
            {Math.round(zoomScale * 100)}%
          </span>
          <button className="toolbar-zoom-btn" onClick={handleZoomIn} disabled={zoomScale >= 3.0} title="Zoom In">
            ➕
          </button>
          <button className="toolbar-reset-btn" onClick={handleResetZoom} disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0} title="Reset Scale & Pan">
            ↺
          </button>
          <button className="toolbar-arrow-btn" onClick={handleNext} disabled={photos.length <= 1} title="Next Photo">
            ▶
          </button>
          {showAllFirst && (
            <button 
              className="grid-toggle-toolbar-btn" 
              onClick={() => setLocalActiveIndex(null)}
              title="Return to Gallery Grid View"
            >
              ▦ Grid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
