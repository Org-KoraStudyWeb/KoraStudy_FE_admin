// src/containers/CourseContainer.jsx
import React, { useEffect, useState } from "react";
import CourseListPages from "../../pages/course/CourseListPages";
import axiosClient from "../../api/axiosClient";

const CourseContainer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      console.log("🚀 [useEffect] Đã chạy fetchCourses()");
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      console.log(
        "🌍 API URL:",
        axiosClient.defaults.baseURL + "/courses/lists"
      );

      try {
        const res = await axiosClient.get("/courses/lists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ API trả về dữ liệu:", res.data);

        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else if (res.data?.content && Array.isArray(res.data.content)) {
          console.warn("⚠️ API trả về kiểu { content: [...] }");
          setCourses(res.data.content);
        } else {
          console.error("❌ Dữ liệu trả về không hợp lệ:", res.data);
          setCourses([]);
          setError("Lỗi: Dữ liệu trả về không hợp lệ.");
        }
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
        setError("Lỗi khi tải danh sách khóa học.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    // ---- Mã gỡ lỗi ----
    console.log("ID khóa học nhận được để xóa:", courseId);
    if (typeof courseId === "undefined" || courseId === null) {
      alert(
        "Lỗi: Không thể xóa vì ID khóa học không xác định. Vui lòng kiểm tra lại dữ liệu trả về từ API."
      );
      return;
    }
    // ---- Kết thúc gỡ lỗi ----

    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) {
      return;
    }

    try {
      // Gọi API để xóa khóa học với ID tương ứng
      await axiosClient.delete(`/courses/delete/${courseId}`);
      // Cập nhật lại state để loại bỏ khóa học đã xóa khỏi giao diện
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      alert("Xóa khóa học thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa khóa học:", error);
      alert(
        "Xóa khóa học thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <>
      {error && (
        <>
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          {console.log("🪵 Lỗi đang hiển thị:", error)}
        </>
      )}
      <CourseListPages
        courses={courses}
        loading={loading}
        onDeleteCourse={handleDeleteCourse}
      />
    </>
  );
};

export default CourseContainer;
