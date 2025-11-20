
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react'; // Requires npm install @headlessui/react if using, but sticking to standard div modal for zero-dep
import { X, Save, User as UserIcon, Palette } from 'lucide-react';
import { useStore } from '../store';
import { THEMES } from '../constants';
import { ThemeColor } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { resizeImage } from '../utils';

const SettingsModal = () => {
  const { user, isSettingsOpen, setSettingsOpen, setUser } = useStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uploading, setUploading] = useState(false);

  if (!isSettingsOpen || !user) return null;

  const theme = THEMES[user.theme];

  const handleSave = async () => {
    if (!confirm("Are you sure you want to save changes?")) return;
    
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      displayName
    });
    setUser({ ...user, displayName });
    setSettingsOpen(false);
  };

  const handleThemeChange = async (newTheme: ThemeColor) => {
     const userRef = doc(db, "users", user.uid);
     await updateDoc(userRef, { theme: newTheme });
     setUser({ ...user, theme: newTheme });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const blob = await resizeImage(e.target.files[0]);
      const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, "users", user.uid), { photoURL });
      setUser({ ...user, photoURL });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md ${theme.bg} ${theme.text} rounded-2xl shadow-2xl overflow-hidden border ${theme.border}`}>
        <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserIcon size={20} /> Settings
          </h2>
          <button onClick={() => setSettingsOpen(false)} className={`p-1 rounded-full hover:bg-black/10`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-opacity-50 ring-current">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {displayName[0]}
                </div>
              )}
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">Wait...</div>}
            </div>
            <label className={`text-sm cursor-pointer font-medium underline ${theme.muted} hover:text-current`}>
              Change Avatar
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-80">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${theme.input} outline-none`}
            />
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-80 flex items-center gap-2">
              <Palette size={16} /> Theme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(THEMES) as ThemeColor[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`w-8 h-8 rounded-full border-2 shadow-sm ${
                     user.theme === t ? 'border-current ring-2 ring-offset-2 ring-current' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: t === 'white' ? '#fff' : t === 'black' ? '#000' : `var(--color-${t}-600)` }}
                  // Note: Inline style approximation for pure tailwind mapping logic is complex, 
                  // relying on class names defined in constants primarily.
                  // Let's use a mapping or simple colored divs.
                >
                  <div className={`w-full h-full rounded-full ${THEMES[t].bg}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-4 border-t ${theme.border} flex justify-end`}>
          <button 
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${theme.bubbleSelf} opacity-90 hover:opacity-100`}
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
