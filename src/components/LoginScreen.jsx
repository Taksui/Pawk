import { signInWithGoogle } from "../services/authService";
import "../styles/LoginScreen.css";

function LoginScreen() {
  async function handleLogin() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">

        <div className="login-logo">🐾</div>

        <h1 className="login-title">PawMap</h1>
        <p className="login-sub">
          Map and track street dogs in your city.<br />
          Powered by AI.
        </p>

        <button className="login-btn" onClick={handleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
          />
          Continue with Google
        </button>

        <p className="login-note">
          Free to use · No spam · Open source
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;