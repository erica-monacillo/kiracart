import axios from "axios";
import { API_BASE } from "./base";

const api = axios.create({
  baseURL: API_BASE,
});

export default api;
