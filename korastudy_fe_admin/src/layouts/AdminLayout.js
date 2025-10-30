import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
