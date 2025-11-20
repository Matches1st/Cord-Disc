
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where, getDoc, doc, startAfter } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useStore } from '../store';
import { Message, Room } from '../types';
import { Send, Paperclip, ImageIcon, Download, MoreVertical, Hash } from 'lucide-react';
import { THEMES } from '../constants';
import { formatTime, resizeImage } from '../utils';

const ChatArea = () => {
  const { roomId } = useParams();
  const { user, currentRoom, setCurrentRoom } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const theme = user ? THEMES[user.theme] : THEMES.white;

  // Load Room Details
  useEffect(() => {
    if (!roomId || !user) return;

    const roomRef = doc(db, "rooms", roomId);
    getDoc(roomRef).then(snap => {
      if (snap.exists()) {
        setCurrentRoom({ id: snap.id, ...snap.data() } as Room);
      } else {
        // Handle invalid room
        setCurrentRoom(null);
      }
    });
  }, [roomId, user, setCurrentRoom]);

  // Load Messages
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "desc"), // Get newest first for pagination logic if needed, but we display asc
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs.reverse()); // Reverse to show oldest at top
      // Auto scroll on new message
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return unsubscribe;
  }, [roomId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !isUploading) || !user || !roomId) return;

    const text = inputText.trim();
    setInputText(''); // Optimistic clear

    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        type: 'text'
      });
    } catch (err) {
      console.error("Send failed", err);
      setInputText(text); // Revert on failure
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user || !roomId) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      let blob = file;
      let type: 'image' | 'file' = 'file';

      if (file.type.startsWith('image/')) {
        blob = (await resizeImage(file)) as unknown as File;
        type = 'image';
      }

      const storageRef = ref(storage, `rooms/${roomId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed', 
        () => {}, 
        (error) => { setIsUploading(false); alert("Upload failed"); }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "rooms", roomId, "messages"), {
            text: "",
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            createdAt: serverTimestamp(),
            type,
            fileUrl: downloadURL,
            fileName: file.name
          });
          setIsUploading(false);
        }
      );

    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  // Paste handler for images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob && fileInputRef.current) {
                // Create a fake event to reuse handleFileUpload logic structure? 
                // Or just call logic directly. Logic is simpler directly.
                // For brevity in this specific constraint environment, let's skip complex paste handling logic duplication
                // and just alert users they can use the button, OR implement a quick one.
                // Let's try to support it, it's a nice touch.
                const fakeEvent = { target: { files: [blob] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileUpload(fakeEvent);
            }
        }
    }
  };

  if (!currentRoom) {
    return (
      <div className={`flex-1 flex items-center justify-center flex-col gap-4 ${theme.bg} ${theme.text} opacity-80`}>
        <div className="text-6xl opacity-20">#</div>
        <p className="text-xl">Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <div className={`h-14 border-b ${theme.border} flex items-center px-4 justify-between shadow-sm z-10`}>
        <div>
           <h1 className="font-bold flex items-center gap-2">
             <Hash size={18} className="opacity-50" /> {currentRoom.name}
           </h1>
           <span className="text-xs opacity-60">Code: {currentRoom.id}</span>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
           {/* Simple member count visual fallback if we don't fetch full member list in real-time for header */}
           <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white ring-2 ring-white">
             {currentRoom.memberIds.length}
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" onPaste={handlePaste}>
        {messages.map((msg, idx) => {
           const isSelf = msg.senderId === user?.uid;
           const showHeader = idx === 0 || messages[idx-1].senderId !== msg.senderId || (msg.createdAt?.toMillis() - messages[idx-1].createdAt?.toMillis() > 300000);

           return (
             <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
               {showHeader && (
                 <div className={`flex items-center gap-2 mb-1 mt-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.senderPhoto ? (
                      <img src={msg.senderPhoto} className="w-6 h-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold">
                        {msg.senderName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`text-xs font-bold opacity-70`}>{msg.senderName}</span>
                    <span className="text-[10px] opacity-40">{msg.createdAt ? formatTime(msg.createdAt.toDate()) : '...'}</span>
                 </div>
               )}
               
               <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${isSelf ? theme.bubbleSelf : theme.bubbleOther}`}>
                 {msg.type === 'text' && <p className="break-words whitespace-pre-wrap">{msg.text}</p>}
                 
                 {msg.type === 'image' && (
                   <div className="rounded-lg overflow-hidden my-1">
                     <img src={msg.fileUrl} alt="Attachment" className="max-w-full max-h-[400px] object-contain" loading="lazy" />
                   </div>
                 )}

                 {msg.type === 'file' && (
                   <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 bg-black/10 rounded hover:bg-black/20 transition">
                     <div className="p-2 bg-white/20 rounded"><Download size={16} /></div>
                     <div className="flex-1 min-w-0">
                       <div className="truncate font-medium text-sm">{msg.fileName}</div>
                       <div className="text-xs opacity-70">Attachment</div>
                     </div>
                   </a>
                 )}
               </div>
             </div>
           );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`p-4 ${theme.bg} border-t ${theme.border}`}>
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-full transition ${theme.hover} opacity-70 hover:opacity-100`}
            disabled={isUploading}
          >
            {isUploading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Paperclip size={20} />}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${currentRoom.name}`}
            className={`flex-1 py-3 px-4 rounded-full outline-none shadow-inner transition ${theme.input}`}
          />
          
          <button 
            type="submit" 
            disabled={!inputText.trim() && !isUploading}
            className={`p-3 rounded-full transition ${
               inputText.trim() ? theme.bubbleSelf : 'opacity-50 cursor-not-allowed bg-gray-700'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
