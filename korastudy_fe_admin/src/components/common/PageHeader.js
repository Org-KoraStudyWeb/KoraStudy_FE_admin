// src/components/common/PageHeader.js
import React from "react";

const PageHeader = ({ title, actions }) => {
  return (
    <div
      style={{
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>
        {title}
      </h1>
      <div>{actions}</div>
    </div>
  );
};

export default PageHeader;
