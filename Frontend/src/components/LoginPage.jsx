import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLoginSuccess, navigateTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // First-time reset state
  const [isResetStep, setIsResetStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      // Check if backend flagged mandatory password setup
      if (data.requiresPasswordReset) {
        setTempToken(data.token);
        setIsResetStep(true);
        return;
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password update failed.");
      }

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
        <div className="login-brand" onClick={() => navigateTo && navigateTo("home")}>
          Nethro<span className="login-brand-dot">.</span>Labs
        </div>

        {!isResetStep ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className="login-title">Initial Password Setup</h2>
            <p className="login-subtitle">A mandatory password change is required for your first session.</p>

            {error && <div className="login-error-alert">{error}</div>}

            <form onSubmit={handlePasswordReset} className="login-form">
              <div className="login-input-group">
                <label className="login-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="login-input-group">
                <label className="login-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Updating Credentials..." : "Update & Access Workspace"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}