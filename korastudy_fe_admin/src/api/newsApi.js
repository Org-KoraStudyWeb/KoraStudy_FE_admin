// src/api/newsApi.js
import axiosClient from "./axiosClient";

const newsApi = {
  // =================== ARTICLES ===================
  
  // Get all articles with filters (admin)
  getAllArticles: (params = {}) => {
    const { page = 0, size = 10, topicId, status, level, keyword } = params;
    return axiosClient.get("/api/v1/admin/news", {
      params: { page, size, topicId, status, level, keyword }
    });
  },

  // Get single article by ID
  getArticleById: (id) => {
    return axiosClient.get(`/api/v1/admin/news/${id}`);
  },

  // Import article from URL (crawl)
  importFromUrl: (url, topicId = null) => {
    return axiosClient.post("/api/v1/admin/news/import-from-url", {
      url,
      topicId
    });
  },

  // Update article
  updateArticle: (id, articleData) => {
    return axiosClient.put(`/api/v1/admin/news/${id}`, articleData);
  },

  // Delete article
  deleteArticle: (id) => {
    return axiosClient.delete(`/api/v1/admin/news/${id}`);
  },

  // Change article status
  changeArticleStatus: (id, status) => {
    return axiosClient.patch(`/api/v1/admin/news/${id}/status`, null, {
      params: { status }
    });
  },

  // Publish article
  publishArticle: (id) => {
    return newsApi.changeArticleStatus(id, 'PUBLISHED');
  },

  // Archive article
  archiveArticle: (id) => {
    return newsApi.changeArticleStatus(id, 'ARCHIVED');
  },

  // =================== TOPICS ===================
  
  // Get all topics
  getAllTopics: () => {
    return axiosClient.get("/api/v1/admin/news/topics");
  },

  // Create topic
  createTopic: (topicData) => {
    return axiosClient.post("/api/v1/admin/news/topics", topicData);
  },

  // Update topic
  updateTopic: (id, topicData) => {
    return axiosClient.put(`/api/v1/admin/news/topics/${id}`, topicData);
  },

  // Delete topic
  deleteTopic: (id) => {
    return axiosClient.delete(`/api/v1/admin/news/topics/${id}`);
  },

  // =================== STATISTICS ===================
  
  // Get news statistics (can be added later)
  getStatistics: () => {
    return axiosClient.get("/api/v1/admin/news/statistics");
  }
};

export default newsApi;
