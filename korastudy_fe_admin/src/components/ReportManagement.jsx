import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Eye, X, AlertTriangle } from 'lucide-react';
import blogApi from '../api/blogApi';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAllReports(filterStatus || null);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewReport = async (reportId) => {
    try {
      const response = await blogApi.getReportById(reportId);
      setSelectedReport(response.data);
      setShowReviewModal(true);
      setReviewStatus('');
      setAdminNote('');
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Không thể tải chi tiết báo cáo');
    }
  };

  const handleReviewReport = async (e) => {
    e.preventDefault();

    if (!reviewStatus) {
      toast.error('Vui lòng chọn trạng thái xử lý');
      return;
    }

    try {
      setSubmitting(true);
      await blogApi.reviewReport(selectedReport.id, reviewStatus, adminNote);
      toast.success('Đã xử lý báo cáo thành công');
      setShowReviewModal(false);
      fetchReports(); // Refresh list
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast.error('Không thể xử lý báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
      REVIEWED: { color: 'bg-green-100 text-green-800', text: 'Đã xử lý' },
      DISMISSED: { color: 'bg-gray-100 text-gray-800', text: 'Bỏ qua' }
    };

    const { color, text } = config[status] || config.PENDING;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Quản lý báo cáo bài viết
        </h1>

        {/* Filter */}
        <div className="flex gap-4 items-center">
          <label className="font-medium text-gray-700 dark:text-gray-200">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="REVIEWED">Đã xử lý</option>
            <option value="DISMISSED">Bỏ qua</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Không có báo cáo nào</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.post?.postTitle || 'Bài viết đã xóa'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {report.reporter?.username || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {report.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Chi tiết báo cáo
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bài viết:
                </label>
                <p className="text-gray-900 dark:text-white">{selectedReport.post?.postTitle}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Người báo cáo:
                </label>
                <p className="text-gray-900 dark:text-white">{selectedReport.reporter?.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lý do:
                </label>
                <p className="text-gray-900 dark:text-white">{selectedReport.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả chi tiết:
                </label>
                <p className="text-gray-900 dark:text-white">{selectedReport.description || 'Không có'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trạng thái hiện tại:
                </label>
                {getStatusBadge(selectedReport.status)}
              </div>

              {selectedReport.adminNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú admin:
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedReport.adminNote}</p>
                </div>
              )}
            </div>

            {selectedReport.status === 'PENDING' && (
              <form onSubmit={handleReviewReport}>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    Kết quả xử lý <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">-- Chọn kết quả --</option>
                    <option value="REVIEWED">Đã xử lý</option>
                    <option value="DISMISSED">Bỏ qua</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                    Ghi chú
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    placeholder="Ghi chú về việc xử lý báo cáo..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
