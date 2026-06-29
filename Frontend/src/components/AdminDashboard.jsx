import { useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard({ token, onLogout }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("NethroClient2026!"); // Default placeholder template
  
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectBudget, setProjectBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleCreateClientAndProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Step 1: Create Client Account with forced password update flag
      const clientResponse = await fetch("http://localhost:5000/api/admin/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          password: tempPassword,
          role: "client",
        }),
      });

      const clientData = await clientResponse.json();

      if (!clientResponse.ok) {
        throw new Error(clientData.message || "Failed to establish client account infrastructure.");
      }

      // Step 2: Associate and provision Project Matrix linked to the created client ID
      const projectResponse = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDesc,
          budget: projectBudget,
          clientId: clientData.user.id, // Links directly to new MongoDB account reference
        }),
      });

      const projectData = await projectResponse.json();

      if (!projectResponse.ok) {
        throw new Error(projectData.message || "Client profile created, but project assignment failed.");
      }

      setMessage({
        type: "success",
        text: `Success! Account created for ${clientName}. Credentials and project workspace maps loaded.`,
      });

      // Clear input fields on successful generation
      setClientName("");
      setClientEmail("");
      setProjectName("");
      setProjectDesc("");
      setProjectBudget("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <span className="admin-brand">Nethro<span className="admin-dot">.</span>Labs</span>
          <span className="admin-badge">Admin Terminal</span>
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>Terminate Console Session</button>
      </header>

      <main className="admin-main">
        <div className="admin-card">
          <h2 className="admin-card-title">Provision New Client Environment</h2>
          <p className="admin-card-sub">Generate encrypted accounts and attach target architecture metrics.</p>

          {message.text && (
            <div className={`admin-alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateClientAndProject} className="admin-form">
            <div className="form-section-divider">Profile Specifications</div>
            
            <div className="admin-input-group">
              <label className="admin-label">Client / Organization Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="admin-input"
                placeholder="Acme Corp International"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Corporate Email Gateway</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="admin-input"
                placeholder="pointofcontact@acme.com"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Temporary Shared Access Password</label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="admin-input"
                placeholder="Temporary login token"
                required
              />
              <span className="admin-input-hint">The client will be systematically forced to change this password during their first terminal initialization.</span>
            </div>

            <div className="form-section-divider">Architecture & Project Mapping</div>

            <div className="admin-input-group">
              <label className="admin-label">Project Cluster Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="admin-input"
                placeholder="Walled Core Neural Infrastructure"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Operational Specifications (Description)</label>
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="admin-input admin-textarea"
                placeholder="Detail high-throughput requirements, deep learning model objectives, and pipeline scopes..."
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Allocated Budget (USD)</label>
              <input
                type="number"
                value={projectBudget}
                onChange={(e) => setProjectBudget(e.target.value)}
                className="admin-input"
                placeholder="75000"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? "Compiling Node Parameters..." : "Deploy Workspace Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}