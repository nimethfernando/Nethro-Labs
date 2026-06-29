import { useState, useEffect, useRef } from "react";
import ContactPage from "./ContactPage";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";

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

  return <canvas ref={canvasRef} style={styles.canvas} />;
}

function ServiceCard({ service }) {
  return (
    <div style={styles.card} className="service-card">
      <div style={styles.cardHeader}>
        <span style={styles.cardBadge}>{service.badge}</span>
      </div>
      <h3 style={styles.cardLabel}>{service.label}</h3>
      <p style={styles.cardText}>{service.desc}</p>
    </div>
  );
}

// Dedicated inline panel for first-time password configuration
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
          "Authorization": `Bearer ${token}`
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
    <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ color: "#FFF", padding: 40, background: "#111827", borderRadius: 12, border: "1px solid #1F2937", maxWidth: "440px", width: "90%" }}>
        <h2 style={{ color: "#00D4FF", margin: "0 0 8px 0", fontSize: "22px" }}>Initialize Security Credentials</h2>
        <p style={{ color: "#9CA3AF", fontSize: "14px", margin: "0 0 24px 0", lineHeight: "1.4" }}>
          This is your first terminal login session. Please configure a personal secret password to proceed.
        </p>

        {error && <div style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>{error}</div>}

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#9CA3AF", marginBottom: "6px" }}>New Secure Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", background: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#FFF", boxSizing: "border-box" }}
              placeholder="••••••••"
              required
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#9CA3AF", marginBottom: "6px" }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", background: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#FFF", boxSizing: "border-box" }}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, width: "100%" }}>
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

  const navigateTo = (targetView) => {
    setView(targetView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    
    // Check if backend payload specifies that a first-time password setup is intercepted
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
    { label: "Predictive Analytics Systems", desc: "Build enterprise forecast kernels optimized for complex logistical modeling.", badge: "Deep Learning" },
    { label: "Computer Vision Formations", desc: "Deploy classification frameworks built for consistent low-light imagery accuracy.", badge: "Vision" },
    { label: "Custom Core AI Architecture", desc: "Construct fully walled, dedicated localized neural frameworks from raw foundational layers.", badge: "Infrastructure" }
  ];

  if (view === "login") {
    // Intercept login callback properties to map setup conditions
    return (
      <LoginPage 
        onLoginSuccess={(user, token) => {
          // If the payload returns a flat setup property, embed it to user object
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

  // Client workspace layout screen
  if (view === "client-dashboard") {
    return (
      <div style={{ ...styles.container, justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "#FFF", textAlign: "center", padding: 40, background: "#111827", borderRadius: 12, border: "1px solid #1F2937", maxWidth: "500px", width: "90%" }}>
          <h2 style={{ color: "#00D4FF", marginBottom: "16px" }}>Client Operations Workspace</h2>
          <p style={{ color: "#9CA3AF", marginBottom: "24px", fontSize: "15px" }}>
            Authenticated session active for: <strong>{currentUser?.name}</strong> ({currentUser?.email})
          </p>
          <button style={styles.btnPrimary} onClick={handleLogout}>Terminate Session (Logout)</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <NeuralCanvas />

      {/* ── NAVBAR ── */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigateTo("home")}>
          Nethro<span style={styles.logoDot}>.</span>Labs
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          <span style={styles.navLink} onClick={() => navigateTo("home")}>Architecture</span>
          <span style={styles.navLink} onClick={() => navigateTo("contact")}>Consultation</span>
          <button style={styles.btnSecondary} onClick={() => navigateTo("login")}>
            Portal Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.pill}>Next-Gen Enterprise Engine</div>
          <h1 style={styles.heroTitle}>
            Engineering Walled<br />
            <span style={{ color: "#00D4FF" }}>Intelligence Frameworks</span>
          </h1>
          <p style={styles.heroSub}>
            Nethro Labs architects domain-isolated deep learning architectures and high-throughput data backends for organizations requiring strict operational accuracy.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button style={styles.btnPrimary} onClick={() => navigateTo("contact")}>
              Initialize System Architecture
            </button>
          </div>
        </div>
      </header>

      {/* ── SERVICES MATRIX ── */}
      <div style={styles.matrixSection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Foundational Clusters</h2>
          <p style={styles.sectionSub}>
            We deploy strict hybrid models across core networks, engineering software that covers every dimension of your technology stack.
          </p>
          <div style={styles.grid}>
            {services.map((s) => (
              <ServiceCard key={s.label} service={s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={styles.ctaStrip} className="cta-section">
        <h2 style={styles.ctaTitle}>
          Ready to build something<br />
          <span style={{ color: "#00D4FF" }}>resilient?</span>
        </h2>
        <p style={styles.ctaSub}>
          Talk to our team and get a tailored proposal within 48 hours.
        </p>
        <button style={styles.btnPrimary} onClick={() => navigateTo("contact")}>
          Schedule a Call
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer} className="footer-section">
        <div style={styles.logo} onClick={() => navigateTo("home")}>
          Nethro<span style={styles.logoDot}>.</span>Labs
        </div>
        <div style={styles.footerNote}>
          © {new Date().getFullYear()} Nethro Labs. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
          {["Privacy", "Terms", "LinkedIn"].map((l) => (
            <a key={l} href="#" style={{ ...styles.footerNote, textDecoration: "none" }}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#070A13",
    color: "#F3F4F6",
    minHeight: "100vh",
    position: "relative",
    fontFamily: "system-ui, -apple-system, sans-serif",
    overflowX: "hidden",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "680px",
    zIndex: 1,
    pointerEvents: "none",
  },
  nav: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: "-0.5px",
    cursor: "pointer",
  },
  logoDot: {
    color: "#00D4FF",
  },
  navLink: {
    fontSize: "14px",
    color: "#9CA3AF",
    cursor: "pointer",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  heroSection: {
    position: "relative",
    zIndex: 5,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "100px 24px 140px 24px",
  },
  heroContent: {
    maxWidth: "680px",
  },
  pill: {
    display: "inline-block",
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    border: "1px solid rgba(0, 212, 255, 0.25)",
    color: "#00D4FF",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "24px",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: "800",
    lineHeight: "1.15",
    color: "#FFF",
    margin: "0 0 24px 0",
    letterSpacing: "-1px",
  },
  heroSub: {
    fontSize: "18px",
    lineHeight: "1.6",
    color: "#9CA3AF",
    margin: "0 0 40px 0",
  },
  matrixSection: {
    backgroundColor: "#0B0F19",
    borderTop: "1px solid #1F2937",
    padding: "100px 24px",
    position: "relative",
    zIndex: 5,
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  sectionSub: {
    fontSize: "16px",
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto 60px auto",
    lineHeight: "1.5",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
  },
  card: {
    backgroundColor: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "12px",
    padding: "32px",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    marginBottom: "20px",
  },
  cardBadge: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#00D4FF",
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    padding: "4px 10px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  cardLabel: {
    fontSize: "19px",
    fontWeight: "700",
    color: "#FFF",
    margin: "0 0 12px 0",
  },
  cardText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#9CA3AF",
    margin: 0,
  },
  ctaStrip: {
    borderTop: "1px solid #1F2937",
    padding: "100px 24px",
    textAlign: "center",
    position: "relative",
    zIndex: 5,
  },
  ctaTitle: {
    fontSize: "36px",
    fontWeight: "800",
    lineHeight: "1.2",
    color: "#FFF",
    margin: "0 0 16px 0",
  },
  ctaSub: {
    fontSize: "16px",
    color: "#9CA3AF",
    margin: "0 0 32px 0",
  },
  footer: {
    borderTop: "1px solid #1F2937",
    padding: "48px 24px",
    textAlign: "center",
    backgroundColor: "#05070D",
    position: "relative",
    zIndex: 5,
  },
  footerNote: {
    fontSize: "13px",
    color: "#4B5563",
    marginTop: "16px",
    marginBottom: "16px",
  },
  btnPrimary: {
    backgroundColor: "#00D4FF",
    color: "#070A13",
    padding: "14px 28px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    color: "#FFF",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    border: "1px solid #374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};