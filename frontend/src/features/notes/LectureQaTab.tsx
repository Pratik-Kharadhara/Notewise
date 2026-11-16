import React, { useState } from 'react';
import { Send, Sparkles, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';
import type { ChatMessage, Recording } from '../../types/echonote';
import { api } from '../../services/index.js';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export function LectureQaTab({ recording }: { recording: Recording }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);

  const suggestions =
    recording.suggestedQuestions && recording.suggestedQuestions.length > 0
      ? recording.suggestedQuestions
      : [
          `What are the main takeaways from ${recording.title}?`,
          'Which key terms should I memorize for the exam?',
        ];

  const submitQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `q-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setLastFailedQuestion(null);

    try {
      const res = await api.askLectureQuestion(recording.id, trimmed);
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setLastFailedQuestion(trimmed);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          err instanceof Error
            ? err.message
            : 'Unable to answer right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(input);
  };

  return (
    <Card padding="none" className="overflow-hidden flex flex-col">
      {/* Grounding banner */}
      <div className="px-6 py-3.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center gap-2.5 text-xs font-medium text-indigo-800">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Grounded strictly in this lecture’s transcript and study notes — answers do
          not pull from unverified external sources.
        </span>
      </div>

      {/* Chat history */}
      <div className="p-6 space-y-5 min-h-[340px] max-h-[480px] overflow-y-auto bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="py-6 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Ask a question about this lecture
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Clarify definitions, formulas, or examples directly from the recording.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {suggestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => submitQuestion(q)}
                  className="text-left px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.error
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {msg.error ? <AlertCircle className="w-4 h-4" /> : 'AI'}
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.error
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>

              {msg.role === 'user' && <Avatar name={user.name} size="sm" tone="amber" />}
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-center gap-3" aria-live="polite">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:240ms]" />
              </span>
              Searching lecture transcript...
            </div>
          </div>
        )}

        {lastFailedQuestion && !sending && (
          <div className="flex justify-start pl-11">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => submitQuestion(lastFailedQuestion)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry last question
            </Button>
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a concept, formula, or example from this lecture..."
          aria-label="Ask a question about this lecture"
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
        <Button
          type="submit"
          disabled={!input.trim() || sending}
          loading={sending}
          icon={<Send className="w-4 h-4" />}
        >
          Ask
        </Button>
      </form>
    </Card>
  );
}
