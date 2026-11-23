import axios from "axios";

// Empty base URL keeps local requests on Vite's proxy, including when the
// development launcher has selected a free backend port automatically.
axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? "";
axios.defaults.withCredentials = true;
