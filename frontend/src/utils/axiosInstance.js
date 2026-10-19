import axios from "axios";



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const api = axios.create ({
  baseURL: BACKEND_URL,
  withCredentials: true,
});



let updateAccessToken = () => {};

let refreshPromise = null;


export const setAccessTokenUpdater = (callback) => {
  updateAccessToken = callback;
};



// Attach the latest access token to each request.

api.interceptors.request.use (
  (config) => {
    const token = localStorage.getItem ("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);



// Refresh an expired token and retry the original request.

api.interceptors.response.use (
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.respose?.status;

    const url = originalRequest?.url || "";



    const isAuthEndpoint = 
    url.includes ("/api/v1/user/login") || 
    url.includes ("/api/v1/user/register") ||
    url.includes ("/api/v1/user/verify-otp") ||
    url.includes ("/api/v1/user/refresh");

    

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject (error);
    }


    originalRequest._retry = true;

    try {
      
      // Share one refresh request between simultaneous failed request.

      if (!refreshPromise) {
        refreshPromise = axios.post (`${BACKEND_URL}/api/v1/user/refresh`, 
          {},
          {
            withCredentials: true
          }
        )
        .then ((respose) => {
          if (!respose.data.success || !respose.data.accessToken) {
            throw new Error ("Unable to refresh access token");
          }

          return respose.data.accessToken;
        })

        .finally (() => {
          refreshPromise = null;
        });
      }


      const newToken = await refreshPromise;

      localStorage.setItem("accessToken", newToken);

      updateAccessToken (newToken);

      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

     return api (originalRequest);

    } catch (refreshError) {
      
      // Only clear the session when the server rejects the refresh token.

      if (refreshError.respose?.status === 401) {
       
        localStorage.removeItem ("accessToken");

        updateAccessToken("");
      }

      return Promise.reject (refreshError);
    }
  }
)


export default api;