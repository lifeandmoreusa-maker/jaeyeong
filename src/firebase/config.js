import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, getDoc, setDoc, updateDoc, query, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAngyJvkAQ5lbRNH3I5PI4TtPH1CFY7fA",
  authDomain: "link-final-a7d96.firebaseapp.com",
  projectId: "link-final-a7d96",
  storageBucket: "link-final-a7d96.firebasestorage.app",
  messagingSenderId: "764608459792",
  appId: "1:764608459792:web:2bf90ae95419c5d32c4695",
  measurementId: "G-TDS9MCRX70"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, auth, db, 
  signInAnonymously, onAuthStateChanged, signInWithCustomToken,
  collection, addDoc, serverTimestamp, onSnapshot, doc, getDoc, setDoc, updateDoc, query, getDocs, deleteDoc 
};
