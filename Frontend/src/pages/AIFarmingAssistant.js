import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Cpu,
  Trash2,
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import "../styles/AIFarmingAssistant.css";

function AIFarmingAssistant() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Conversation States
  const [conversationId, setConversationId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sidebar History States
  const [sessions, setSessions] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Suggested Prompts
  const suggestions = [
    "What crop should I plant in Clay soil?",
    "How to organically treat Tomato Late Blight?",
    "Best fertilizer schedule for growing Rice?",
    "Explain drip vs sprinkler irrigation methods.",
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingHistory(true);
      const res = await axios.get("http://localhost:5000/assistant/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        setSessions(res.data.data.conversations || {});
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadSession = (id, sessionMessages) => {
    setConversationId(id);
    // Format the messages from backend: sort them ascending by date
    const sorted = [...sessionMessages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Convert backend schema to chat bubbles
    const formatted = [];
    sorted.forEach((item) => {
      formatted.push({ sender: "user", text: item.question, id: item._id });
      formatted.push({ 
        sender: "assistant", 
        text: item.answer, 
        id: `${item._id}-ans`,
        historyId: item._id,
        helpfulness: item.helpfulness 
      });
    });
    setMessages(formatted);
  };

  const startNewChat = () => {
    setConversationId("");
    setMessages([]);
    setQuestion("");
  };

  const askQuestion = async (selectedPrompt) => {
    const queryText = selectedPrompt || question;
    if (!queryText.trim()) return;

    // Append user question
    const userMsg = { sender: "user", text: queryText, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/assistant/ask",
        {
          question: queryText,
          conversationId: conversationId || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.success) {
        const payload = res.data.data;
        if (!conversationId) {
          setConversationId(payload.conversationId);
        }

        const botMsg = {
          sender: "assistant",
          text: payload.answer,
          id: Date.now().toString() + "-ans",
          historyId: payload.historyId,
          helpfulness: 0,
        };
        setMessages((prev) => [...prev, botMsg]);
        fetchHistory(); // Refresh sidebar sessions
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = {
        sender: "assistant",
        text: "Sorry, I am facing connectivity issues with my core AI engine. Please retry in a few moments.",
        id: Date.now().toString() + "-err",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      askQuestion();
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation session?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/assistant/conversation/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHistory();
      if (conversationId === sessionId) {
        startNewChat();
      }
    } catch (error) {
      console.error("Delete session error:", error);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Clear all conversations from database? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/assistant/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions({});
      startNewChat();
    } catch (error) {
      console.error("Clear all history error:", error);
    }
  };

  const submitFeedback = async (historyId, score, msgIdx) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/assistant/feedback",
        {
          conversationHistoryId: historyId,
          helpfulness: score,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local message score
      const updated = [...messages];
      updated[msgIdx].helpfulness = score;
      setMessages(updated);
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  // Safe RegEx-based Simple Markdown parser
  const parseMarkdown = (text) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
    html = html.replace(/^\s*\*\s+(.*$)/gim, "<li>$1</li>");

    // Consecutive <li> grouped in <ul>
    // A simple browser fallback is to let <li> run in normal text but wrapping is cleaner
    
    // Newlines
    html = html.replace(/\n/g, "<br />");

    return { __html: html };
  };

  return (
    <div className="assistant-page-container">
      {/* Sidebar: Conversation Sessions */}
      <div className="assistant-sidebar">
        <div className="sidebar-header">
          <h3>
            <MessageSquare /> History
          </h3>
          <button className="clear-history-btn" onClick={clearAllHistory} title="Clear all history">
            <Trash2 size={16} />
          </button>
        </div>

        <button className="action-btn-nav" style={{ margin: "1rem", width: "calc(100% - 2rem)" }} onClick={startNewChat}>
          <Plus size={16} /> New Advisory Chat
        </button>

        <div className="sidebar-history-list">
          {loadingHistory ? (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#666" }}>Loading logs...</p>
          ) : Object.keys(sessions).length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#999", fontStyle: "italic" }}>
              No past sessions
            </p>
          ) : (
            Object.keys(sessions).map((sessId) => {
              const lastMsg = sessions[sessId][0];
              return (
                <div
                  key={sessId}
                  className={`history-session-item ${conversationId === sessId ? "active" : ""}`}
                  onClick={() => loadSession(sessId, sessions[sessId])}
                >
                  <div className="session-info">
                    <span className="session-title">{lastMsg.question}</span>
                    <span className="session-date">
                      {new Date(lastMsg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="delete-session-btn" onClick={(e) => deleteSession(e, sessId)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Chat Conversation */}
      <div className="assistant-chat-panel">
        <div className="chat-panel-header">
          <h2>
            <Cpu /> Smart Agronomy Assistant
          </h2>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Back
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message-panel">
              <span className="welcome-icon">🤖</span>
              <h2>Indian Farm Advisory Engine</h2>
              <p style={{ maxWidth: "500px", lineHeight: "1.6" }}>
                Ask me questions about crop selection, fertilizer scheduling, soil diagnostics, irrigation techniques, and organic remedies. I speak English, Kannada, Hindi, Telugu, Tamil, Malayalam, and Marathi!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="chat-bubble">
                  {msg.sender === "user" ? (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  ) : (
                    <div>
                      <div dangerouslySetInnerHTML={parseMarkdown(msg.text)} />
                      {msg.historyId && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px", justifyContent: "flex-end", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "6px" }}>
                          <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: msg.helpfulness === 1 ? "#2ecc71" : "#888" }}
                            onClick={() => submitFeedback(msg.historyId, 1, index)}
                            title="Helpful"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: msg.helpfulness === -1 ? "#e74c3c" : "#888" }}
                            onClick={() => submitFeedback(msg.historyId, -1, index)}
                            title="Not Helpful"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-bubble-wrapper assistant">
              <div className="chat-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 0 && (
          <div className="suggestion-chips-container">
            {suggestions.map((s, idx) => (
              <button key={idx} className="suggestion-chip" onClick={() => askQuestion(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Panel */}
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type farming query..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button className="chat-send-btn" onClick={() => askQuestion()} disabled={loading || !question.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIFarmingAssistant;
