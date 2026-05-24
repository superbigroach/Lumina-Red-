import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, Building2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import {
  onConversations, onMessages, sendMessage, onBusinessConversations, onBusinesses,
  Conversation, ChatMessage, Business,
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

type InboxMode = 'personal' | string; // string = businessId

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [inboxMode, setInboxMode] = useState<InboxMode>('personal');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to user's owned businesses
  useEffect(() => {
    if (!user) return;
    const unsubBiz = onBusinesses((all) =>
      setMyBusinesses(all.filter((b) => b.founderId === user.uid))
    );
    return unsubBiz;
  }, [user]);

  // Subscribe to conversations based on inbox mode
  useEffect(() => {
    if (!user) return;
    setConversations([]); // clear on mode change
    if (inboxMode === 'personal') {
      const unsub = onConversations(user.uid, (convos) =>
        setConversations(convos.filter((c) => !c.businessId))
      );
      return unsub;
    } else {
      const unsub = onBusinessConversations(inboxMode, setConversations);
      return unsub;
    }
  }, [user, inboxMode]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConvoId) {
      setMessages([]);
      return;
    }
    const unsub = onMessages(selectedConvoId, setMessages);
    return unsub;
  }, [selectedConvoId]);

  // Scroll to bottom when messages change
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

  const handleModeSwitch = (mode: InboxMode) => {
    setInboxMode(mode);
    setSelectedConvoId(null); // clear selection on mode switch
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

  // Get business name for current business inbox mode
  const activeBusiness =
    inboxMode !== 'personal'
      ? myBusinesses.find((b) => b.id === inboxMode)
      : null;

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

              {/* Inbox mode toggle — only shown when user owns businesses */}
              {myBusinesses.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleModeSwitch('personal')}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      inboxMode === 'personal'
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Personal
                  </button>
                  {myBusinesses.map((biz) => (
                    <button
                      key={biz.id}
                      onClick={() => handleModeSwitch(biz.id)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        inboxMode === biz.id
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate" style={{ maxWidth: '8rem' }}>
                        {biz.name.length > 12 ? biz.name.slice(0, 12) + '…' : biz.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

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
                  const otherAvatar =
                    other.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=0D9488&color=fff&size=100`;
                  const lastTime = convo.lastMessageAt?.toDate
                    ? convo.lastMessageAt.toDate()
                    : new Date();
                  const isSelected = convo.id === selectedConvoId;
                  const isBizConvo = !!convo.businessId;

                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvoId(convo.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        isSelected ? 'bg-terracotta-50' : ''
                      }`}
                    >
                      {/* Avatar with optional business badge */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherAvatar}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isBizConvo && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta-500 ring-2 ring-white">
                            <Building2 className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {other.name}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {timeAgo(lastTime)}
                          </span>
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
                    const otherAvatar =
                      other.photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name)}&background=0D9488&color=fff&size=100`;
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

                {/* Business inbox banner */}
                {inboxMode !== 'personal' && activeBusiness && (
                  <div className="flex items-center gap-2 border-t border-gray-100 bg-terracotta-50 px-4 py-2 text-xs text-terracotta-700">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      Business message for{' '}
                      <span className="font-semibold">{activeBusiness.name}</span>
                    </span>
                  </div>
                )}

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
                  Choose from your existing conversations or start a new one by visiting someone's
                  profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
