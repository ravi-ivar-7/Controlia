import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
    // baseURL :  "http://localhost:3001"
});

export default axiosInstance;
