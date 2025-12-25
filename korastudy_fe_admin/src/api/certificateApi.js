// src/api/admin/certificateAdminApi.js
import axiosClient from "./axiosClient";

// Certificate Admin API endpoints
const certificateApi = {
  // ==================== ADMIN CERTIFICATE ENDPOINTS ====================
  // Base: /api/v1/certificates

  /**
   * ADMIN: Lấy certificate của một user cho khóa học cụ thể
   * API: Sử dụng API hiện có GET /api/v1/certificates/courses/{courseId}
   * Hoặc cần backend tạo API mới: GET /api/v1/certificates/admin/users/{userId}/courses/{courseId}
   *
   * @param {number} userId - ID của user
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<Object>} Thông tin certificate
   */
  getUserCertificate: async (userId, courseId) => {
    try {
      console.log(
        `🔍 ADMIN GET certificate for user=${userId}, course=${courseId}`
      );

      const response = await axiosClient.get(
        `/api/v1/certificates/admin/users/${userId}/courses/${courseId}`
      );

      console.log(`✅ Admin certificate found:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Admin lỗi khi lấy certificate user=${userId}, course=${courseId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * ADMIN: Lấy tất cả certificates của một user
   * API: Cần backend tạo API mới: GET /api/v1/certificates/admin/users/{userId}/certificates
   *
   * @param {number} userId - ID của user
   * @returns {Promise<Object>} Danh sách certificates của user
   */
  getAllUserCertificates: async (userId) => {
    try {
      console.log(`📋 ADMIN GET all certificates for user=${userId}`);
      const response = await axiosClient.get(
        `/api/v1/certificates/admin/users/${userId}/certificates`
      );

      console.log(`✅ Admin user certificates:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Admin lỗi khi lấy certificates user=${userId}:`, error);
      throw error;
    }
  },

  /**
   * ADMIN: Xóa certificate của user
   * API: Sử dụng API hiện có DELETE /api/v1/certificates/courses/{courseId}
   * Hoặc cần backend tạo API mới: DELETE /api/v1/certificates/admin/{certificateId}
   *
   * @param {number} certificateId - ID của certificate cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteCertificate: async (certificateId) => {
    try {
      console.log(`🗑️ ADMIN DELETE certificate=${certificateId}`);

      const response = await axiosClient.delete(
        `/api/v1/certificates/admin/${certificateId}`
      );

      console.log(`✅ Admin certificate deleted:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Admin lỗi khi xóa certificate=${certificateId}:`,
        error
      );
      throw error;
    }
  },
};

export default certificateApi;
