// src/services/paymentService.js
import paymentApi from "../api/paymentApi";

// Helper để download file
const downloadFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

class PaymentService {
  _extractDataFromResponse(response) {
    if (!response) return null;
    return response?.data !== undefined ? response.data : response;
  }

  handleError(error, defaultMessage) {
    console.error("PaymentService Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });

    let message = defaultMessage;
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      message,
      status: error.response?.status,
      data: null,
    };
  }

  // ==================== ADMIN SERVICES ====================
  async getAllPayments(params = {}) {
    try {
      console.log(
        "🔄 PaymentService.getAllPayments called with params:",
        params
      );

      const response = await paymentApi.getAllPayments(params);
      const data = this._extractDataFromResponse(response);

      console.log("✅ PaymentService.getAllPayments response:", data);

      // Xử lý response format từ BE
      return this._processPaymentResponse(
        data,
        "Lấy danh sách thanh toán thành công."
      );
    } catch (error) {
      console.error("❌ PaymentService.getAllPayments error:", error);
      return this.handleError(error, "Lỗi khi lấy danh sách thanh toán.");
    }
  }

  async searchPayments(params = {}) {
    try {
      console.log(
        "🔍 PaymentService.searchPayments called with params:",
        params
      );

      // Đảm bảo sort format đúng với BE
      if (!params.sort && (params.sortBy || params.sortDirection)) {
        const sortBy = params.sortBy || "dateTransaction";
        const sortDirection = params.sortDirection || "desc";
        params.sort = [`${sortBy},${sortDirection}`];
      }

      const response = await paymentApi.searchPayments(params);
      const data = this._extractDataFromResponse(response);

      console.log("✅ PaymentService.searchPayments response:", data);

      // Xử lý response format từ BE
      return this._processPaymentResponse(
        data,
        "Tìm kiếm thanh toán thành công."
      );
    } catch (error) {
      console.error("❌ PaymentService.searchPayments error:", error);
      return this.handleError(error, "Lỗi khi tìm kiếm thanh toán.");
    }
  }

  // Helper method để xử lý response format chung
  _processPaymentResponse(data, successMessage) {
    let payments = [];
    let paginationInfo = {
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      pageSize: 20,
      hasNext: false,
      hasPrevious: false,
    };

    // Format 1: Map response với payments và pagination riêng
    if (data?.payments !== undefined) {
      payments = Array.isArray(data.payments) ? data.payments : [];
      paginationInfo = {
        currentPage: data.currentPage || 0,
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 0,
        pageSize: data.pageSize || 20,
        hasNext: data.hasNext || false,
        hasPrevious: data.hasPrevious || false,
      };
    }
    // Format 2: Page object trực tiếp
    else if (data?.content !== undefined) {
      payments = Array.isArray(data.content) ? data.content : [];
      paginationInfo = {
        currentPage: data.number || 0,
        totalItems: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        pageSize: data.size || 20,
        hasNext: !data.last || false,
        hasPrevious: !data.first || false,
      };
    }
    // Format 3: Direct array
    else if (Array.isArray(data)) {
      payments = data;
    }
    // Format 4: Kiểm tra các trường hợp khác
    else {
      console.warn("⚠️ Unexpected response format:", data);

      // Thử extract từ các trường khác
      if (data?.data?.payments) {
        payments = data.data.payments;
        paginationInfo = data.data.pagination || {};
      } else if (data?.data?.content) {
        payments = data.data.content;
        if (data.data) {
          paginationInfo = {
            currentPage: data.data.number || 0,
            totalItems: data.data.totalElements || 0,
            totalPages: data.data.totalPages || 0,
            pageSize: data.data.size || 20,
          };
        }
      }
    }

    console.log("📊 Processed payments:", {
      count: payments.length,
      pagination: paginationInfo,
    });

    return {
      success: true,
      data: {
        payments,
        pagination: paginationInfo,
      },
      message: successMessage,
    };
  }

  async getPaymentDetails(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: "ID thanh toán không được để trống.",
        };
      }
      const response = await paymentApi.getPaymentDetails(id);
      const data = this._extractDataFromResponse(response);
      return {
        success: true,
        data: data,
        message: "Lấy chi tiết thanh toán thành công.",
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy chi tiết thanh toán.");
    }
  }

  async exportToPdf(params = {}) {
    try {
      const response = await paymentApi.exportToPdf(params);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const time = new Date().toTimeString().slice(0, 8).replace(/:/g, "");
      const fileName = `payment-report-${date}-${time}.pdf`;
      downloadFile(response.data, fileName);
      return { success: true, message: "Xuất PDF thành công!" };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xuất báo cáo PDF.");
    }
  }

  async exportToExcel(params = {}) {
    try {
      const response = await paymentApi.exportToExcel(params);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const time = new Date().toTimeString().slice(0, 8).replace(/:/g, "");
      const fileName = `payment-report-${date}-${time}.xlsx`;
      downloadFile(response.data, fileName);
      return { success: true, message: "Xuất Excel thành công!" };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xuất báo cáo Excel.");
    }
  }

  async getTotalRevenue() {
    try {
      console.log("💰 PaymentService.getTotalRevenue called");

      const response = await paymentApi.getTotalRevenue();
      const data = this._extractDataFromResponse(response);

      console.log("✅ PaymentService.getTotalRevenue response:", data);

      // BE có thể trả về number trực tiếp hoặc object
      let totalRevenue = 0;

      if (typeof data === "number") {
        totalRevenue = data;
      } else if (data && typeof data === "object") {
        // Thử các key có thể có
        totalRevenue =
          data.totalRevenue || data.revenue || data.amount || data.value || 0;
      } else if (typeof data === "string") {
        totalRevenue = parseFloat(data) || 0;
      }

      return {
        success: true,
        data: { totalRevenue },
        message: "Lấy thống kê doanh thu thành công.",
      };
    } catch (error) {
      console.error("❌ PaymentService.getTotalRevenue error:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê doanh thu.");
    }
  }

  async getPaymentStatusStats() {
    try {
      console.log("📊 PaymentService.getPaymentStatusStats called");

      const response = await paymentApi.getPaymentStatusStats();
      const data = this._extractDataFromResponse(response);

      console.log("✅ PaymentService.getPaymentStatusStats response:", data);

      // Đảm bảo luôn trả về object
      let statusStats = {};

      if (data && typeof data === "object") {
        statusStats = data;
      } else if (Array.isArray(data)) {
        // Nếu là array, convert sang object
        data.forEach((item) => {
          if (item && item.status && item.count !== undefined) {
            statusStats[item.status] = item.count;
          }
        });
      }

      return {
        success: true,
        data: { statusStats },
        message: "Lấy thống kê trạng thái thành công.",
      };
    } catch (error) {
      console.error("❌ PaymentService.getPaymentStatusStats error:", error);
      return this.handleError(error, "Lỗi khi lấy thống kê trạng thái.");
    }
  }

  // ==================== UTILITY METHODS ====================
  formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";

      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Ngày không hợp lệ";
    }
  }

  getPaymentStatusTag(status) {
    const statusConfig = {
      SUCCESS: { color: "#52c41a", text: "Thành công", badge: "success" },
      PENDING: { color: "#1890ff", text: "Đang chờ", badge: "processing" },
      FAILED: { color: "#f5222d", text: "Thất bại", badge: "error" },
      CANCELLED: { color: "#fa8c16", text: "Đã hủy", badge: "warning" },
      REFUNDED: { color: "#722ed1", text: "Đã hoàn tiền", badge: "default" },
      PROCESSING: { color: "#13c2c2", text: "Đang xử lý", badge: "processing" },
    };

    return (
      statusConfig[status] || {
        color: "#d9d9d9",
        text: status || "Không xác định",
        badge: "default",
      }
    );
  }

  // Helper để build params cho search
  buildSearchParams(filters = {}, page = 0, pageSize = 20) {
    const params = {
      page: page,
      size: pageSize,
      sort: ["dateTransaction,desc"],
    };

    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.status) params.status = filters.status;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;

    return params;
  }

  // Helper để build params cho getAllPayments
  buildGetAllParams(
    page = 0,
    pageSize = 20,
    sortBy = "dateTransaction",
    sortDirection = "desc"
  ) {
    return {
      page: page,
      size: pageSize,
      sortBy: sortBy,
      sortDirection: sortDirection,
    };
  }
}

const paymentService = new PaymentService();
export default paymentService;
