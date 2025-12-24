# CourseEnrollmentList Refactoring - Implementation Examples

## How to Use the Refactored Component

### Basic Usage (No Changes Required)

The refactored component maintains the same external interface:

```javascript
import CourseEnrollmentList from "./components/course/CourseEnrollmentList";

function CourseDetail() {
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setEnrollmentModalVisible(true)}>
        Quản lý đăng ký
      </Button>

      <CourseEnrollmentList
        visible={enrollmentModalVisible}
        onClose={() => setEnrollmentModalVisible(false)}
        courseId={courseId}
        courseName={courseName}
      />
    </>
  );
}
```

## Using Sub-Components Independently

### Example 1: Display Enrollment Statistics Only

```javascript
import { useState, useEffect } from "react";
import EnrollmentStats from "./components/course/enrollmentComponents/EnrollmentStats";
import EnrollmentService from "./services/EnrollmentService";

function CourseStatsPage({ courseId }) {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const loadEnrollments = async () => {
      const response = await EnrollmentService.getCourseEnrollmentsAdmin(
        courseId
      );
      if (response.success) {
        setEnrollments(response.data?.content || []);
      }
    };
    loadEnrollments();
  }, [courseId]);

  return <EnrollmentStats enrollments={enrollments} />;
}
```

### Example 2: Custom Enrollment Table

```javascript
import { useState } from "react";
import EnrollmentTable from "./components/course/enrollmentComponents/EnrollmentTable";
import ProgressDetailModal from "./components/course/enrollmentComponents/ProgressDetailModal";

function CustomEnrollmentPage({ enrollments, courseId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  const handleViewProgress = (userId, username) => {
    setSelectedUser({ userId, username });
    setProgressModalVisible(true);
  };

  return (
    <>
      <EnrollmentTable
        enrollments={enrollments}
        loading={false}
        pagination={{ current: 1, pageSize: 10, total: enrollments.length }}
        onTableChange={(page, size) =>
          console.log(`Page: ${page}, Size: ${size}`)
        }
        onViewProgressDetail={handleViewProgress}
        onViewQuizResults={(userId, username) =>
          console.log(`View quiz: ${username}`)
        }
        onIssueCertificate={(userId, username, progress) =>
          console.log(`Issue cert to ${username}: ${progress}%`)
        }
        courseId={courseId}
        searchText=""
      />

      {selectedUser && (
        <ProgressDetailModal
          visible={progressModalVisible}
          onClose={() => setProgressModalVisible(false)}
          courseId={courseId}
          userId={selectedUser.userId}
          username={selectedUser.username}
        />
      )}
    </>
  );
}
```

### Example 3: Add Search Functionality

```javascript
import { useState, useCallback } from "react";
import EnrollmentSearchBar from "./components/course/enrollmentComponents/EnrollmentSearchBar";
import EnrollmentTable from "./components/course/enrollmentComponents/EnrollmentTable";

function SearchableEnrollments({ enrollments, courseId }) {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(enrollments);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      if (!value.trim()) {
        setFilteredData(enrollments);
        return;
      }

      const filtered = enrollments.filter(
        (e) =>
          e.username?.toLowerCase().includes(value.toLowerCase()) ||
          e.email?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    },
    [enrollments]
  );

  const handleRefresh = async () => {
    setLoading(true);
    // Reload enrollments from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <>
      <EnrollmentSearchBar
        searchText={searchText}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <EnrollmentTable
        enrollments={filteredData}
        loading={loading}
        pagination={{ current: 1, pageSize: 10, total: filteredData.length }}
        onTableChange={() => {}}
        onViewProgressDetail={() => {}}
        onViewQuizResults={() => {}}
        onIssueCertificate={() => {}}
        courseId={courseId}
        searchText={searchText}
      />
    </>
  );
}
```

### Example 4: Certificate Issuance Workflow

```javascript
import { useState } from "react";
import CertificateModal from "./components/course/enrollmentComponents/CertificateModal";
import { message } from "antd";

function CertificateWorkflow() {
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleIssueCertificate = async (certificateData) => {
    try {
      console.log("Certificate Data:", {
        userId: selectedUser.userId,
        courseId: "course123",
        ...certificateData,
      });

      // TODO: Call your certificate API endpoint
      // const response = await CertificateService.issueCertificate({
      //   userId: selectedUser.userId,
      //   courseId: 'course123',
      //   ...certificateData
      // });

      message.success("Trao certificate thành công");
      setCertificateModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi trao certificate");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setSelectedUser({ userId: 1, username: "John Doe" });
          setCertificateModalVisible(true);
        }}
      >
        Issue Certificate
      </button>

      {selectedUser && (
        <CertificateModal
          visible={certificateModalVisible}
          onClose={() => setCertificateModalVisible(false)}
          username={selectedUser.username}
          userId={selectedUser.userId}
          courseId="course123"
          courseName="Advanced React"
          progress={85}
          onIssueCertificate={handleIssueCertificate}
        />
      )}
    </>
  );
}
```

## Advanced Examples

### Example 5: Batch Processing

```javascript
import { useState } from "react";
import { Button, message } from "antd";

function BulkCertificateIssuance({ enrollments, courseId }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIssueBulkCertificates = async () => {
    setIsProcessing(true);

    // Filter students who completed the course
    const completedStudents = enrollments.filter((e) => e.isCourseCompleted);

    for (const student of completedStudents) {
      try {
        // TODO: Call certificate API for each student
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated delay
        console.log(`Certificate issued to ${student.username}`);
      } catch (error) {
        console.error(
          `Failed to issue certificate to ${student.username}`,
          error
        );
      }
    }

    setIsProcessing(false);
    message.success(
      `Trao certificate cho ${completedStudents.length} học viên`
    );
  };

  return (
    <Button
      onClick={handleIssueBulkCertificates}
      loading={isProcessing}
      type="primary"
    >
      Trao Certificate Hàng Loạt (
      {enrollments.filter((e) => e.isCourseCompleted).length})
    </Button>
  );
}
```

### Example 6: Progress Analytics Dashboard

```javascript
import { Row, Col, Card, Statistic } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

function ProgressAnalytics({ enrollments }) {
  const totalStudents = enrollments.length;
  const completedStudents = enrollments.filter(
    (e) => e.isCourseCompleted
  ).length;
  const inProgressStudents = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100
  ).length;
  const notStarted = enrollments.filter((e) => e.progress === 0).length;
  const avgProgress = Math.round(
    enrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents
  );

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng Học Viên"
            value={totalStudents}
            prefix={<UserOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Hoàn Thành"
            value={completedStudents}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đang Học"
            value={inProgressStudents}
            valueStyle={{ color: "#1890ff" }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tiến Độ TB"
            value={avgProgress}
            suffix="%"
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
    </Row>
  );
}
```

### Example 7: Export to CSV

```javascript
function ExportEnrollmentData({ enrollments, courseName }) {
  const handleExport = () => {
    // Prepare CSV headers
    const headers = [
      "Học Viên",
      "Email",
      "Tiến Độ %",
      "Trạng Thái",
      "Ngày Đăng Ký",
      "Bài Học",
      "Quiz",
    ];

    // Prepare CSV rows
    const rows = enrollments.map((e) => [
      e.username,
      e.email,
      e.progress,
      e.isCourseCompleted ? "Hoàn Thành" : "Đang Học",
      e.enrollmentDate,
      `${e.completedLessons}/${e.totalLessons}`,
      `${e.quizProgress.passedQuizzes}/${e.quizProgress.totalQuizzes}`,
    ]);

    // Create CSV content
    const csvContent = [
      [headers.join(",")],
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`
    );
    element.setAttribute("download", `${courseName}_enrollments.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return <Button onClick={handleExport}>Xuất CSV</Button>;
}
```

## Best Practices

### 1. Props Validation

```javascript
import PropTypes from "prop-types";

function MyComponent({ enrollments, courseId }) {
  return <div>{enrollments.length} students</div>;
}

MyComponent.propTypes = {
  enrollments: PropTypes.arrayOf(PropTypes.object).isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
```

### 2. Error Handling

```javascript
const handleModalAction = async (action) => {
  try {
    setLoading(true);
    // Perform action
  } catch (error) {
    message.error(error.message || "Lỗi không xác định");
    console.error("Action error:", error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Loading States

```javascript
// Always show loading feedback to user
<EnrollmentTable
  loading={loading}
  enrollments={enrollments}
  // ... other props
/>
```

### 4. Memory Leaks Prevention

```javascript
useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    const data = await fetchData();
    if (isMounted) {
      setEnrollments(data);
    }
  };

  loadData();

  return () => {
    isMounted = false; // Cleanup
  };
}, []);
```

## Common Patterns

### Pattern 1: Modal Workflow

```javascript
const [modalVisible, setModalVisible] = useState(false);
const [selectedData, setSelectedData] = useState(null);

const handleOpen = (data) => {
  setSelectedData(data);
  setModalVisible(true);
};

const handleClose = () => {
  setModalVisible(false);
  setSelectedData(null);
};
```

### Pattern 2: Search & Filter

```javascript
const [searchText, setSearchText] = useState("");

const filtered = enrollments.filter(
  (item) =>
    item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchText.toLowerCase())
);
```

### Pattern 3: Async Data Loading

```javascript
useEffect(() => {
  loadData();
}, [courseId]); // Only reload when courseId changes
```

## Testing Examples

### Jest Test Example

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import EnrollmentStats from "./EnrollmentStats";

test("renders enrollment statistics", () => {
  const enrollments = [
    { userId: 1, username: "John", progress: 100 },
    { userId: 2, username: "Jane", progress: 50 },
  ];

  render(<EnrollmentStats enrollments={enrollments} />);

  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument();
});
```

---

**These examples demonstrate how to use the refactored CourseEnrollmentList component both as a complete package and by using individual sub-components for custom implementations.**
