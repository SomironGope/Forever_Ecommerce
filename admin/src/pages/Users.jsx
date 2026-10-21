import {useEffect, useCallback, useMemo, useState } from "react";

import { toast } from "react-toastify";

import adminAxios from "../utils/AdminAxios";
 

function Users() {
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState ("")

  const [confirmModel, setConfirmModel] = useState({
    open: false,
    type: "",
    userId: "",
    userName: "",
  });

  const [actionLoading, setActionLoading] = useState(false);

  //==================================Get All Users========================


  //==================================Get All Users========================

  const getUsers = useCallback(async () => {
    const response = await adminAxios.get("/api/v1/user/all-user");

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch users"
      );
    }

    return response.data.users;
  }, []);

  // Initial fetch and subsequent Retry requests
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Fetch Users Error:", error);

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        const data = await getUsers();

        if (ignore) return;

        setUsers(data);
        setError("");
      } catch (error) {
        if (ignore) return;

        console.error("Fetch Users Error:", error);

        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch users"
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [getUsers]);

  // ========================Block User ==================================

  const handleBlockUser = async (userId) => {
    try {
      setActionLoading(true);

      const response = await adminAxios.put(
        `/api/v1/user/block-user/${userId}`,
        {},
      
      );

      if (response.data.success) {
        toast.success(response.data.message || "User blocked successfully");

        // Update only tghe affected user//

        setUsers((prevUser) =>
          prevUser.map((user) =>
            user._id === userId ? { ...user, isBlocked: true } : user,
          ),
        );
      } else {
        toast.error(response.data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Block User Error:", error);

      toast.error(error.response?.data?.message || "Failed to block user");
    } finally {
      setActionLoading(false);

      setConfirmModel({
        open: false,
        type: "",
        userId: "",
        userName: "",
      });
    }
  };

  // ============================Unblock User ================================

  const handleUnblockUser = async (userId) => {
    try {
      setActionLoading(true);
      const response = await adminAxios.put(
        `/api/v1/user/unblock-user/${userId}`,
        {},
      );
    
      if (response.data.success) {
        toast.success(response.data.message || "User unblocked successfully");

        setUsers((prevUser) =>
          prevUser.map((user) =>
            user._id === userId ? { ...user, isBlocked: false } : user,
          ),
        );
      } else {
        toast.error(response?.data?.message || "Failed to unblock user");
      }
    } catch (error) {
      console.error("Unblock User Error:", error);

      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setActionLoading(false);

      setConfirmModel({
        open: false,
        type: "",
        userId: "",
        userName: "",
      });
    }
  };

  // ======================== OpenConfirm Model ===============================
  const openConfirmModel = (type, userId, userName) => {
    setConfirmModel({
      open: true,
      type,
      userId,
      userName,
    });
  };

  // ======================CloseConfirmModel=================================

  const closeConfirmModel = () => {
    if (actionLoading) return;

    setConfirmModel({
      open: false,
      type: "",
      userId: "",
      userName: "",
    });
  };

  // ======================Search + Filter====================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        fullName.includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.isBlocked) ||
        (statusFilter === "blocked" && user.isBlocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ============================= Statistics ============================================

  const totalUsers = users.filter((user) => user.role === "user").length;

  const blockedUsers = users.filter(
    (user) => user.role === "user" && user.isBlocked,
  ).length;

  const activeUser = totalUsers - blockedUsers;

  const adminUser = users.filter((user) => user.role === "admin").length;

  // ============================= Loading ===================================

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-125 flex flex-col items-center justify-center gap-3">
         <p className="text-red-500 text-sm">{error}</p>
         
         <button 
         onClick={fetchUsers} 
         className="rounded-lg bg-black px-4 py-3 text-sm text-white hover:bg-gray-800"
         >
           Retry
         </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* -----------------------------Header---------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-800">
            User Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage registered users and account status
          </p>
        </div>
      </div>

      {/* ------------------------ Statistics ------------------------------------- */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold text-gray-800 mt-2">
            {totalUsers}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-semibold text-green-600 mt-2">
            {activeUser}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Blocked Users</p>
          <p className="text-2xl font-semibold text-red-600 mt-2">
            {blockedUsers}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-semibold text-violet-600 mt-2">
            {adminUser}
          </p>
        </div>

      </div>


      {/* ------------------------------------Filters ------------------------------------ */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ----------------Search---------------- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* ------------------Role Filter------------------ */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* --------------------Status Filter------------------ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* -----------------------User Count----------------------- */}

      <div className="flex items-center justify-between py-2">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-800">
            {filteredUsers.length}
          </span>{" "}
          of <span className="font-medium text-gray-800">{users.length}</span>{" "}
          users
        </p>
      </div>

      {/* ---------------------------User Table------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  User
                </th>

                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  Email
                </th>

                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  Role
                </th>

                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  Status
                </th>

                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  Joined
                </th>

                <th className="text-left px-5 py-4 font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const userName =
                    `${user.firstName || ""} ${user.lastName || ""}`.trim();
                  const isAdminUser = user.role === "admin";

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded"
                    >
                      {/* -----------------User-------------- */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={userName}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                              {user.firstName?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {userName || "Unknown User"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {" "}
                              ID: {user._id?.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* --------------------Email-------------------- */}

                      <td className="px-5 py-4 text-gray-600">{user.email}</td>

                      {/* -------------Role-------------------------- */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium 
                                   ${
                                     isAdminUser
                                       ? "bg-violet-100 text-violet-700"
                                       : "bg-gray-100 text-gray-700"
                                   } `}
                        >
                          {" "}
                          {user.role}
                        </span>
                      </td>

                      {/* -------------Status----------------------- */}

                      <td className="px-5 py-4">
                        {isAdminUser ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                            Admin
                          </span>
                        ) : user.isBlocked ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </td>

                      {/* ---------------------Joined---------------------- */}

                      <td className="px-5 py-4 text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "_"}
                      </td>

                      {/* ----------------------Action------------------------- */}

                      <td className="px-5 py-4 text-center">
                        {isAdminUser ? (
                          <span className="text-xs text-gray-400">
                            Protected
                          </span>
                        ) : user.isBlocked ? (
                          <button
                            onClick={() =>
                              openConfirmModel(
                                "unblock",
                                user._id,
                                `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              openConfirmModel(
                                "block",
                                user._id,
                                `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan= {6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    {
                      users.length === 0 
                      ? "No registered users found."
                      : "No users match your search or filters."
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModel.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            {/* Header */}
            <div className="p-6 text-center">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                  confirmModel.type === "block"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {confirmModel.type === "block" ? "!" : "✓"}
              </div>

              <h2
                id="confirm-title"
                className="text-xl font-semibold text-gray-800"
              >
                {confirmModel.type === "block"
                  ? "Block User?"
                  : "Unblock User?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to{" "}
                {confirmModel.type === "block" ? "block" : "unblock"} this user?
              </p>

              <p className="mt-3 inline-flex rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
                {confirmModel.userName || "Unknown User"}
              </p>

              {confirmModel.type === "block" && (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  This user will lose access to their account until unblocked.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={closeConfirmModel}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  confirmModel.type === "block"
                    ? handleBlockUser(confirmModel.userId)
                    : handleUnblockUser(confirmModel.userId)
                }
                className={`min-w-28 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
                  confirmModel.type === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : confirmModel.type === "block"
                    ? "Block User"
                    : "Unblock User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
