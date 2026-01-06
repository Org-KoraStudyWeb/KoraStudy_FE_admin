import axiosClient from "../api/axiosClient";

const AdminExamService = {
  // Get dashboard stats for admin
  getDashboardStats: async () => {
    try {
      console.log("📊 Fetching exam dashboard stats...");
      const response = await axiosClient.get("/api/v1/admin/exams/stats");
      console.log("✅ Exam dashboard stats fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching exam dashboard stats:", error);
      throw error;
    }
  },

  // Get all exams for admin
  getAllExams: async () => {
    try {
      // Sử dụng axiosClient đã được cấu hình tập trung
      const response = await axiosClient.get("/api/v1/admin/exams");
      console.log("Fetched exams from server:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  },

  // Delete an exam
  deleteExam: async (id) => {
    try {
      console.log("Deleting exam with ID:", id);
      const response = await axiosClient.delete(`/api/v1/admin/exams/${id}`);
      console.log("Delete response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting exam:", error);
      throw error;
    }
  },

  // Get exam detail for editing
  getExamDetail: async (id) => {
    try {
      const response = await axiosClient.get(`/api/v1/admin/exams/${id}`);
      console.log("Got exam details:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      console.log("Sending data to create exam:", examData);
      const response = await axiosClient.post("/api/v1/admin/exams", examData);
      console.log("Create exam response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      console.log("Sending data to update exam:", examData);
      const response = await axiosClient.put(
        `/api/v1/admin/exams/${id}`,
        examData
      );
      console.log("Update exam response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating exam:", error);
      throw error;
    }
  },

  // Add a new part to an exam
  addPart: async (examId, partData) => {
    try {
      console.log("Adding part to exam:", examId, partData);
      const response = await axiosClient.post(
        `/api/v1/admin/exams/${examId}/parts`,
        partData
      );
      console.log("Add part response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding part:", error);
      throw error;
    }
  },

  // Update a part
  updatePart: async (partId, partData) => {
    try {
      console.log("Updating part:", partId, partData);
      const response = await axiosClient.put(
        `/api/v1/admin/exams/parts/${partId}`,
        partData
      );
      console.log("Update part response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating part:", error);
      throw error;
    }
  },

  // Delete a part
  deletePart: async (partId) => {
    try {
      const response = await axiosClient.delete(
        `/api/v1/admin/exams/parts/${partId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting part:", error);
      throw error;
    }
  },

  // Add a new question to a part
  addQuestion: async (partId, questionData) => {
    try {
      console.log("Adding question to part:", partId, questionData);
      const response = await axiosClient.post(
        `/api/v1/admin/exams/parts/${partId}/questions`,
        questionData
      );
      console.log("Add question response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (questionId, questionData) => {
    try {
      console.log("Updating question:", questionId, questionData);
      const response = await axiosClient.put(
        `/api/v1/admin/exams/questions/${questionId}`,
        questionData
      );
      console.log("Update question response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    try {
      const response = await axiosClient.delete(
        `/api/v1/admin/exams/questions/${questionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },

  uploadFileAndUpdateQuestion: async (questionId, file, fileType) => {
    try {
      console.log(
        `Bắt đầu upload ${fileType} lên Cloudinary cho câu hỏi:`,
        questionId
      );

      // Tạo form data
      const formData = new FormData();
      formData.append("file", file);

      // Chọn endpoint tương ứng
      const endpoint =
        fileType === "image"
          ? `/api/v1/admin/exams/questions/${questionId}/upload-image`
          : fileType === "audio"
          ? `/api/v1/admin/exams/questions/${questionId}/upload-audio`
          : null;

      if (!endpoint) {
        throw new Error("Loại file không được hỗ trợ");
      }

      console.log(`Sử dụng endpoint: ${endpoint}`);

      // Gửi request lên backend với header multipart/form-data
      const response = await axiosClient.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        `Upload ${fileType} và cập nhật câu hỏi thành công:`,
        response.data
      );

      return {
        url: response.data[fileType + "Url"],
        questionData: response.data,
      };
    } catch (error) {
      console.error(`Lỗi khi upload ${fileType} và cập nhật câu hỏi:`, error);
      throw error;
    }
  },
  // =====================
  // Toggle exam active status
  toggleExamActive: async (id) => {
    try {
      const response = await axiosClient.patch(
        `/api/v1/admin/exams/${id}/toggle-active`
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling exam status:", error);
      throw error;
    }
  },

  // Duplicate exam
  duplicateExam: async (id) => {
    try {
      const response = await axiosClient.post(
        `/api/v1/admin/exams/${id}/duplicate`
      );
      return response.data;
    } catch (error) {
      console.error("Error duplicating exam:", error);
      throw error;
    }
  },
};

export default AdminExamService;
