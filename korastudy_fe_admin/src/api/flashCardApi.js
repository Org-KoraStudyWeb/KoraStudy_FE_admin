import axiosClient from './axiosClient';

const flashCardApi = {
  // Lấy danh sách bộ flashcard hệ thống
  getSystemFlashcardSets: () => {
    return axiosClient.get('/api/v1/flashcards/system');
  },

  // Lấy chi tiết bộ flashcard
  getFlashcardSetById: (setId) => {
    return axiosClient.get(`/api/v1/flashcards/${setId}`);
  },

  // Tạo bộ flashcard hệ thống
  createSystemFlashcardSet: (data) => {
    return axiosClient.post('/api/v1/flashcards/system', data);
  },

  // Cập nhật bộ flashcard hệ thống
  updateSystemFlashcardSet: (setId, data) => {
    return axiosClient.put(`/api/v1/flashcards/system/${setId}`, data);
  },

  // Xóa bộ flashcard hệ thống
  deleteSystemFlashcardSet: (setId) => {
    return axiosClient.delete(`/api/v1/flashcards/system/${setId}`);
  }
};

export default flashCardApi;