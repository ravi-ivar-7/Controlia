import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.CONTROLIA_BACKEND_BASE_URL,
    // baseURL :  "http://localhost:3001"
});

export default axiosInstance;
