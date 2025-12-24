// src/api/paymentApi.js
import axiosClient from "./axiosClient";

const paymentApi = {
  // ==================== ADMIN APIs ====================

  // 1. Lấy danh sách thanh toán (phân trang cơ bản)
  getAllPayments: (params = {}) => {
    // Validate và chuyển đổi params
    const page = Math.max(0, parseInt(params.page) || 0);
    const size = Math.max(1, Math.min(100, parseInt(params.size) || 20));

    const queryParams = {
      page: page,
      size: size,
      sortBy: params.sortBy || "dateTransaction",
      sortDirection: params.sortDirection || "desc",
    };

    return axiosClient.get("/api/v1/admin/payments", {
      params: queryParams,
    });
  },

  // 2. Tìm kiếm thanh toán với filters (sử dụng endpoint /search)
  searchPayments: (params = {}) => {
    // Validate và chuyển đổi params
    const page = Math.max(0, parseInt(params.page) || 0);
    const size = Math.max(1, Math.min(100, parseInt(params.size) || 20));

    // Build sort array theo format BE yêu cầu
    const sortArray = [];
    if (params.sort) {
      // Nếu có sort array từ params
      if (Array.isArray(params.sort)) {
        sortArray.push(...params.sort);
      } else if (typeof params.sort === "string") {
        sortArray.push(params.sort);
      }
    } else {
      // Default sort
      const sortBy = params.sortBy || "dateTransaction";
      const sortDirection = params.sortDirection || "desc";
      sortArray.push(`${sortBy},${sortDirection}`);
    }

    const queryParams = {
      page: page,
      size: size,
      sort: sortArray,
    };

    // Thêm filter params nếu có
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim();
    }
    if (params.status) {
      queryParams.status = params.status;
    }
    if (params.paymentMethod) {
      queryParams.paymentMethod = params.paymentMethod;
    }
    if (params.fromDate) {
      queryParams.fromDate = params.fromDate;
    }
    if (params.toDate) {
      queryParams.toDate = params.toDate;
    }

    console.log("📤 API Search Params:", queryParams);

    return axiosClient.get("/api/v1/admin/payments/search", {
      params: queryParams,
    });
  },

  // 3. Xuất PDF
  exportToPdf: (params = {}) => {
    const queryParams = {};
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return axiosClient.get("/api/v1/admin/payments/export/pdf", {
      params: queryParams,
      responseType: "blob",
    });
  },

  // 4. Xuất Excel
  exportToExcel: (params = {}) => {
    const queryParams = {};
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return axiosClient.get("/api/v1/admin/payments/export/excel", {
      params: queryParams,
      responseType: "blob",
    });
  },

  // 5. Thống kê doanh thu
  getTotalRevenue: () => {
    return axiosClient.get("/api/v1/admin/payments/stats/revenue");
  },

  // 6. Thống kê trạng thái
  getPaymentStatusStats: () => {
    return axiosClient.get("/api/v1/admin/payments/stats/status");
  },

  // 7. Lấy chi tiết payment
  getPaymentDetails: (id) => {
    return axiosClient.get(`/api/v1/admin/payments/${id}`);
  },
};

export default paymentApi;
