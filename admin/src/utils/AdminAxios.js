
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const adminAxios = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

let updateAdminAccessToken = () => {};
let refreshPromise = null;

export const setAdminAccessTokenUpdater = (callback) => {
  updateAdminAccessToken = callback;
};

// 1. Attach the latest access token to every request.
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminAccessToken");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Handle expired access tokens.
adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.includes("/api/v1/admin/login") ||
      url.includes("/api/v1/admin/refresh") ||
      url.includes("/api/v1/admin/logout");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${BACKEND_URL}/api/v1/admin/refresh`,
            {},
            { withCredentials: true }
          )
          .then((response) => {
            const newToken = response.data.adminAccessToken;

            if (!response.data.success || !newToken) {
              throw new Error("Unable to refresh admin access token");
            }

            localStorage.setItem("adminAccessToken", newToken);
            updateAdminAccessToken(newToken);

            return newToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Retry the failed request with the new token.
      return adminAxios(originalRequest);
    } catch (refreshError) {
      // Clear the session only when refresh is rejected with 401.
      if (refreshError.response?.status === 401) {
        localStorage.removeItem("adminAccessToken");
        updateAdminAccessToken("");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }

      return Promise.reject(refreshError);
    }
  }
);

export default adminAxios;
