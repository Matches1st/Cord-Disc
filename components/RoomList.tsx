
import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, onSnapshot, doc, setDoc, updateDoc, arrayUnion, serverTimestamp, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store';
import { Room } from '../types';
import { Plus, Hash, Search } from 'lucide-react';
import { generateRoomCode } from '../utils';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '../constants';

const RoomList = () => {
  const { user, currentRoom, setCurrentRoom } = useStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const theme = user ? THEMES[user.theme] : THEMES.white;

  useEffect(() => {
    if (!user) return;

    // Query rooms where user is a member
    // Firestore "array-contains" is limited to 10 items in "in" queries, but "array-contains" works on a single field.
    // However, standard indexing supports this well for list views.
    const q = query(
      collection(db, "rooms"),
      where("memberIds", "array-contains", user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData: Room[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomData);
    });

    return unsubscribe;
  }, [user]);

  const createRoom = async () => {
    if (!user) return;
    const name = prompt("Room Name:");
    if (!name) return;
    const code = generateRoomCode();

    try {
      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", code);
        const userRef = doc(db, "users", user.uid);
        
        transaction.set(roomRef, {
          name,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          memberIds: [user.uid]
        });
        
        transaction.update(userRef, {
          joinedRooms: arrayUnion(code)
        });
      });
      navigate(`/room/${code}`);
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Could not create room. Try again.");
    }
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || joinCode.length !== 6) return;
    
    const code = joinCode.toUpperCase();
    const roomRef = doc(db, "rooms", code);
    const userRef = doc(db, "users", user.uid);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        alert("Room not found!");
        return;
      }

      await updateDoc(roomRef, { memberIds: arrayUnion(user.uid) });
      await updateDoc(userRef, { joinedRooms: arrayUnion(code) });
      
      setJoinCode('');
      setShowJoinInput(false);
      navigate(`/room/${code}`);
    } catch (err) {
      console.error("Failed to join", err);
      alert("Failed to join room.");
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme.bg} bg-opacity-95 border-r ${theme.border}`}>
      <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
        <h2 className="font-bold text-lg opacity-90">Rooms</h2>
        <button onClick={() => setShowJoinInput(!showJoinInput)} className={`p-2 rounded-full ${theme.hover}`}>
          <Plus size={20} />
        </button>
      </div>

      {showJoinInput && (
        <form onSubmit={joinRoom} className="p-3 border-b border-opacity-20 border-gray-500">
           <div className="flex gap-2">
             <input 
              type="text" 
              placeholder="6-CHAR CODE" 
              className={`w-full p-2 text-sm rounded ${theme.input} uppercase`}
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
             />
             <button type="submit" className="bg-blue-600 px-3 rounded text-white text-sm">Go</button>
           </div>
           <button 
             type="button" 
             onClick={createRoom} 
             className={`w-full mt-2 text-xs underline opacity-70 hover:opacity-100 text-left`}
           >
             Or create a new room
           </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => navigate(`/room/${room.id}`)}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${
              currentRoom?.id === room.id ? theme.bubbleOther + ' font-bold' : theme.hover
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Hash size={16} />
            </div>
            <div className="truncate">
              <div className="truncate">{room.name}</div>
              <div className={`text-xs opacity-50`}>#{room.id}</div>
            </div>
          </button>
        ))}
        
        {rooms.length === 0 && (
          <div className={`p-4 text-center text-sm opacity-50 italic`}>
            No rooms yet. Create or join one!
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
