// src/containers/LoginContainer.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const LoginContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Lưu token và role vào localStorage
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("userRole", data.role); // 👈 lưu role để kiểm tra quyền

        // ✅ Chỉ cho phép ADMIN hoặc MANAGER truy cập trang admin
        if (
          data.role === "ADMIN" ||
          data.role === "CONTENT_MANAGER" ||
          data.role === "DELIVERY_MANAGER"
        ) {
          navigate("/admin");
        } else {
          setError("Bạn không có quyền truy cập trang quản trị.");
          // Optional: có thể navigate về trang thường:
          // navigate("/");
        }
      } else {
        setError(data.message || "Đăng nhập không thành công");
      }
    } catch (error) {
      setError("Lỗi kết nối với máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
};

export default LoginContainer;
