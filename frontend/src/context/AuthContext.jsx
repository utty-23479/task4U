import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      checkBlockedStatus(savedToken);
    }
  }, []);

  useEffect(() => {
    if (isBlocked) {
      handleLogout(
        "You have been blocked and cannot continue using the application.",
      );
    }
  }, [isBlocked]);

  // useEffect(() => {
  //   const savedToken = localStorage.getItem("token");
  //   if (savedToken) {
  //     setToken(savedToken);
  //     const checkBlockedStatus = async () => {
  //       const response = await fetch("api/check-blocked", {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${savedToken}`,
  //         },
  //       });
  //       const data = await response.json();
  //       if (data.isBlocked) {
  //         handleLogout("You've been blocked");
  //       }
  //     };
  //     checkBlockedStatus();
  //   }
  // }, []);

  const checkBlockedStatus = async (token) => {
    try {
      const response = await fetch("api/check-blocked", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIsBlocked(data.isBlocked);
    } catch (error) {
      console.error("Error checking blocked status:", error);
    }
  };

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setIsBlocked(false);
    navigate("/dashboard");
  };

  const handleLogout = (message) => {
    setToken(null);
    localStorage.removeItem("token");
    setIsBlocked(false);
    if (message) alert(message);
    navigate("/login");
  };

  const logout = () => handleLogout();

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isBlocked, checkBlockedStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
