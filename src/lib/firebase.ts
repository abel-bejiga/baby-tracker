import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqHzKgqWO4vLC4reBUlatyJKLSMK3ELw0",
  authDomain: "baby-tracker-dff08.firebaseapp.com",
  projectId: "baby-tracker-dff08",
  storageBucket: "baby-tracker-dff08.firebasestorage.app",
  messagingSenderId: "189009041669",
  appId: "1:189009041669:web:9db702782bded9f74f3f6c",
  measurementId: "G-JHDNRL0K06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);