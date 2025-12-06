// src/pages/course/CourseDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Switch,
  Empty,
} from "antd";
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
  UserOutlined,
} from "@ant-design/icons";
import CourseService from "../../services/CourseService";
import SectionService from "../../services/SectionService";
import LessonService from "../../services/LessonService";
import SectionForm from "../../components/course/SectionForm";
import LessonForm from "../../components/course/LessonForm";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States - Gom nhóm để tối ưu
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // UI states
  const [uiState, setUiState] = useState({
    sectionFormVisible: false,
    lessonFormVisible: false,
    editingSection: null,
    editingLesson: null,
    selectedSectionId: null,
    publishLoading: false,
  });

  const [currentSection, setCurrentSection] = useState(null);

  // Helper để update UI state
  const updateUiState = useCallback((updates) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Load course detail data - ĐÃ TỐI ƯU
  const loadCourseDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Load course info
      const courseResponse = await CourseService.getCourseById(id);
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      } else {
        message.error(courseResponse.message);
        return;
      }

      // Load sections với lessons - ĐÃ GOM VÀO ĐÂY
      setSectionsLoading(true);
      try {
        const sectionsResponse = await SectionService.getSectionsByCourseId(id);
        if (sectionsResponse.success) {
          const sectionsWithLessons = await Promise.all(
            sectionsResponse.data.map(async (section) => {
              try {
                const lessonsResponse =
                  await LessonService.getLessonsBySectionId(section.id);
                return {
                  ...section,
                  lessons: lessonsResponse.success ? lessonsResponse.data : [],
                };
              } catch (error) {
                console.error(
                  `Error loading lessons for section ${section.id}:`,
                  error
                );
                return { ...section, lessons: [] };
              }
            })
          );

          const sortedSections = sectionsWithLessons.sort(
            (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
          );
          setSections(sortedSections);
        } else {
          message.error(sectionsResponse.message);
        }
      } catch (error) {
        console.error("Load sections error:", error);
        message.error("Lỗi khi tải nội dung khóa học");
      } finally {
        setSectionsLoading(false);
      }
    } catch (error) {
      console.error("Load course detail error:", error);
      message.error("Lỗi khi tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load sections với lessons - ĐÃ TỐI ƯU (tránh N+1)
  const loadSections = useCallback(async () => {
    setSectionsLoading(true);
    try {
      // Giả sử có API lấy sections kèm lessons
      const sectionsResponse = await SectionService.getSectionsByCourseId(id);
      if (sectionsResponse.success) {
        // Nếu API chưa hỗ trợ lấy lessons, dùng cách cũ nhưng tối ưu hơn
        const sectionsWithLessons = await Promise.all(
          sectionsResponse.data.map(async (section) => {
            try {
              const lessonsResponse = await LessonService.getLessonsBySectionId(
                section.id
              );
              return {
                ...section,
                lessons: lessonsResponse.success ? lessonsResponse.data : [],
              };
            } catch (error) {
              console.error(
                `Error loading lessons for section ${section.id}:`,
                error
              );
              return { ...section, lessons: [] };
            }
          })
        );

        const sortedSections = sectionsWithLessons.sort(
          (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
        );
        setSections(sortedSections);
      } else {
        message.error(sectionsResponse.message);
      }
    } catch (error) {
      console.error("Load sections error:", error);
      message.error("Lỗi khi tải nội dung khóa học");
    } finally {
      setSectionsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (id && isMounted) {
        await loadCourseDetail();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, loadCourseDetail]);

  // Publish/Unpublish course - ĐÃ CẢI THIỆN
  const handleTogglePublish = async (checked) => {
    // Validation
    if (checked && sections.length === 0) {
      message.warning("Không thể xuất bản khóa học chưa có nội dung");
      return;
    }

    updateUiState({ publishLoading: true });

    try {
      const response = await CourseService.togglePublishCourse(id, checked);

      if (response.success) {
        setCourse((prev) => ({ ...prev, published: checked }));
        message.success(checked ? "Đã xuất bản khóa học" : "Đã ẩn khóa học");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Toggle publish error:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái khóa học");
    } finally {
      updateUiState({ publishLoading: false });
    }
  };

  // Section handlers
  const showSectionForm = (section = null) => {
    updateUiState({
      sectionFormVisible: true,
      editingSection: section,
    });
  };

  const closeSectionForm = () => {
    updateUiState({
      sectionFormVisible: false,
      editingSection: null,
    });
  };

  const handleSectionSuccess = () => {
    closeSectionForm();
    loadSections(); // Chỉ reload sections, không reload cả course
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const response = await SectionService.deleteSection(sectionId);
      if (response.success) {
        message.success(response.message);
        loadSections();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Delete section error:", error);
      message.error("Có lỗi xảy ra khi xóa chương học");
    }
  };

  // Lesson handlers
  const showLessonForm = (sectionId, lesson = null) => {
    updateUiState({
      lessonFormVisible: true,
      selectedSectionId: sectionId,
      editingLesson: lesson,
    });
  };

  const closeLessonForm = () => {
    updateUiState({
      lessonFormVisible: false,
      selectedSectionId: null,
      editingLesson: null,
    });
  };

  const handleLessonSuccess = () => {
    closeLessonForm();
    loadSections(); // Chỉ reload sections
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const response = await LessonService.deleteLesson(lessonId);
      if (response.success) {
        message.success(response.message);
        loadSections();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Delete lesson error:", error);
      message.error("Có lỗi xảy ra khi xóa bài học");
    }
  };

  // Handle section click for breadcrumb
  const handleSectionClick = useCallback((section) => {
    setCurrentSection(section);
  }, []);

  // Content type icons and labels
  const getContentTypeIcon = (type) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "TEXT":
        return <FileTextOutlined style={{ color: "#52c41a" }} />;
      case "QUIZ":
        return <QuestionCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <BookOutlined />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case "VIDEO":
        return "Video";
      case "TEXT":
        return "Văn bản";
      case "QUIZ":
        return "Bài kiểm tra";
      default:
        return "Khác";
    }
  };

  // Tính tổng số bài học
  const totalLessons = sections.reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0
  );

  if (loading && !course) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card loading={true}>
          <p>Đang tải thông tin khóa học...</p>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          description="Không tìm thấy khóa học"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/courses")}
          >
            Quay lại danh sách
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Breadcrumb với Section Name */}
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          {
            title: (
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/courses")}
                style={{ padding: 0 }}
              >
                Quản lý khóa học
              </Button>
            ),
          },
          {
            title: course.courseName,
          },
          ...(currentSection
            ? [
                {
                  title: (
                    <>
                      <BookOutlined style={{ marginRight: 4 }} />
                      {currentSection.sectionName}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />

      {/* Course Info */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={18}>
          <Card
            title={
              <Space>
                <BookOutlined />
                {course.courseName}
                <Tag color={course.published ? "green" : "orange"}>
                  {course.published ? "Đã xuất bản" : "Nháp"}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <div>
                  <span style={{ marginRight: 8 }}>
                    {course.published ? "Đã xuất bản" : "Chưa xuất bản"}
                  </span>
                  <Switch
                    checked={course.published}
                    onChange={handleTogglePublish}
                    loading={uiState.publishLoading}
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
            <div
              className="course-description"
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: course.courseDescription || "Chưa có mô tả",
                }}
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#333",
                }}
              />
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Giá khóa học"
                  value={course.coursePrice || 0}
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
                  value={totalLessons}
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
      <Card
        title="Nội dung khóa học"
        loading={sectionsLoading}
        extra={
          sections.length > 0 && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => showSectionForm()}
            >
              Thêm chương học
            </Button>
          )
        }
      >
        {sections.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có chương học nào"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showSectionForm()}
            >
              Thêm chương học đầu tiên
            </Button>
          </Empty>
        ) : (
          <Collapse
            items={sections.map((section) => ({
              key: section.id,
              label: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                  onClick={() => handleSectionClick(section)}
                >
                  <span>
                    <BookOutlined style={{ marginRight: "8px" }} />
                    {section.sectionName}
                    <Tag style={{ marginLeft: "8px" }}>
                      {section.lessons?.length || 0} bài học
                    </Tag>
                  </span>
                </div>
              ),
              extra: (
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
                      <Button size="small" icon={<DeleteOutlined />} danger />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
              children:
                section.lessons && section.lessons.length > 0 ? (
                  <List
                    dataSource={section.lessons.sort(
                      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
                    )}
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
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getContentTypeIcon(lesson.contentType)}
                          title={
                            <Space>
                              <span>
                                {index + 1}. {lesson.lessonTitle}
                              </span>
                              <Tag size="small">
                                {getContentTypeLabel(lesson.contentType)}
                              </Tag>
                              {lesson.videoUrl && (
                                <Tag size="small" color="blue">
                                  Có video
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div
                              style={{
                                maxHeight: "60px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {lesson.content || "Chưa có nội dung"}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: "24px", marginBottom: "8px" }}
                    />
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
                ),
            }))}
            defaultActiveKey={sections.map((s) => s.id.toString())}
            onChange={(keys) => {
              if (keys.length > 0) {
                const activeSectionId = keys[0];
                const activeSection = sections.find(
                  (s) => s.id.toString() === activeSectionId
                );
                if (activeSection) {
                  handleSectionClick(activeSection);
                }
              } else {
                setCurrentSection(null);
              }
            }}
          />
        )}
      </Card>

      {/* Section Form Modal */}
      <SectionForm
        visible={uiState.sectionFormVisible}
        onClose={closeSectionForm}
        onSuccess={handleSectionSuccess}
        courseId={parseInt(id)}
        editingSection={uiState.editingSection}
      />

      {/* Lesson Form Modal */}
      <LessonForm
        visible={uiState.lessonFormVisible}
        onClose={closeLessonForm}
        onSuccess={handleLessonSuccess}
        sectionId={uiState.selectedSectionId}
        editingLesson={uiState.editingLesson}
      />
    </div>
  );
};

export default CourseDetail;
