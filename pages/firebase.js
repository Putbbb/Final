import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAt6tTuvd_iG-AG6BdvEhCYAb6HOIL9C3g",
  authDomain: "senior-d0d4d.firebaseapp.com",
  projectId: "senior-d0d4d",
  storageBucket: "senior-d0d4d.firebasestorage.app",
  messagingSenderId: "310597788111",
  appId: "1:310597788111:web:f5211c1867d83410fef2ba",
  measurementId: "G-FX9R8GM86Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
