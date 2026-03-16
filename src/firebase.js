import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyB77ryKtsEf0sLYrSn3dcwuud5Ud-VBwtE",
  authDomain: "gcfares-6bf1e.firebaseapp.com",
  projectId: "gcfares-6bf1e",
  storageBucket: "gcfares-6bf1e.firebasestorage.app",
  messagingSenderId: "91039015169",
  appId: "1:91039015169:web:846d32cc5776c026ed7b00",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);