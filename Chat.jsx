import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Menu, Sparkles, Sun, Moon } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

const WELCOME = "Hi! I'm **Noor AI**. Ask me anything — I can chat, write code, analyze files, and more. How can I help you today?";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId);
  const messages = active?.messages || [];

  const safeList = async () => {
    try {
      return await base44.entities.Conversation.list("-updated_date", 100);
    } catch (e) {
      return [];
    }
  };

  const loadConversations = useCallback(async () => {
    const list = await safeList();
    setConversations(list);
    if (list.length && !activeId) setActiveId(list[0].id);
  }, [activeId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, thinking]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  const createConversation = async () => {
    const temp = {
      id: `local_${Date.now()}`,
      title: "New Chat",
      messages: [{ role: "assistant", content: WELCOME, created_at: new Date().toISOString() }],
    };
    setConversations((prev) => [temp, ...prev]);
    setActiveId(temp.id);
    setSidebarOpen(false);
    try {
      const created = await base44.entities.Conversation.create({ title: "New Chat", messages: temp.messages });
      setConversations((prev) => prev.map((c) => (c.id === temp.id ? created : c)));
      setActiveId(created.id);
    } catch (e) {
      // keep local conversation
    }
  };

  const deleteConversation = async (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining[0]?.id || null);
    }
    if (!String(id).startsWith("local_")) {
      try { await base44.entities.Conversation.delete(id); } catch (e) {}
    }
  };

  const renameConversation = async (id, title) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    if (!String(id).startsWith("local_")) {
      try { await base44.entities.Conversation.update(id, { title }); } catch (e) {}
    }
  };

  const updateMessages = (id, msgs) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages: msgs } : c)));
  };

  const persistMessages = async (id, msgs, title) => {
    if (String(id).startsWith("local_")) return;
    const payload = { messages: msgs };
    if (title) payload.title = title;
    try { await base44.entities.Conversation.update(id, payload); } catch (e) {}
  };

  const generateReply = async (history, fileUrl) => {
    const promptHistory = history
      .filter((m) => m.content !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }))
      .concat(
        fileUrl
          ? [{ role: "user", content: "Please analyze the attached file." }]
          : []
      );

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Noor AI, a helpful, knowledgeable, and friendly assistant. Respond in clear markdown. Use code blocks with language tags when sharing code.\n\nConversation so far:\n${
        promptHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
      }\n\nAssistant:`,
      file_urls: fileUrl ? [fileUrl] : null,
    });
    return typeof result === "string" ? result : result?.response || result?.output || JSON.stringify(result);
  };

  const send = async (text, attachment) => {
    let conv = active;
    if (!conv) {
      conv = {
        id: `local_${Date.now()}`,
        title: text.slice(0, 40),
        messages: [],
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      try {
        const created = await base44.entities.Conversation.create({ title: conv.title, messages: [] });
        setConversations((prev) => prev.map((c) => (c.id === conv.id ? created : c)));
        conv = created;
        setActiveId(created.id);
      } catch (e) {
        // keep local
      }
    }

    const userMsg = { role: "user", content: text, created_at: new Date().toISOString() };
    const assistantPlaceholder = { role: "assistant", content: "", created_at: new Date().toISOString() };
    const newMessages = [...conv.messages.filter((m) => m.content !== WELCOME), userMsg, assistantPlaceholder];
    updateMessages(conv.id, newMessages);

    const newTitle = conv.title === "New Chat" || conv.messages.length <= 1 ? text.slice(0, 40) : conv.title;
    setThinking(true);
    setLoading(true);
    try {
      const reply = await generateReply(newMessages.slice(0, -1), attachment?.url);
      const final = [...newMessages.slice(0, -1), { ...assistantPlaceholder, content: reply }];
      updateMessages(conv.id, final);
      persistMessages(conv.id, final, newTitle);
      setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, title: newTitle } : c)));
    } catch (e) {
      const errContent = "⚠️ Sorry, I couldn't generate a response. Please try again.";
      const final = [...newMessages.slice(0, -1), { ...assistantPlaceholder, content: errContent }];
      updateMessages(conv.id, final);
    } finally {
      setThinking(false);
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!active) return;
    const msgs = active.messages;
    const lastUserIndex = [...msgs].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;
    const cutIndex = msgs.length - 1 - lastUserIndex;
    const history = msgs.slice(0, cutIndex + 1);
    const placeholder = { role: "assistant", content: "", created_at: new Date().toISOString() };
    const newMessages = [...history, placeholder];
    updateMessages(active.id, newMessages);
    setThinking(true);
    setLoading(true);
    try {
      const reply = await generateReply(history);
      const final = [...history, { ...placeholder, content: reply }];
      updateMessages(active.id, final);
      persistMessages(active.id, final);
    } catch (e) {
      const final = [...history, { ...placeholder, content: "⚠️ Sorry, I couldn't generate a response." }];
      updateMessages(active.id, final);
    } finally {
      setThinking(false);
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    } catch (e) {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onNew={createConversation}
        onDelete={deleteConversation}
        onRename={renameConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 glass">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold truncate">
              {active?.title || "Noor AI Chat"}
            </h1>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors" title="Toggle theme">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <EmptyState onNew={createConversation} />
          ) : (
            <div className="max-w-3xl mx-auto pb-6">
              {messages.map((m, i) => (
                <ChatMessage
                  key={i}
                  message={m}
                  isLast={i === messages.length - 1 && m.role === "assistant"}
                  onRegenerate={regenerate}
                  loading={thinking && i === messages.length - 1 && m.role === "assistant"}
                />
              ))}
            </div>
          )}
        </div>

        <ChatInput onSend={send} onUpload={handleUpload} uploading={uploading} disabled={loading} />
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  const suggestions = [
    { title: "Write code", text: "Build a React timer component", icon: "⌨️" },
    { title: "Get creative", text: "Write a short story about space", icon: "✨" },
    { title: "Analyze", text: "Explain quantum computing simply", icon: "🔬" },
    { title: "Translate", text: "Translate 'hello' to 10 languages", icon: "🌍" },
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center px-5 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center glow mb-6 animate-float">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground mb-8 text-sm">Start a conversation or try one of these:</p>
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={onNew}
            className="glass rounded-2xl p-4 text-left hover:bg-white/5 hover:-translate-y-0.5 transition-all"
          >
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-sm font-semibold">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
