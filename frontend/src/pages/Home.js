import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { auth } from "../firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "../dashboard.css";

/* Sample sales data */
const salesData = [
  { month: "Jan", sales: 400 },
  { month: "Feb", sales: 650 },
  { month: "Mar", sales: 800 },
  { month: "Apr", sales: 720 },
  { month: "May", sales: 1100 }
];

function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const user = auth.currentUser;

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-content">

        {/* Header */}
        <div className="header">
          <h2>Sales Dashboard 📊</h2>
          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* User Profile */}
        <div className="card profile">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
          />
          <div>
            <h3>{user?.email}</h3>
            <p>Sales Executive</p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="charts">
          <div className="card">
            <h3>Monthly Sales Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#374151"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
