import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../premiumLogin.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Create user in Firebase Authentication
      await signup(email, password);

      // Get the currently logged-in user
      const user = auth.currentUser;

      // Store additional user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      alert("Account created successfully!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="premium-bg">
      <div className="center">
        <div className="premium-card">
          <h2>Create Account</h2>
          <p>Start managing sales intelligently</p>

          <form onSubmit={handleSignup}>
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

            <button>Create Account</button>
          </form>

          <Link to="/">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}