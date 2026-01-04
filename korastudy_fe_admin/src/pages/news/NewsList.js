import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  MoreVertical,
  Calendar,
  Download,
  Globe,
  FileText,
  Archive,
  Clock,
  Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import newsApi from '../../api/newsApi';

const NewsList = () => {
  const navigate = useNavigate();
  
  // States
  const [articles, setArticles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importTopicId, setImportTopicId] = useState('');
  const [importing, setImporting] = useState(false);
  
  // Topic management modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicFormData, setTopicFormData] = useState({ name: '', nameKorean: '', description: '', iconUrl: '' });
  const [editingTopicId, setEditingTopicId] = useState(null);

  // Fetch articles with filters
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        size: pageSize,
        keyword: searchTerm || undefined,
        topicId: selectedTopic || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        level: filterLevel !== 'all' ? filterLevel : undefined
      };

      const response = await newsApi.getAllArticles(params);
      const data = response.data;
      
      console.log('📰 News API Response:', data);

      if (data.data?.content) {
        setArticles(data.data.content);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      } else if (data.content) {
        setArticles(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setArticles([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Không thể tải danh sách bài viết');
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedTopic, filterStatus, filterLevel]);

  // Fetch topics
  const fetchTopics = async () => {
    try {
      const response = await newsApi.getAllTopics();
      const data = response.data;
      if (data.data) {
        setTopics(data.data);
      } else if (Array.isArray(data)) {
        setTopics(data);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchTopics();
  }, [fetchArticles]);

  // Handle import from URL
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast.error('Vui lòng nhập URL bài viết');
      return;
    }

    try {
      setImporting(true);
      const response = await newsApi.importFromUrl(importUrl, importTopicId || null);
      
      if (response.data.success || response.data.data) {
        const article = response.data.data || response.data.article;
        toast.success('Import bài viết thành công! Chuyển sang trang chỉnh sửa...');
        setShowImportModal(false);
        setImportUrl('');
        setImportTopicId('');
        
        // Navigate to edit page
        if (article?.id) {
          navigate(`/admin/news/edit/${article.id}`);
        } else {
          fetchArticles();
        }
      } else {
        toast.error(response.data.message || 'Import thất bại');
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.response?.data?.message || 'Không thể import bài viết từ URL này');
    } finally {
      setImporting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!articleToDelete) return;
    
    try {
      await newsApi.deleteArticle(articleToDelete.id);
      toast.success('Đã xóa bài viết');
      setShowDeleteModal(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Không thể xóa bài viết');
    }
  };

  // Handle status change
  const handleStatusChange = async (article, newStatus) => {
    try {
      await newsApi.changeArticleStatus(article.id, newStatus);
      toast.success(`Đã chuyển trạng thái sang ${getStatusLabel(newStatus)}`);
      fetchArticles();
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  // Topic CRUD
  const handleSaveTopic = async () => {
    try {
      if (editingTopicId) {
        await newsApi.updateTopic(editingTopicId, topicFormData);
        toast.success('Đã cập nhật chủ đề');
      } else {
        await newsApi.createTopic(topicFormData);
        toast.success('Đã tạo chủ đề mới');
      }
      setShowTopicModal(false);
      setTopicFormData({ name: '', nameKorean: '', description: '', iconUrl: '' });
      setEditingTopicId(null);
      fetchTopics();
    } catch (err) {
      console.error('Topic save error:', err);
      toast.error('Không thể lưu chủ đề');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Bạn có chắc muốn xóa chủ đề này?')) return;
    
    try {
      await newsApi.deleteTopic(topicId);
      toast.success('Đã xóa chủ đề');
      fetchTopics();
    } catch (err) {
      console.error('Topic delete error:', err);
      toast.error('Không thể xóa chủ đề (có thể đang có bài viết)');
    }
  };

  // Helper functions
  const getStatusLabel = (status) => {
    const labels = {
      'DRAFT': 'Bản nháp',
      'SCHEDULED': 'Đã lên lịch',
      'PUBLISHED': 'Đã xuất bản',
      'ARCHIVED': 'Đã lưu trữ'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SCHEDULED': 'bg-yellow-100 text-yellow-800',
      'PUBLISHED': 'bg-green-100 text-green-800',
      'ARCHIVED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level) => {
    const colors = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-blue-100 text-blue-800',
      'ADVANCED': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {totalElements} bài viết
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Tag size={18} />
            Quản lý chủ đề
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Import từ URL
          </button>
          <Link
            to="/admin/news/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Tạo mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Topic filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="SCHEDULED">Đã lên lịch</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>

          {/* Level filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả cấp độ</option>
            <option value="BEGINNER">Sơ cấp</option>
            <option value="INTERMEDIATE">Trung cấp</option>
            <option value="ADVANCED">Cao cấp</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <XCircle size={48} className="mx-auto mb-4" />
            <p>{error}</p>
            <button
              onClick={fetchArticles}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Chưa có bài viết nào</p>
            <button
              onClick={() => setShowImportModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Import bài viết đầu tiên
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cấp độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.thumbnailUrl && (
                        <img
                          src={article.thumbnailUrl}
                          alt=""
                          className="h-12 w-16 object-cover rounded mr-3"
                        />
                      )}
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </p>
                        {article.sourceUrl && (
                          <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Globe size={12} />
                            Nguồn gốc
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {article.topic?.name || article.newsTopic?.name || article.topicName || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(article.difficultyLevel)}`}>
                      {article.difficultyLevel || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                      {getStatusLabel(article.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <Link
                        to={`/admin/news/view/${article.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </Link>
                      
                      {/* Edit */}
                      <Link
                        to={`/admin/news/edit/${article.id}`}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>

                      {/* Status actions */}
                      {article.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(article, 'PUBLISHED')}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Xuất bản"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {article.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleStatusChange(article, 'ARCHIVED')}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                          title="Lưu trữ"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      
                      {/* Restore - for ARCHIVED articles */}
                      {article.status === 'ARCHIVED' && (
                        <button
                          onClick={() => handleStatusChange(article, 'PUBLISHED')}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Khôi phục & Xuất bản lại"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setArticleToDelete(article);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {currentPage + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Import bài viết từ URL
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Nhập URL bài viết để crawl nội dung tự động
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.voakorea.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: VOA Korea, KBS News, và các trang tin tức khác
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề (tùy chọn)
                </label>
                <select
                  value={importTopicId}
                  onChange={(e) => setImportTopicId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportUrl('');
                  setImportTopicId('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleImportFromUrl}
                disabled={importing || !importUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa bài viết "{articleToDelete?.title}"?
              </p>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setArticleToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Management Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                Quản lý chủ đề tin tức
              </h3>
            </div>
            
            <div className="p-6">
              {/* Add/Edit form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-700 mb-3">
                  {editingTopicId ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Tên (Tiếng Việt)"
                    value={topicFormData.name}
                    onChange={(e) => setTopicFormData({...topicFormData, name: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Tên (Tiếng Hàn)"
                    value={topicFormData.nameKorean}
                    onChange={(e) => setTopicFormData({...topicFormData, nameKorean: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Mô tả"
                    value={topicFormData.description}
                    onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="URL Icon"
                    value={topicFormData.iconUrl}
                    onChange={(e) => setTopicFormData({...topicFormData, iconUrl: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleSaveTopic}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingTopicId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {editingTopicId && (
                    <button
                      onClick={() => {
                        setEditingTopicId(null);
                        setTopicFormData({ name: '', nameKorean: '', description: '', iconUrl: '' });
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              {/* Topics list */}
              <div className="space-y-2">
                {topics.map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div>
                      <span className="font-medium">{topic.name}</span>
                      {topic.nameKorean && (
                        <span className="text-gray-500 ml-2">({topic.nameKorean})</span>
                      )}
                      {topic.description && (
                        <p className="text-sm text-gray-500">{topic.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id);
                          setTopicFormData({
                            name: topic.name || '',
                            nameKorean: topic.nameKorean || '',
                            description: topic.description || '',
                            iconUrl: topic.iconUrl || ''
                          });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {topics.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Chưa có chủ đề nào</p>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowTopicModal(false);
                  setEditingTopicId(null);
                  setTopicFormData({ name: '', nameKorean: '', description: '', iconUrl: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
