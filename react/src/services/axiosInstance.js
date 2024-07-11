import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_NODEJS_API,
    // baseURL :  "http://localhost:3001"
});

export default axiosInstance;
