
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Shield, Key, ArrowRight, Ghost } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Guest specific state
  const [guestMode, setGuestMode] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = `${username}@corddisc.local`; // Dummy email

    try {
      if (guestMode) {
        // Guest Flow
        if (guestName.length < 3) throw new Error("Name must be at least 3 chars");
        const cred = await signInAnonymously(auth);
        // Note: The User document creation happens in App.tsx listener
        // But we need to stash the guest name to be picked up there, or update profile here.
        // Updating profile here is safer before the listener triggers deeply.
        // Actually, listener triggers immediately. 
        // We will rely on the App.tsx logic to prompt if anonymous, 
        // BUT since we have a UI here, let's update the profile immediately after sign in
        // NO, listener runs fast. Let's just use localStorage to pass the name to the listener logic 
        // OR handle it in the listener by checking if (user.isAnonymous && !doc.exists).
        // To keep "App.tsx" clean, let's do a quick check here.
        // Actually, simple pattern: Update profile first if possible, or let App.tsx handle it.
        // The prompt says: "modal asks for temporary username -> signInAnonymously". 
        // So we are asking here.
        localStorage.setItem('temp_guest_name', guestName);
        return; // Success handled by listener
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').trim());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-3xl font-bold">C</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Welcome to Cord Disc</h2>
          <p className="text-gray-400 text-center mb-8">The lightweight real-time chat.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {!guestMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  required
                />
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                <Ghost className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Temporary Guest Name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
               <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Entering...' : 'Enter as Guest'} <ArrowRight size={18} />
              </button>
             </form>
          )}

          <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-400">
            {!guestMode && (
              <button onClick={() => setIsLogin(!isLogin)} className="hover:text-white transition">
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            )}
            
            <button 
              onClick={() => setGuestMode(!guestMode)} 
              className="text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-1"
            >
              {guestMode ? "Back to Login" : "Continue as Guest"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
