import { useState, useEffect, useRef } from "react";

// ── Neural Network Canvas (reused from main app) ───────────────────────────
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

    const NODES = 28;
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

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}
    />
  );
}

// ── Contact info items ─────────────────────────────────────────────────────
const contactInfo = [
  {
    icon: "✉",
    label: "Email",
    value: "hello@nethrolabs.io",
    accent: "#00D4FF",
  },
  {
    icon: "📞",
    label: "Phone",
    value: "+1 (888) 462-7600",
    accent: "#4DFFB4",
  },
  {
    icon: "📍",
    label: "Headquarters",
    value: "120 West 45th St, New York, NY 10036",
    accent: "#A78BFA",
  },
  {
    icon: "🕐",
    label: "Support Hours",
    value: "24 / 7 — 365 days a year",
    accent: "#FFB347",
  },
];

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#0A0F1E",
    color: "#F0F8FF",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  nav: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    height: 64,
    background: "rgba(10,15,30,0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0,212,255,0.1)",
  },
  logo: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#F0F8FF",
    textDecoration: "none",
  },
  logoDot: { color: "#00D4FF" },
  navLinks: {
    display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0,
  },
  navLink: {
    color: "#B8D4E8", textDecoration: "none",
    fontSize: 14, fontWeight: 500, letterSpacing: "0.3px", cursor: "pointer",
  },
  navCta: {
    background: "transparent", border: "1px solid #00D4FF",
    color: "#00D4FF", padding: "8px 20px", borderRadius: 6,
    fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.3px",
  },
  // PAGE HEADER
  pageHeader: {
    position: "relative",
    paddingTop: 140,
    paddingBottom: 80,
    paddingInline: 48,
    textAlign: "center",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, fontWeight: 600, letterSpacing: "2px",
    textTransform: "uppercase", color: "#00D4FF", marginBottom: 24,
    position: "relative",
  },
  eyebrowLine: { width: 32, height: 1, background: "#00D4FF" },
  pageTitle: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "clamp(38px, 6vw, 72px)",
    fontWeight: 700, lineHeight: 1.05,
    letterSpacing: "-2px", margin: "0 0 20px",
    position: "relative",
  },
  gradientText: {
    background: "linear-gradient(135deg, #00D4FF 0%, #4DFFB4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  pageSub: {
    fontSize: "clamp(15px, 2vw, 18px)",
    color: "#B8D4E8", maxWidth: 500,
    lineHeight: 1.65, margin: "0 auto",
    position: "relative",
  },
  // BODY
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 48,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 48px 100px",
    alignItems: "start",
  },
  // FORM PANEL
  formPanel: {
    background: "#0E1628",
    border: "1px solid rgba(0,212,255,0.12)",
    borderRadius: 16,
    padding: "48px 40px",
  },
  panelLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "2px",
    textTransform: "uppercase", color: "#00D4FF", marginBottom: 8,
  },
  panelTitle: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px",
    marginBottom: 32, color: "#F0F8FF",
  },
  fieldGroup: { marginBottom: 20 },
  label: {
    display: "block", fontSize: 13, fontWeight: 500,
    color: "#B8D4E8", marginBottom: 8, letterSpacing: "0.2px",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: "#0A0F1E", border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: 8, padding: "12px 16px",
    color: "#F0F8FF", fontSize: 15,
    outline: "none", transition: "border-color 0.2s",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  textarea: {
    width: "100%", boxSizing: "border-box",
    background: "#0A0F1E", border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: 8, padding: "12px 16px",
    color: "#F0F8FF", fontSize: 15,
    outline: "none", resize: "vertical",
    minHeight: 130, transition: "border-color 0.2s",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  selectWrapper: { position: "relative" },
  select: {
    width: "100%", boxSizing: "border-box",
    background: "#0A0F1E", border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: 8, padding: "12px 16px",
    color: "#F0F8FF", fontSize: 15,
    outline: "none", appearance: "none",
    cursor: "pointer", transition: "border-color 0.2s",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  selectArrow: {
    position: "absolute", right: 14, top: "50%",
    transform: "translateY(-50%)",
    color: "#B8D4E8", pointerEvents: "none", fontSize: 12,
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  submitBtn: {
    width: "100%", marginTop: 8,
    background: "linear-gradient(135deg, #00D4FF, #4DFFB4)",
    color: "#0A0F1E", border: "none",
    padding: "15px 32px", borderRadius: 8,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    letterSpacing: "0.3px", transition: "opacity 0.2s",
  },
  // INFO PANEL
  infoPanel: { display: "flex", flexDirection: "column", gap: 16 },
  infoCard: {
    background: "#0E1628",
    border: "1px solid rgba(0,212,255,0.1)",
    borderRadius: 12, padding: "24px 28px",
    display: "flex", alignItems: "flex-start", gap: 20,
    transition: "border-color 0.25s, transform 0.2s",
  },
  infoIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0,
  },
  infoLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "1.5px",
    textTransform: "uppercase", color: "#B8D4E8", marginBottom: 6,
  },
  infoValue: {
    fontSize: 15, color: "#F0F8FF", fontWeight: 500, lineHeight: 1.5,
  },
  // RESPONSE TIME BADGE
  badge: {
    background: "rgba(77,255,180,0.08)",
    border: "1px solid rgba(77,255,180,0.2)",
    borderRadius: 12, padding: "20px 24px",
    display: "flex", alignItems: "center", gap: 16,
  },
  badgeDot: {
    width: 10, height: 10, borderRadius: "50%",
    background: "#4DFFB4", flexShrink: 0,
    boxShadow: "0 0 8px #4DFFB4",
  },
  badgeText: { fontSize: 14, color: "#B8D4E8", lineHeight: 1.5 },
  badgeTextStrong: { color: "#4DFFB4", fontWeight: 600 },
  // FOOTER
  footer: {
    background: "#060A14",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 48px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: 16,
  },
  footerNote: { fontSize: 13, color: "#4A6080" },
};

// ── InfoCard ───────────────────────────────────────────────────────────────
function InfoCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...S.infoCard,
        borderColor: hovered ? item.accent + "44" : "rgba(0,212,255,0.1)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          ...S.infoIconWrap,
          background: item.accent + "18",
        }}
      >
        {item.icon}
      </div>
      <div>
        <div style={S.infoLabel}>{item.label}</div>
        <div style={S.infoValue}>{item.value}</div>
      </div>
    </div>
  );
}

// ── ContactField ───────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

// ── Contact Page ───────────────────────────────────────────────────────────
export default function ContactPage() {
  const [navHover, setNavHover] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    company: "", service: "", message: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.email || !form.message) return;
    setSubmitted(true);
  };

  const focusStyle = (field) =>
    focusedField === field ? { borderColor: "#00D4FF" } : {};

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::placeholder { color: #3a4f6a; }
        option { background: #0A0F1E; color: #F0F8FF; }
        @media (max-width: 768px) {
          .contact-body { grid-template-columns: 1fr !important; padding: 0 24px 72px !important; }
          .page-header { padding-inline: 24px !important; }
          .nav-links { display: none !important; }
          nav { padding: 0 24px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.logo}>
          Nethro<span style={S.logoDot}>.</span>Labs
        </div>
        <ul style={S.navLinks} className="nav-links">
          {["Services", "About", "Case Studies", "Contact"].map((link) => (
            <li key={link}>
              <a
                style={{
                  ...S.navLink,
                  color: navHover === link || link === "Contact" ? "#00D4FF" : "#B8D4E8",
                }}
                onMouseEnter={() => setNavHover(link)}
                onMouseLeave={() => setNavHover(null)}
                href="#"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
        <button style={S.navCta}>Get a Quote</button>
      </nav>

      {/* PAGE HEADER */}
      <section style={S.pageHeader} className="page-header">
        <NeuralCanvas />
        <div style={S.overlay} />
        <div style={S.eyebrow}>
          <span style={S.eyebrowLine} />
          Let's Talk
          <span style={S.eyebrowLine} />
        </div>
        <h1 style={S.pageTitle}>
          Your next project<br />
          <span style={S.gradientText}>starts here.</span>
        </h1>
        <p style={S.pageSub}>
          Tell us what you're building. We'll come back with a tailored proposal within 48 hours — no pressure, no boilerplate.
        </p>
      </section>

      {/* BODY */}
      <div style={{ ...S.body, gridTemplateColumns: "1fr 1fr" }} className="contact-body">

        {/* ── FORM PANEL ── */}
        <div style={S.formPanel}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
              <div style={{ ...S.panelTitle, marginBottom: 12 }}>Message received.</div>
              <p style={{ color: "#B8D4E8", fontSize: 15, lineHeight: 1.65 }}>
                A member of the Nethro Labs team will be in touch within 48 hours.
              </p>
            </div>
          ) : (
            <>
              <div style={S.panelLabel}>Send a Message</div>
              <div style={S.panelTitle}>Tell us about your project</div>

              <div style={S.row}>
                <Field label="First name">
                  <input
                    style={{ ...S.input, ...focusStyle("firstName") }}
                    name="firstName" value={form.firstName}
                    onChange={handleChange} placeholder="Ada"
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    style={{ ...S.input, ...focusStyle("lastName") }}
                    name="lastName" value={form.lastName}
                    onChange={handleChange} placeholder="Lovelace"
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
              </div>

              <Field label="Work email *">
                <input
                  style={{ ...S.input, ...focusStyle("email") }}
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="ada@company.com"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>

              <Field label="Company">
                <input
                  style={{ ...S.input, ...focusStyle("company") }}
                  name="company" value={form.company}
                  onChange={handleChange} placeholder="Acme Corp"
                  onFocus={() => setFocusedField("company")}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>

              <Field label="Service area">
                <div style={S.selectWrapper}>
                  <select
                    style={{ ...S.select, ...focusStyle("service") }}
                    name="service" value={form.service}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("service")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Select a service…</option>
                    <option>Cloud Infrastructure</option>
                    <option>Cybersecurity</option>
                    <option>Network Solutions</option>
                    <option>Managed IT Services</option>
                    <option>Software Development</option>
                    <option>Data & Analytics</option>
                    <option>Other / Not sure yet</option>
                  </select>
                  <span style={S.selectArrow}>▾</span>
                </div>
              </Field>

              <Field label="Tell us about your project *">
                <textarea
                  style={{ ...S.textarea, ...focusStyle("message") }}
                  name="message" value={form.message}
                  onChange={handleChange}
                  placeholder="What are you trying to build or fix? The more detail, the better."
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>

              <button style={S.submitBtn} onClick={handleSubmit}>
                Send message →
              </button>
            </>
          )}
        </div>

        {/* ── INFO PANEL ── */}
        <div style={S.infoPanel}>
          <div>
            <div style={{ ...S.panelLabel, marginBottom: 8 }}>Reach us directly</div>
            <div style={{ ...S.panelTitle, marginBottom: 24 }}>We're here when you need us.</div>
          </div>

          {contactInfo.map((item) => (
            <InfoCard key={item.label} item={item} />
          ))}

          <div style={S.badge}>
            <div style={S.badgeDot} />
            <p style={S.badgeText}>
              <span style={S.badgeTextStrong}>48-hour response guarantee.</span>{" "}
              Every inquiry gets a real reply from a senior engineer — no auto-responders, no sales scripts.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={{ ...S.logo, textDecoration: "none" }}>
          Nethro<span style={S.logoDot}>.</span>Labs
        </div>
        <div style={S.footerNote}>
          © {new Date().getFullYear()} Nethro Labs. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "LinkedIn"].map((l) => (
            <a key={l} href="#" style={{ ...S.footerNote, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
