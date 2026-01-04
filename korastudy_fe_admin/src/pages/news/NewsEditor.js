import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Archive,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import newsApi from '../../api/newsApi';

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const isViewMode = window.location.pathname.includes('/view/');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    thumbnailUrl: '',
    sourceUrl: '',
    sourceName: '',
    difficultyLevel: 'BEGINNER',
    topicId: '',
    status: 'DRAFT',
    estimatedReadTime: 0,
    wordCount: 0
  });

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch article if editing
  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getArticleById(id);
      const article = response.data.data || response.data;
      
      setFormData({
        title: article.title || '',
        content: article.content || '',
        summary: article.summary || '',
        thumbnailUrl: article.thumbnailUrl || '',
        sourceUrl: article.sourceUrl || '',
        sourceName: article.sourceName || '',
        difficultyLevel: article.difficultyLevel || 'BEGINNER',
        topicId: article.newsTopic?.id || article.topicId || '',
        status: article.status || 'DRAFT',
        estimatedReadTime: article.estimatedReadTime || 0,
        wordCount: article.wordCount || 0
      });
    } catch (err) {
      console.error('Error fetching article:', err);
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate stats
  useEffect(() => {
    const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
    setFormData(prev => ({
      ...prev,
      wordCount,
      estimatedReadTime
    }));
  }, [formData.content]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (newStatus = null) => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        status: newStatus || formData.status,
        topicId: formData.topicId || null
      };

      if (isEditing) {
        await newsApi.updateArticle(id, payload);
        toast.success('Đã cập nhật bài viết');
      } else {
        // For create - would need a createArticle endpoint
        toast.info('Chức năng tạo mới đang phát triển. Vui lòng sử dụng Import từ URL.');
      }

      if (newStatus === 'PUBLISHED') {
        navigate('/admin/news');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Không thể lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await newsApi.changeArticleStatus(id, newStatus);
      setFormData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Đã chuyển trạng thái sang ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

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
      'DRAFT': 'bg-gray-100 text-gray-800 border-gray-300',
      'SCHEDULED': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PUBLISHED': 'bg-green-100 text-green-800 border-green-300',
      'ARCHIVED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/news')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {isViewMode ? 'Xem bài viết' : isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h1>
                {isEditing && (
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(formData.status)}`}>
                    {getStatusLabel(formData.status)}
                  </span>
                )}
              </div>
            </div>

            {!isViewMode && (
              <div className="flex items-center gap-3">
                {/* Status actions */}
                {isEditing && formData.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('PUBLISHED')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={18} />
                    Xuất bản
                  </button>
                )}
                
                {isEditing && formData.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleStatusChange('ARCHIVED')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    <Archive size={18} />
                    Lưu trữ
                  </button>
                )}

                {/* Save button */}
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            )}

            {isViewMode && (
              <button
                onClick={() => navigate(`/admin/news/edit/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isViewMode}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                disabled={isViewMode}
                rows={3}
                placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                disabled={isViewMode}
                rows={20}
                placeholder="Nhập nội dung bài viết tiếng Hàn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans text-base leading-relaxed disabled:bg-gray-50"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              />
              <div className="mt-2 flex justify-end text-sm text-gray-500">
                <span>{formData.wordCount} từ</span>
                <span className="mx-2">•</span>
                <span>~{formData.estimatedReadTime} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image size={16} className="inline mr-2" />
                Ảnh đại diện
              </label>
              {formData.thumbnailUrl && (
                <img
                  src={formData.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleInputChange}
                disabled={isViewMode}
                placeholder="URL ảnh đại diện..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
              />
            </div>

            {/* Topic */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-2" />
                Chủ đề
              </label>
              <select
                name="topicId"
                value={formData.topicId}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              >
                <option value="">-- Chọn chủ đề --</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BarChart2 size={16} className="inline mr-2" />
                Cấp độ
              </label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              >
                <option value="BEGINNER">Sơ cấp (TOPIK I)</option>
                <option value="INTERMEDIATE">Trung cấp (TOPIK II 3-4)</option>
                <option value="ADVANCED">Cao cấp (TOPIK II 5-6)</option>
              </select>
            </div>

            {/* Source */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe size={16} className="inline mr-2" />
                Nguồn
              </label>
              <input
                type="text"
                name="sourceName"
                value={formData.sourceName}
                onChange={handleInputChange}
                disabled={isViewMode}
                placeholder="Tên nguồn (VD: VOA Korea)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 disabled:bg-gray-50"
              />
              <input
                type="url"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleInputChange}
                disabled={isViewMode}
                placeholder="URL nguồn gốc"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
              {formData.sourceUrl && (
                <a
                  href={formData.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mt-2"
                >
                  <Globe size={14} />
                  Xem nguồn gốc
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Thống kê</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Số từ:</span>
                  <span className="font-medium">{formData.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian đọc:</span>
                  <span className="font-medium">{formData.estimatedReadTime} phút</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;
