
import './App.css';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminContext } from './context/AdminContext';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import Login from './component/Login';

import Add from './pages/Add';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Order from './pages/Orders';
import Users from './pages/Users';
import UpdateProduct from './pages/UpdateProduct';
import OrderDetailsPage from './pages/OrderDetailsPage';

function App() {
  const { token, authLoading } = useContext(AdminContext);

  // Wait until the refresh-token check finishes.
  if (authLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <ToastContainer />
        <p className="text-gray-600">Checking admin session...</p>
      </div>
    );
  }

  // Show only the login page when not authenticated.
  if (!token) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <ToastContainer />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    );
  }

  // Show the admin panel when authenticated.
  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />

      <Routes>
        <Route
          path="/login"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/*"
          element={
            <>
              <Navbar />

              <div className="flex w-full mt-25">
                <Sidebar />

                <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/add" element={<Add />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Order />} />
                    <Route path="/users" element={<Users />} />
                    <Route
                      path="/order-details/:orderId"
                      element={<OrderDetailsPage />}
                    />
                    <Route
                      path="/dashboard"
                      element={<Dashboard />}
                    />
                    <Route
                      path="/update-product/:productId"
                      element={<UpdateProduct />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </div>
              </div>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
