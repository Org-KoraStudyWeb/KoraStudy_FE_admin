import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import axiosClient from "../api/axiosClient";

const LoginContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError("");

    console.log("=== LOGIN DEBUG ===");
    console.log("Form data:", formData);

    try {
      // 👉 DÙNG axiosClient (KHÔNG dùng fetch)
      const response = await axiosClient.post("/api/v1/auth/login", formData);

      const data = response.data;

      console.log("Response status:", response.status);
      console.log("Response data:", data);
      console.log("Token received:", data.token);
      console.log("Roles:", data.roles);

      if (data?.token) {
        // ✅ SINGLE SOURCE OF TRUTH
        localStorage.setItem("accessToken", data.token);

        // (optional) legacy keys – có thể bỏ nếu backend/frontend đã đồng bộ
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminToken", data.token);

        localStorage.setItem("userRoles", JSON.stringify(data.roles || []));
        localStorage.setItem("username", data.username || formData.username);

        console.log("✅ Token stored successfully");
        console.log("Token:", data.token.substring(0, 30) + "...");

        // ✅ Check quyền admin
        const userRoles = data.roles || [];
        const hasAdminAccess = userRoles.some((role) =>
          ["ADMIN", "CONTENT_MANAGER", "DELIVERY_MANAGER"].includes(role)
        );

        console.log("User roles:", userRoles);
        console.log("Has admin access:", hasAdminAccess);

        if (hasAdminAccess) {
          console.log("✅ Access granted → /admin");
          navigate("/admin", { replace: true });
        } else {
          console.log("❌ Access denied");
          setError(
            `Bạn không có quyền truy cập trang quản trị. Roles: ${userRoles.join(
              ", "
            )}`
          );
        }
      } else {
        console.log("❌ Login failed: No token");
        setError(data?.message || "Đăng nhập không thành công");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.response?.data?.message || "Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
};

export default LoginContainer;
