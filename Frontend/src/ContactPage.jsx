import { useState, useEffect, useRef } from "react";

// ── Neural Network Canvas ──────────────────────────────────────────────────
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
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
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
            ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 140) * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.45 * glow})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,230,255,0.9)`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }} />
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const contactInfo = [
  { icon: "✉", label: "Email",        value: "hello@nethrolabs.io",              accent: "#00D4FF" },
  { icon: "📞", label: "Phone",        value: "+1 (888) 462-7600",               accent: "#4DFFB4" },
  { icon: "📍", label: "Headquarters", value: "120 West 45th St, New York, NY",  accent: "#A78BFA" },
  { icon: "🕐", label: "Support Hours",value: "24 / 7 — 365 days a year",        accent: "#FFB347" },
];

// ── InfoCard ───────────────────────────────────────────────────────────────
function InfoCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0E1628",
        border: `1px solid ${hovered ? item.accent + "55" : "rgba(0,212,255,0.1)"}`,
        borderRadius: 12,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        transition: "border-color 0.25s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: item.accent + "18",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{item.icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#B8D4E8", marginBottom: 5 }}>
          {item.label}
        </div>
        <div style={{ fontSize: 15, color: "#F0F8FF", fontWeight: 500 }}>{item.value}</div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function ContactPage({ onNavigate }) {
  const [navHover, setNavHover] = useState(null);
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", company:"", service:"", message:"" });

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const inputStyle = (field) => ({
    width: "100%", boxSizing: "border-box",
    background: "#070C1A",
    border: `1px solid ${focused === field ? "#00D4FF" : "rgba(0,212,255,0.15)"}`,
    borderRadius: 8, padding: "12px 16px",
    color: "#F0F8FF", fontSize: 15, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s",
  });
  const fProps = (name) => ({
    name, value: form[name], onChange: set,
    onFocus: () => setFocused(name), onBlur: () => setFocused(null),
  });

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#0A0F1E", color:"#F0F8FF", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::placeholder { color: #3a4f6a; }
        option { background: #0A0F1E; color: #F0F8FF; }
        button:hover { opacity: 0.88; }

        /* ── NAV ── */
        .cn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 56px; height: 64px;
          background: rgba(10,15,30,0.88); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(0,212,255,0.1);
        }
        .cn-logo { cursor: pointer; }
        .cn-nav-links { display:flex; gap:32px; list-style:none; }
        .cn-nav-link {
          font-size:14px; font-weight:500; letter-spacing:.3px;
          text-decoration:none; cursor:pointer; transition:color .2s;
        }
        .cn-nav-cta {
          background:transparent; border:1px solid #00D4FF; color:#00D4FF;
          padding:8px 20px; border-radius:6px; font-size:14px;
          font-weight:600; cursor:pointer; letter-spacing:.3px;
          font-family:inherit;
        }

        /* ── HEADER ── */
        .cn-header {
          position: relative; overflow: hidden;
          padding: 148px 56px 96px;
          text-align: center;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%);
        }
        .cn-eyebrow {
          display:inline-flex; align-items:center; gap:10px;
          font-size:12px; font-weight:600; letter-spacing:2px;
          text-transform:uppercase; color:#00D4FF; margin-bottom:24px; position:relative;
        }
        .cn-eyebrow-line { width:32px; height:1px; background:#00D4FF; }
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
          max-width:520px; line-height:1.65; margin:0 auto; position:relative;
        }

        /* ── BODY ── */
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

        /* ── FORM PANEL ── */
        .cn-form-panel {
          background:#0E1628; border:1px solid rgba(0,212,255,0.12);
          border-radius:16px; padding:48px 40px;
        }
        .cn-panel-eyebrow {
          font-size:12px; font-weight:600; letter-spacing:2px;
          text-transform:uppercase; color:#00D4FF; margin-bottom:8px;
        }
        .cn-panel-title {
          font-family:'Space Grotesk','Inter',sans-serif;
          font-size:26px; font-weight:700; letter-spacing:-.5px;
          margin-bottom:32px; color:#F0F8FF;
        }
        .cn-field { margin-bottom:20px; }
        .cn-label {
          display:block; font-size:13px; font-weight:500;
          color:#B8D4E8; margin-bottom:8px; letter-spacing:.2px;
        }
        .cn-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .cn-submit {
          width:100%; margin-top:8px;
          background:linear-gradient(135deg,#00D4FF,#4DFFB4);
          color:#0A0F1E; border:none; padding:15px 32px;
          border-radius:8px; font-size:15px; font-weight:700;
          cursor:pointer; letter-spacing:.3px; font-family:inherit;
          transition:opacity .2s;
        }
        .cn-select-wrap { position:relative; }
        .cn-select-arrow {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          color:#B8D4E8; pointer-events:none; font-size:12px;
        }

        /* ── INFO PANEL ── */
        .cn-info-panel { display:flex; flex-direction:column; gap:16px; }
        .cn-badge {
          background:rgba(77,255,180,0.07); border:1px solid rgba(77,255,180,0.2);
          border-radius:12px; padding:20px 24px;
          display:flex; align-items:flex-start; gap:14px;
        }
        .cn-badge-dot {
          width:10px; height:10px; border-radius:50%; background:#4DFFB4;
          flex-shrink:0; box-shadow:0 0 8px #4DFFB4; margin-top:4px;
        }
        .cn-badge-text { font-size:14px; color:#B8D4E8; line-height:1.6; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .cn-nav { padding: 0 24px; }
          .cn-nav-links { display: none; }
          .cn-header { padding: 120px 24px 72px; }
          .cn-body { grid-template-columns: 1fr; padding: 0 24px 72px; gap: 28px; }
          .cn-form-panel { padding: 32px 24px; }
          .cn-footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; gap: 12px; }
          .cn-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cn-h1 { letter-spacing: -1px; }
          .cn-form-panel { padding: 28px 18px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="cn-nav">
        <div className="cn-logo" onClick={() => onNavigate("home")}>Nethro<span style={{ color:"#00D4FF" }}>.</span>Labs</div>
        <ul className="cn-nav-links">
          {["Services","About","Case Studies","Contact"].map(link => (
            <li key={link}>
              <a
                className="cn-nav-link"
                style={{ color: navHover === link || link === "Contact" ? "#00D4FF" : "#B8D4E8" }}
                onMouseEnter={() => setNavHover(link)}
                onMouseLeave={() => setNavHover(null)}
                onClick={(e) => {
                  e.preventDefault();
                  if (link === "Contact") {
                    onNavigate("contact");
                  } else if (link === "Services") {
                    onNavigate("home", "services");
                  } else {
                    onNavigate("home");
                  }
                }}
                href="#"
              >{link}</a>
            </li>
          ))}
        </ul>
        <button className="cn-nav-cta" onClick={() => onNavigate("contact")}>Get a Quote</button>
      </nav>

      {/* HEADER */}
      <header className="cn-header">
        <NeuralCanvas />
        <div className="cn-eyebrow">
          <span className="cn-eyebrow-line" />
          Let's Talk
          <span className="cn-eyebrow-line" />
        </div>
        <h1 className="cn-h1">
          Your next project<br />
          <span className="cn-gradient">starts here.</span>
        </h1>
        <p className="cn-sub">
          Tell us what you're building. We'll come back with a tailored proposal within 48 hours — no pressure, no boilerplate.
        </p>
      </header>

      {/* BODY */}
      <div className="cn-body">

        {/* FORM */}
        <div className="cn-form-panel">
          {submitted ? (
            <div className="cn-success">
              <div className="cn-success-icon">✓</div>
              <div className="cn-success-title">Message received.</div>
              <p style={{ color:"#B8D4E8", fontSize:15, lineHeight:1.65 }}>
                A member of the Nethro Labs team will be in touch within 48 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="cn-panel-eyebrow">Send a Message</div>
              <div className="cn-panel-title">Tell us about your project</div>

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
                <input style={inputStyle("email")} type="email" placeholder="ada@company.com" {...fProps("email")} />
              </div>

              <div className="cn-field">
                <label className="cn-label">Company</label>
                <input style={inputStyle("company")} placeholder="Acme Corp" {...fProps("company")} />
              </div>

              <div className="cn-field">
                <label className="cn-label">Service area</label>
                <div className="cn-select-wrap">
                  <select style={{ ...inputStyle("service"), appearance:"none", cursor:"pointer" }} {...fProps("service")}>
                    <option value="">Select a service…</option>
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
                  style={{ ...inputStyle("message"), resize:"vertical", minHeight:130 }}
                  placeholder="What are you trying to build or fix? The more detail, the better."
                  {...fProps("message")}
                />
              </div>

              <button className="cn-submit" onClick={() => { if (form.email && form.message) setSubmitted(true); }}>
                Send message →
              </button>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="cn-info-panel">
          <div>
            <div className="cn-panel-eyebrow">Reach us directly</div>
            <div className="cn-panel-title" style={{ marginBottom:24 }}>We're here when you need us.</div>
          </div>

          {contactInfo.map(item => <InfoCard key={item.label} item={item} />)}

          <div className="cn-badge">
            <div className="cn-badge-dot" />
            <p className="cn-badge-text">
              <span style={{ color:"#4DFFB4", fontWeight:600 }}>48-hour response guarantee.</span>{" "}
              Every inquiry gets a real reply from a senior engineer — no auto-responders, no sales scripts.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#060A14", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div className="cn-logo" onClick={() => onNavigate("home")}>Nethro<span style={{ color:"#00D4FF" }}>.</span>Labs</div>
        <div className="cn-footer-note">© {new Date().getFullYear()} Nethro Labs. All rights reserved.</div>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","LinkedIn"].map(l => (
            <a key={l} href="#" className="cn-footer-note" style={{ textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}