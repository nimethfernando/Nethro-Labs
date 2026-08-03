import { useState, useEffect } from "react";
import "./ClientDashboard.css";

export default function ClientDashboard({ token, onLogout, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch client-specific operations data once authenticated
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/client/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load workspace parameters.");
        }

        // Adjust this depending on what your backend 'api/client/' route returns
        setTickets(data.tickets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchClientData();
  }, [token]);

  return (
    <div className="app-container client-dashboard-view">
      <div className="client-dashboard-animation" aria-hidden="true">
        <span className="client-orbit client-orbit-one" />
        <span className="client-orbit client-orbit-two" />
        <span className="client-scan-line" />
      </div>
      {/* ── INTERNAL APEX NAVIGATION ── */}
      <nav className="navbar-hub">
        <div className="brand-logo">
          Nethro<span className="brand-dot">.</span>Hub
        </div>
        <div className="nav-links-cluster">
          <span className="user-session-badge">
            <span className="status-indicator-dot online"></span>
            {currentUser?.name || "Client Terminal"}
          </span>
          <button className="btn-secondary logout-btn" onClick={onLogout}>
            Terminate Session
          </button>
        </div>
      </nav>

      {/* ── CLIENT HUB CONTENT ── */}
      <main className="matrix-section dashboard-main">
        <div className="matrix-wrapper">
          <div className="dashboard-header-block">
            <div className="pill-badge">Client Portal Secure Link Active</div>
            <h1 className="hero-title dashboard-title">Operations Workspace</h1>
            <p className="hero-subtext">
              Manage framework deployments, support tickets, and localized node architectures associated with <strong>{currentUser?.email}</strong>.
            </p>
          </div>

          {/* ── OVERVIEW SYSTEM METRICS ── */}
          <div className="services-grid-layout metrics-summary-grid">
            <div className="service-card-node service-card metric-card">
              <span className="card-pill-tag">Status</span>
              <h3 className="card-heading-label">Node Integrity</h3>
              <p className="metric-value-text text-green">Operational (100%)</p>
            </div>
            <div className="service-card-node service-card metric-card">
              <span className="card-pill-tag">Active Tasks</span>
              <h3 className="card-heading-label">Open Tickets</h3>
              <p className="metric-value-text">{loading ? "..." : tickets.length}</p>
            </div>
            <div className="service-card-node service-card metric-card">
              <span className="card-pill-tag">Security</span>
              <h3 className="card-heading-label">Access Level</h3>
              <p className="metric-value-text text-blue">Standard Client</p>
            </div>
          </div>

          {/* ── DATA SECTION ── */}
          <div className="workspace-data-table-section">
            <h2 className="section-main-title">Active Service Requests</h2>
            
            {error && <div className="setup-alert-banner text-center">{error}</div>}

            {loading ? (
              <div className="dashboard-card-fallback loading-spinner-box">
                <p className="dashboard-fallback-text">Parsing infrastructure streams...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="dashboard-card-fallback empty-state-box">
                <h3 className="dashboard-fallback-title">No Active Incidents Found</h3>
                <p className="dashboard-fallback-text">
                  Your architecture is currently running optimally. No active tickets or incidents require attention.
                </p>
              </div>
            ) : (
              <div className="custom-terminal-table-wrapper">
                <table className="terminal-data-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject Reference</th>
                      <th>Priority Class</th>
                      <th>Status State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td className="mono-text">#{ticket._id.substring(0, 7)}</td>
                        <td>{ticket.title}</td>
                        <td>
                          <span className={`priority-tag ${ticket.priority}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-tag ${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
