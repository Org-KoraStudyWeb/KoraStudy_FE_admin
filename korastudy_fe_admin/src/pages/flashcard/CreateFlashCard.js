import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Eye, Image } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import flashCardApi from '../../api/flashCardApi';

const CreateFlashCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const isView = window.location.pathname.includes('/view/');

  const [flashCardSet, setFlashCardSet] = useState({
    title: '',
    description: '',
    category: '',
    cards: [{ term: '', definition: '', example: '', imageUrl: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick add vocabulary templates
  const quickAddTemplates = [
    { korean: '안녕하세요', vietnamese: 'Xin chào', pronunciation: 'an-nyeong-ha-se-yo' },
    { korean: '감사합니다', vietnamese: 'Cảm ơn', pronunciation: 'gam-sa-ham-ni-da' },
    { korean: '죄송합니다', vietnamese: 'Xin lỗi', pronunciation: 'joe-song-ham-ni-da' },
    { korean: '괜찮아요', vietnamese: 'Không sao', pronunciation: 'gwaen-chan-a-yo' },
    { korean: '네', vietnamese: 'Vâng/Có', pronunciation: 'ne' },
    { korean: '아니요', vietnamese: 'Không', pronunciation: 'a-ni-yo' },
    { korean: '맛있어요', vietnamese: 'Ngon', pronunciation: 'ma-si-sseo-yo' },
    { korean: '사랑해요', vietnamese: 'Yêu', pronunciation: 'sa-rang-hae-yo' }
  ];

  // Load existing flashcard set if editing
  useEffect(() => {
    if (isEdit || isView) {
      loadFlashCardSet();
    }
  }, [id, isEdit, isView]);

  const loadFlashCardSet = async () => {
    try {
      setLoading(true);
      const response = await flashCardApi.getFlashcardSetById(id);
      const data = response.data;
      
      setFlashCardSet({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        cards: data.cards && data.cards.length > 0 ? data.cards.map(card => ({
          term: card.term || '',
          definition: card.definition || '',
          example: card.example || '',
          imageUrl: card.imageUrl || ''
        })) : [{ term: '', definition: '', example: '', imageUrl: '' }]
      });
    } catch (error) {
      console.error('Lỗi khi tải flashcard set:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const addCard = () => {
    setFlashCardSet({
      ...flashCardSet,
      cards: [...flashCardSet.cards, { term: '', definition: '', example: '', imageUrl: '' }]
    });
  };

  const removeCard = (index) => {
    if (flashCardSet.cards.length > 1) {
      const newCards = flashCardSet.cards.filter((_, i) => i !== index);
      setFlashCardSet({ ...flashCardSet, cards: newCards });
    }
  };

  const updateCard = (index, field, value) => {
    const newCards = [...flashCardSet.cards];
    newCards[index][field] = value;
    setFlashCardSet({ ...flashCardSet, cards: newCards });
  };

  const addQuickVocabulary = (template) => {
    const newCard = {
      term: template.korean,
      definition: template.vietnamese,
      example: template.pronunciation,
      imageUrl: ''
    };
    
    setFlashCardSet({
      ...flashCardSet,
      cards: [...flashCardSet.cards, newCard]
    });
  };

  const handleSave = async () => {
    // Validation
    if (!flashCardSet.title.trim()) {
      alert('Vui lòng nhập tên danh sách');
      return;
    }

    if (!flashCardSet.category) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    // Validate cards
    const validCards = flashCardSet.cards.filter(card => 
      card.term?.trim() && card.definition?.trim()
    );

    if (validCards.length === 0) {
      alert('Vui lòng thêm ít nhất một từ vựng');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        title: flashCardSet.title.trim(),
        description: flashCardSet.description.trim(),
        category: flashCardSet.category,
        cards: validCards.map(card => ({
          term: card.term?.trim(),
          definition: card.definition?.trim(),
          example: card.example?.trim() || '',
          imageUrl: card.imageUrl?.trim() || ''
        }))
      };

      if (isEdit) {
        await flashCardApi.updateSystemFlashcardSet(id, payload);
        alert('Cập nhật bộ flashcard thành công!');
      } else {
        await flashCardApi.createSystemFlashcardSet(payload);
        alert('Tạo bộ flashcard thành công!');
      }

      navigate('/admin/flashcards');
    } catch (error) {
      console.error('Lỗi khi lưu flashcard:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/flashcards" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isView ? 'Xem Chi Tiết Flash Card' : isEdit ? 'Chỉnh Sửa Flash Card' : 'Tạo Flash Card Mới'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isView ? 'Xem chi tiết bộ thẻ học từ vựng' : 'Tạo và quản lý bộ thẻ học từ vựng hệ thống'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin danh sách</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh sách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={flashCardSet.title}
                    onChange={(e) => setFlashCardSet({ ...flashCardSet, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: Từ vựng du lịch"
                    disabled={isView}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={flashCardSet.description}
                    onChange={(e) => setFlashCardSet({ ...flashCardSet, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả ngắn về danh sách từ vựng này..."
                    disabled={isView}
                  />
                </div>
              </div>
            </div>

            {/* Flash Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Từ vựng ({flashCardSet.cards.length})
                </h2>
                {!isView && (
                  <button
                    onClick={addCard}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} />
                    Thêm từ
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {flashCardSet.cards.map((card, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Từ #{index + 1}</h3>
                      {!isView && flashCardSet.cards.length > 1 && (
                        <button
                          onClick={() => removeCard(index)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Xóa từ"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiếng Hàn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={card.term || ''}
                          onChange={(e) => updateCard(index, 'term', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="안녕하세요"
                          disabled={isView}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiếng Việt <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={card.definition || ''}
                          onChange={(e) => updateCard(index, 'definition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Xin chào"
                          disabled={isView}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phát âm
                        </label>
                        <input
                          type="text"
                          value={card.example || ''}
                          onChange={(e) => updateCard(index, 'example', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="an-nyeong-ha-se-yo"
                          disabled={isView}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ví dụ
                        </label>
                        <input
                          type="text"
                          value={card.imageUrl || ''}
                          onChange={(e) => updateCard(index, 'imageUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="안녕하세요, 만나서 반갑습니다"
                          disabled={isView}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={flashCardSet.category}
                    onChange={(e) => setFlashCardSet({ ...flashCardSet, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isView}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="vocabulary">Từ vựng cơ bản</option>
                    <option value="grammar">Ngữ pháp</option>
                    <option value="business">Business</option>
                    <option value="travel">Du lịch</option>
                    <option value="daily">Hàng ngày</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              {!isView && (
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo danh sách')}
                  </button>
                  <Link 
                    to="/admin/flashcards" 
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Hủy
                  </Link>
                </div>
              )}

              {isView && (
                <div className="mt-6 space-y-3">
                  <Link 
                    to={`/admin/flashcards/edit/${id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye size={16} />
                    Chỉnh sửa
                  </Link>
                  <Link 
                    to="/admin/flashcards" 
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Quay lại
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Add Templates */}
            {!isView && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm nhanh từ mẫu</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {quickAddTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => addQuickVocabulary(template)}
                      className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
                      title={`${template.korean} - ${template.vietnamese}`}
                    >
                      <div className="font-medium text-gray-900">{template.korean}</div>
                      <div className="text-gray-600 text-xs">{template.vietnamese}</div>
                    </button>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  Click vào từ mẫu để thêm nhanh vào danh sách
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số từ:</span>
                  <span className="font-medium">{flashCardSet.cards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Từ hoàn thành:</span>
                  <span className="font-medium">
                    {flashCardSet.cards.filter(card => card.term && card.definition).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Còn thiếu:</span>
                  <span className="font-medium text-orange-600">
                    {flashCardSet.cards.filter(card => !card.term || !card.definition).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashCard;