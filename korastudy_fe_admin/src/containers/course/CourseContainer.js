import React, { useEffect, useState } from "react";
import CourseListPages from "../../pages/course/CourseListPages";
import axiosClient from "../../api/axiosClient";

const CourseContainer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      console.log("🚀 [useEffect] Đã chạy useEffect");

      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      console.log("🔑 Token hiện tại:", token);
      console.log(
        "🌍 API URL:",
        axiosClient.defaults.baseURL + "/courses/lists"
      );

      try {
        console.log("📡 Bắt đầu gọi axiosClient.get('/courses/lists')");
        const res = await axiosClient.get("/courses/lists");
        console.log("✅ API trả về dữ liệu:", res.data);
        setCourses(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:");
        console.error(err);
        setError("Lỗi khi tải danh sách khóa học.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <CourseListPages courses={courses} loading={loading} />
    </>
  );
};

export default CourseContainer;
