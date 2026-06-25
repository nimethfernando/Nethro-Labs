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
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const alpha = (1 - dist / 140) * 0.25;
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.5 * glow})`;
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
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.55,
      }}
    />
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const services = [
  {
    icon: "⬡",
    label: "Cloud Infrastructure",
    desc: "Scalable, secure cloud environments engineered for uptime. From migration to multi-cloud orchestration.",
    accent: "#00D4FF",
  },
  {
    icon: "⬡",
    label: "Cybersecurity",
    desc: "Threat detection, zero-trust architecture, and 24/7 monitoring to keep your systems airtight.",
    accent: "#4DFFB4",
  },
  {
    icon: "⬡",
    label: "Network Solutions",
    desc: "Enterprise networking — SD-WAN, VPNs, routing and switching — optimized for performance.",
    accent: "#A78BFA",
  },
  {
    icon: "⬡",
    label: "Managed IT Services",
    desc: "Your full-stack IT department, on demand. We handle the ops so your team can ship.",
    accent: "#FFB347",
  },
  {
    icon: "⬡",
    label: "Software Development",
    desc: "Custom applications built to integrate with your stack — from MVPs to enterprise platforms.",
    accent: "#FF6B9D",
  },
  {
    icon: "⬡",
    label: "Data & Analytics",
    desc: "Pipelines, dashboards, and intelligence layers that turn your data into decisions.",
    accent: "#00D4FF",
  },
];

const stats = [
  { value: "200+", label: "Clients Served" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "15+", label: "Years Experience" },
  { value: "24/7", label: "Support Coverage" },
];

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: "#0A0F1E",
    color: "#F0F8FF",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  // NAV
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
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
  },
  logoDot: { color: "#00D4FF" },
  navLinks: {
    display: "flex",
    gap: 32,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: "#B8D4E8",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "0.3px",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  navCta: {
    background: "transparent",
    border: "1px solid #00D4FF",
    color: "#00D4FF",
    padding: "8px 20px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    letterSpacing: "0.3px",
  },
  // HERO
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "120px 24px 80px",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#00D4FF",
    marginBottom: 28,
    position: "relative",
  },
  eyebrowLine: {
    width: 32,
    height: 1,
    background: "#00D4FF",
  },
  heroTitle: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "clamp(42px, 7vw, 92px)",
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-2px",
    margin: "0 0 24px",
    position: "relative",
    maxWidth: 900,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #00D4FF 0%, #4DFFB4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "#B8D4E8",
    maxWidth: 560,
    lineHeight: 1.65,
    margin: "0 0 48px",
    position: "relative",
  },
  heroBtns: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
    position: "relative",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #00D4FF, #4DFFB4)",
    color: "#0A0F1E",
    border: "none",
    padding: "14px 32px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  btnSecondary: {
    background: "transparent",
    color: "#F0F8FF",
    border: "1px solid rgba(240,248,255,0.25)",
    padding: "14px 32px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  // STATS BAR
  statsBar: {
    background: "#0E1628",
    borderTop: "1px solid rgba(0,212,255,0.1)",
    borderBottom: "1px solid rgba(0,212,255,0.1)",
    padding: "40px 48px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
    textAlign: "center",
  },
  statValue: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 700,
    color: "#00D4FF",
    lineHeight: 1,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#B8D4E8",
    letterSpacing: "0.5px",
    fontWeight: 500,
  },
  // SERVICES
  section: {
    padding: "100px 48px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#00D4FF",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "clamp(28px, 4vw, 48px)",
    fontWeight: 700,
    letterSpacing: "-1px",
    marginBottom: 16,
    lineHeight: 1.1,
  },
  sectionSub: {
    color: "#B8D4E8",
    fontSize: 16,
    maxWidth: 520,
    lineHeight: 1.6,
    marginBottom: 64,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  card: {
    background: "#0E1628",
    border: "1px solid rgba(0,212,255,0.1)",
    borderRadius: 12,
    padding: "36px 32px",
    transition: "border-color 0.25s, transform 0.2s",
    cursor: "default",
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 20,
    display: "block",
  },
  cardLabel: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: "-0.3px",
  },
  cardDesc: {
    fontSize: 14,
    color: "#B8D4E8",
    lineHeight: 1.65,
  },
  // CTA STRIP
  ctaStrip: {
    background: "linear-gradient(135deg, #0E1628 0%, #112040 100%)",
    borderTop: "1px solid rgba(0,212,255,0.15)",
    padding: "100px 48px",
    textAlign: "center",
  },
  ctaTitle: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "clamp(28px, 4vw, 52px)",
    fontWeight: 700,
    letterSpacing: "-1.5px",
    marginBottom: 20,
    lineHeight: 1.1,
  },
  ctaSub: {
    color: "#B8D4E8",
    fontSize: 17,
    marginBottom: 40,
    lineHeight: 1.6,
  },
  // FOOTER
  footer: {
    background: "#060A14",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  footerNote: {
    fontSize: 13,
    color: "#4A6080",
  },
};

// ── ServiceCard ────────────────────────────────────────────────────────────
function ServiceCard({ service }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.card,
        borderColor: hovered
          ? service.accent + "55"
          : "rgba(0,212,255,0.1)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ ...styles.cardIcon, color: service.accent }}>
        {service.icon}
      </span>
      <div style={{ ...styles.cardLabel, color: hovered ? service.accent : "#F0F8FF" }}>
        {service.label}
      </div>
      <div style={styles.cardDesc}>{service.desc}</div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function NethroLabs() {
  const [navHover, setNavHover] = useState(null);

  return (
    <div style={styles.root}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          Nethro<span style={styles.logoDot}>.</span>Labs
        </div>
        <ul style={styles.navLinks}>
          {["Services", "About", "Case Studies", "Contact"].map((link) => (
            <li key={link}>
              <a
                style={{
                  ...styles.navLink,
                  color: navHover === link ? "#00D4FF" : "#B8D4E8",
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
        <button style={styles.navCta}>Get a Quote</button>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <NeuralCanvas />
        <div style={styles.heroOverlay} />
        <div style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          IT Solutions for the Modern Enterprise
          <span style={styles.eyebrowLine} />
        </div>
        <h1 style={styles.heroTitle}>
          Systems that{" "}
          <span style={styles.heroAccent}>think ahead</span>
          <br />so you don't have to.
        </h1>
        <p style={styles.heroSub}>
          Nethro Labs delivers end-to-end IT solutions — cloud, security,
          networking, and software — engineered to scale with your ambitions.
        </p>
        <div style={styles.heroBtns}>
          <button style={styles.btnPrimary}>Start a Project</button>
          <button style={styles.btnSecondary}>Explore Services →</button>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={styles.statsBar}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <div style={{ background: "#0A0F1E" }}>
        <div style={styles.section}>
          <div style={styles.sectionEyebrow}>What We Do</div>
          <h2 style={styles.sectionTitle}>
            Full-spectrum IT,<br />
            <span style={{ color: "#00D4FF" }}>zero compromises.</span>
          </h2>
          <p style={styles.sectionSub}>
            From the network layer to the application layer, Nethro Labs
            covers every dimension of your technology stack.
          </p>
          <div style={styles.grid}>
            {services.map((s) => (
              <ServiceCard key={s.label} service={s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={styles.ctaStrip}>
        <h2 style={styles.ctaTitle}>
          Ready to build something<br />
          <span style={{ color: "#00D4FF" }}>resilient?</span>
        </h2>
        <p style={styles.ctaSub}>
          Talk to our team and get a tailored proposal within 48 hours.
        </p>
        <button style={styles.btnPrimary}>Schedule a Call</button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.logo}>
          Nethro<span style={styles.logoDot}>.</span>Labs
        </div>
        <div style={styles.footerNote}>
          © {new Date().getFullYear()} Nethro Labs. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "LinkedIn"].map((l) => (
            <a
              key={l}
              href="#"
              style={{ ...styles.footerNote, textDecoration: "none" }}
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
