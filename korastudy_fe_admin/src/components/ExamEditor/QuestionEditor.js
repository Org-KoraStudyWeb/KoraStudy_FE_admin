import React, { useRef } from 'react';
import { 
  Trash2, 
  Upload, 
  Volume2, 
  Image as ImageIcon,
  X,
  Loader
} from 'lucide-react';

const QuestionEditor = ({
  question,
  questionIndex,
  partIndex,
  onUpdateQuestion,
  onDeleteQuestion,
  onFileUpload,
  uploadingFiles
}) => {
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Kích thước file ảnh không được vượt quá 5MB');
        return;
      }
      onFileUpload(file, 'image', questionIndex);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Kích thước file audio không được vượt quá 10MB');
        return;
      }
      onFileUpload(file, 'audio', questionIndex);
    }
  };

  const removeImage = () => {
    onUpdateQuestion(questionIndex, 'imageUrl', null);
  };

  const removeAudio = () => {
    onUpdateQuestion(questionIndex, 'audioUrl', null);
  };

  const isUploadingImage = uploadingFiles[`${partIndex}-${questionIndex}-image`];
  const isUploadingAudio = uploadingFiles[`${partIndex}-${questionIndex}-audio`];

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
            Câu {question.questionOrder}
          </span>
          <select
            value={question.questionType}
            onChange={(e) => onUpdateQuestion(questionIndex, 'questionType', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
            <option value="FILL_BLANK">Điền từ</option>
            <option value="LISTENING">Nghe</option>
            <option value="READING">Đọc hiểu</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={question.points}
            onChange={(e) => onUpdateQuestion(questionIndex, 'points', parseInt(e.target.value))}
            min="1"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Điểm số"
          />
          <span className="text-sm text-gray-500">điểm</span>
          <button
            onClick={() => onDeleteQuestion(questionIndex)}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Xóa câu hỏi"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung câu hỏi *
          </label>
          <textarea
            value={question.questionText}
            onChange={(e) => onUpdateQuestion(questionIndex, 'questionText', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập nội dung câu hỏi"
          />
        </div>

        {/* Media Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            {question.imageUrl ? (
              <div className="relative">
                <img 
                  src={question.imageUrl} 
                  alt="Question" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  title="Xóa ảnh"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader className="animate-spin mb-2" size={24} />
                  ) : (
                    <ImageIcon className="mb-2 text-gray-400" size={24} />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploadingImage ? 'Đang upload...' : 'Nhấn để upload ảnh'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File âm thanh
            </label>
            {question.audioUrl ? (
              <div className="relative">
                <div className="p-4 border border-gray-300 rounded-lg">
                  <audio controls className="w-full">
                    <source src={question.audioUrl} type="audio/mpeg" />
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                  <button
                    onClick={removeAudio}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    title="Xóa audio"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploadingAudio}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUploadingAudio ? (
                    <Loader className="animate-spin mb-2" size={24} />
                  ) : (
                    <Volume2 className="mb-2 text-gray-400" size={24} />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploadingAudio ? 'Đang upload...' : 'Nhấn để upload audio'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Các lựa chọn
          </label>
          <textarea
            value={question.option}
            onChange={(e) => onUpdateQuestion(questionIndex, 'option', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A) Lựa chọn 1 B) Lựa chọn 2 C) Lựa chọn 3 D) Lựa chọn 4"
          />
        </div>

        {/* Correct Answer and Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đáp án đúng *
            </label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => onUpdateQuestion(questionIndex, 'correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giải thích
            </label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => onUpdateQuestion(questionIndex, 'explanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Giải thích đáp án"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
