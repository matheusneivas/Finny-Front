import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, getChatHistory } from '../services/chat';
import type { ChatMessage } from '../services/chat';
import './HomePage.css';

const SUGGESTIONS = [
  '💰 Quanto devo guardar por mês?',
  '📊 Como montar uma reserva de emergência?',
  '📈 Onde investir com pouco dinheiro?',
  '💳 Como sair das dívidas mais rápido?',
];

function OwlIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="36" rx="20" ry="22" fill="#1E88E5" />
      <ellipse cx="32" cy="20" rx="16" ry="14" fill="#1E88E5" />
      <ellipse cx="24" cy="20" rx="7" ry="7" fill="white" />
      <ellipse cx="40" cy="20" rx="7" ry="7" fill="white" />
      <ellipse cx="24" cy="20" rx="4" ry="4" fill="#1565C0" />
      <ellipse cx="40" cy="20" rx="4" ry="4" fill="#1565C0" />
      <ellipse cx="25" cy="19" rx="1.5" ry="1.5" fill="white" />
      <ellipse cx="41" cy="19" rx="1.5" ry="1.5" fill="white" />
      <polygon points="32,27 29,31 35,31" fill="#FB8C00" />
      <path d="M16 14 Q12 8 16 4 Q18 10 22 12" fill="#1565C0" />
      <path d="M48 14 Q52 8 48 4 Q46 10 42 12" fill="#1565C0" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row message-row--assistant">
      <div className="message-avatar"><OwlIcon size={28} /></div>
      <div className="message-bubble message-bubble--assistant typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function MessageItem({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}>
      {!isUser && <div className="message-avatar"><OwlIcon size={28} /></div>}
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}>
        <p className="message-text">{msg.content}</p>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const firstName = user?.name?.split(' ')[0] ?? 'usuário';

  useEffect(() => {
    getChatHistory()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    const userMsg: ChatMessage = { id: `tmp-${Date.now()}`, role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res = await sendMessage(content);
      setMessages((prev) => [...prev, { id: `tmp-${Date.now()}-r`, role: 'assistant', content: res.reply, createdAt: new Date().toISOString() }]);
    } catch {
      setMessages((prev) => [...prev, { id: `tmp-${Date.now()}-e`, role: 'assistant', content: 'Desculpe, tive um problema. Tente novamente.', createdAt: new Date().toISOString() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [sending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const isEmpty = !loadingHistory && messages.length === 0;

  return (
    <>
      <div className="chat-messages">
        {loadingHistory ? (
          <div className="chat-loading"><div className="chat-spinner" /></div>
        ) : isEmpty ? (
          <div className="chat-empty">
            <OwlIcon size={64} />
            <h2 className="chat-empty-title">Olá, {firstName}! 👋</h2>
            <p className="chat-empty-subtitle">Sou o Finny, seu assistente financeiro pessoal.<br />Como posso te ajudar hoje?</p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-btn" onClick={() => handleSend(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageItem key={msg.id} msg={msg} />)}
            {sending && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo sobre suas finanças..."
            rows={1}
            disabled={sending}
          />
          <button
            className={`chat-send-btn ${(!input.trim() || sending) ? 'chat-send-btn--disabled' : ''}`}
            onClick={() => handleSend(input)}
            disabled={!input.trim() || sending}
            aria-label="Enviar"
          >
            {sending ? <div className="send-spinner" /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        <p className="chat-input-hint">Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </>
  );
}
