import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { chatWithAssistant } from '../api/ai';
import { ApiError } from '../api/client';

const EXAMPLE_QUESTIONS = [
  'Айлық бюджетті қалай жоспарлау керек?',
  'Жинақ қорын қалай бастауға болады?',
  'Несиені тезірек жабу үшін не істеу керек?',
  'Шығыстарымды қалай азайтуға болады?',
  'Төтенше жағдай қорын қалай құру керек?',
];

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `msg-${uidCounter}`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const historyForApi = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { _uid: nextUid(), role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const result = await chatWithAssistant(trimmed, historyForApi);
      setMessages((prev) => [
        ...prev,
        { _uid: nextUid(), role: 'assistant', text: result.reply },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.body?.message || err.message
          : 'Күтпеген қате пайда болды. Қайталап көріңіз.';
      setMessages((prev) => [
        ...prev,
        { _uid: nextUid(), role: 'assistant', text: message, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="content content--fade">
      <div className="panel chat-panel">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Bot size={32} strokeWidth={1.5} />
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              Қаржылық ИИ-көмекші
            </h2>
            <p className="hint">
              Тек жеке қаржы тақырыбында сұрақ қойыңыз — бюджет, үнемдеу, қарыз,
              жинақ мақсаттары. Мысалдардан бастаңыз:
            </p>
            <div className="chat-examples chat-examples--grid">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chat-example-chip"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="chat-messages" ref={listRef}>
              {messages.map((m) => (
                <div key={m._uid} className={`chat-bubble chat-bubble--${m.role}`}>
                  <span className="chat-bubble__icon">
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </span>
                  <span className="chat-bubble__text">{m.text}</span>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                  <span className="chat-bubble__icon">
                    <Bot size={14} />
                  </span>
                  <span className="chat-bubble__text">Жазып жатыр…</span>
                </div>
              )}
            </div>

            <div className="chat-examples">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chat-example-chip"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </>
        )}

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Қаржы туралы сұрағыңызды жазыңыз..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className={`btn btn--primary${loading ? ' btn--loading' : ''}`}
            disabled={loading || !input.trim()}
            aria-label="Жіберу"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="hint" style={{ marginTop: 8 }}>
          Көмекші тек қаржы тақырыбындағы сұрақтарға жауап береді.
        </p>
      </div>
    </div>
  );
}
