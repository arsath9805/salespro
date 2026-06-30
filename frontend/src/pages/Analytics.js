import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";


import Sidebar from "../components/Sidebar";
import { db } from "../firebase";
import "../styles/analytics.css";

const Plot = createPlotlyComponent(Plotly);

function Analytics() {

  /* ===========================
        STATES
  =========================== */

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [fastProducts, setFastProducts] = useState([]);
  const [slowProducts, setSlowProducts] = useState([]);

  const [categoryData, setCategoryData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [inventoryPie, setInventoryPie] = useState([]);
  const [statusData, setStatusData] = useState([]);

  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [forecastData, setForecastData] = useState([]);
  const [restockProducts, setRestockProducts] = useState([]);

  const [averageOrderValue, setAverageOrderValue] =
    useState(0);

  const [insights, setInsights] = useState([]);


  /* ===========================
        FETCH DATA
  =========================== */

  useEffect(() => {

    const fetchAnalytics = async () => {

      /* ======================
            PRODUCTS
      ====================== */

      const productSnap = await getDocs(
        collection(db, "products")
      );

      const products = productSnap.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      setTotalProducts(products.length);

      /* INVENTORY VALUE */

      const inventory = products.reduce(
        (sum, p) =>
          sum +
          Number(p.per_cost || 0) *
          Number(p.quantity || 0),
        0
      );

      setInventoryValue(inventory);

      /* PROFIT */

      let profitAmount = 0;

      products.forEach((product) => {

        const costPrice =
          product.cost_price ??
          Math.round(product.per_cost * 0.8);

        const profitPerUnit =
          product.per_cost - costPrice;

        profitAmount +=
          profitPerUnit *
          Number(product.quantity || 0);

      });

      setTotalProfit(profitAmount);

      /* LOW STOCK */

      const lowStock = products.filter(
        (p) =>
          Number(p.quantity) <=
          Number(p.threshold || 5)
      );

      setLowStockProducts(lowStock);

      /* CATEGORY ANALYTICS */

      const categoryMap = {};

      products.forEach((product) => {

        const category =
          product.category || "Others";

        categoryMap[category] =
          (categoryMap[category] || 0) + 1;
      });

      setCategoryData(
        Object.keys(categoryMap).map(
          (key) => ({
            category: key,
            value: categoryMap[key],
          })
        )
      );

      /* BRAND ANALYTICS */

      const brandMap = {};

      products.forEach((product) => {

        const brand =
          product.supplier || "Unknown";

        brandMap[brand] =
          (brandMap[brand] || 0) + 1;
      });

      setBrandData(
        Object.keys(brandMap).map(
          (key) => ({
            brand: key,
            value: brandMap[key],
          })
        )
      );

      /* INVENTORY HEALTH */

      const inStock =
        products.filter(
          (p) => p.quantity > 5
        ).length;

      const low =
        products.filter(
          (p) =>
            p.quantity > 0 &&
            p.quantity <= 5
        ).length;

      const out =
        products.filter(
          (p) => p.quantity === 0
        ).length;

      setInventoryPie([
        {
          name: "In Stock",
          value: inStock,
        },
        {
          name: "Low Stock",
          value: low,
        },
        {
          name: "Out Of Stock",
          value: out,
        },
      ]);


      /* ======================
             ORDERS
      ====================== */

      const orderSnap = await getDocs(
        collection(db, "orders")
      );

      const orders = orderSnap.docs.map(
        (doc) => doc.data()
      );

      setTotalOrders(orders.length);

      /* REVENUE */

      const revenue = orders.reduce(
        (sum, order) =>
          sum +
          Number(order.price || 0),
        0
      );

      setTotalRevenue(revenue);

      /* CUSTOMERS */

      const customers = new Set();

      orders.forEach((o) =>
        customers.add(o.userEmail)
      );

      setTotalCustomers(customers.size);

      /* AVERAGE ORDER VALUE */

      setAverageOrderValue(
        orders.length
          ? revenue / orders.length
          : 0
      );

      /* ORDER STATUS */

      const statusMap = {};

      orders.forEach((order) => {

        const status =
          order.status || "PLACED";

        statusMap[status] =
          (statusMap[status] || 0) + 1;

      });

      setStatusData(
        Object.keys(statusMap).map(
          (key) => ({
            status: key,
            count: statusMap[key],
          })
        )
      );


      /* ======================
         TOP SELLING PRODUCTS
      ====================== */

      const salesMap = {};

      orders.forEach((order) => {

        salesMap[order.productName] =
          (salesMap[
            order.productName
          ] || 0) +
          Number(order.quantity || 0);

      });

      const sortedProducts =
        Object.keys(salesMap)
          .map((key) => ({
            name: key,
            sold: salesMap[key],
          }))
          .sort(
            (a, b) =>
              b.sold - a.sold
          );

      setTopProducts(
        sortedProducts.slice(0, 5)
      );

      setFastProducts(
        sortedProducts.filter(
          (p) => p.sold >= 5
        )
      );

      setSlowProducts(
        sortedProducts.filter(
          (p) => p.sold < 5
        )
      );


      /* ======================
          REVENUE TRENDS
      ====================== */

      const dailyMap = {};
      const weeklyMap = {};
      const monthlyMap = {};

      orders.forEach((order) => {

        if (!order.orderedAt) return;

        const date =
          order.orderedAt.toDate();

        const amount =
          Number(order.price || 0);

        /* DAILY */

        const dayKey =
          date.toISOString()
            .split("T")[0];

        dailyMap[dayKey] =
          (dailyMap[dayKey] || 0) +
          amount;

        /* WEEKLY */

        const week =
          Math.ceil(
            date.getDate() / 7
          );

        const weekKey =
          `${date.getFullYear()}-W${week}`;

        weeklyMap[weekKey] =
          (weeklyMap[weekKey] || 0) +
          amount;

        /* MONTHLY */

        const monthKey =
          `${date.getFullYear()}-${date.getMonth() + 1}`;

        monthlyMap[monthKey] =
          (monthlyMap[monthKey] || 0) +
          amount;

      });


      setDailyRevenue(
        Object.keys(dailyMap).map(
          (key) => ({
            date: key,
            revenue: dailyMap[key],
          })
        )
      );

      setWeeklyRevenue(
        Object.keys(weeklyMap).map(
          (key) => ({
            week: key,
            revenue: weeklyMap[key],
          })
        )
      );

      setMonthlyRevenue(
        Object.keys(monthlyMap).map(
          (key) => ({
            month: key,
            revenue: monthlyMap[key],
          })
        )
      );


      /* ======================
          FORECAST SUMMARY
      ====================== */

      const forecast =
        sortedProducts.map(
          (product) => ({

            name: product.name,

            current:
              product.sold,

            predicted:
              Math.round(
                product.sold * 1.15
              ),

          })
        );

      setForecastData(forecast);

      setRestockProducts(
        products.filter(
          (p) =>
            p.quantity <
            p.threshold
        )
      );


      /* ======================
         AI INSIGHTS
      ====================== */

      const aiInsights = [];

      if (lowStock.length > 0) {

        aiInsights.push(
          `${lowStock.length} products require immediate restocking.`
        );

      }

      if (
        sortedProducts.length > 0
      ) {

        aiInsights.push(
          `${sortedProducts[0].name} is currently the top-selling product.`
        );

      }

      if (
        revenue > 100000
      ) {

        aiInsights.push(
          "Revenue performance is strong this month."
        );

      }

      setInsights(aiInsights);

    };

    fetchAnalytics();

  }, []);
    return (
    <>
      <Sidebar />

      <div className="dashboard-content">

        <h2>📊 Analytics Dashboard</h2>

        <p>
          Real-time business insights and sales analytics.
        </p>

        {/* ======================
            SUMMARY CARDS
        ====================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >

          <div className="card">
            <h3>📦 Products</h3>
            <h1>{totalProducts}</h1>
          </div>

          <div className="card">
            <h3>🛒 Orders</h3>
            <h1>{totalOrders}</h1>
          </div>

          <div className="card">
            <h3>💰 Revenue</h3>
            <h1>
              ₹ {totalRevenue.toLocaleString()}
            </h1>
          </div>

          <div className="card">
            <h3>📈 Profit</h3>
            <h1>
              ₹ {Math.round(
                totalProfit
              ).toLocaleString()}
            </h1>
          </div>

          <div className="card">
            <h3>👥 Customers</h3>
            <h1>{totalCustomers}</h1>
          </div>

          <div className="card">
            <h3>🏬 Inventory Value</h3>
            <h1>
              ₹ {Math.round(
                inventoryValue
              ).toLocaleString()}
            </h1>
          </div>

          <div className="card">
            <h3>⚠️ Low Stock</h3>
            <h1>
              {lowStockProducts.length}
            </h1>
          </div>

        </div>


        {/* ======================
            DAILY REVENUE
        ====================== */}

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >

          <h3>📅 Daily Revenue Trend</h3>

          <Plot
            data={[
              {
                x: dailyRevenue.map(
                  (d) => d.date
                ),

                y: dailyRevenue.map(
                  (d) => d.revenue
                ),

                type: "scatter",

                mode: "lines+markers",

                name: "Revenue",
              },
            ]}

            layout={{
              autosize: true,
              height: 400,
              title: "Daily Revenue",
            }}

            style={{
              width: "100%",
            }}
          />

        </div>


        {/* ======================
            WEEKLY REVENUE
        ====================== */}

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >

          <h3>📆 Weekly Revenue Trend</h3>

          <Plot
            data={[
              {
                x: weeklyRevenue.map(
                  (d) => d.week
                ),

                y: weeklyRevenue.map(
                  (d) => d.revenue
                ),

                type: "bar",

                name: "Weekly Revenue",
              },
            ]}

            layout={{
              autosize: true,
              height: 400,
            }}

            style={{
              width: "100%",
            }}
          />

        </div>


        {/* ======================
            MONTHLY REVENUE
        ====================== */}

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >

          <h3>🗓 Monthly Revenue Trend</h3>

          <Plot
            data={[
              {
                x: monthlyRevenue.map(
                  (d) => d.month
                ),

                y: monthlyRevenue.map(
                  (d) => d.revenue
                ),

                type: "scatter",

                mode: "lines+markers",

                fill: "tozeroy",

                name: "Monthly Revenue",
              },
            ]}

            layout={{
              autosize: true,
              height: 400,
            }}

            style={{
              width: "100%",
            }}
          />

        </div>
        {/* SUMMARY CARDS */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "30px",
  }}
>
  <div className="card">
    <h3>💰 Revenue</h3>
    <h1>₹ {totalRevenue.toLocaleString()}</h1>
  </div>

  <div className="card">
    <h3>📈 Profit</h3>
    <h1>₹ {totalProfit.toLocaleString()}</h1>
  </div>

  <div className="card">
    <h3>📦 Inventory Value</h3>
    <h1>₹ {inventoryValue.toLocaleString()}</h1>
  </div>

  <div className="card">
    <h3>👥 Customers</h3>
    <h1>{totalCustomers}</h1>
  </div>

  <div className="card">
    <h3>🛒 Orders</h3>
    <h1>{totalOrders}</h1>
  </div>

  <div className="card">
    <h3>⚠️ Low Stock</h3>
    <h1>{lowStockProducts.length}</h1>
  </div>

  <div className="card">
  <h3>💳 Avg Order Value</h3>
  <h1>
    ₹ {averageOrderValue.toFixed(2)}
  </h1>
</div>
</div>

{/* CATEGORY CHART */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>📊 Category Distribution</h3>

  <Plot
    data={[
      {
        x: categoryData.map((x) => x.category),
        y: categoryData.map((x) => x.value),
        type: "bar",
      },
    ]}
    layout={{
      width: 900,
      height: 400,
      title: "Products by Category",
    }}
  />
</div>

{/* BRAND PERFORMANCE */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🏭 Brand Performance</h3>

  <Plot
    data={[
      {
        labels: brandData.map((x) => x.brand),
        values: brandData.map((x) => x.value),
        type: "pie",
      },
    ]}
    layout={{
      width: 900,
      height: 450,
    }}
  />
</div>

<div className="card-section">
  <h3>🚚 Order Status</h3>

  <Plot
    data={[
      {
        labels: statusData.map(x => x.status),
        values: statusData.map(x => x.count),
        type: "pie",
      },
    ]}
    layout={{
      autosize: true,
      height: 400,
    }}
    style={{ width: "100%" }}
  />
</div>

{/* TOP PRODUCTS */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🔥 Top Selling Products</h3>

  {topProducts.map((product, index) => (
    <div
      key={index}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      {topProducts.map((product, index) => (
      <div key={index}>
      <span>{product.name}</span>
      <b>{product.sold} sold</b>
  </div>
))}
    </div>
  ))}
</div>

{/* LOW STOCK */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>⚠️ Low Stock Products</h3>

  {lowStockProducts.map((product) => (
    <div
      key={product.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <span>{product.product_name || product.name}</span>

      <span style={{ color: "red" }}>
        {product.quantity} left
      </span>
    </div>
  ))}
</div>

<div className="card-section">
  <h3>📦 Inventory Health</h3>

  <Plot
    data={[
      {
        labels: inventoryPie.map(x => x.name),
        values: inventoryPie.map(x => x.value),
        type: "pie",
      },
    ]}
    layout={{
      autosize: true,
      height: 400,
    }}
    style={{ width: "100%" }}
  />
</div>
{/* FAST MOVING PRODUCTS */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🚀 Fast Moving Products</h3>

  {fastProducts.map((p, index) => (
    <div key={index}>
      {p.name} - {p.sold} sold
    </div>
  ))}
</div>

{/* SLOW MOVING PRODUCTS */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🐢 Slow Moving Products</h3>

  {slowProducts.map((p, index) => (
    <div key={index}>
      {p.name} - {p.sold} sold
    </div>
  ))}
</div>

{/* SALES FORECAST */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🔮 Sales Forecast</h3>

  {forecastData.slice(0, 5).map((item, index) => (
    <div key={index}>
      {item.name}: {item.current} → {item.predicted}
    </div>
  ))}
</div>

{/* RESTOCK RECOMMENDATIONS */}

<div
  style={{
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
  }}
>
  <h3>🔄 Restock Recommendations</h3>

  {restockProducts.map((p) => (
    <div key={p.id}>
      {p.product_name} - {p.quantity} left
    </div>
  ))}
</div>

{/* AI INSIGHTS */}

<div
  style={{
    marginTop: "30px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    padding: "25px",
    borderRadius: "20px",
  }}
>
  <h2>🤖 AI Business Insights</h2>

  <ul>
    {insights.map((item, index) => (
      <li
        key={index}
        style={{
          marginTop: "12px",
        }}
      >
        {item}
      </li>
    ))}
  </ul>
</div>

</div>
</>
);
}

export default Analytics;