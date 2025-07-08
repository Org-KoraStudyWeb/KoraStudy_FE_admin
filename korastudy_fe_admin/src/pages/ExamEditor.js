import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Volume2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import PartEditor from '../components/ExamEditor/PartEditor';
import CloudinaryService from '../services/CloudinaryService';
import AdminExamService from '../services/AdminExamService';

const ExamEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  console.log('ExamEditor mounted, id:', id, 'isEditing:', isEditing); // Debug log

  const [exam, setExam] = useState({
    id: null,
    title: '',
    description: '',
    level: 'TOPIK I',
    durationTimes: 60,
    instructions: '',
    requirements: '',
    parts: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [expandedParts, setExpandedParts] = useState({});

  useEffect(() => {
    console.log('ExamEditor useEffect, isEditing:', isEditing, 'id:', id); // Debug log
    if (isEditing) {
      fetchExamData();
    }
  }, [id, isEditing]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const examData = await AdminExamService.getExamDetail(id);
      setExam(examData);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!exam.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài thi');
      return;
    }

    setLoading(true);
    try {
      let savedExam;
      if (isEditing) {
        savedExam = await AdminExamService.updateExam(id, exam);
        alert('Cập nhật bài thi thành công!');
      } else {
        savedExam = await AdminExamService.createExam(exam);
        alert('Tạo bài thi thành công!');
      }
      
      // If creating new exam, redirect to edit mode with the new ID
      if (!isEditing && savedExam.id) {
        navigate(`/admin/exams/${savedExam.id}/edit`);
      } else {
        navigate('/admin/exams');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Có lỗi xảy ra khi lưu bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async () => {
    if (!exam.id) {
      alert('Vui lòng lưu bài thi trước khi thêm phần');
      return;
    }

    const newPartData = {
      title: `Phần ${exam.parts.length + 1}`,
      description: '',
      instructions: '',
      timeLimit: 30
    };

    try {
      const newPart = await AdminExamService.addPart(exam.id, newPartData);
      setExam({
        ...exam,
        parts: [...exam.parts, newPart]
      });
    } catch (error) {
      console.error('Error adding part:', error);
      alert('Có lỗi xảy ra khi thêm phần: ' + error.message);
    }
  };

  const handleDeletePart = async (partIndex) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phần này?')) {
      const part = exam.parts[partIndex];
      
      try {
        await AdminExamService.deletePart(part.id);
        const updatedParts = exam.parts.filter((_, index) => index !== partIndex);
        setExam({
          ...exam,
          parts: updatedParts.map((part, index) => ({
            ...part,
            partNumber: index + 1
          }))
        });
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('Có lỗi xảy ra khi xóa phần: ' + error.message);
      }
    }
  };

  const handleAddQuestion = async (partIndex) => {
    const part = exam.parts[partIndex];
    
    const newQuestionData = {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      option: 'A)  B)  C)  D) ',
      correctAnswer: 'A',
      explanation: '',
      points: 1
    };

    try {
      const newQuestion = await AdminExamService.addQuestion(part.id, newQuestionData);
      
      const updatedParts = [...exam.parts];
      updatedParts[partIndex].questions = [...updatedParts[partIndex].questions, newQuestion];
      updatedParts[partIndex].questionCount = updatedParts[partIndex].questions.length;
      
      setExam({
        ...exam,
        parts: updatedParts
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Có lỗi xảy ra khi thêm câu hỏi: ' + error.message);
    }
  };

  const handleDeleteQuestion = async (partIndex, questionIndex) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const question = exam.parts[partIndex].questions[questionIndex];
      
      try {
        await AdminExamService.deleteQuestion(question.id);
        
        const updatedParts = [...exam.parts];
        updatedParts[partIndex].questions.splice(questionIndex, 1);
        updatedParts[partIndex].questionCount = updatedParts[partIndex].questions.length;
        
        // Update question orders
        updatedParts[partIndex].questions.forEach((q, idx) => {
          q.questionOrder = idx + 1;
        });
        
        setExam({
          ...exam,
          parts: updatedParts
        });
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Có lỗi xảy ra khi xóa câu hỏi: ' + error.message);
      }
    }
  };

  const handleFileUpload = async (file, type, partIndex, questionIndex) => {
    const uploadKey = `${partIndex}-${questionIndex}-${type}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const question = exam.parts[partIndex].questions[questionIndex];
      let uploadResult;
      
      if (type === 'image') {
        uploadResult = await AdminExamService.uploadQuestionImage(question.id, file);
      } else if (type === 'audio') {
        uploadResult = await AdminExamService.uploadQuestionAudio(question.id, file);
      }
      
      const updatedParts = [...exam.parts];
      if (type === 'image') {
        updatedParts[partIndex].questions[questionIndex].imageUrl = uploadResult.imageUrl;
      } else if (type === 'audio') {
        updatedParts[partIndex].questions[questionIndex].audioUrl = uploadResult.audioUrl;
      }
      
      setExam({
        ...exam,
        parts: updatedParts
      });
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Có lỗi xảy ra khi upload ${type}: ${error.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const updatePartField = async (partIndex, field, value) => {
    const part = exam.parts[partIndex];
    const updatedPartData = { ...part, [field]: value };
    
    try {
      if (part.id) {
        await AdminExamService.updatePart(part.id, updatedPartData);
      }
      
      const updatedParts = [...exam.parts];
      updatedParts[partIndex][field] = value;
      setExam({
        ...exam,
        parts: updatedParts
      });
    } catch (error) {
      console.error('Error updating part:', error);
      // Still update UI for better UX, but show error
      const updatedParts = [...exam.parts];
      updatedParts[partIndex][field] = value;
      setExam({
        ...exam,
        parts: updatedParts
      });
    }
  };

  const updateQuestionField = async (partIndex, questionIndex, field, value) => {
    const question = exam.parts[partIndex].questions[questionIndex];
    const updatedQuestionData = { ...question, [field]: value };
    
    try {
      if (question.id) {
        await AdminExamService.updateQuestion(question.id, updatedQuestionData);
      }
      
      const updatedParts = [...exam.parts];
      updatedParts[partIndex].questions[questionIndex][field] = value;
      setExam({
        ...exam,
        parts: updatedParts
      });
    } catch (error) {
      console.error('Error updating question:', error);
      // Still update UI for better UX, but show error
      const updatedParts = [...exam.parts];
      updatedParts[partIndex].questions[questionIndex][field] = value;
      setExam({
        ...exam,
        parts: updatedParts
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/exams')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
                </h1>
                <p className="text-gray-600">{exam.title || 'Nhập tiêu đề bài thi'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveExam}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Đang lưu...' : 'Lưu bài thi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài thi *
              </label>
              <input
                type="text"
                value={exam.title}
                onChange={(e) => updateExamField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề bài thi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ *
              </label>
              <select
                value={exam.level}
                onChange={(e) => updateExamField('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TOPIK I">TOPIK I</option>
                <option value="TOPIK II">TOPIK II</option>
                <option value="Sơ cấp">Sơ cấp</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Cao cấp">Cao cấp</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={exam.description}
              onChange={(e) => updateExamField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về bài thi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian (phút) *
              </label>
              <input
                type="number"
                value={exam.durationTimes}
                onChange={(e) => updateExamField('durationTimes', parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng số phần
              </label>
              <input
                type="text"
                value={exam.parts.length}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng câu hỏi
              </label>
              <input
                type="text"
                value={exam.parts.reduce((sum, part) => sum + part.questions.length, 0)}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hướng dẫn
              </label>
              <textarea
                value={exam.instructions}
                onChange={(e) => updateExamField('instructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hướng dẫn làm bài"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yêu cầu
              </label>
              <textarea
                value={exam.requirements}
                onChange={(e) => updateExamField('requirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yêu cầu đối với thí sinh"
              />
            </div>
          </div>
        </div>

        {/* Parts Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cấu trúc bài thi</h2>
            <button
              onClick={handleAddPart}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm phần
            </button>
          </div>

          {exam.parts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Chưa có phần nào. Nhấn "Thêm phần" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exam.parts.map((part, partIndex) => (
                <PartEditor
                  key={part.id}
                  part={part}
                  partIndex={partIndex}
                  isExpanded={expandedParts[partIndex]}
                  onToggleExpanded={() => togglePartExpanded(partIndex)}
                  onUpdatePart={(field, value) => updatePartField(partIndex, field, value)}
                  onDeletePart={() => handleDeletePart(partIndex)}
                  onAddQuestion={() => handleAddQuestion(partIndex)}
                  onUpdateQuestion={(questionIndex, field, value) => 
                    updateQuestionField(partIndex, questionIndex, field, value)
                  }
                  onDeleteQuestion={(questionIndex) => 
                    handleDeleteQuestion(partIndex, questionIndex)
                  }
                  onFileUpload={(file, type, questionIndex) => 
                    handleFileUpload(file, type, partIndex, questionIndex)
                  }
                  uploadingFiles={uploadingFiles}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamEditor;