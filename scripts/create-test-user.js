// Firebase Test User Creation Script
// Run this in your Firebase Console or use it as a guide to manually create a test user

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyApbH75Dh6bg1OXdHl2lZz_-26Lhm-i_7Y",
    authDomain: "respond-ai.firebaseapp.com",
    projectId: "respond-ai",
    storageBucket: "respond-ai.firebasestorage.app",
    messagingSenderId: "33899164250",
    appId: "1:33899164250:web:1bec150f5d9a90a11d5e63",
    measurementId: "G-2VYFME2F5C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser() {
    try {
        // Create test user account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            "test@example.com",
            "test123456"
        );

        // Add user data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Test User",
            email: "test@example.com",
            role: "user",
            createdAt: new Date().toISOString(),
        });

        console.log("✅ Test user created successfully!");
        console.log("Email: test@example.com");
        console.log("Password: test123456");
    } catch (error) {
        console.error("Error creating test user:", error);
    }
}

// To use this script:
// 1. Run it in a Node.js environment or Firebase Functions
// 2. OR manually create in Firebase Console:
//    - Go to Firebase Console > Authentication > Add user
//    - Email: test@example.com
//    - Password: test123456
//    - Then go to Firestore > Create collection "users"
//    - Add document with user UID as document ID
//    - Add fields: name, email, role, createdAt

createTestUser();
