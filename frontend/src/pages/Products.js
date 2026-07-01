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

  useEffect(() => {
  setCurrentPage(1);
}, [
  search,
  categoryFilter,
  brandFilter,
  sortBy,
]);
  
  useEffect(() => {
  setCurrentPage(1);
}, [search, categoryFilter, brandFilter, sortBy]);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProducts(list);
  };

  const getProductImage = (productName) => {

  const name = productName.toLowerCase();

  if (name.includes("laptop"))
    return "/images/laptop.jpg";

  if (name.includes("keyboard"))
    return "/images/keyboard.jpg";

  if (name.includes("printer"))
    return "/images/printer.jpg";

  if (name.includes("tablet"))
    return "/images/tablet.jpg";

  if (name.includes("mouse"))
    return "/images/mouse.jpg";

  if (name.includes("headphone"))
    return "/images/headphones.jpg";

  if (name.includes("monitor"))
    return "/images/monitor.jpg";

  if (name.includes("phone") || name.includes("smartphone"))
    return "/images/smartphone.jpg";

  if (name.includes("watch") || name.includes("smartwatch"))
    return "/images/smartwatch.jpg";

  if (name.includes("power bank"))
    return "/images/powerbank.jpg";


  return "/images/default.jpg";
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

  const brands = [
  "All",
  ...new Set(products.map((p) => p.supplier))
  ];

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
  {brands.map((brand) => (
    <option key={brand}>
      {brand}
    </option>
  ))}
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
 
          {displayedProducts.length === 0 ? (

    <h2
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
      }}
    >
      😢 No products found
    </h2>

  ) : (

    displayedProducts.map((product) => (
          <div
            className="product-card"
            key={product.id}
            onClick={() =>
              navigate(`/product/${product.id}`)
            }
            style={{ cursor: "pointer" }}
          >
            <img
              src={getProductImage(product.product_name)}
              alt={product.product_name}
              className="product-image"
              onError={(e) => {
                e.target.src = "/images/default.jpg";
               }}
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
        ))
      )}
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
        <button
  disabled={currentPage === 1}
  onClick={() => setCurrentPage(currentPage - 1)}
>
  ◀ Previous
</button>

{[...Array(totalPages)]
  .map((_, index) => index + 1)
  .filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 2
  )
  .map((page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      style={{
        padding: "10px 15px",
        borderRadius: "10px",
        border: "none",
        background:
          currentPage === page
            ? "#2563eb"
            : "#ddd",
        color:
          currentPage === page
            ? "#fff"
            : "#000",
        cursor: "pointer",
      }}
    >
      {page}
    </button>
  ))}

<button
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage(currentPage + 1)}
>
  Next ▶
</button>
      </div>

    </div>
  );
}