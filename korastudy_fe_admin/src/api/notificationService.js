import axiosClient from "./axiosClient"; // Use the existing axios client with proper token handling

export const notificationService = {
  // Gửi thông báo hệ thống (chỉ admin)
  sendSystemNotification: async (notificationData) => {
    try {
      // Sử dụng axiosClient để đảm bảo token được gửi đúng cách
      const response = await axiosClient.post(
        "/api/v1/notifications/system",
        notificationData
      );
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },

  // Lấy danh sách người dùng (để hiển thị trong dropdown)
  getUsersForNotification: async () => {
    try {
      // Use axiosClient instead of axios directly for consistent authentication
      const response = await axiosClient.get("/api/v1/admin/users");
      console.log("API response:", response.data); // Debug log

      // Kiểm tra cấu trúc dữ liệu và trích xuất mảng users
      if (Array.isArray(response.data)) {
        return response.data; // Nếu response.data đã là mảng
      } else if (response.data && Array.isArray(response.data.content)) {
        return response.data.content; // Nếu users nằm trong thuộc tính content
      } else if (response.data && Array.isArray(response.data.users)) {
        return response.data.users; // Nếu users nằm trong thuộc tính users
      } else {
        console.error("Unexpected API response format:", response.data);
        return []; // Trả về mảng rỗng để tránh lỗi
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
};

export default notificationService;
