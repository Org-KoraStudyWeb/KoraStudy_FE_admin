import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateFlashCard = () => {
  const [flashCardSet, setFlashCardSet] = useState({
    title: '',
    description: '',
    category: '',
    cards: [{ front: '', back: '', example: '' }]
  });

  const addCard = () => {
    setFlashCardSet({
      ...flashCardSet,
      cards: [...flashCardSet.cards, { front: '', back: '', example: '' }]
    });
  };

  const removeCard = (index) => {
    const newCards = flashCardSet.cards.filter((_, i) => i !== index);
    setFlashCardSet({ ...flashCardSet, cards: newCards });
  };

  const updateCard = (index, field, value) => {
    const newCards = [...flashCardSet.cards];
    newCards[index][field] = value;
    setFlashCardSet({ ...flashCardSet, cards: newCards });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/flashcards" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Flash Card mới</h1>
          <p className="text-gray-600 mt-1">Tạo bộ thẻ học từ vựng và ngữ pháp</p>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên bộ thẻ
              </label>
              <input
                type="text"
                value={flashCardSet.title}
                onChange={(e) => setFlashCardSet({ ...flashCardSet, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên bộ thẻ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={flashCardSet.category}
                onChange={(e) => setFlashCardSet({ ...flashCardSet, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
                <option value="listening">Nghe</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={flashCardSet.description}
              onChange={(e) => setFlashCardSet({ ...flashCardSet, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả bộ thẻ..."
            />
          </div>
        </div>

        {/* Flash Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách thẻ</h2>
            <button
              onClick={addCard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Thêm thẻ
            </button>
          </div>

          <div className="space-y-4">
            {flashCardSet.cards.map((card, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Thẻ {index + 1}</h3>
                  {flashCardSet.cards.length > 1 && (
                    <button
                      onClick={() => removeCard(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mặt trước (Tiếng Hàn)
                    </label>
                    <input
                      type="text"
                      value={card.front}
                      onChange={(e) => updateCard(index, 'front', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập từ/cụm từ tiếng Hàn..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mặt sau (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={card.back}
                      onChange={(e) => updateCard(index, 'back', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập nghĩa tiếng Việt..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ví dụ (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={card.example}
                    onChange={(e) => updateCard(index, 'example', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập câu ví dụ..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link to="/admin/flashcards" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Hủy
            </Link>
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Lưu nháp
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Xuất bản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashCard;