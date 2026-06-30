import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "../premiumLogin.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revenue, setRevenue] = useState(0);
  const navigate = useNavigate();

  // Count-up animation
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 50;
      if (count >= 5000) {
        count = 5000;
        clearInterval(interval);
      }
      setRevenue(count);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="premium-bg">
      {/* Logo */}
      <div className="logo">💼 SalesPro</div>

      <div className="center">
        <div className="premium-card">
          <h2>Sales Intelligence</h2>
          <p>Grow revenue with insights</p>

          {/* Count-up revenue */}
          <div className="revenue">₹ {revenue}+</div>

          {/* Animated SVG graph */}
          <svg
            className="graph"
            width="100%"
            height="80"
            viewBox="0 0 300 80"
          >
            <path
              d="M10 60 L60 40 L120 50 L180 20 L240 35"
              fill="none"
              stroke="#ff9800"
              strokeWidth="4"
            />
          </svg>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Business Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button>Login</button>
          </form>

          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

