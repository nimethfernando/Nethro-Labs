import { useState, useRef, useEffect } from "react";
import { Mascot } from "mascotz/react";
import "./MascotsLab.css";

const BODIES = ["round", "bean", "tall", "square", "pear", "ghost", "blob", "cloud", "drop", "loaf", "triangle", "cat"];
const EYES = ["dot", "pill", "big", "wide", "tiny", "ring"];
const MOODS = ["idle", "happy", "thinking", "angry", "shy", "sleeping", "curious", "surprised", "love", "dizzy"];
const COLOR_PRESETS = [
  { name: "Cyan", hex: "#00D4FF" },
  { name: "Emerald", hex: "#4DFFB4" },
  { name: "Purple", hex: "#8F7CF0" },
  { name: "Coral", hex: "#F0845A" },
  { name: "Amber", hex: "#F2C14E" },
  { name: "Pink", hex: "#F28BB8" },
  { name: "Teal", hex: "#5BB8A6" },
  { name: "Blue", hex: "#5B8FE6" },
];

export default function MascotsLab({ navigateTo }) {
  // Playground state
  const [seed, setSeed] = useState("Nethro");
  const [mood, setMood] = useState("idle");
  const [color, setColor] = useState("#00D4FF");
  const [body, setBody] = useState("round");
  const [eyes, setEyes] = useState("dot");
  const [sunglasses, setSunglasses] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Scenario 1: Shy Password
  const [demoEmail, setDemoEmail] = useState("");
  const [demoPassword, setDemoPassword] = useState("");
  const [activeDemoField, setActiveDemoField] = useState(null);
  const demoEmailRef = useRef(null);

  // Scenario 2: Tempting Button
  const [temptingHovered, setTemptingHovered] = useState(false);
  const [temptingPressed, setTemptingPressed] = useState(false);

  // Scenario 3: Scary Button
  const [scaryHovered, setScaryHovered] = useState(false);
  const [scaryTriggered, setScaryTriggered] = useState(false);

  // Scenario 4: Love button
  const [likes, setLikes] = useState(42);
  const [isLoved, setIsLoved] = useState(false);

  // Scenario 5: Async Task
  const [taskState, setTaskState] = useState("idle"); // idle, running, success

  // Scenario 6: Sleepy mascot
  const [sleepyMood, setSleepyMood] = useState("sleeping");

  // Copy install
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm i mascotz");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopyCode = () => {
    const codeSnippet = `<Mascot
  seed="${seed}"
  mood="${mood}"
  body="${body}"
  eyes="${eyes}"
  color="${color}"
  sunglasses={${sunglasses}}
  size={128}
/>`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunTask = () => {
    setTaskState("running");
    setTimeout(() => {
      setTaskState("success");
      setTimeout(() => setTaskState("idle"), 3500);
    }, 1800);
  };

  return (
    <section id="mascots-lab" className="mascots-lab-section">
      <div className="section-inner-container">
        {/* ── SECTION HEADER ── */}
        <div className="mascot-section-header">
          <div className="mascot-pill-badge">
            <span className="mascot-pill-dot" />
            <span>Interactive Agents & Mascot Engine</span>
          </div>
          <h2 className="mascot-section-title">
            Mascots that <span className="mascot-gradient-text">watch, react & come alive.</span>
          </h2>
          <p className="mascot-section-desc">
            Integrate dynamic digital companions whose eyes follow cursor movement, blink naturally, and react in real time: shy on password fields, curious about buttons, thinking while data compiles, and delighted on success.
          </p>

          <div className="mascot-quick-bar">
            <button className="mascot-install-btn" onClick={handleCopyInstall}>
              <span className="terminal-prompt">$</span>
              <code>npm i mascotz</code>
              <span className="install-copy-tag">{copiedInstall ? "✓ Copied" : "Copy"}</span>
            </button>
            <a
              href="https://www.mascotz.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="mascot-external-link"
            >
              Explore mascotz.dev ↗
            </a>
          </div>
        </div>

        {/* ── INTERACTIVE PLAYGROUND STUDIO ── */}
        <div className="mascot-studio-card">
          <div className="mascot-studio-header">
            <div>
              <span className="studio-tag">Interactive Design Studio</span>
              <h3 className="studio-heading">Design & Test Your Companion</h3>
            </div>
            <button className="copy-code-btn" onClick={handleCopyCode}>
              {copiedCode ? "✓ Snippet Copied!" : "📋 Copy React Code"}
            </button>
          </div>

          <div className="mascot-studio-grid">
            {/* LEFT: LIVE PREVIEW STAGE */}
            <div className="mascot-preview-stage">
              <div className="mascot-stage-spotlight" />
              <div
                className="mascot-stage-figure"
                onClick={() => setSunglasses((s) => !s)}
                title="Click to toggle sunglasses!"
              >
                <Mascot
                  seed={seed || "Nethro"}
                  mood={mood}
                  body={body}
                  eyes={eyes}
                  color={color}
                  sunglasses={sunglasses}
                  size={160}
                />
              </div>

              <div className="mascot-stage-meta">
                <span className="meta-seed">seed: "{seed || 'Nethro'}"</span>
                <span className="meta-mood">mood: {mood}</span>
                <span className="meta-badge" onClick={() => setSunglasses((s) => !s)}>
                  {sunglasses ? "🕶️ Shades ON (click to remove)" : "👓 Click for shades"}
                </span>
              </div>
            </div>

            {/* RIGHT: CONTROLS */}
            <div className="mascot-controls-panel">
              {/* SEED INPUT */}
              <div className="control-group">
                <label className="control-label">
                  Deterministic Seed String
                  <span className="control-sublabel">(Any name generates a unique mascot)</span>
                </label>
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="e.g. Nethro, Petra, Atlas, Nova..."
                  className="mascot-text-input"
                />
              </div>

              {/* MOOD SELECTOR */}
              <div className="control-group">
                <label className="control-label">Mascot Mood State ({mood})</label>
                <div className="mood-pills-wrap">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`mood-pill-btn ${mood === m ? "active" : ""}`}
                      onClick={() => setMood(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* BODY SHAPES */}
              <div className="control-group">
                <label className="control-label">Body Geometry ({body})</label>
                <div className="geometry-pills-wrap">
                  {BODIES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`geo-pill-btn ${body === b ? "active" : ""}`}
                      onClick={() => setBody(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* EYE TYPES */}
              <div className="control-group">
                <label className="control-label">Eye Styles ({eyes})</label>
                <div className="geometry-pills-wrap">
                  {EYES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={`geo-pill-btn ${eyes === e ? "active" : ""}`}
                      onClick={() => setEyes(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLOR PRESETS */}
              <div className="control-group">
                <label className="control-label">Color Swatches</label>
                <div className="color-swatches-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`color-swatch-btn ${color.toLowerCase() === c.hex.toLowerCase() ? "selected" : ""}`}
                      onClick={() => setColor(c.hex)}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="custom-color-picker"
                    title="Custom Hex Color"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIGNATURE INTERACTIVE MOMENTS (SCENARIOS) ── */}
        <div className="scenarios-container">
          <div className="scenarios-title-wrap">
            <span className="studio-tag">Live Reactive Behaviors</span>
            <h3 className="scenarios-heading">Interactive Moments in Action</h3>
            <p className="scenarios-subtext">
              Try the real-time reactions below — see how characters adapt to forms, user intent, loading states, and cursor presence.
            </p>
          </div>

          <div className="scenarios-grid">
            {/* SCENARIO 1: SHY PASSWORD WATCHER */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill">Form Privacy</span>
                <span className="scenario-title">The Shy Password Watcher</span>
              </div>
              <p className="scenario-desc">
                Follows your email typing with its eyes. When you move to the password field, it blushes and looks away.
              </p>

              <div className="scenario-mascot-box">
                <Mascot
                  seed="ShyLock"
                  mood={
                    activeDemoField === "password"
                      ? "shy"
                      : activeDemoField === "email"
                      ? "curious"
                      : "idle"
                  }
                  lookAt={activeDemoField === "password" ? null : activeDemoField === "email" ? demoEmailRef : "cursor"}
                  size={90}
                  color="#00D4FF"
                />
              </div>

              <div className="scenario-form">
                <input
                  ref={demoEmailRef}
                  type="email"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  onFocus={() => setActiveDemoField("email")}
                  onBlur={() => setActiveDemoField(null)}
                  placeholder="name@company.com"
                  className="scenario-input"
                />
                <input
                  type="password"
                  value={demoPassword}
                  onChange={(e) => setDemoPassword(e.target.value)}
                  onFocus={() => setActiveDemoField("password")}
                  onBlur={() => setActiveDemoField(null)}
                  placeholder="Enter secret password..."
                  className="scenario-input"
                />
              </div>
              <span className="scenario-status-label">
                {activeDemoField === "password"
                  ? "🙈 Shy mode active (eyes covered)"
                  : activeDemoField === "email"
                  ? "👀 Tracking your keystrokes"
                  : "Hover/focus an input"}
              </span>
            </div>

            {/* SCENARIO 2: TEMPTING BUTTON */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill">Hover Physics</span>
                <span className="scenario-title">The Tempting Button</span>
              </div>
              <p className="scenario-desc">
                Hover the button: the mascot perks up and watches eagerly. Click it to trigger a celebratory wink!
              </p>

              <div className="scenario-mascot-box">
                <Mascot
                  seed="TemptingBot"
                  mood={temptingPressed ? "happy" : temptingHovered ? "curious" : "idle"}
                  sunglasses={temptingPressed}
                  size={90}
                  color="#4DFFB4"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  className="tempting-action-btn"
                  onMouseEnter={() => setTemptingHovered(true)}
                  onMouseLeave={() => setTemptingHovered(false)}
                  onClick={() => {
                    setTemptingPressed(true);
                    setTimeout(() => setTemptingPressed(false), 2400);
                  }}
                >
                  {temptingPressed ? "🎉 Awesome!" : "Hover & Press Me"}
                </button>
              </div>

              <span className="scenario-status-label">
                {temptingPressed
                  ? "✨ Happy celebration!"
                  : temptingHovered
                  ? "👀 It's watching eagerly!"
                  : "Move cursor over the button"}
              </span>
            </div>

            {/* SCENARIO 3: DANGER ZONE */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill" style={{ color: "#FF6B6B", borderColor: "#FF6B6B44" }}>
                  Alerts & Safety
                </span>
                <span className="scenario-title">The Danger Warning</span>
              </div>
              <p className="scenario-desc">
                Hover over a high-consequence button. The sentinel gets alarmed and warns you against rash actions.
              </p>

              <div className="scenario-mascot-box">
                <Mascot
                  seed="Sentinel"
                  mood={scaryTriggered ? "dizzy" : scaryHovered ? "angry" : "idle"}
                  body="triangle"
                  size={90}
                  color="#FF6B6B"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  className="danger-action-btn"
                  onMouseEnter={() => setScaryHovered(true)}
                  onMouseLeave={() => setScaryHovered(false)}
                  onClick={() => {
                    setScaryTriggered(true);
                    setTimeout(() => setScaryTriggered(false), 2000);
                  }}
                >
                  ⚠️ Delete Cloud Database
                </button>
              </div>

              <span className="scenario-status-label">
                {scaryTriggered
                  ? "💥 System meltdown averted!"
                  : scaryHovered
                  ? "😠 Sentinel is angry / alarmed!"
                  : "Hover to see sentinel reaction"}
              </span>
            </div>

            {/* SCENARIO 4: LOVE REACTOR */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill" style={{ color: "#F28BB8", borderColor: "#F28BB844" }}>
                  Affinity
                </span>
                <span className="scenario-title">Heart Affinity Reactor</span>
              </div>
              <p className="scenario-desc">
                Click to send appreciation. The mascot's eyes instantly turn to glowing hearts.
              </p>

              <div className="scenario-mascot-box">
                <Mascot
                  seed="SweetHeart"
                  mood={isLoved ? "love" : "idle"}
                  size={90}
                  color="#F28BB8"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  className="love-action-btn"
                  onClick={() => {
                    setLikes((l) => l + 1);
                    setIsLoved(true);
                    setTimeout(() => setIsLoved(false), 2500);
                  }}
                >
                  ❤️ Send Love ({likes})
                </button>
              </div>

              <span className="scenario-status-label">
                {isLoved ? "😍 Heart eyes activated!" : "Click to react with love"}
              </span>
            </div>

            {/* SCENARIO 5: ASYNC TASK LOADER */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill">Async Handshake</span>
                <span className="scenario-title">Thinking While Loading</span>
              </div>
              <p className="scenario-desc">
                Dispatches a cloud pipeline. Mascot ponders thoughtfully while computing, then celebrates on finish.
              </p>

              <div className="scenario-mascot-box">
                <Mascot
                  seed="PipelineBot"
                  mood={taskState === "running" ? "thinking" : taskState === "success" ? "happy" : "idle"}
                  sunglasses={taskState === "success"}
                  size={90}
                  color="#8F7CF0"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  className="task-action-btn"
                  disabled={taskState === "running"}
                  onClick={handleRunTask}
                >
                  {taskState === "running"
                    ? "⚡ Computing Nodes..."
                    : taskState === "success"
                    ? "✓ Deployment Succeeded"
                    : "Execute Microservices"}
                </button>
              </div>

              <span className="scenario-status-label">
                {taskState === "running"
                  ? "🤔 Thinking while process runs..."
                  : taskState === "success"
                  ? "🎉 Finished successfully!"
                  : "Click to start pipeline"}
              </span>
            </div>

            {/* SCENARIO 6: SLEEPY MASCOT */}
            <div className="scenario-card">
              <div className="scenario-card-header">
                <span className="scenario-pill">Idle State</span>
                <span className="scenario-title">Inactivity Snooze</span>
              </div>
              <p className="scenario-desc">
                When visitors stay idle, the mascot falls asleep. Hover over it to gently wake it up!
              </p>

              <div
                className="scenario-mascot-box"
                onMouseEnter={() => setSleepyMood("surprised")}
                onMouseLeave={() => setTimeout(() => setSleepyMood("sleeping"), 2000)}
                style={{ cursor: "pointer" }}
              >
                <Mascot
                  seed="Snoozy"
                  mood={sleepyMood}
                  size={90}
                  color="#F2C14E"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  className="wake-action-btn"
                  onClick={() => {
                    setSleepyMood("happy");
                    setTimeout(() => setSleepyMood("sleeping"), 3000);
                  }}
                >
                  ⏰ Wake Up Mascot!
                </button>
              </div>

              <span className="scenario-status-label">
                {sleepyMood === "sleeping"
                  ? "💤 Snoozing quietly (hover to wake)"
                  : sleepyMood === "surprised"
                  ? "😮 Awake and alert!"
                  : "😊 Cheerful and energetic!"}
              </span>
            </div>
          </div>
        </div>

        {/* ── CALLOUT / FOOTER BANNER ── */}
        <div className="mascot-footer-banner">
          <div>
            <h4 className="banner-title">Bring your brand to life with custom Mascots</h4>
            <p className="banner-desc">
              We design custom characters, bespoke animations, and interactive agentic UI tailored to your platform architecture.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigateTo("contact")}>
            Consult Our UI Engineers →
          </button>
        </div>
      </div>
    </section>
  );
}
