/**
 * File Helper Utilities
 * Xử lý filename, sanitize, download, etc.
 */

/**
 * Xóa dấu tiếng Việt
 */
export const removeVietnameseAccents = (str) => {
  if (!str) return "";

  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

/**
 * Làm sạch filename để upload (giữ nguyên extension)
 */
export const sanitizeFilenameForUpload = (filename) => {
  if (!filename) return "document";

  // Tách extension
  const lastDotIndex = filename.lastIndexOf(".");
  let nameWithoutExt = filename;
  let extension = "";

  if (lastDotIndex > 0) {
    extension = filename.substring(lastDotIndex); // Giữ .pdf, .docx
    nameWithoutExt = filename.substring(0, lastDotIndex);
  }

  // Xóa dấu tiếng Việt
  let sanitized = removeVietnameseAccents(nameWithoutExt);

  // Thay thế ký tự không hợp lệ
  sanitized = sanitized
    .replace(/[\\/:*?"<>|]/g, "_") // Ký tự nguy hiểm cho file system
    .replace(/_+/g, "_") // Gộp nhiều _ thành 1
    .replace(/[^\w\s.-]/g, "") // Loại bỏ ký tự đặc biệt khác
    .trim();

  // Nếu rỗng sau khi sanitize
  if (!sanitized) {
    sanitized = "file_" + Date.now();
  }

  // Giới hạn độ dài
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized + extension;
};

/**
 * Tạo tên file an toàn cho download
 */
export const getSafeDownloadFilename = (
  lessonTitle,
  documentUrl,
  defaultName = "document"
) => {
  if (!lessonTitle && !documentUrl) return defaultName;

  // Lấy extension từ URL
  const getExtensionFromUrl = (url) => {
    if (!url) return "";
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? "." + match[1].toLowerCase() : "";
  };

  // Xử lý tên file
  let safeName = lessonTitle || defaultName;

  // Xóa dấu tiếng Việt
  safeName = removeVietnameseAccents(safeName);

  // Làm sạch
  safeName = safeName
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_")
    .toLowerCase();

  // Đảm bảo không rỗng
  if (!safeName) safeName = defaultName;

  // Giới hạn độ dài
  if (safeName.length > 50) {
    safeName = safeName.substring(0, 50);
  }

  // Thêm extension
  const extension = getExtensionFromUrl(documentUrl);
  return safeName + extension;
};

/**
 * Lấy extension từ filename
 */
export const getFileExtension = (filename) => {
  if (!filename) return "";
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : "";
};

/**
 * Validate file type
 */
export const validateFileType = (
  file,
  allowedTypes,
  allowedExtensions = []
) => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check by MIME type
  if (allowedTypes.includes(fileType)) {
    return true;
  }

  // Check by extension
  const extension = getFileExtension(fileName);
  return allowedExtensions.includes("." + extension);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Tạo title an toàn cho upload (không có extension)
 */
export const getSafeUploadTitle = (filename) => {
  if (!filename) return "";

  // Lấy tên không có extension
  const lastDotIndex = filename.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;

  // Xóa dấu và làm sạch
  return removeVietnameseAccents(nameWithoutExt)
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/_+/g, "_")
    .trim();
};
