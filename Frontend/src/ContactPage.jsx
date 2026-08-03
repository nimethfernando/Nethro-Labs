import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ── Neural Network Canvas ──────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODES = 32;
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
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / 140) * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${0.45 * glow})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 255, 0.9)`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
}

// ── Contact Info Data ──────────────────────────────────────────────────────
const contactInfo = [
  { icon: "✉", label: "Email", value: "nimeth42@gmail.com", accent: "#00D4FF" },
  { icon: "📞", label: "Phone", value: "+94 72 545 2820", accent: "#4DFFB4" },
  { icon: "📍", label: "Headquarters", value: "71A, Mayfair Gardens Road, Koralwella, Moratuwa", accent: "#A78BFA" },
  { icon: "🕐", label: "Support Hours", value: "24 / 7 — 365 days a year", accent: "#FFB347" },
];

// ── InfoCard Component ─────────────────────────────────────────────────────
function InfoCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#111C33" : "#0E1628",
        border: `1px solid ${hovered ? item.accent + "66" : "rgba(0,212,255,0.12)"}`,
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 8px 24px -6px ${item.accent}22` : "none",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          flexShrink: 0,
          background: item.accent + "1A",
          border: `1px solid ${item.accent}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {item.icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#94A3B8",
            marginBottom: 4,
          }}
        >
          {item.label}
        </div>
        <div style={{ fontSize: 15, color: "#F0F8FF", fontWeight: 500, lineHeight: 1.4 }}>{item.value}</div>
      </div>
    </div>
  );
}

// ── Main Contact Page ──────────────────────────────────────────────────────
export default function ContactPage({ navigateTo, onNavigate }) {
  const handleNavigate = (page) => {
    const nav = navigateTo || onNavigate;
    if (typeof nav === "function") nav(page);
  };

  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const inputStyle = (field) => ({
    width: "100%",
    boxSizing: "border-box",
    background: focused === field ? "#0B132B" : "#070C1A",
    border: `1px solid ${focused === field ? "#00D4FF" : "rgba(0,212,255,0.18)"}`,
    boxShadow: focused === field ? "0 0 0 3px rgba(0, 212, 255, 0.15)" : "none",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#F0F8FF",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s ease-in-out",
  });

  const fProps = (name) => ({
    name,
    value: form[name],
    onChange: set,
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  // ── EmailJS Submission Handler ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.message) {
      setError("Please fill in both your email address and message.");
      return;
    }

    setLoading(true);
    setError("");

    const templateParams = {
      from_name: `${form.firstName} ${form.lastName}`.trim() || "Website Visitor",
      reply_to: form.email,
      company: form.company || "N/A",
      service_area: form.service || "General Inquiry",
      message: form.message,
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitted(true);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setError("Failed to dispatch your message. Please try again or reach us via direct email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ background: "#0A0F1E", color: "#F0F8FF", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        ::placeholder { color: #475569; }
        option { background: #0A0F1E; color: #F0F8FF; }

        .cn-header {
          position: relative; overflow: hidden;
          padding: 148px 56px 72px;
          text-align: center;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,212,255,0.08) 0%, transparent 70%);
        }
        .cn-eyebrow {
          display:inline-flex; align-items:center; gap:12px;
          font-size:12px; font-weight:700; letter-spacing:2px;
          text-transform:uppercase; color:#00D4FF; margin-bottom:24px; position:relative;
        }
        .cn-eyebrow-line { width:32px; height:1px; background:linear-gradient(90deg, transparent, #00D4FF); }
        .cn-eyebrow-line.right { background:linear-gradient(90deg, #00D4FF, transparent); }
        .cn-h1 {
          font-family:'Space Grotesk','Inter',sans-serif;
          font-size:clamp(40px,6.5vw,80px); font-weight:700;
          line-height:1.05; letter-spacing:-2px; margin-bottom:20px; position:relative;
        }
        .cn-gradient {
          background:linear-gradient(135deg,#00D4FF 0%,#4DFFB4 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .cn-sub {
          font-size:clamp(15px,2vw,19px); color:#B8D4E8;
          max-width:540px; line-height:1.65; margin:0 auto; position:relative;
        }

        .cn-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 56px 100px;
          align-items: start;
        }

        .cn-form-panel {
          background:#0E1628; border:1px solid rgba(0,212,255,0.15);
          border-radius:20px; padding:48px 40px;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
        }
        .cn-panel-eyebrow {
          font-size:12px; font-weight:700; letter-spacing:2px;
          text-transform:uppercase; color:#00D4FF; margin-bottom:8px;
        }
        .cn-panel-title {
          font-family:'Space Grotesk','Inter',sans-serif;
          font-size:26px; font-weight:700; letter-spacing:-.5px;
          margin-bottom:32px; color:#F0F8FF;
        }
        .cn-field { margin-bottom:22px; }
        .cn-label {
          display:block; font-size:13px; font-weight:600;
          color:#B8D4E8; margin-bottom:8px; letter-spacing:.2px;
        }
        .cn-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .cn-submit {
          width:100%; margin-top:10px;
          background:linear-gradient(135deg,#00D4FF,#4DFFB4);
          color:#0A0F1E; border:none; padding:16px 32px;
          border-radius:10px; font-size:15px; font-weight:700;
          cursor:pointer; letter-spacing:.3px; font-family:inherit;
          transition:all .25s ease;
          box-shadow: 0 4px 20px rgba(0,212,255,0.25);
        }
        .cn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,212,255,0.4);
        }
        .cn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .cn-select-wrap { position:relative; }
        .cn-select-arrow {
          position:absolute; right:16px; top:50%; transform:translateY(-50%);
          color:#00D4FF; pointer-events:none; font-size:12px;
        }
        .cn-error-banner {
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.3);
          color: #ff6b6b;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .cn-info-panel { display:flex; flex-direction:column; gap:18px; }
        .cn-badge {
          background:rgba(77,255,180,0.05); border:1px solid rgba(77,255,180,0.25);
          border-radius:14px; padding:20px 24px;
          display:flex; align-items:flex-start; gap:14px;
        }
        .cn-badge-dot {
          width:10px; height:10px; border-radius:50%; background:#4DFFB4;
          flex-shrink:0; box-shadow:0 0 10px #4DFFB4; margin-top:5px;
        }
        .cn-badge-text { font-size:14px; color:#B8D4E8; line-height:1.6; }

        @media (max-width: 900px) {
          .cn-header { padding: 120px 24px 72px; }
          .cn-body { grid-template-columns: 1fr; padding: 0 24px 72px; gap: 32px; }
          .cn-form-panel { padding: 32px 24px; }
          .cn-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cn-h1 { letter-spacing: -1px; }
          .cn-form-panel { padding: 28px 18px; }
        }
      `}</style>

      {/* ── NAVIGATION HEADER ── */}
      <nav className="nav-header">
        <div className="brand-logo" onClick={() => handleNavigate("home")}>
          Nethro<span className="brand-dot">.</span>Labs
        </div>

        <div className="nav-links-group">
          <button className="nav-link-btn" onClick={() => handleNavigate("home")}>
            Home
          </button>
          <button className="nav-link-btn" onClick={() => handleNavigate("contact")}>
            Contact
          </button>
          <button className="btn-primary" onClick={() => handleNavigate("login")}>
            Client Login
          </button>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <header className="cn-header">
        <NeuralCanvas />
        <div className="cn-eyebrow">
          <span className="cn-eyebrow-line" />
          Let's Talk
          <span className="cn-eyebrow-line right" />
        </div>
        <h1 className="cn-h1">
          Your next project<br />
          <span className="cn-gradient">starts here.</span>
        </h1>
        <p className="cn-sub">
          Tell us what you're building. We'll come back with a tailored proposal within 48 hours — no pressure, no boilerplate.
        </p>
      </header>

      {/* ── BODY ── */}
      <div className="cn-body">
        {/* FORM PANEL */}
        <div className="cn-form-panel">
          {submitted ? (
            <div className="cn-success" style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 56, color: "#4DFFB4", marginBottom: 16 }}>✓</div>
              <h3 style={{ fontSize: 26, marginBottom: 12, color: "#F0F8FF" }}>Message received.</h3>
              <p style={{ color: "#B8D4E8", fontSize: 15, lineHeight: 1.65 }}>
                A member of the Nethro Labs engineering team will review your project requirements and follow up within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="cn-panel-eyebrow">Send a Message</div>
              <div className="cn-panel-title">Tell us about your project</div>

              {error && <div className="cn-error-banner">{error}</div>}

              <div className="cn-row">
                <div className="cn-field">
                  <label className="cn-label">First name</label>
                  <input style={inputStyle("firstName")} placeholder="Ada" {...fProps("firstName")} />
                </div>
                <div className="cn-field">
                  <label className="cn-label">Last name</label>
                  <input style={inputStyle("lastName")} placeholder="Lovelace" {...fProps("lastName")} />
                </div>
              </div>

              <div className="cn-field">
                <label className="cn-label">Work email *</label>
                <input style={inputStyle("email")} type="email" placeholder="ada@company.com" required {...fProps("email")} />
              </div>

              <div className="cn-field">
                <label className="cn-label">Company</label>
                <input style={inputStyle("company")} placeholder="Acme Corp" {...fProps("company")} />
              </div>

              <div className="cn-field">
                <label className="cn-label">Service area</label>
                <div className="cn-select-wrap">
                  <select style={{ ...inputStyle("service"), appearance: "none", cursor: "pointer" }} {...fProps("service")}>
                    <option value="">Select a service…</option>
                    <option>Web Platform Development</option>
                    <option>Cloud Infrastructure</option>
                    <option>Cybersecurity</option>
                    <option>Network Solutions</option>
                    <option>Managed IT Services</option>
                    <option>Software Development</option>
                    <option>Data & Analytics</option>
                    <option>Other / Not sure yet</option>
                  </select>
                  <span className="cn-select-arrow">▾</span>
                </div>
              </div>

              <div className="cn-field">
                <label className="cn-label">Tell us about your project *</label>
                <textarea
                  style={{ ...inputStyle("message"), resize: "vertical", minHeight: 130 }}
                  placeholder="What are you trying to build or fix? The more detail, the better."
                  required
                  {...fProps("message")}
                />
              </div>

              <button type="submit" className="cn-submit" disabled={loading}>
                {loading ? "Dispatching Message..." : "Send message →"}
              </button>
            </form>
          )}
        </div>

        {/* INFO PANEL */}
        <div className="cn-info-panel">
          <div>
            <div className="cn-panel-eyebrow">Reach us directly</div>
            <div className="cn-panel-title" style={{ marginBottom: 24 }}>We're here when you need us.</div>
          </div>

          {contactInfo.map((item) => (
            <InfoCard key={item.label} item={item} />
          ))}

          <div className="cn-badge">
            <div className="cn-badge-dot" />
            <p className="cn-badge-text">
              <span style={{ color: "#4DFFB4", fontWeight: 700 }}>48-hour response guarantee.</span>{" "}
              Every inquiry gets a real reply from a senior engineer — no auto-responders, no sales scripts.
            </p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer-terminal footer-section">
        <div className="brand-logo" onClick={() => handleNavigate("home")}>
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