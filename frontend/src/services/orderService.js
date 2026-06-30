import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

/* PLACE ORDER */
export const placeOrder = async (product) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first!");
  }

  // Get latest product data from Firestore
  const productRef = doc(db, "products", product.id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error("Product not found!");
  }

  const productData = productSnap.data();

  // Check stock availability
  if (productData.quantity <= 0) {
    throw new Error("Product is out of stock!");
  }

  // Store order in Firestore
  await addDoc(collection(db, "orders"), {
    userId: user.uid,
    userEmail: user.email,
    productId: product.id,
    productName: product.product_name,
    price: product.per_cost,
    quantity: 1,
    status: "PLACED",
    orderedAt: serverTimestamp(),
  });

  // Reduce stock by 1
  await updateDoc(productRef, {
    quantity: productData.quantity - 1,
  });

  console.log("Order stored and inventory updated!");
};

/* UPDATE ORDER STATUS (ADMIN) */
export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    status: newStatus,
  });
};