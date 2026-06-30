import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>📦 My Orders</h2>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            background: "#fff",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h4>{order.productName}</h4>
          <p>Price: ₹ {order.price}</p>

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

          <p>
            Ordered on:{" "}
            {order.orderedAt?.toDate().toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
