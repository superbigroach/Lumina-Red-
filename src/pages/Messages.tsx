import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  onConversations, onMessages, sendMessage,
  Conversation, ChatMessage,
} from '../lib/firestore';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onConversations(user.uid, setConversations);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!selectedConvoId) {
      setMessages([]);
      return;
    }
    const unsub = onMessages(selectedConvoId, setMessages);
    return unsub;
  }, [selectedConvoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvoId) return;
    setSending(true);
    try {
      await sendMessage(selectedConvoId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);

  const getOtherParticipant = (convo: Conversation) => {
    if (!user) return { name: '', photo: '' };
    const otherUid = convo.participants.find((p) => p !== user.uid) || '';
    return {
      name: convo.participantNames?.[otherUid] || 'Unknown',
      photo: convo.participantPhotos?.[otherUid] || '',
    };
  };

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) => {
        const other = getOtherParticipant(c);
        return other.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  // Mobile: show conversation list or thread
  const showThread = selectedConvoId !== null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div
            className={`flex flex-col border-r border-gray-100 ${
              showThread ? 'hidden md:flex' : 'flex'
            } w-full md:w-80 lg:w-96`}
          >
            {/* Header */}
            <div className="border-b border-gray-100 p-4">
              <h2 className="font-display text-lg font-semibold text-gray-900">Mensajes</h2>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm font-medium text-gray-900">No conversations yet</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Start a conversation by visiting someone's profile
                  </p>
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const other = getOtherParticipant(convo);
                  const otherAvatar = other.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=0D9488&color=fff&size=100`;
                  const lastTime = convo.lastMessageAt?.toDate ? convo.lastMessageAt.toDate() : new Date();
                  const isSelected = convo.id === selectedConvoId;

                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvoId(convo.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        isSelected ? 'bg-terracotta-50' : ''
                      }`}
                    >
                      <img
                        src={otherAvatar}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-gray-900">{other.name}</p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(lastTime)}</span>
                        </div>
                        <p className="truncate text-xs text-gray-500 mt-0.5">
                          {convo.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Message thread */}
          <div
            className={`flex flex-1 flex-col ${
              showThread ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedConvo ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <button
                    onClick={() => setSelectedConvoId(null)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {(() => {
                    const other = getOtherParticipant(selectedConvo);
                    const otherAvatar = other.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=0D9488&color=fff&size=100`;
                    return (
                      <>
                        <img
                          src={otherAvatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{other.name}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-8">
                      Start the conversation!
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    const msgTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? 'bg-terracotta-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`mt-1 text-xs ${
                              isMe ? 'text-terracotta-200' : 'text-gray-400'
                            }`}
                          >
                            {timeAgo(msgTime)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-terracotta-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta-500 text-white transition-colors hover:bg-terracotta-600 disabled:opacity-40"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-gray-900">
                  Select a conversation
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Choose from your existing conversations or start a new one by visiting someone's profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
