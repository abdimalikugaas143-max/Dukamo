import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import type { Message } from '@/types';

export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Message | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(() => {
    apiGet<Message[]>('/api/messages')
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  function openConversation(conv: Message) {
    setActiveConv(conv);
    apiGet<Message[]>(`/api/messages/conversation/${conv.other_user_id}`)
      .then(msgs => {
        setThread(msgs);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        loadConversations(); // refresh unread counts
      });
  }

  async function sendMessage() {
    if (!text.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const msg = await apiPost<Message>('/api/messages', {
        recipient_id: activeConv.other_user_id,
        content: text.trim(),
      });
      setThread(t => [...t, { ...msg, sender_name: user?.name }]);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      // silent fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Chat with employers and workers</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ minHeight: 480 }}>
        <div className="flex h-[520px]">
          {/* Conversations list */}
          <div className={`w-full lg:w-72 border-r border-slate-200 flex flex-col ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Conversations</p>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
                <MessageSquare size={32} className="text-slate-300" />
                <p className="text-slate-400 text-sm">No conversations yet</p>
                <p className="text-slate-400 text-xs">Start by messaging a worker or employer from a job or gig page.</p>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {conversations.map(conv => (
                  <li
                    key={conv.other_user_id}
                    onClick={() => openConversation(conv)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeConv?.other_user_id === conv.other_user_id ? 'bg-emerald-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700 truncate">{conv.other_user_name}</p>
                          {Number(conv.unread_count) > 0 && (
                            <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{conv.content}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Message thread */}
          <div className={`flex-1 flex flex-col ${activeConv ? 'flex' : 'hidden lg:flex'}`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                <MessageSquare size={40} className="text-slate-200" />
                <p className="text-slate-400 text-sm">Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button onClick={() => setActiveConv(null)} className="lg:hidden text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User size={15} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{activeConv.other_user_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{activeConv.other_user_role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {thread.map(msg => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-emerald-200' : 'text-slate-400'}`}>{formatDate(msg.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim() || sending}
                    className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
