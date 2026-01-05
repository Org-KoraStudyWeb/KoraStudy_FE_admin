// Configuration file for the application

// API Base URL - adjust this to your backend API endpoint
const PROD_BACKEND_URL = "https://korastudybackend-g0fbapeue9gphqhd.indonesiacentral-01.azurewebsites.net";

export const API_BASE_URL = (() => {
  // Ưu tiên 1: Nếu đang chạy trên production domain (Azure Static Web Apps), bắt buộc dùng production backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('azurestaticapps.net')) {
    console.log('[Config] Phát hiện môi trường Production, sử dụng Backend Production');
    return PROD_BACKEND_URL;
  }
  
  // Ưu tiên 2: Biến môi trường REACT_APP_API_URL (thường dùng cho dev/local hoặc build custom)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Ưu tiên 3: Fallback - Local development
  return 'http://localhost:8080';
})();

// TinyMCE API Key
// ⚠️ LƯU Ý BẢO MẬT:
// - TinyMCE API Key là PUBLIC key, được thiết kế để dùng trong frontend
// - Key này được bảo vệ bởi Domain Whitelisting (chỉ hoạt động trên domain đã đăng ký)
// - KHÔNG BAO GIỜ đưa Backend API keys (DB password, JWT secret, Azure keys) vào frontend!
// - Để deploy lên Azure, cấu hình biến môi trường REACT_APP_TINYMCE_API_KEY trong Azure Static Web Apps
export const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY || 'no-api-key';

// Other global configuration constants can be added here
export const APP_NAME = 'KoraStudy Admin';
export const APP_VERSION = '1.0.0';