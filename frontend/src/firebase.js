// Firebase core
import { initializeApp } from "firebase/app";

// Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBD0iWbWDX1wUoogKHwCBUX9gAZgHLDXFA",
  authDomain: "sales-app-447c5.firebaseapp.com",
  projectId: "sales-app-447c5",
  storageBucket: "sales-app-447c5.firebasestorage.app",
  messagingSenderId: "55601794582",
  appId: "1:55601794582:web:53e373b71e6567541d2f37",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ EXPORT THESE
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
