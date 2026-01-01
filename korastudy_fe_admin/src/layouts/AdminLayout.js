import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Validate token on component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userRoles = localStorage.getItem("userRoles");

    if (!token) {
      console.warn("⚠️ No token found. Redirecting to login.");
      navigate("/login");
      return;
    }

    // Validate roles
    try {
      const roles = JSON.parse(userRoles || "[]");
      const hasAdminAccess = roles.some(
        (role) =>
          role === "ADMIN" ||
          role === "CONTENT_MANAGER" ||
          role === "DELIVERY_MANAGER"
      );

      if (!hasAdminAccess) {
        console.warn(
          "❌ User doesn't have admin access. Redirecting to login."
        );
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("userRoles");
        localStorage.removeItem("username");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error parsing roles:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onCollapse={handleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <Header title={title} />
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
