import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./client"; // نستخدم عميل Firebase من المتصفح

export { auth };
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };