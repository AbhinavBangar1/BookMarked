import axios from "axios";

export const getDashboard = (userId) =>
  axios.get(`http://localhost:5001/api/user/${userId}/dashboard`);
