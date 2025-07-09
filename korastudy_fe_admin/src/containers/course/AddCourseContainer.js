import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient"; // dùng client có interceptor
import axios from "axios";
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleAddGroup = () => {
    setForm((prev) => ({
      ...prev,
      topicGroups: [...prev.topicGroups, { groupName: "", description: "" }],
    }));
  };

  const handleRemoveGroup = (index) => {
    const updated = form.topicGroups.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, topicGroups: updated }));
  };

  const handleGroupChange = (e, index, field) => {
    const updatedGroups = [...form.topicGroups];
    updatedGroups[index][field] = e.target.value;
    setForm((prev) => ({ ...prev, topicGroups: updatedGroups }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrlToSend = form.imageUrl;

      if (imageFile) {
        const imageForm = new FormData();
        imageForm.append("file", imageFile);

        const uploadRes = await axios.post(
          "http://localhost:8080/api/v1/upload",
          imageForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrlToSend = uploadRes.data.url;
      }

      const payload = {
        ...form,
        imageUrl: imageUrlToSend,
        price: parseFloat(form.price),
      };

      await axiosClient.post("/courses/create", payload); // axiosClient tự gắn token

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
