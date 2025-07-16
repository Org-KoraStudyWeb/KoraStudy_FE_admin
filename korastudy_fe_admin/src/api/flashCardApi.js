import axiosClient from './axiosClient';

const flashCardApi = {
  // Lấy danh sách bộ flashcard hệ thống
  getSystemFlashcardSets: () => {
    return axiosClient.get('/api/flashcards/system');
  },

  // Lấy chi tiết bộ flashcard
  getFlashcardSetById: (setId) => {
    return axiosClient.get(`/api/flashcards/${setId}`);
  },

  // Tạo bộ flashcard hệ thống
  createSystemFlashcardSet: (data) => {
    return axiosClient.post('/api/flashcards/system', data);
  },

  // Cập nhật bộ flashcard hệ thống
  updateSystemFlashcardSet: (setId, data) => {
    return axiosClient.put(`/api/flashcards/system/${setId}`, data);
  },

  // Xóa bộ flashcard hệ thống
  deleteSystemFlashcardSet: (setId) => {
    return axiosClient.delete(`/api/flashcards/system/${setId}`);
  }
};

export default flashCardApi;