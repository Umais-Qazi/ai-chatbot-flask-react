import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything. 🤖" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, { message: text });
      const reply = res.data?.reply || "No reply";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setMessages((m) => [...m, { role: "assistant", content: "Error: " + msg }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>AI Chatbot</h1>
      <p style={{ color: "#666", marginTop: -6 }}>Flask + React + OpenAI • Local demo</p>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "12px 0" }}>
            <div style={{ fontSize: 12, color: "#888" }}>{m.role === "user" ? "You" : "Assistant"}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#888" }}>Thinking…</div>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Type your message and press Enter…"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "0 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
