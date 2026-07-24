import { useState, useEffect, useRef } from "react";
import ContactPage from "./ContactPage";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import ClientDashboard from "./components/ClientDashboard";
import "./App.css";

function NeuralCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODES = 38;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${0.15 + Math.sin(n.pulse) * 0.05})`;
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
}

function ServiceCard({ service }) {
  return (
    <div className="service-card-node service-card">
      <div className="card-header-badge-wrapper">
        <span className="card-pill-tag">{service.badge}</span>
      </div>
      <h3 className="card-heading-label">{service.label}</h3>
      <p className="card-body-description">{service.desc}</p>
    </div>
  );
}

function InitialPasswordSetup({ token, onSetupSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match matching criteria.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update security credentials.");
      }

      onSetupSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-dashboard-container">
      <div className="setup-password-card">
        <h2 className="setup-card-title">Initialize Security Credentials</h2>
        <p className="setup-card-subtitle">
          This is your first terminal login session. Please configure a personal secret password to proceed.
        </p>

        {error && <div className="setup-alert-banner">{error}</div>}

        <form onSubmit={handlePasswordSubmit}>
          <div className="setup-input-wrapper">
            <label className="setup-field-label">New Secure Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="setup-field-input"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="setup-input-wrapper-last">
            <label className="setup-field-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="setup-field-input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%" }}>
            {loading ? "Updating Master Matrix..." : "Save Credentials & Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState("");

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
      } else {
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (targetView) => {
    if (view !== targetView) {
      window.history.pushState({ view: targetView }, "", `#${targetView}`);
      setView(targetView);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);

    if (user.requiresPasswordReset) {
      navigateTo("setup-password");
    } else if (user.role === "admin") {
      navigateTo("admin-dashboard");
    } else {
      navigateTo("client-dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken("");
    navigateTo("home");
  };

  const services = [
    { label: "Enterprise Web Applications", desc: "Engineering modern, scalable web ecosystems built for heavy operational demand.", badge: "Web Systems" },
    { label: "Predictive Analytics Systems", desc: "Build enterprise forecast kernels optimized for complex logistical modeling.", badge: "Deep Learning" },
    { label: "Custom Core Software Architecture", desc: "Construct fully walled, dedicated localized neural and database frameworks.", badge: "Infrastructure" }
  ];

  if (view === "login") {
    return (
      <LoginPage
        onLoginSuccess={(user, token) => {
          const checkResponse = arguments[0];
          if (checkResponse && checkResponse.requiresPasswordReset) {
            handleLoginSuccess({ ...checkResponse.user, requiresPasswordReset: true }, arguments[1]);
          } else {
            handleLoginSuccess(user, token);
          }
        }}
        navigateTo={navigateTo}
      />
    );
  }

  if (view === "contact") {
    return <ContactPage navigateTo={navigateTo} />;
  }

  if (view === "admin-dashboard") {
    return <AdminDashboard token={authToken} onLogout={handleLogout} />;
  }

  if (view === "setup-password") {
    return (
      <InitialPasswordSetup
        token={authToken}
        onSetupSuccess={() => navigateTo("client-dashboard")}
      />
    );
  }

  if (view === "client-dashboard") {
    return (
      <ClientDashboard
        token={authToken}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="app-container">
      <NeuralCanvas />

      {/* ── NAVBAR ── */}
      <nav className="navbar-hub">
        <div className="brand-logo" onClick={() => navigateTo("home")}>
          Nethro<span className="brand-dot">.</span>Labs
        </div>
        <div className="nav-links-cluster">
          <span className="nav-link-item" onClick={() => navigateTo("home")}>Architecture</span>
          <span className="nav-link-item" onClick={() => navigateTo("contact")}>Consultation</span>
          <button className="btn-secondary" onClick={() => navigateTo("login")}>
            Portal Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="pill-badge">Next-Gen Software Solutions</div>
          <h1 className="hero-title">
            Architecting Resilient<br />
            <span className="hero-title-highlight">Digital Platforms</span>
          </h1>
          <p className="hero-subtext">
            Nethro Labs engineers bespoke Web Platforms, Intelligent Analytics Backends, and High-Throughput Software Architecture for enterprise operations.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigateTo("contact")}>
              Initialize Project Proposal
            </button>
          </div>
        </div>
      </header>

      {/* ── FLAGSHIP PROJECT SHOWCASE ── */}
      <div className="matrix-section" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="matrix-wrapper">
          <div className="pill-badge" style={{ marginBottom: "12px" }}>Flagship Deployment</div>
          <h2 className="section-main-title">Project Petra Constructions</h2>
          <p className="section-sub-title">
            Nethro Labs' debut production deployment—an enterprise web solution developed for Petra Constructions, empowering their digital presence and civil engineering project showcases.
          </p>

          <div style={{
            background: "rgba(10, 15, 25, 0.7)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "12px",
            padding: "32px",
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span className="card-pill-tag">Production Live</span>
                <h3 style={{ fontSize: "1.5rem", marginTop: "8px", color: "#fff" }}>Petra Constructions Web Portal</h3>
              </div>
              <a 
                href="https://www.petraconstructions.lk/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                Launch Platform ↗
              </a>
            </div>
            
            <p className="card-body-description" style={{ fontSize: "1rem" }}>
              Designed and built from the ground up to support modern civil engineering visual presentation, structured client inquiries, and high performance content delivery.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "12px" }}>
              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <strong style={{ color: "#00d4ff", display: "block" }}>Domain</strong>
                <span style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Civil & Infrastructure</span>
              </div>
              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <strong style={{ color: "#00d4ff", display: "block" }}>Stack</strong>
                <span style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Modern Web & Cloud Integration</span>
              </div>
              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <strong style={{ color: "#00d4ff", display: "block" }}>Status</strong>
                <span style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Active & Managed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SERVICES MATRIX ── */}
      <div className="matrix-section">
        <div className="matrix-wrapper">
          <h2 className="section-main-title">Foundational Capabilities</h2>
          <p className="section-sub-title">
            We build robust, tailored software solutions across diverse industries, bringing precision and scale to every enterprise architecture.
          </p>
          <div className="services-grid-layout">
            {services.map((s) => (
              <ServiceCard key={s.label} service={s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="cta-strip-panel cta-section">
        <h2 className="cta-heading-title">
          Ready to build something<br />
          <span className="cta-title-accent">resilient?</span>
        </h2>
        <p className="cta-supporting-text">
          Talk to our engineering team and get a tailored proposal for your platform.
        </p>
        <button className="btn-primary" onClick={() => navigateTo("contact")}>
          Schedule a Call
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer-terminal footer-section">
        <div className="brand-logo" onClick={() => navigateTo("home")}>
          Nethro<span className="brand-dot">.</span>Labs
        </div>
        <div className="footer-timestamp-note">
          © {new Date().getFullYear()} Nethro Labs. All rights reserved.
        </div>
        <div className="footer-links-row">
          {["Privacy", "Terms", "LinkedIn"].map((l) => (
            <a key={l} href="#" className="footer-anchor-item">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}