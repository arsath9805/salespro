import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

import Sidebar from "../components/Sidebar";

function Notifications() {

  const [notifications,
    setNotifications] =
    useState([]);

  useEffect(() => {

    const fetchNotifications =
      async () => {

      let alerts = [];

      /* =====================
         LOW STOCK ALERTS
      ===================== */

      const productSnapshot =
        await getDocs(
          collection(
            db,
            "products"
          )
        );

      const products =
        productSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      products.forEach(
        (product) => {

          if (
            Number(
              product.quantity
            ) <=
            Number(
              product.threshold || 5
            )
          ) {

            alerts.push({

              type:
                "low-stock",

              icon:
                "⚠️",

              message:
                `${product.product_name} stock is low (${product.quantity} left)`,

              time:
                product.last_updated ||
                new Date(),

            });

          }

        }
      );

      /* =====================
         NEW ORDERS
      ===================== */

      const orderSnapshot =
        await getDocs(
          collection(
            db,
            "orders"
          )
        );

      const orders =
        orderSnapshot.docs.map(
          (doc) =>
            doc.data()
        );

      orders.forEach(
        (order) => {

          alerts.push({

            type:
              "new-order",

            icon:
              "🛒",

            message:
              `${order.userEmail} ordered ${order.productName}`,

            time:
              order.orderedAt
                ? order.orderedAt.toDate()
                : new Date(),

          });

        }
      );

      /* =====================
         RESTOCKED PRODUCTS
      ===================== */

      products.forEach(
        (product) => {

          if (
            Number(
              product.quantity
            ) >
            Number(
              product.threshold || 5
            ) * 2
          ) {

            alerts.push({

              type:
                "restock",

              icon:
                "✅",

              message:
                `${product.product_name} is sufficiently stocked (${product.quantity} units)`,

              time:
                product.last_updated ||
                new Date(),

            });

          }

        }
      );

      /* =====================
         LATEST FIRST
      ===================== */

      alerts.sort(
        (a, b) =>
          new Date(
            b.time
          ) -
          new Date(
            a.time
          )
      );

      setNotifications(
        alerts
      );

    };

    fetchNotifications();

  }, []);

  return (

    <>
      <Sidebar />

      <div
        className="dashboard-content"
      >

        <h2>
          🔔 Notifications
        </h2>

        <p>
          Real-time alerts
          and system events.
        </p>

        <div
          style={{
            marginTop:
              "30px",
          }}
        >

          {notifications.length ===
          0 ? (

            <div
              style={{
                background:
                  "#fff",
                padding:
                  "30px",
                borderRadius:
                  "20px",
                textAlign:
                  "center",
              }}
            >

              No notifications.

            </div>

          ) : (

            notifications.map(
              (
                notification,
                index
              ) => (

                <div
                  key={index}
                  style={{
                    background:
                      "#fff",

                    padding:
                      "20px",

                    borderRadius:
                      "16px",

                    marginBottom:
                      "15px",

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    boxShadow:
                      "0 5px 15px rgba(0,0,0,0.08)",
                  }}
                >

                  <div>

                    <h3>

                      {
                        notification.icon
                      }

                      {" "}

                      {
                        notification.message
                      }

                    </h3>

                  </div>

                  <small>

                    {new Date(
                      notification.time
                    ).toLocaleString()}

                  </small>

                </div>

              )
            )

          )}

        </div>

      </div>

    </>

  );

}

export default Notifications;