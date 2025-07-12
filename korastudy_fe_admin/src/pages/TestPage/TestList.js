import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  // Download,
  Users,
  Clock,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTests, setSelectedTests] = useState([]);
  const navigate = useNavigate();

  // Enhanced mock data with Korean content
  const tests = [
    {
      id: 1,
      title: 'TOPIK I - 한국어능력시험 모의고사 1',
      type: 'TOPIK I',
      status: 'active',
      questions: 40,
      duration: 100,
      participants: 156,
      createdDate: '2024-01-15',
      lastModified: '2024-01-20',
      level: '초급',
      description: '초급 수준의 한국어 학습자를 위한 TOPIK I 모의고사입니다.'
    },
    {
      id: 2,
      title: 'TOPIK II - 한국어능력시험 모의고사 2',
      type: 'TOPIK II',
      status: 'draft',
      questions: 50,
      duration: 180,
      participants: 89,
      createdDate: '2024-01-10',
      lastModified: '2024-01-18',
      level: '중급',
      description: '중급 이상 수준의 한국어 학습자를 위한 TOPIK II 모의고사입니다.'
    },
    {
      id: 3,
      title: 'Kiểm tra ngữ pháp cơ bản',
      type: 'Grammar',
      status: 'active',
      questions: 25,
      duration: 30,
      participants: 234,
      createdDate: '2024-01-05',
      lastModified: '2024-01-15'
    },
    {
      id: 4,
      title: 'Từ vựng TOPIK I',
      type: 'Vocabulary',
      status: 'inactive',
      questions: 30,
      duration: 45,
      participants: 67,
      createdDate: '2024-01-01',
      lastModified: '2024-01-10'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'draft':
        return 'Bản nháp';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return 'Không xác định';
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || test.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTests.length === filteredTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(filteredTests.map(test => test.id));
    }
  };

  const handleCreateTest = () => {
    navigate('/admin/tests/create');
  };

  const handleEditTest = (testId) => {
    navigate(`/admin/tests/${testId}/edit`);
  };

  const handleViewTest = (testId) => {
    navigate(`/admin/tests/${testId}`);
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      // Logic xóa đề thi
      console.log('Deleting test:', testId);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="text-gray-600 mt-1">Quản lý và tổ chức các đề thi TOPIK</p>
        </div>
        <button 
          onClick={handleCreateTest}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tạo đề thi mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số đề thi</p>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {tests.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tests.filter(t => t.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thí sinh</p>
              <p className="text-2xl font-bold text-purple-600">
                {tests.reduce((sum, test) => sum + test.participants, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="draft">Bản nháp</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTests.length > 0 && (
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Xóa ({selectedTests.length})
              </button>
              <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Xuất file
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTests.length === filteredTests.length && filteredTests.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên đề thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Câu hỏi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thí sinh
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
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => handleSelectTest(test.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{test.title}</div>
                    <div className="text-sm text-gray-500">{test.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {test.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {getStatusText(test.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {test.questions} câu
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                    <Clock size={14} />
                    {test.duration} phút
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                    <Users size={14} />
                    {test.participants}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                    <Calendar size={14} />
                    {test.createdDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewTest(test.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditTest(test.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredTests.length}</span> trong tổng số <span className="font-medium">{tests.length}</span> kết quả
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TestList;