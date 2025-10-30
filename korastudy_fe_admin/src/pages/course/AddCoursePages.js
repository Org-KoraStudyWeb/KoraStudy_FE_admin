import React from "react";

const AddCourse = ({
  form,
  onChange,
  onSubmit,
  onAddGroup,
  onRemoveGroup,
  onFileChange,
  onChangeGroup,
}) => (
  <div className="flex min-h-screen bg-gray-50">
    <div className="flex-1 bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-10">
        <h2 className="text-3xl font-bold mb-8 text-blue-700">
          Thêm khóa học mới
        </h2>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="col-span-1">
            <label className="block font-semibold mb-2 text-gray-700">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-lg"
              placeholder="Nhập tên khóa học"
            />

            <label className="block font-semibold mb-2 text-gray-700">
              Trình độ
            </label>
            <input
              type="text"
              name="courseLevel"
              value={form.courseLevel}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-lg"
              placeholder="Ví dụ: Beginner, Intermediate, Advanced"
            />

            <label className="block font-semibold mb-2 text-gray-700">
              Chọn ảnh khóa học
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="mb-4"
            />
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}
          </div>

          <div className="col-span-1">
            <label className="block font-semibold mb-2 text-gray-700">
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={7}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-lg resize-none"
              placeholder="Nhập mô tả khóa học"
            />

            <label className="block font-semibold mb-2 text-gray-700">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              name="coursePrice"
              value={form.coursePrice}
              onChange={onChange}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-lg"
              placeholder="Nhập giá khóa học"
            />

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={onChange}
                id="published"
                className="mr-3 h-5 w-5 accent-blue-600"
              />
              <label
                htmlFor="published"
                className="font-semibold text-gray-700"
              >
                Công khai khóa học
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">
              Nhóm chủ đề (Topic Groups)
            </label>
            {form.topicGroups?.map((group, index) => (
              <div
                key={index}
                className="grid md:grid-cols-2 gap-4 mb-4 border p-4 rounded bg-gray-50"
              >
                <input
                  type="text"
                  value={group.groupName}
                  onChange={(e) => onChangeGroup(e, index, "groupName")}
                  placeholder="Tên nhóm"
                  className="border border-gray-300 rounded px-4 py-2"
                  required
                />
                <input
                  type="text"
                  value={group.description}
                  onChange={(e) => onChangeGroup(e, index, "description")}
                  placeholder="Mô tả nhóm"
                  className="border border-gray-300 rounded px-4 py-2"
                />
                <button
                  type="button"
                  onClick={() => onRemoveGroup(index)}
                  className="text-red-500 text-sm mt-2 hover:underline col-span-2 text-right"
                >
                  Xóa nhóm mới tạo
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={onAddGroup}
              className="text-blue-600 font-semibold hover:underline mb-6"
            >
              + Thêm nhóm chủ đề
            </button>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition"
            >
              Thêm khóa học
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

export default AddCourse;
