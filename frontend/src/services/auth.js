import axios from "axios"

const API_URL="http://127.0.0.1:8000/accounts/";

export const register=(username,email,password)=>{
    return axios.post(API_URL+"register/",{username,email,password})
}

export const login=(username,password)=>{
    return axios.post(API_URL+"login/",{username,password})
    .then(res=>{
        localStorage.setItem("token",res.data.access);
        return res.data;
    })
}
