import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import "../dashboard.css";

function Sidebar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔐 Check user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2 className="logo-text">SalesPro</h2>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/home" className="nav-link">
          📊 Dashboard
        </NavLink>

        <NavLink to="/products" className="nav-link">
          📦 Products
        </NavLink>

        <NavLink to="/analytics" className="nav-link">
          📈 Analytics
        </NavLink>

        <NavLink to="/prediction" className="nav-link">
          🔮 Prediction
        </NavLink>

        <NavLink to="/notifications" className="nav-link">
          🔔 Notifications
        </NavLink>

        {/* 🔑 ADMIN ONLY */}
        {isAdmin && (
          <NavLink to="/admin" className="nav-link">
            🛠 Admin Dashboard
          </NavLink>
        )}
      </nav>

      {/* LOGOUT – VECTOR ICON ONLY */}
      <div className="logout-link" onClick={handleLogout}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>

        <span>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;
