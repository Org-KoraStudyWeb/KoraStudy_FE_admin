// src/components/course/enrollmentComponents/EnrollmentSearchBar.js
import React from "react";
import { Input, Button } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Search } = Input;

const EnrollmentSearchBar = ({
  onSearch = () => {},
  onRefresh = () => {},
  loading = false,
}) => {
  return (
    <div
      style={{
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Search
        placeholder="Tìm kiếm theo tên, email hoặc ID học viên..."
        allowClear
        enterButton={<SearchOutlined />}
        size="middle"
        style={{ width: 400 }}
        onSearch={onSearch}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        Tải lại
      </Button>
    </div>
  );
};

export default EnrollmentSearchBar;
