import { useState, useEffect } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard({ token, onLogout }) {
  // --- Provision Form State ---
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("NethroClient2026!");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  
  // Web Dev Specific Provisioning Fields
  const [stagingUrl, setStagingUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [status, setStatus] = useState("Requirement Analysis");
  const [progress, setProgress] = useState(0);

  // --- Management & UI State ---
  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- Fetch Projects List ---
  const fetchProjects = async () => {
    setFetchingProjects(true);
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(Array.isArray(data) ? data : data.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setFetchingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Handle Create Client + Website Project ---
  const handleCreateClientAndProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          password: tempPassword,
          clusterName: projectName,
          description: projectDesc,
          budget: projectBudget,
          stagingUrl,
          liveUrl,
          status,
          progress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to provision website workspace.");
      }

      setMessage({
        type: "success",
        text: `Success! Account created for ${clientName}. Web development environment initialized.`,
      });

      // Reset form & refresh list
      setClientName("");
      setClientEmail("");
      setProjectName("");
      setProjectDesc("");
      setProjectBudget("");
      setStagingUrl("");
      setLiveUrl("");
      setStatus("Requirement Analysis");
      setProgress(0);
      fetchProjects();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Update Project ---
  const handleUpdateProject = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${editingProject._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update website metrics.");
      }

      setMessage({ type: "success", text: "Website status and deployment links updated!" });
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      alert(`Update Error: ${err.message}`);
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
        {/* --- PROVISION FORM CARD --- */}
        <div className="admin-card">
          <h2 className="admin-card-title">Provision Client Web Project</h2>
          <p className="admin-card-sub">Generate accounts, attach build targets, and assign preview deployment gateways.</p>

          {message.text && (
            <div className={`admin-alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateClientAndProject} className="admin-form">
            <div className="form-section-divider">Client Credentials</div>
            
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
                placeholder="contact@acme.com"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Temporary Shared Password</label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="admin-input"
                required
              />
              <span className="admin-input-hint">The client will be systematically prompted to change this on initial authentication.</span>
            </div>

            <div className="form-section-divider">Website Architecture & Deployment Setup</div>

            <div className="admin-input-group">
              <label className="admin-label">Website Name / Project Cluster</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="admin-input"
                placeholder="Acme Corporate Portal V2"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Operational Specifications (Description)</label>
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="admin-input admin-textarea"
                placeholder="Detail high-level requirements (React, Node, E-commerce, etc.)..."
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
                placeholder="1500"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Staging Preview Link (Optional)</label>
              <input
                type="url"
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                className="admin-input"
                placeholder="https://staging.acmecorp.com"
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Live Website URL (Optional)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="admin-input"
                placeholder="https://acmecorp.com"
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Initial Build Phase</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="admin-input"
              >
                <option value="Requirement Analysis">Requirement Analysis</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="In Development">In Development</option>
                <option value="QA & Testing">QA & Testing</option>
                <option value="Deployed / Live">Deployed / Live</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? "Initializing Website Instance..." : "Deploy Client Workspace Profile"}
            </button>
          </form>
        </div>

        {/* --- PROJECT MANAGEMENT TABLE --- */}
        <div className="admin-card" style={{ marginTop: "2rem" }}>
          <h2 className="admin-card-title">Active Website Projects</h2>
          
          {fetchingProjects ? (
            <p>Loading projects database...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Website Title</th>
                  <th>Client</th>
                  <th>Status & Progress</th>
                  <th>Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj._id}>
                    <td><strong>{proj.clusterName}</strong></td>
                    <td>{proj.client?.name || "Unassigned"}</td>
                    <td>
                      <span style={{ color: "#00d4ff", fontWeight: 600 }}>{proj.status || "In Development"}</span>
                      <br />
                      <small style={{ color: "#9ca3af" }}>{proj.progress || 0}% Completed</small>
                    </td>
                    <td>
                      {proj.stagingUrl && (
                        <a href={proj.stagingUrl} target="_blank" rel="noreferrer" style={{ color: "#00d4ff", marginRight: "8px", fontSize: "12px" }}>
                          Staging ↗
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#10b981", fontSize: "12px" }}>
                          Live ↗
                        </a>
                      )}
                      {!proj.stagingUrl && !proj.liveUrl && <span style={{ color: "#6b7280", fontSize: "12px" }}>None</span>}
                    </td>
                    <td>
                      <button 
                        className="admin-edit-btn" 
                        onClick={() => setEditingProject(proj)}
                      >
                        Edit / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* --- EDIT MODAL COMPONENT --- */}
      {editingProject && (
        <EditModal 
          project={editingProject} 
          onSave={handleUpdateProject} 
          onClose={() => setEditingProject(null)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: EDIT MODAL ---
function EditModal({ project, onSave, onClose }) {
  const [clusterName, setClusterName] = useState(project.clusterName || "");
  const [description, setDescription] = useState(project.description || "");
  const [budget, setBudget] = useState(project.budget || 0);
  const [stagingUrl, setStagingUrl] = useState(project.stagingUrl || "");
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || "");
  const [status, setStatus] = useState(project.status || "In Development");
  const [progress, setProgress] = useState(project.progress || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ clusterName, description, budget, stagingUrl, liveUrl, status, progress });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Website Details & Progress</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label className="admin-label">Website Title</label>
            <input 
              className="admin-input" 
              value={clusterName} 
              onChange={(e) => setClusterName(e.target.value)} 
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Staging Preview Link</label>
            <input 
              type="url"
              className="admin-input" 
              placeholder="https://staging.clientwebsite.com"
              value={stagingUrl} 
              onChange={(e) => setStagingUrl(e.target.value)} 
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Production Live Link</label>
            <input 
              type="url"
              className="admin-input" 
              placeholder="https://clientwebsite.com"
              value={liveUrl} 
              onChange={(e) => setLiveUrl(e.target.value)} 
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Development Phase</label>
            <select 
              className="admin-input" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Requirement Analysis">Requirement Analysis</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="In Development">In Development</option>
              <option value="QA & Testing">QA & Testing</option>
              <option value="Deployed / Live">Deployed / Live</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Completion Progress ({progress}%)</label>
            <input 
              type="range"
              min="0"
              max="100"
              className="admin-input" 
              value={progress} 
              onChange={(e) => setProgress(e.target.value)} 
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Operational Specifications</label>
            <textarea 
              className="admin-input admin-textarea" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Allocated Budget (USD)</label>
            <input 
              type="number" 
              className="admin-input" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="admin-submit-btn">Save Deployment Updates</button>
            <button type="button" className="admin-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}