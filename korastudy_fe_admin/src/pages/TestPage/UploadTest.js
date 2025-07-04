import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  FileText, 
  Users, 
  CheckCircle,
  AlertCircle,
  Move
} from 'lucide-react';

const UploadTest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    type: 'TOPIK I',
    difficulty: 'beginner',
    duration: 60,
    passingScore: 60,
    maxAttempts: 3,
    isPublic: true,
    tags: [],
    instructions: ''
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1
  });

  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: <FileText size={20} /> },
    { id: 2, title: 'Câu hỏi', icon: <Edit3 size={20} /> },
    { id: 3, title: 'Xem trước & Xuất bản', icon: <Eye size={20} /> }
  ];

  const questionTypes = [
    { value: 'multiple-choice', label: 'Trắc nghiệm' },
    { value: 'true-false', label: 'Đúng/Sai' },
    { value: 'fill-blank', label: 'Điền vào chỗ trống' },
    { value: 'essay', label: 'Tự luận' }
  ];

  const testTypes = [
    { value: 'TOPIK I', label: 'TOPIK I' },
    { value: 'TOPIK II', label: 'TOPIK II' },
    { value: 'Grammar', label: 'Ngữ pháp' },
    { value: 'Vocabulary', label: 'Từ vựng' },
    { value: 'Listening', label: 'Nghe' },
    { value: 'Reading', label: 'Đọc' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Cơ bản', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Nâng cao', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addQuestion = () => {
    if (editingQuestionIndex >= 0) {
      setQuestions(prev => prev.map((q, i) => i === editingQuestionIndex ? currentQuestion : q));
      setEditingQuestionIndex(-1);
    } else {
      setQuestions(prev => [...prev, { ...currentQuestion, id: Date.now() }]);
    }
    
    setCurrentQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    });
    setShowQuestionEditor(false);
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionEditor(true);
  };

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    if (direction === 'up' && index > 0) {
      setQuestions(prev => {
        const newQuestions = [...prev];
        [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
        return newQuestions;
      });
    } else if (direction === 'down' && index < questions.length - 1) {
      setQuestions(prev => {
        const newQuestions = [...prev];
        [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
        return newQuestions;
      });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return testData.title && testData.type && testData.duration > 0;
      case 2:
        return questions.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    // Here you would typically send the data to your backend
    console.log('Publishing test:', { testData, questions });
    alert('Đề thi đã được tạo thành công!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đề thi *
                </label>
                <input
                  type="text"
                  value={testData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên đề thi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại đề thi *
                </label>
                <select
                  value={testData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {testTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ khó
                </label>
                <select
                  value={testData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian (phút) *
                </label>
                <input
                  type="number"
                  value={testData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm đạt (%)
                </label>
                <input
                  type="number"
                  value={testData.passingScore}
                  onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lần làm tối đa
                </label>
                <input
                  type="number"
                  value={testData.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={testData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả về đề thi..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hướng dẫn làm bài
              </label>
              <textarea
                value={testData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hướng dẫn chi tiết cho thí sinh..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={testData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                Công khai đề thi (cho phép tất cả người dùng làm bài)
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quản lý câu hỏi</h3>
                <p className="text-sm text-gray-600">Đã có {questions.length} câu hỏi</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQuestionEditor(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Thêm câu hỏi
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Upload size={16} />
                  Import từ file
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có câu hỏi nào</h3>
                <p className="text-gray-600 mb-4">Bắt đầu tạo câu hỏi cho đề thi của bạn</p>
                <button
                  onClick={() => setShowQuestionEditor(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus size={16} />
                  Tạo câu hỏi đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Câu {index + 1}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            {questionTypes.find(t => t.value === question.type)?.label}
                          </span>
                          <span className="text-xs text-gray-500">{question.points} điểm</span>
                        </div>
                        <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                        {question.type === 'multiple-choice' && (
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`text-sm p-2 rounded ${
                                optIndex === question.correctAnswer 
                                  ? 'bg-green-50 text-green-800 border border-green-200' 
                                  : 'bg-gray-50 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                        >
                          <Move size={16} />
                        </button>
                        <button
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === questions.length - 1}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                        >
                          <Move size={16} className="rotate-180" />
                        </button>
                        <button
                          onClick={() => editQuestion(index)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(index)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Editor Modal */}
            {showQuestionEditor && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingQuestionIndex >= 0 ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowQuestionEditor(false);
                        setEditingQuestionIndex(-1);
                        setCurrentQuestion({
                          type: 'multiple-choice',
                          question: '',
                          options: ['', '', '', ''],
                          correctAnswer: 0,
                          explanation: '',
                          points: 1
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại câu hỏi
                        </label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => handleQuestionChange('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Điểm số
                        </label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Câu hỏi *
                      </label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => handleQuestionChange('question', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>

                    {currentQuestion.type === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Các lựa chọn
                        </label>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === index}
                                onChange={() => handleQuestionChange('correctAnswer', index)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700 w-6">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giải thích (tùy chọn)
                      </label>
                      <textarea
                        value={currentQuestion.explanation}
                        onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Giải thích đáp án đúng..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        onClick={() => {
                          setShowQuestionEditor(false);
                          setEditingQuestionIndex(-1);
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={addQuestion}
                        disabled={!currentQuestion.question.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {editingQuestionIndex >= 0 ? 'Cập nhật' : 'Thêm câu hỏi'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đề thi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Tên đề thi:</span>
                  <p className="text-gray-900">{testData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Loại:</span>
                  <p className="text-gray-900">{testData.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Thời gian:</span>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Clock size={16} />
                    {testData.duration} phút
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Số câu hỏi:</span>
                  <p className="text-gray-900">{questions.length} câu</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Tổng điểm:</span>
                  <p className="text-gray-900">{questions.reduce((sum, q) => sum + q.points, 0)} điểm</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Điểm đạt:</span>
                  <p className="text-gray-900">{testData.passingScore}%</p>
                </div>
              </div>
              {testData.description && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-600">Mô tả:</span>
                  <p className="text-gray-900 mt-1">{testData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách câu hỏi</h3>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Câu {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">{question.points} điểm</span>
                    </div>
                    <p className="text-gray-900 text-sm">{question.question}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-yellow-800 font-medium">Lưu ý trước khi xuất bản</h4>
                  <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                    <li>• Kiểm tra kỹ nội dung các câu hỏi và đáp án</li>
                    <li>• Đảm bảo thời gian làm bài phù hợp với số lượng câu hỏi</li>
                    <li>• Sau khi xuất bản, đề thi sẽ có thể được truy cập bởi người dùng</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo đề thi mới</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý đề thi TOPIK</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
            <Save size={16} />
            Lưu nháp
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle size={20} />
                ) : (
                  step.icon
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Bước {step.id}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              Tiếp theo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Xuất bản đề thi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadTest;
