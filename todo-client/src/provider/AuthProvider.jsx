import React, { createContext, useEffect, useState } from "react";
import auth from "../firebase/firebase.config";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const googleSignOut = () => {
    return signOut(auth);
  };
  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("LoggedIn User", currentUser);
      setUser(currentUser);
    });

    return () => {
      unsubcribe();
    };
  }, []);

  const authInfo = {
    user,
    googleSignIn,
    googleSignOut,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
