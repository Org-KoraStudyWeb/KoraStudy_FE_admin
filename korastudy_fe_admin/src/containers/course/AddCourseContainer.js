import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import AddCourse from "../../pages/course/AddCoursePages";

const CourseContainer = () => {
  const [form, setForm] = useState({
    name: "",
    level: "",
    description: "",
    imageUrl: "",
    price: "",
    isPublished: false,
    topicGroups: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // Xử lý thay đổi trường đơn
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Thêm nhóm từ vựng
  const handleAddGroup = () => {
    setForm((prev) => ({
      ...prev,
      topicGroups: [...prev.topicGroups, { groupName: "", description: "" }],
    }));
  };

  // Xóa nhóm từ vựng
  const handleRemoveGroup = (index) => {
    const updated = form.topicGroups.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, topicGroups: updated }));
  };

  // Thay đổi thông tin nhóm từ vựng
  const handleGroupChange = (e, index, field) => {
    const updatedGroups = [...form.topicGroups];
    updatedGroups[index][field] = e.target.value;
    setForm((prev) => ({ ...prev, topicGroups: updatedGroups }));
  };

  // Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Gắn ảnh nếu có
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Gắn JSON dữ liệu khóa học
      const coursePayload = {
        ...form,
        price: parseFloat(form.price),
      };
      const jsonBlob = new Blob([JSON.stringify(coursePayload)], {
        type: "application/json",
      });
      formData.append("course", jsonBlob);

      // Gửi lên server
      await axiosClient.post("/courses/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Tạo khóa học thành công!");
      navigate("/admin/courses");
    } catch (error) {
      console.error("Tạo khóa học thất bại:", error);
      alert(
        "Tạo khóa học thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <AddCourse
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onAddGroup={handleAddGroup}
      onRemoveGroup={handleRemoveGroup}
      onGroupChange={handleGroupChange}
      onImageChange={handleImageChange}
      onChangeGroup={handleGroupChange}
    />
  );
};

export default CourseContainer;
