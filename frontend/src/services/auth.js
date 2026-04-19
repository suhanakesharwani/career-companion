import axios from "axios";

const API = axios.create({
  baseURL: "https://career-companion-backend-uhlf.onrender.com",
  withCredentials: true,   // ⭐ VERY IMPORTANT
});

// REGISTER
export const register = (username, email, password) => {
  return API.post("register/", {
    username,
    email,
    password,
  });
};

// LOGIN
export const login = (email, password) => {
  return API.post("login/", {
    email,
    password,
  });
};

// REFRESH TOKEN
export const refreshToken = () => {
  return API.post("refresh/");
};

// LOGOUT
export const logout = () => {
  return API.post("logout/");
};

export default API;