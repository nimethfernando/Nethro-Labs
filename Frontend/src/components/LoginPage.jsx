import { useState } from "react";
import "./LoginPage.css"; // We import the clean, separate CSS file here

export default function LoginPage({ onLoginSuccess, navigateTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // The role returned from the database triggers the automatic redirection
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand" onClick={() => navigateTo("home")}>
          Nethro<span className="login-brand-dot">.</span>Labs
        </div>
        
        <h2 className="login-title">Portal Identity Access</h2>
        <p className="login-subtitle">Enter your credentials to connect to your workspace terminal</p>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Corporate Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="name@nethrolabs.com"
              required
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Security Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? "Decrypting Auth Link..." : "Authenticate Session"}
          </button>
        </form>
      </div>
    </div>
  );
}