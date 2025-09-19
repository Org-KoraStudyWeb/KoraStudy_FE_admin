// src/pages/course/CourseDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Breadcrumb,
  Button,
  Space,
  Collapse,
  List,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Switch
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import CourseService from '../../services/CourseService';
import SectionForm from '../../components/course/SectionForm';
import LessonForm from '../../components/course/LessonForm';

const { Panel } = Collapse;

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionFormVisible, setSectionFormVisible] = useState(false);
  const [lessonFormVisible, setLessonFormVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);

  // Load course detail data
  const loadCourseDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load course info
      const courseResponse = await CourseService.getCourseById(id);
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      }

      // Load sections with lessons
      const sectionsResponse = await CourseService.getSectionsByCourseId(id);
      if (sectionsResponse.success) {
        const sectionsWithLessons = await Promise.all(
          sectionsResponse.data.map(async (section) => {
            const lessonsResponse = await CourseService.getLessonsBySectionId(section.id);
            return {
              ...section,
              lessons: lessonsResponse.success ? lessonsResponse.data : []
            };
          })
        );
        setSections(sectionsWithLessons.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
      }
    } catch (error) {
      console.error('Load course detail error:', error);
      message.error('Lỗi khi tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetail();
  }, [id]);

  // Publish/Unpublish course
  const handleTogglePublish = async (checked) => {
    setPublishLoading(true);
    try {
      const response = await CourseService.updateCourse(id, {
        ...course,
        isPublished: checked
      });
      
      if (response.success) {
        setCourse(prev => ({ ...prev, isPublished: checked }));
        message.success(checked ? 'Đã xuất bản khóa học' : 'Đã ẩn khóa học');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái khóa học');
    } finally {
      setPublishLoading(false);
    }
  };

  // Section handlers
  const showSectionForm = (section = null) => {
    setEditingSection(section);
    setSectionFormVisible(true);
  };

  const closeSectionForm = () => {
    setSectionFormVisible(false);
    setEditingSection(null);
  };

  const handleSectionSuccess = () => {
    loadCourseDetail();
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const response = await CourseService.deleteSection(sectionId);
      if (response.success) {
        message.success(response.message);
        loadCourseDetail();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error('Delete section error:', error);
      message.error('Có lỗi xảy ra khi xóa chương học');
    }
  };

  // Lesson handlers
  const showLessonForm = (sectionId, lesson = null) => {
    setSelectedSectionId(sectionId);
    setEditingLesson(lesson);
    setLessonFormVisible(true);
  };

  const closeLessonForm = () => {
    setLessonFormVisible(false);
    setEditingLesson(null);
    setSelectedSectionId(null);
  };

  const handleLessonSuccess = () => {
    loadCourseDetail();
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const response = await CourseService.deleteLesson(lessonId);
      if (response.success) {
        message.success(response.message);
        loadCourseDetail();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error('Delete lesson error:', error);
      message.error('Có lỗi xảy ra khi xóa bài học');
    }
  };

  // Content type icons and labels
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'TEXT':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'QUIZ':
        return <QuestionCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <BookOutlined />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'VIDEO':
        return 'Video';
      case 'TEXT':
        return 'Văn bản';
      case 'QUIZ':
        return 'Bài kiểm tra';
      default:
        return 'Khác';
    }
  };

  if (!course) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Card loading={loading}>
          <p>Đang tải thông tin khóa học...</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/courses')}
          >
            Quản lý khóa học
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{course.courseName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Course Info */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={18}>
          <Card 
            title={
              <Space>
                <BookOutlined />
                {course.courseName}
                <Tag color={course.isPublished ? 'green' : 'orange'}>
                  {course.isPublished ? 'Đã xuất bản' : 'Nháp'}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <div>
                  <span style={{ marginRight: 8 }}>
                    {course.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                  </span>
                  <Switch
                    checked={course.isPublished}
                    onChange={handleTogglePublish}
                    loading={publishLoading}
                    checkedChildren="Xuất bản"
                    unCheckedChildren="Ẩn"
                  />
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showSectionForm()}
                >
                  Thêm chương học
                </Button>
              </Space>
            }
          >
            <p>{course.courseDescription}</p>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Giá khóa học"
                  value={course.price || 0}
                  suffix="VND"
                  formatter={(value) => value.toLocaleString()}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Số chương học"
                  value={sections.length}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tổng bài học"
                  value={sections.reduce((total, section) => total + (section.lessons?.length || 0), 0)}
                  prefix={<PlayCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Học viên đăng ký"
              value={course.enrollmentCount || 0}
              prefix={<UserOutlined />}
            />
            <Divider />
            <Statistic
              title="Lượt xem"
              value={course.viewCount || 0}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sections and Lessons */}
      <Card title="Nội dung khóa học" loading={loading}>
        {sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <p style={{ marginTop: '16px', color: '#999' }}>
              Chưa có chương học nào. Hãy thêm chương học đầu tiên!
            </p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showSectionForm()}
            >
              Thêm chương học
            </Button>
          </div>
        ) : (
          <Collapse defaultActiveKey={sections.map(s => s.id.toString())}>
            {sections.map((section) => (
              <Panel
                key={section.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>
                      <BookOutlined style={{ marginRight: '8px' }} />
                      {section.sectionTitle}
                      <Tag style={{ marginLeft: '8px' }}>
                        {section.lessons?.length || 0} bài học
                      </Tag>
                    </span>
                  </div>
                }
                extra={
                  <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Thêm bài học">
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => showLessonForm(section.id)}
                      >
                        Thêm bài học
                      </Button>
                    </Tooltip>
                    <Tooltip title="Sửa chương">
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => showSectionForm(section)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Xóa chương học?"
                      description="Tất cả bài học trong chương sẽ bị xóa. Bạn có chắc chắn?"
                      onConfirm={() => handleDeleteSection(section.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okType="danger"
                    >
                      <Tooltip title="Xóa chương">
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                }
              >
                {section.sectionDescription && (
                  <p style={{ marginBottom: '16px', color: '#666', fontStyle: 'italic' }}>
                    {section.sectionDescription}
                  </p>
                )}
                
                {section.lessons && section.lessons.length > 0 ? (
                  <List
                    dataSource={section.lessons.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))}
                    renderItem={(lesson, index) => (
                      <List.Item
                        actions={[
                          <Tooltip title="Chỉnh sửa" key="edit">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => showLessonForm(section.id, lesson)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            key="delete"
                            title="Xóa bài học này?"
                            onConfirm={() => handleDeleteLesson(lesson.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okType="danger"
                          >
                            <Tooltip title="Xóa">
                              <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                              />
                            </Tooltip>
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getContentTypeIcon(lesson.contentType)}
                          title={
                            <Space>
                              <span>{index + 1}. {lesson.lessonTitle}</span>
                              <Tag size="small">{getContentTypeLabel(lesson.contentType)}</Tag>
                              {lesson.videoUrl && (
                                <Tag size="small" color="blue">Có video</Tag>
                              )}
                            </Space>
                          }
                          description={lesson.content}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <FileTextOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                    <p>Chưa có bài học nào trong chương này</p>
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => showLessonForm(section.id)}
                    >
                      Thêm bài học đầu tiên
                    </Button>
                  </div>
                )}
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* Section Form Modal */}
      <SectionForm
        visible={sectionFormVisible}
        onClose={closeSectionForm}
        onSuccess={handleSectionSuccess}
        courseId={parseInt(id)}
        editingSection={editingSection}
      />

      {/* Lesson Form Modal */}
      <LessonForm
        visible={lessonFormVisible}
        onClose={closeLessonForm}
        onSuccess={handleLessonSuccess}
        sectionId={selectedSectionId}
        editingLesson={editingLesson}
      />
    </div>
  );
};

export default CourseDetail;
