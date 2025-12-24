# CourseEnrollmentList Component Guide

## Quick Reference

### Main Component Location

`src/components/course/CourseEnrollmentList.js`

### Sub-Components Location

`src/components/course/enrollmentComponents/`

## Component API Reference

### CourseEnrollmentList (Main)

```javascript
<CourseEnrollmentList
  visible={boolean}           // Show/hide modal
  onClose={function}          // Close handler
  courseId={string|number}    // Course ID to load
  courseName={string}         // Course name for modal title
/>
```

### EnrollmentStats

```javascript
<EnrollmentStats
  enrollments={array} // Array of enrollment objects
  searchText={string} // Current search text (optional)
/>
```

### EnrollmentSearchBar

```javascript
<EnrollmentSearchBar
  searchText={string}         // Current search value
  onSearch={function}         // Handler: (value) => void
  onRefresh={function}        // Handler: () => void
  loading={boolean}           // Show loading state
/>
```

### EnrollmentTable

```javascript
<EnrollmentTable
  enrollments={array}         // Array of enrollment objects
  loading={boolean}           // Loading state
  pagination={{
    current: number,
    pageSize: number,
    total: number
  }}
  onTableChange={function}    // Handler: (page, pageSize) => void
  onViewProgressDetail={function}  // Handler: (userId, username) => void
  onViewQuizResults={function}     // Handler: (userId, username) => void
  onIssueCertificate={function}    // Handler: (userId, username, progress) => void
  courseId={string|number}    // Current course ID
  searchText={string}         // Current search text
/>
```

### EnrollmentActions

```javascript
<EnrollmentActions
  userId={number}             // User ID
  username={string}           // User name
  onViewProgressDetail={function}
  onViewQuizResults={function}
  onIssueCertificate={function}
/>
```

### ProgressDetailModal

```javascript
<ProgressDetailModal
  visible={boolean}           // Show/hide modal
  onClose={function}          // Close handler
  courseId={string|number}    // Course ID
  userId={number}             // User ID
  username={string}           // User name (optional)
/>
```

### QuizResultsModal

```javascript
<QuizResultsModal
  visible={boolean}           // Show/hide modal
  onClose={function}          // Close handler
  courseId={string|number}    // Course ID
  userId={number}             // User ID
  username={string}           // User name (optional)
/>
```

### CertificateModal

```javascript
<CertificateModal
  visible={boolean}           // Show/hide modal
  onClose={function}          // Close handler
  username={string}           // User name
  userId={number}             // User ID
  courseId={string|number}    // Course ID
  courseName={string}         // Course name
  progress={number}           // Progress percentage
  onIssueCertificate={function} // Handler: (data) => Promise<void>
/>
```

### QuizProgressDetail

```javascript
<QuizProgressDetail
  record={object} // Enrollment record
/>
```

## Enrollment Object Structure

```javascript
{
  userId: number,
  username: string,
  email: string,
  avatar?: string,
  enrollmentDate: string,     // ISO date format
  expiryDate?: string,        // ISO date format
  status: string,             // "ACTIVE", "COMPLETED", "EXPIRED"
  lastActivity?: string,      // ISO date format
  progress: number,           // 0-100
  completedLessons: number,
  totalLessons: number,
  quizProgress: {
    totalQuizzes: number,
    passedQuizzes: number,
    failedQuizzes: number,
    notAttemptedQuizzes: number,
    completedQuizzes: number,
    quizDetails: array
  },
  isCourseCompleted: boolean,
  totalDuration: number       // in minutes
}
```

## Quiz Detail Object Structure

```javascript
{
  quizId: number,
  quizName: string,
  score: number,
  passingScore: number,
  percentage: number,         // 0-100
  status: string,             // "PASS", "FAIL", "NOT_ATTEMPTED"
  attempts: number,
  timeSpent: number,          // in seconds
  completedDate?: string      // ISO date format
}
```

## State Management in Main Component

```javascript
// Data states
const [enrollments, setEnrollments] = useState([]);
const [filteredEnrollments, setFilteredEnrollments] = useState([]);
const [loading, setLoading] = useState(false);
const [searchText, setSearchText] = useState("");
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 5,
  total: 0,
});
const [courseStructure, setCourseStructure] = useState({
  totalLessons: 0,
  totalQuizzes: 0,
  quizzes: [],
});

// Modal states
const [progressDetailVisible, setProgressDetailVisible] = useState(false);
const [quizResultsVisible, setQuizResultsVisible] = useState(false);
const [certificateModalVisible, setCertificateModalVisible] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
```

## Key Functions

### loadEnrollmentsWithProgress

Loads enrollment data with calculated progress metrics

```javascript
const loadEnrollmentsWithProgress = useCallback(
  async (page = 1, size = 5) => {
    // Fetches from EnrollmentService, LessonService, QuizProgressService
    // Combines data and calculates progress percentages
  },
  [courseId, courseStructure]
);
```

### handleSearch

Filters enrollments by search text

```javascript
const handleSearch = (value) => {
  // Filters by username, email, or userId
};
```

### handleViewProgressDetail

Opens progress detail modal

```javascript
const handleViewProgressDetail = (userId, username) => {
  setSelectedUser({ userId, username });
  setProgressDetailVisible(true);
};
```

### handleViewQuizResults

Opens quiz results modal

```javascript
const handleViewQuizResults = (userId, username) => {
  setSelectedUser({ userId, username });
  setQuizResultsVisible(true);
};
```

### handleIssueCertificate

Opens certificate modal

```javascript
const handleIssueCertificate = (userId, username, progress) => {
  setSelectedUser({ userId, username, progress });
  setCertificateModalVisible(true);
};
```

## Services Used

- **EnrollmentService**
  - `getCourseEnrollmentsAdmin(courseId, { page, size })`
- **CourseProgressService**
  - `getCourseStructure(courseId)`
  - `getProgressAnalytics(courseId, userId)`
- **LessonService**
  - `getUserProgressByCourseForAdmin(courseId, userId)`
- **QuizProgressService**
  - `getUserQuizProgressInCourseForAdmin(courseId, userId)`
  - `analyzeUserQuizProgress(quizData)`

## CSS/Styling

- Uses Ant Design components exclusively
- Responsive design with proper spacing
- Color-coded status indicators
- Progress bars with percentage display
- Avatar components with fallback initials

## Actions Available to Users

1. **View Progress Detail**

   - Shows detailed progress breakdown
   - Displays lesson completion, quiz results, time spent

2. **View Quiz Results**

   - Lists all quiz attempts
   - Shows scores and status
   - Displays attempt history

3. **Issue Certificate**
   - Form to create certificate
   - Select certificate type
   - Set issue date
   - Add notes (optional)
   - Backend implementation required

## Future Enhancements

- [ ] Bulk certificate issuance
- [ ] Export enrollment data to CSV
- [ ] Email notifications
- [ ] Certificate PDF generation
- [ ] Custom certificate templates
- [ ] Attendance tracking
- [ ] Course analytics dashboard
- [ ] Student performance comparison

---

**Last Updated:** 2024  
**Component Status:** Production Ready (Refactored)
