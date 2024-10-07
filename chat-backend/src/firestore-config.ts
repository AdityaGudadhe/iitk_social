import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC086zmza5sbB0eJHG1oQsYOjt85WnQu58",
    authDomain: "iitk-connect.firebaseapp.com",
    projectId: "iitk-connect",
    storageBucket: "iitk-connect.appspot.com",
    messagingSenderId: "1046015583036",
    appId: "1:1046015583036:web:ec5af48a37185402a43439",
    measurementId: "G-XP2VH0VHE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { app, db };