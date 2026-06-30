import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => doc.data()));
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>My Orders</h2>
      {orders.map((o, i) => (
        <p key={i}>
          {o.productName} – ₹{o.price}
        </p>
      ))}
    </div>
  );
}
