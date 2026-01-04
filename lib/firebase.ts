import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyApbH75Dh6bg1OXdHl2lZz_-26Lhm-i_7Y",
    authDomain: "respond-ai.firebaseapp.com",
    projectId: "respond-ai",
    storageBucket: "respond-ai.firebasestorage.app",
    messagingSenderId: "33899164250",
    appId: "1:33899164250:web:1bec150f5d9a90a11d5e63",
    measurementId: "G-2VYFME2F5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Force enable network to prevent offline mode
if (typeof window !== 'undefined') {
    enableNetwork(db).catch((error) => {
        console.error("Error enabling network:", error);
    });
}

export default app;
