// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
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
    appId: "1:1046015583036:web:fb2306afdce52e77a43439",
    measurementId: "G-3TP5W2YVY7"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export { app, auth, googleProvider };