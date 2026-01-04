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

    try {
      // DÙNG axiosClient (KHÔNG dùng fetch)

      const response = await axiosClient.post("/api/v1/auth/login", formData);

      // API might return data in response.data or nested structure
      const data = response.data?.data || response.data;

      if (data?.token) {

        localStorage.setItem("accessToken", data.token);

        // (optional) legacy keys – có thể bỏ nếu backend/frontend đã đồng bộ
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminToken", data.token);

        const rolesData = JSON.stringify(data.roles || []);
        localStorage.setItem("userRoles", rolesData);
        localStorage.setItem("username", data.username || formData.username);

        //  Check quyền admin
        const userRoles = data.roles || [];
        const hasAdminAccess = userRoles.some((role) =>
          ["ADMIN", "CONTENT_MANAGER", "DELIVERY_MANAGER"].includes(role)
        );


        if (hasAdminAccess) {

          let attempts = 0;
          const checkAndNavigate = () => {
            const savedToken = localStorage.getItem("accessToken");
            if (savedToken) {
               navigate("/admin", { replace: true });
            } else if (attempts < 5) {
               attempts++;
               console.warn(`⏳ Token not found yet, retrying (${attempts}/5)...`);
               setTimeout(checkAndNavigate, 100);
            } else {
               console.error(" Failed to save token after 5 attempts!");
               setError("Lỗi lưu phiên đăng nhập. Vui lòng thử lại.");
            }
          };
          
          checkAndNavigate();
        } else {
          console.log(" Access denied");
          setError(
            `Bạn không có quyền truy cập trang quản trị. Roles: ${userRoles.join(
              ", "
            )}`
          );
        }
      } else {
        console.log(" Login failed: No token in response");
        console.log("Response data keys:", Object.keys(data || {}));
        setError(data?.message || "Đăng nhập không thành công");
      }
    } catch (error) {
      console.error(" Login error:", error);
      setError(error.response?.data?.message || "Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
};

export default LoginContainer;
