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
        ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 212, 255, 0.55)";
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function ServiceCard({ service }) {
  return (
    <div className="service-item-card">
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{service.icon}</div>
      <h3 className="service-card-title">{service.label}</h3>
      <p className="service-card-text">{service.description}</p>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="project-item-card">
      <div>
        <div className="project-card-header">
          <span className="project-category">{project.category}</span>
          <span className="project-badge">✓ {project.status}</span>
        </div>
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-description">{project.description}</p>
        <div className="project-tech-tags">
          {project.technologies.map((tech) => (
            <span key={tech} className="tech-tag">{tech}</span>
          ))}
        </div>
      </div>

      <div>
        <div className="project-metrics-row">
          <div className="project-metric-item">
            <span className="metric-val">{project.metric1Value}</span>
            <span className="metric-lbl">{project.metric1Label}</span>
          </div>
          <div className="project-metric-item">
            <span className="metric-val">{project.metric2Value}</span>
            <span className="metric-lbl">{project.metric2Label}</span>
          </div>
        </div>

        {project.link && (
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                padding: "8px 14px",
                textDecoration: "none"
              }}
            >
              Visit Live Site ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigateTo = (page) => setCurrentPage(page);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData.role === "admin") {
      setCurrentPage("admin-dashboard");
    } else if (userData.role === "client") {
      setCurrentPage("client-dashboard");
    } else {
      setCurrentPage("home");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentPage("login");
  };

  if (currentPage === "contact") {
    return <ContactPage navigateTo={navigateTo} />;
  }

  if (currentPage === "login") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} navigateTo={navigateTo} />;
  }

  if (currentPage === "admin-dashboard") {
    if (!token || user?.role !== "admin") {
      return (
        <div className="center-dashboard-container">
          <div className="dashboard-card-fallback">
            <h2 className="dashboard-fallback-title">Access Denied</h2>
            <p className="dashboard-fallback-text">
              You must be logged in as an Administrator to view this terminal.
            </p>
            <button className="btn-primary" onClick={() => navigateTo("login")}>
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
  }

  if (currentPage === "client-dashboard") {
    if (!token || (user?.role !== "client" && user?.role !== "admin")) {
      return (
        <div className="center-dashboard-container">
          <div className="dashboard-card-fallback">
            <h2 className="dashboard-fallback-title">Access Denied</h2>
            <p className="dashboard-fallback-text">
              You must be logged in as a Client to view this dashboard.
            </p>
            <button className="btn-primary" onClick={() => navigateTo("login")}>
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return <ClientDashboard user={user} token={token} onLogout={handleLogout} />;
  }

  const services = [
    {
      icon: "⚡",
      label: "Custom Web Applications",
      description: "Scalable React/Node.js enterprise ecosystems engineered for maximum throughput.",
    },
    {
      icon: "🔒",
      label: "Cybersecurity & Audit",
      description: "In-depth application vulnerability assessments, penetration testing, and access protocols.",
    },
    {
      icon: "☁️",
      label: "Cloud Architecture",
      description: "Resilient microservices, database cluster orchestration, and serverless infrastructure.",
    },
  ];

  const completedProjects = [
    {
      title: "AlumniVantage Ecosystem",
      category: "Enterprise Platform",
      status: "Delivered",
      description: "Secure university alumni portal featuring domain-restricted authentication, profile management, and career networks.",
      technologies: ["React", "Node.js", "MongoDB", "JWT"],
      metric1Label: "Verified Users",
      metric1Value: "12,500+",
      metric2Label: "Auth Speed",
      metric2Value: "< 25ms",
    },
    {
      title: "TanColorize AI Engine",
      category: "Deep Learning & Computer Vision",
      status: "Production",
      description: "Fair and balanced deep learning colorization model tailored for diverse skin tones and high-fidelity photo restoration.",
      technologies: ["PyTorch", "GANs", "Python", "FastAPI"],
      metric1Label: "Accuracy Rate",
      metric1Value: "98.4%",
      metric2Label: "Processing",
      metric2Value: "1.2s / Image",
    },
    {
      title: "Petra Constructions Platform",
      category: "Civil Engineering & Enterprise Web",
      status: "Live Project",
      description: "Full-scale corporate platform for Petra Constructions showcasing architectural portfolios, engineering services, and digital project inquiries.",
      technologies: ["React", "Node.js", "REST APIs", "Tailwind CSS"],
      metric1Label: "Completed Works",
      metric1Value: "50+ Projects",
      metric2Label: "Load Speed",
      metric2Value: "< 1.2s",
      link: "https://petraconstructions.lk/",
    },
  ];

  return (
    <div className="app-container">
      <NeuralCanvas />

      {/* ── NAVIGATION HEADER ── */}
      <nav className="nav-header">
        <div className="brand-logo" onClick={() => navigateTo("home")}>
          Nethro<span className="brand-dot">.</span>Labs
        </div>

        <div className="nav-links-group">
          <button className="nav-link-btn" onClick={() => navigateTo("home")}>Home</button>
          <button className="nav-link-btn" onClick={() => navigateTo("contact")}>Contact</button>
          {user ? (
            <button
              className="btn-primary"
              onClick={() => navigateTo(user.role === "admin" ? "admin-dashboard" : "client-dashboard")}
            >
              Workspace Terminal
            </button>
          ) : (
            <button className="btn-primary" onClick={() => navigateTo("login")}>Client Login</button>
          )}
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
            <button className="btn-secondary" onClick={() => navigateTo("login")}>
              Access Portal
            </button>
          </div>
        </div>

        {/* ── HERO RIGHT GRAPHIC CARD ── */}
        <div className="hero-graphic-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span className="card-pill-tag">System Terminal v2.4</span>
            <span style={{ color: "#10B981", fontSize: "13px", fontWeight: "600" }}>● Core Online</span>
          </div>

          <p style={{ color: "#F3F4F6", fontSize: "15px", fontWeight: "600", margin: "0 0 8px 0" }}>
            Enterprise System Deployment
          </p>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>
            High-reliability cloud architecture monitoring active client environments.
          </p>

          <div className="hero-stat-grid">
            <div className="hero-stat-node">
              <span className="hero-stat-value">99.9%</span>
              <span className="hero-stat-label">Platform Uptime</span>
            </div>
            <div className="hero-stat-node">
              <span className="hero-stat-value">&lt; 40ms</span>
              <span className="hero-stat-label">Core Latency</span>
            </div>
            <div className="hero-stat-node">
              <span className="hero-stat-value">Active</span>
              <span className="hero-stat-label">Security Shield</span>
            </div>
            <div className="hero-stat-node">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Node Operations</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── FEATURED DELIVERED PROJECTS ── */}
      <div className="projects-section">
        <div className="section-inner-container">
          <h2 className="section-heading-title">Delivered Projects & Systems</h2>
          <p className="section-supporting-subtext">
            Explore recent enterprise software deployments, full-stack web platforms, and deep learning engines built by Nethro Labs.
          </p>
          <div className="projects-grid-layout">
            {completedProjects.map((p) => (
              <ProjectCard key={p.title} project={p} />
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div className="services-section">
        <div className="section-inner-container">
          <h2 className="section-heading-title">Engineering Capabilities</h2>
          <p className="section-supporting-subtext">
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