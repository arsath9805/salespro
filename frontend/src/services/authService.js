import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// SIGN UP
export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // CREATE USER DOCUMENT IN FIRESTORE
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: "user", // default role
    createdAt: serverTimestamp(),
  });

  return user;
};

// LOGIN
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};
