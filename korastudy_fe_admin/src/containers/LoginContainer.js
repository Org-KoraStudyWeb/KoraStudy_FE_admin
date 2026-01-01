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
      console.log("🔐 Sending login request...");
      const response = await axiosClient.post("/api/v1/auth/login", formData);

      console.log("📦 Full response:", response);
      console.log("📦 Response.data:", response.data);

      // API might return data in response.data or nested structure
      const data = response.data?.data || response.data;

      console.log("✅ Processed data:", data);
      console.log("Token received:", data?.token);
      console.log("Roles:", data?.roles);

      if (data?.token) {
        // ✅ SINGLE SOURCE OF TRUTH
        console.log("💾 Saving token to localStorage...");
        console.log("🔑 Token to save - full:", data.token);
        console.log("🔑 Token to save - length:", data.token.length);
        console.log(
          "🔑 Token to save - first 50 chars:",
          data.token.substring(0, 50)
        );

        localStorage.setItem("accessToken", data.token);
        console.log("✅ accessToken saved");

        // (optional) legacy keys – có thể bỏ nếu backend/frontend đã đồng bộ
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminToken", data.token);

        const rolesData = JSON.stringify(data.roles || []);
        localStorage.setItem("userRoles", rolesData);
        localStorage.setItem("username", data.username || formData.username);

        // Verify storage
        const storedToken = localStorage.getItem("accessToken");
        const storedRoles = localStorage.getItem("userRoles");
        console.log(
          "🔍 Verification - accessToken:",
          storedToken ? "✅ SAVED" : "❌ NOT SAVED"
        );
        console.log(
          "🔍 Verification - storedToken length:",
          storedToken?.length
        );
        console.log(
          "🔍 Verification - storedToken first 50:",
          storedToken?.substring(0, 50)
        );
        console.log("🔍 Verification - userRoles:", storedRoles);

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
          
          // Double check storage before navigating
          let attempts = 0;
          const checkAndNavigate = () => {
            const savedToken = localStorage.getItem("accessToken");
            if (savedToken) {
               console.log("🚀 Token confirmed in storage, navigating now...");
               navigate("/admin", { replace: true });
            } else if (attempts < 5) {
               attempts++;
               console.warn(`⏳ Token not found yet, retrying (${attempts}/5)...`);
               setTimeout(checkAndNavigate, 100);
            } else {
               console.error("❌ Failed to save token after 5 attempts!");
               setError("Lỗi lưu phiên đăng nhập. Vui lòng thử lại.");
            }
          };
          
          checkAndNavigate();
        } else {
          console.log("❌ Access denied");
          setError(
            `Bạn không có quyền truy cập trang quản trị. Roles: ${userRoles.join(
              ", "
            )}`
          );
        }
      } else {
        console.log("❌ Login failed: No token in response");
        console.log("Response data keys:", Object.keys(data || {}));
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
