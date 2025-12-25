// src/services/admin/CertificateAdminService.js
import certificateApi from "../api/certificateApi";

// Certificate Admin Service - Quản lý certificate của user
const CertificateService = {
  // Define certificate grade constants
  CERTIFICATE_GRADES: {
    EXCELLENT: "EXCELLENT",
    GOOD: "GOOD",
    FAIR: "FAIR",
    PASS: "PASS",
  },

  // ==================== CERTIFICATE MANAGEMENT ====================

  /**
   * Lấy certificate của user cho một khóa học
   *
   * @param {number} userId - ID của user
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<Object>} Thông tin certificate
   */
  getUserCertificate: async (userId, courseId) => {
    try {
      console.log(
        `📜 Admin: Lấy certificate user=${userId}, course=${courseId}`
      );

      const response = await certificateApi.getUserCertificate(
        userId,
        courseId
      );

      // Format certificate cho hiển thị
      if (response.success && response.certificate) {
        const formattedCert = CertificateService.formatCertificateForDisplay(
          response.certificate
        );
        return {
          success: true,
          certificate: formattedCert,
          message: "Lấy certificate thành công",
        };
      }

      return response;
    } catch (error) {
      console.error("❌ Admin service lỗi khi lấy certificate:", error);
      return {
        success: false,
        message: error.message || "Không thể lấy certificate",
        error: error.data,
      };
    }
  },

  /**
   * Lấy tất cả certificates của một user
   *
   * @param {number} userId - ID của user
   * @returns {Promise<Object>} Danh sách certificates
   */
  getAllUserCertificates: async (userId) => {
    try {
      console.log(`📋 Admin: Lấy tất cả certificates user=${userId}`);

      const response = await certificateApi.getAllUserCertificates(userId);

      // Format certificates cho hiển thị
      if (response.success && response.certificates) {
        const formattedCerts = response.certificates.map((cert) =>
          CertificateService.formatCertificateForDisplay(cert)
        );

        return {
          success: true,
          certificates: formattedCerts,
          totalCertificates:
            response.totalCertificates || formattedCerts.length,
          stats: response.stats,
          message: "Lấy danh sách certificates thành công",
        };
      }

      return response;
    } catch (error) {
      console.error(
        "❌ Admin service lỗi khi lấy danh sách certificates:",
        error
      );
      return {
        success: false,
        message: error.message || "Không thể lấy danh sách certificates",
        error: error.data,
      };
    }
  },

  /**
   * Xóa certificate của user
   *
   * @param {number} certificateId - ID của certificate
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteCertificate: async (certificateId) => {
    try {
      console.log(`🗑️ Admin: Xóa certificate=${certificateId}`);

      const response = await certificateApi.deleteCertificate(certificateId);

      return {
        success: true,
        ...response,
        message: "Xóa certificate thành công",
      };
    } catch (error) {
      console.error("❌ Admin service lỗi khi xóa certificate:", error);
      return {
        success: false,
        message: error.message || "Không thể xóa certificate",
        error: error.data,
      };
    }
  },

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Format certificate cho hiển thị
   */
  formatCertificateForDisplay: (certificate) => {
    if (!certificate) return null;

    return {
      ...certificate,
      formattedDate: CertificateService.formatCertificateDate(
        certificate.certificateDate
      ),
      gradeDisplayName: CertificateService.getGradeDisplayName(
        certificate.grade
      ),
      gradeIcon: CertificateService.getGradeIcon(certificate.grade),
      gradeColor: CertificateService.getGradeColor(certificate.grade),
      averageScoreFormatted: CertificateService.formatScore(
        certificate.averageScore
      ),
      canDelete: true, // Admin luôn có quyền xóa
    };
  },

  /**
   * Format date cho hiển thị
   */
  formatCertificateDate: (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  },

  /**
   * Get display name cho certificate grade
   */
  getGradeDisplayName: (grade) => {
    const gradeNames = {
      [CertificateService.CERTIFICATE_GRADES.EXCELLENT]: "Xuất sắc",
      [CertificateService.CERTIFICATE_GRADES.GOOD]: "Giỏi",
      [CertificateService.CERTIFICATE_GRADES.FAIR]: "Khá",
      [CertificateService.CERTIFICATE_GRADES.PASS]: "Hoàn thành",
    };
    return gradeNames[grade] || grade;
  },

  /**
   * Get icon cho certificate grade
   */
  getGradeIcon: (grade) => {
    const gradeIcons = {
      [CertificateService.CERTIFICATE_GRADES.EXCELLENT]: "🏆",
      [CertificateService.CERTIFICATE_GRADES.GOOD]: "⭐",
      [CertificateService.CERTIFICATE_GRADES.FAIR]: "✨",
      [CertificateService.CERTIFICATE_GRADES.PASS]: "✅",
    };
    return gradeIcons[grade] || "📜";
  },

  /**
   * Get color cho certificate grade
   */
  getGradeColor: (grade) => {
    const gradeColors = {
      [CertificateService.CERTIFICATE_GRADES.EXCELLENT]: "#FFD700", // Gold
      [CertificateService.CERTIFICATE_GRADES.GOOD]: "#4CAF50", // Green
      [CertificateService.CERTIFICATE_GRADES.FAIR]: "#2196F3", // Blue
      [CertificateService.CERTIFICATE_GRADES.PASS]: "#9E9E9E", // Gray
    };
    return gradeColors[grade] || "#000000";
  },

  /**
   * Format điểm số cho hiển thị
   */
  formatScore: (score) => {
    if (score === null || score === undefined) return "N/A";
    return score.toFixed(1);
  },

  /**
   * Kiểm tra xem certificate có hợp lệ không
   */
  isValidCertificate: (certificate) => {
    return (
      certificate &&
      certificate.id &&
      certificate.certificateName &&
      certificate.certificateDate
    );
  },

  /**
   * Validate userId
   */
  validateUserId: (userId) => {
    return userId && !isNaN(parseInt(userId)) && parseInt(userId) > 0;
  },

  /**
   * Validate courseId
   */
  validateCourseId: (courseId) => {
    return courseId && !isNaN(parseInt(courseId)) && parseInt(courseId) > 0;
  },

  /**
   * Validate certificateId
   */
  validateCertificateId: (certificateId) => {
    return (
      certificateId &&
      !isNaN(parseInt(certificateId)) &&
      parseInt(certificateId) > 0
    );
  },
};

export default CertificateService;
