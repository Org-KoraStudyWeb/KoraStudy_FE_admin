import React, { useState } from "react";
import { Search, Filter, X, Sliders } from "lucide-react";

const ReviewFilter = ({ onFilter, isLoading }) => {
  const [filters, setFilters] = useState({
    targetType: "",
    status: "",
    search: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = { targetType: "", status: "", search: "" };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleQuickFilter = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Filter size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bộ lọc & Tìm kiếm
            </h3>
            <p className="text-sm text-gray-500">
              Tìm kiếm và lọc đánh giá theo tiêu chí
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showAdvanced
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Sliders size={16} />
            {showAdvanced ? "Lọc đơn giản" : "Lọc nâng cao"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm theo ID, tiêu đề khóa học, nội dung đánh giá..."
          value={filters.search}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-sm font-medium text-gray-700 mr-2">
          Loại nhanh:
        </span>
        <button
          onClick={() => handleQuickFilter("targetType", "")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            !filters.targetType
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => handleQuickFilter("targetType", "COURSE")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            filters.targetType === "COURSE"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Khóa học
        </button>
        <button
          onClick={() => handleQuickFilter("targetType", "MOCK_TEST")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            filters.targetType === "MOCK_TEST"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Bài thi
        </button>
        <button
          onClick={() => handleQuickFilter("status", "HIDDEN")}
          className={`px-3 py-1.5 text-sm rounded-lg ${
            filters.status === "HIDDEN"
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Đã ẩn
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Loại đánh giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại đánh giá
              </label>
              <select
                name="targetType"
                value={filters.targetType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Tất cả loại</option>
                <option value="COURSE">Khóa học</option>
                <option value="MOCK_TEST">Bài thi thử</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hiển thị</option>
                <option value="HIDDEN">Đã ẩn</option>
                <option value="DELETED">Đã xóa</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá sao
              </label>
              <select
                name="rating"
                value={filters.rating || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Tất cả rating</option>
                <option value="5">★★★★★ (5 sao)</option>
                <option value="4">★★★★☆ (4 sao trở lên)</option>
                <option value="3">★★★☆☆ (3 sao trở lên)</option>
                <option value="2">★★☆☆☆ (2 sao trở lên)</option>
                <option value="1">★☆☆☆☆ (1 sao)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-5 pt-5 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <X size={18} />
          Đặt lại bộ lọc
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang tìm...
              </>
            ) : (
              <>
                <Search size={18} />
                Tìm kiếm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilter;
