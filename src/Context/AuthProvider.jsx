import React, { useEffect } from "react";
import { createContext, useState } from "react";

export const AuthContext = createContext();
export default function AuthProvider(props) {
  const [user, setUser] = useState({});
  const [type, setType] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser, type, setType }}>
      {props.children}
    </AuthContext.Provider>
  );
}
