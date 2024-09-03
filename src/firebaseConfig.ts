import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Import for Firebase storage

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFUn6EuiuNTZ0TsETQ-BhCpmMcvOA7FME",
  authDomain: "deliverysitem-4dcc6.firebaseapp.com",
  databaseURL: "https://deliverysitem-4dcc6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "deliverysitem-4dcc6",
  storageBucket: "deliverysitem-4dcc6.appspot.com",
  messagingSenderId: "592971366104",
  appId: "1:592971366104:web:bce9b391ca1f638ae521ad",
  measurementId: "G-Z3NKN4YCZ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Exporting Firebase storage

export { auth };
