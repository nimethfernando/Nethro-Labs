import { useState, useEffect } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard({ token, onLogout }) {
  // --- Create Form State ---
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("NethroClient2026!");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectBudget, setProjectBudget] = useState("");

  // --- Management & UI State ---
  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Holds active project being edited
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

  // --- Handle Create Client + Project ---
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to provision workspace ecosystem.");
      }

      setMessage({
        type: "success",
        text: `Success! Account created for ${clientName}. Credentials and project workspace maps loaded.`,
      });

      // Clear form & refresh table
      setClientName("");
      setClientEmail("");
      setProjectName("");
      setProjectDesc("");
      setProjectBudget("");
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
        throw new Error(data.message || "Failed to update project.");
      }

      setMessage({ type: "success", text: "Project details updated successfully!" });
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
                placeholder="Detail high-throughput requirements..."
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

        {/* --- PROJECT MANAGEMENT TABLE --- */}
        <div className="admin-card" style={{ marginTop: "2rem" }}>
          <h2 className="admin-card-title">Active Project Architecture Clusters</h2>
          
          {fetchingProjects ? (
            <p>Loading projects database...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cluster Name</th>
                  <th>Client Name</th>
                  <th>Budget</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj._id}>
                    <td><strong>{proj.clusterName}</strong></td>
                    <td>{proj.client?.name || "Unassigned"}</td>
                    <td>${proj.budget?.toLocaleString()}</td>
                    <td>{proj.description?.substring(0, 40)}...</td>
                    <td>
                      <button 
                        className="admin-edit-btn" 
                        onClick={() => setEditingProject(proj)}
                      >
                        Edit Details
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ clusterName, description, budget });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Project Architecture</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label className="admin-label">Cluster Name</label>
            <input 
              className="admin-input" 
              value={clusterName} 
              onChange={(e) => setClusterName(e.target.value)} 
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
            <button type="submit" className="admin-submit-btn">Save Updates</button>
            <button type="button" className="admin-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}