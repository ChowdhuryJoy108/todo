// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: "AIzaSyB0ywKBOYwkDMeB7HLWXX5sIlIH6C-28WE",
  authDomain: "todo-f15f0.firebaseapp.com",
  projectId: "todo-f15f0",
  storageBucket: "todo-f15f0.firebasestorage.app",
  messagingSenderId: "536646508478",
  appId: "1:536646508478:web:f361159c0567294a3ce3ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;

