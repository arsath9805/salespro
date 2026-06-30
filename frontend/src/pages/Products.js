import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { placeOrder } from "../services/orderService";
import { useNavigate } from "react-router-dom";
import "../styles/products.css";
import { toast } from "react-toastify";

export default function Products() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const productsPerPage = 6;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProducts(list);
  };

  /* FILTER + SORT */

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      product.category === categoryFilter;

    const matchesBrand =
      brandFilter === "All" ||
      product.supplier === brandFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand
    );
  });

  if (sortBy === "price-low") {
    filteredProducts.sort(
      (a, b) => a.per_cost - b.per_cost
    );
  }

  if (sortBy === "price-high") {
    filteredProducts.sort(
      (a, b) => b.per_cost - a.per_cost
    );
  }

  if (sortBy === "stock") {
    filteredProducts.sort(
      (a, b) => b.quantity - a.quantity
    );
  }

  /* PAGINATION */

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex =
    (currentPage - 1) * productsPerPage;

  const displayedProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + productsPerPage
    );

  return (
    <div className="products-container">

      <h2 className="products-title">
        🛒 Products
      </h2>

      {/* SEARCH + FILTERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr 1fr 1fr",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option>All</option>
          <option>Electronics</option>
          <option>Accessories</option>
        </select>

        <select
          value={brandFilter}
          onChange={(e) =>
            setBrandFilter(e.target.value)
          }
        >
          <option>All</option>
          <option>Sony</option>
          <option>Samsung</option>
          <option>Dell</option>
          <option>HP</option>
          <option>Apple</option>
          <option>Lenovo</option>
          <option>Boat</option>
          <option>Asus</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="default">
            Sort By
          </option>

          <option value="price-low">
            Price: Low → High
          </option>

          <option value="price-high">
            Price: High → Low
          </option>

          <option value="stock">
            Best Stock
          </option>
        </select>
      </div>

      {/* PRODUCTS */}

      <div className="products-grid">
        {displayedProducts.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() =>
              navigate(`/product/${product.id}`)
            }
            style={{ cursor: "pointer" }}
          >
            <img
              src={`https://via.placeholder.com/250?text=${product.product_name}`}
              alt={product.product_name}
              className="product-image"
            />

            <h3>{product.product_name}</h3>

            <p className="category">
              {product.category}
            </p>

            <p>
              🏷 {product.supplier}
            </p>

            <p
              className="price"
            >
              ₹ {product.per_cost}
            </p>

            <p>
              ⭐⭐⭐⭐⭐
            </p>

            {/* STOCK STATUS */}

            {product.quantity > 10 ? (
              <p
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                🟢 In Stock
              </p>
            ) : product.quantity > 0 ? (
              <p
                style={{
                  color: "orange",
                  fontWeight: "bold",
                }}
              >
                🟡 Low Stock ({product.quantity})
              </p>
            ) : (
              <p
                style={{
                  color: "red",
                  fontWeight: "bold",
                }}
              >
                🔴 Out of Stock
              </p>
            )}

            <button
              className="buy-btn"
              disabled={
                product.quantity <= 0
              }
              onClick={async (e) => {
                e.stopPropagation();

                try {
                  await placeOrder(product);

                  toast.success(
                    "🎉 Order placed successfully!"
                  );

                  fetchProducts();

                } catch (err) {
                  toast.error(err.message);
                }
              }}
            >
              {product.quantity > 0
                ? "Buy Now"
                : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>

      {/* PAGINATION */}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {[...Array(totalPages)].map(
          (_, index) => (
            <button
              key={index}
              onClick={() =>
                setCurrentPage(index + 1)
              }
              style={{
                padding:
                  "10px 15px",
                borderRadius: "10px",
                border: "none",
                background:
                  currentPage ===
                  index + 1
                    ? "#2563eb"
                    : "#ddd",
                color:
                  currentPage ===
                  index + 1
                    ? "#fff"
                    : "#000",
                cursor: "pointer",
              }}
            >
              {index + 1}
            </button>
          )
        )}
      </div>

    </div>
  );
}