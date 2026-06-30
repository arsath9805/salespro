import "./ProductCard.css";

export default function ProductCard({ product, onBuy }) {
  const outOfStock = product.quantity <= 0;

  return (
    <div className="product-card">
      <img
        src={product.image || "/placeholder.png"}
        alt={product.product_name}
        className="product-image"
      />

      <div className="product-info">
        <h4>{product.product_name}</h4>
        <p className="category">{product.category}</p>

        <h3 className="price">₹ {product.per_cost.toLocaleString()}</h3>

        <p className={`stock ${outOfStock ? "out" : "in"}`}>
          {outOfStock ? "Out of Stock" : `In Stock (${product.quantity})`}
        </p>

        <button
          disabled={outOfStock}
          onClick={() => onBuy(product)}
          className="buy-btn"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
