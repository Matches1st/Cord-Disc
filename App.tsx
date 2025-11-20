
import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useStore } from './store';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

// Components
import AuthPage from './components/AuthPage';
import RoomList from './components/RoomList';
import ChatArea from './components/ChatArea';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import SettingsModal from './components/SettingsModal';
import { THEMES } from './constants';

// Helper wrapper to handle auth redirect logic inside Router context
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, setUser, setIsLoading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
          setUser({ uid: currentUser.uid, ...snap.data() } as any);
        } else {
          // Create new user doc
          // Check for temporary guest name from AuthPage
          const guestName = localStorage.getItem('temp_guest_name');
          const displayName = guestName || currentUser.email?.split('@')[0] || "User";
          
          const newUser = {
            uid: currentUser.uid,
            username: displayName.toLowerCase().replace(/\s/g, ''),
            displayName: displayName,
            photoURL: null,
            theme: "white",
            joinedRooms: [],
            createdAt: serverTimestamp(),
            isGuest: currentUser.isAnonymous
          };

          await setDoc(userRef, newUser);
          setUser(newUser as any);
          localStorage.removeItem('temp_guest_name');
        }
        
        setIsLoading(false);
        if (location.pathname === '/login') navigate('/');
      } else {
        setUser(null);
        setIsLoading(false);
        navigate('/login');
      }
    });

    return () => unsub();
  }, []);

  // Handle Tab Close / Cleanup for Guests
  useEffect(() => {
    const handleTabClose = () => {
        if (user && user.isGuest) {
            // Best effort cleanup. Cannot guarantee execution on all browsers.
            // RTDB onDisconnect is preferred, but sticking to instructions for Firestore logic + constraints.
            // We send a beacon or synchronous XHR if we really needed to, but modern fetch keepalive might work.
            // For this specific constraints, we just rely on standard logic.
            // Note: Real "delete on disconnect" needs RTDB or Cloud Functions.
        }
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => window.removeEventListener('beforeunload', handleTabClose);
  }, [user]);

  if (isLoading) return <LoadingSkeleton />;

  return <>{children}</>;
};

const ProtectedLayout = () => {
  const { user, setSettingsOpen } = useStore();
  const theme = user ? THEMES[user.theme] : THEMES.white;

  const handleLogout = () => {
    if(user?.isGuest) {
        // Cleanup guest data if possible manually before signout
        deleteDoc(doc(db, "users", user.uid)).catch(console.error);
    }
    auth.signOut();
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-72 flex-col border-r border-opacity-20 border-gray-500">
        {/* User Header */}
        <div className={`p-4 border-b ${theme.border} flex items-center gap-3`}>
          <div className="relative">
             <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="Me" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                   {user?.displayName?.[0]}
                 </div>
               )}
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{user?.displayName}</div>
            <div className="text-xs opacity-60 truncate">@{user?.username}</div>
          </div>
          <button onClick={() => setSettingsOpen(true)} className={`p-2 rounded-full ${theme.hover}`}>
            <SettingsIcon size={18} />
          </button>
        </div>
        
        {/* Room List */}
        <div className="flex-1 overflow-hidden">
          <RoomList />
        </div>

        {/* Logout */}
        <div className={`p-3 border-t ${theme.border}`}>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded ${theme.hover} opacity-70 hover:opacity-100 text-sm font-medium`}
          >
            <LogOut size={16} /> Sign Out {user?.isGuest ? '(Guest)' : ''}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
            <Route path="/" element={<div className="flex-1 flex items-center justify-center opacity-50">Select a room</div>} />
            <Route path="/room/:roomId" element={<ChatArea />} />
        </Routes>
      </div>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AuthWrapper>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthWrapper>
    </HashRouter>
  );
};

export default App;
