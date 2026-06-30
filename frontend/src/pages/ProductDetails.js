import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";
import { placeOrder } from "../services/orderService";
import "../styles/productDetails.css";
import { toast } from "react-toastify";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [buyers, setBuyers] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [recentBuyers, setRecentBuyers] = useState([]);

  /* FETCH PRODUCT */
  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));

      if (snap.exists()) {
        setProduct({
          id: snap.id,
          ...snap.data(),
        });
      }
    };

    fetchProduct();
  }, [id]);

  /* FETCH PRODUCT ORDERS */
  useEffect(() => {
    if (!product) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("productName", "==", product.product_name)
        );

        const snapshot = await getDocs(q);

        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const uniqueBuyers = new Set();

        let sold = 0;

        orderList.forEach((order) => {
          if (order.userEmail) {
            uniqueBuyers.add(order.userEmail);
          }

          sold += Number(order.quantity || 0);
        });

        setBuyers(uniqueBuyers.size);
        setTotalSold(sold);
        setRecentBuyers(orderList.slice(0, 5));
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [product]);

  if (!product) {
    return <p className="loading">Loading product...</p>;
  }

  return (
    <div className="details-page">
      <div className="details-card animate">

        {/* IMAGE */}
        <div className="image-box">
          <img
            src={`https://via.placeholder.com/420?text=${product.product_name}`}
            alt={product.product_name}
          />
        </div>

        {/* INFO */}
        <div className="info-box">

          <h1>{product.product_name}</h1>

          <p className="category">
            {product.category}
          </p>

          <div className="price">
            ₹ {product.per_cost}
          </div>

          <p className="stock">
            {product.quantity > 0
              ? "✅ In Stock"
              : "❌ Out of Stock"}
          </p>

          <p>
            Quantity Available: {product.quantity}
          </p>

          {/* AMAZON STYLE STATS */}

          <hr style={{ margin: "20px 0" }} />

          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            👥 {buyers} people bought this item
          </p>

          <p
            style={{
              fontWeight: "bold",
            }}
          >
            📦 Total Sold: {totalSold}
          </p>

          <p
            style={{
              color: "#f59e0b",
              fontSize: "20px",
            }}
          >
            ⭐⭐⭐⭐⭐
          </p>

          {/* BUY BUTTON */}

          <button
            className="buy-btn"
            disabled={product.quantity <= 0}
            onClick={async () => {
              try {
                await placeOrder(product);

                toast.success(
                  "🎉 Order placed successfully!",
                  {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored",
                  }
                );

                setProduct((prev) => ({
                  ...prev,
                  quantity: prev.quantity - 1,
                }));

                setTotalSold((prev) => prev + 1);

              } catch (err) {
                console.error(err);

                toast.error(err.message, {
                  position: "top-right",
                  autoClose: 3000,
                });
              }
            }}
          >
            {product.quantity > 0
              ? "Buy Now"
              : "Out of Stock"}
          </button>

          {/* RECENT BUYERS */}

          <hr style={{ marginTop: "30px" }} />

          <h3>🛒 Recent Buyers</h3>

          {recentBuyers.length === 0 ? (
            <p>No purchases yet.</p>
          ) : (
            recentBuyers.map((buyer, index) => (
              <div
                key={index}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px",
                }}
              >
                👤{" "}
                {buyer.userEmail || "Unknown User"}

                {"  •  "}

                {buyer.quantity} item(s)
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;