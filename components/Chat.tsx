import React, { useEffect, useState, useRef } from 'react';
import { User, subscribeToChat, sendMessage } from '../services/firebase';
import { ChatMessage } from '../types';
import { Send, Users, Leaf, MapPin } from 'lucide-react';

interface ChatProps {
  user: User;
}

const CHANNELS = [
  { id: 'veg_growers', name: 'Veg Growers', icon: <Leaf className="w-4 h-4" /> },
  { id: 'flower_fans', name: 'Flower Fans', icon: <Users className="w-4 h-4" /> },
  { id: 'local_swap', name: 'Local Swap', icon: <MapPin className="w-4 h-4" /> },
];

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToChat(activeChannel, (msgs) => {
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [activeChannel]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    await sendMessage(activeChannel, inputText, user);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white">
      {/* Channels Header */}
      <div className="px-4 pt-6 pb-2 border-b border-sage-100">
        <h2 className="text-xl font-serif font-bold text-sage-900 mb-4">Garden Clubs</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeChannel === channel.id 
                  ? 'bg-terra-500 text-white shadow-md' 
                  : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
              }`}
            >
              <span className="mr-2">{channel.icon}</span>
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-sage-50/30">
        {messages.map((msg) => {
          const isMe = msg.userId === user.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                {!isMe && (
                   <div className="flex items-baseline gap-2 mb-1 ml-1">
                      <span className="text-xs font-bold text-sage-700">{msg.userName}</span>
                      <span className="text-[10px] text-sage-400 bg-sage-100 px-1.5 rounded-md">{msg.userLevel}</span>
                   </div>
                )}
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-terra-500 text-white rounded-tr-none' 
                    : 'bg-white text-sage-800 border border-sage-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-sage-300 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-sage-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${activeChannel}...`}
            className="flex-grow bg-sage-50 border border-sage-200 text-sage-900 rounded-full px-4 py-3 focus:outline-none focus:border-terra-400 focus:ring-1 focus:ring-terra-400 transition-all"
          />
          <button 
            type="submit"
            className="bg-sage-800 text-white p-3 rounded-full hover:bg-sage-900 transition-colors shadow-md disabled:opacity-50"
            disabled={!inputText.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;