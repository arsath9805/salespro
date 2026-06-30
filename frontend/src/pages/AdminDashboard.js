import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/adminDashboard.css";
import { updateOrderStatus } from "../services/orderService";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  /* ================= ANALYTICS STATES (NEW) ================= */
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [shippedCount, setShippedCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [monthlySales, setMonthlySales] = useState({});

  /* ================= FETCH ORDERS (EXISTING + EXTENDED) ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(list);

      /* 🔥 LIVE ANALYTICS CALCULATION */
      let revenue = 0;
      let placed = 0;
      let shipped = 0;
      let delivered = 0;
      let monthData = {};

      list.forEach((order) => {
        revenue += order.price * order.quantity;

        if (order.status === "DELIVERED") delivered++;
        else if (order.status === "SHIPPED") shipped++;
        else placed++;

        /* MONTHLY SALES */
        if (order.orderedAt) {
          const date = order.orderedAt.toDate();
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const product = order.productName;

          if (!monthData[monthKey]) monthData[monthKey] = {};
          if (!monthData[monthKey][product])
            monthData[monthKey][product] = 0;

          monthData[monthKey][product] += order.quantity;
        }
      });

      setTotalRevenue(revenue);
      setPlacedCount(placed);
      setShippedCount(shipped);
      setDeliveredCount(delivered);
      setMonthlySales(monthData);
    };

    fetchOrders();
  }, []);

  /* ================= SALES PREDICTION ================= */
  const predictNextMonthSales = (productName) => {
    let total = 0;
    let months = 0;

    Object.values(monthlySales).forEach((products) => {
      if (products[productName]) {
        total += products[productName];
        months++;
      }
    });

    return months === 0 ? 0 : Math.round(total / months);
  };

  return (
    <div className="admin-container">
      {/* ================= HEADER ================= */}
      <div className="admin-header">
        <h1>🛠 Admin Dashboard</h1>
        <p>System overview & control panel</p>
      </div>

      {/* ================= STATS CARDS (EXISTING UI, DYNAMIC DATA) ================= */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <h3>💰 Total Revenue</h3>
          <p>₹ {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card orders">
          <h3>📦 Total Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div className="stat-card users">
          <h3>👤 Registered Users</h3>
          <p>326</p>
        </div>

        <div className="stat-card products">
          <h3>🛍 Products</h3>
          <p>750</p>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY (UNCHANGED) ================= */}
      <div className="admin-section">
        <h2>📊 Recent Activity</h2>

        <div className="activity-card">
          <p>
            ✅ New order placed by <b>barath@gmail.com</b>
          </p>
          <span>2 minutes ago</span>
        </div>

        <div className="activity-card">
          <p>👤 New user registered</p>
          <span>10 minutes ago</span>
        </div>

        <div className="activity-card">
          <p>📦 Product stock updated</p>
          <span>30 minutes ago</span>
        </div>
      </div>

      {/* ================= ORDER MANAGEMENT (NEW) ================= */}
      <div className="admin-section">
        <h2>📦 Order Management</h2>

        {orders.length === 0 && <p>No orders found</p>}

        {orders.map((order) => (
          <div className="activity-card" key={order.id}>
            <div>
              <p><b>User:</b> {order.userEmail}</p>
              <p><b>Product:</b> {order.productName}</p>
              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    color:
                      order.status === "DELIVERED"
                        ? "green"
                        : order.status === "SHIPPED"
                        ? "orange"
                        : "blue",
                    fontWeight: "bold",
                  }}
                >
                  {order.status}
                </span>
              </p>
            </div>

            <select
              value={order.status}
              onChange={(e) =>
                updateOrderStatus(order.id, e.target.value)
              }
              style={{ padding: "6px", borderRadius: "6px" }}
            >
              <option value="PLACED">Placed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        ))}
      </div>

      {/* ================= MONTHLY SALES ================= */}
      <div className="admin-section">
        <h2>📅 Monthly Product Sales</h2>

        {Object.entries(monthlySales).map(([month, products]) => (
          <div key={month}>
            <h4>{month}</h4>
            {Object.entries(products).map(([name, qty]) => (
              <p key={name}>
                {name} → {qty} units
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* ================= SALES PREDICTION ================= */}
      <div className="admin-section">
        <h2>🔮 Sales Prediction</h2>
        <p>
          Expected next month sales for <b>Laptop</b>:{" "}
          {predictNextMonthSales("Laptop")}
        </p>
      </div>

      {/* ================= ORDER STATUS SUMMARY ================= */}
      <div className="admin-section">
        <h2>📊 Order Status Summary</h2>

        <div className="stats-grid">
          <div className="stat-card orders">
            <h3>🕒 Placed</h3>
            <p>{placedCount}</p>
          </div>

          <div className="stat-card users">
            <h3>🚚 Shipped</h3>
            <p>{shippedCount}</p>
          </div>

          <div className="stat-card revenue">
            <h3>✅ Delivered</h3>
            <p>{deliveredCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
