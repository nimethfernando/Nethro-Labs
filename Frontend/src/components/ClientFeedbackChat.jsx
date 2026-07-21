import React, { useState, useEffect } from "react";

export default function ClientFeedbackChat({ project, token, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    }
  };

  useEffect(() => {
    if (project?._id) fetchMessages();
  }, [project]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${project._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages(); // Refresh conversation
      }
    } catch (err) {
      console.error("Message send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card">
      {/* Website Live Links Header */}
      <h2 className="admin-card-title">{project.clusterName}</h2>
      <p className="admin-card-sub">Current Phase: <strong>{project.status}</strong> ({project.progress}%)</p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {project.stagingUrl ? (
          <a href={project.stagingUrl} target="_blank" rel="noreferrer" className="admin-edit-btn">
            🌐 Open Staging Preview
          </a>
        ) : (
          <span style={{ color: "#6b7280", fontSize: "13px" }}>Staging URL pending...</span>
        )}

        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="admin-submit-btn" style={{ padding: "6px 14px", width: "auto", marginTop: 0 }}>
            🚀 Open Live Production Site
          </a>
        )}
      </div>

      <div className="form-section-divider">Website Feedback & Iteration Hub</div>

      {/* Chat Messages Feed */}
      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg) => {
          const isMe = msg.sender._id === currentUser._id;
          return (
            <div 
              key={msg._id} 
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "rgba(0, 212, 255, 0.15)" : "#1f2937",
                border: `1px solid ${isMe ? "#00d4ff" : "#374151"}`,
                borderRadius: "8px",
                padding: "10px 14px",
                maxWidth: "75%",
              }}
            >
              <div style={{ fontSize: "11px", color: "#00d4ff", marginBottom: "4px" }}>
                {msg.sender.name} ({msg.sender.role})
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>{msg.message}</p>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="admin-input"
          placeholder="Type your feedback or web change request..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={loading} className="admin-edit-btn" style={{ whiteSpace: "nowrap" }}>
          Send Feedback
        </button>
      </form>
    </div>
  );
}