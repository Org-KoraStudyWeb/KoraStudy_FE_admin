import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Get token from localStorage
 */
const getToken = () => {
  return localStorage.getItem("accessToken") ||
         localStorage.getItem("token") ||
         localStorage.getItem("adminToken");
};

/**
 * Azure Service for Admin - Tích hợp Azure Translator và Text-to-Speech
 */

/**
 * Dịch văn bản từ tiếng Hàn sang tiếng Việt
 */
export const translateKoreanToVietnamese = async (text) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/azure/translate/ko-to-vi`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error translating Korean to Vietnamese:', error);
    throw error;
  }
};

/**
 * Dịch văn bản từ tiếng Việt sang tiếng Hàn
 */
export const translateVietnameseToKorean = async (text) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/azure/translate/vi-to-ko`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error translating Vietnamese to Korean:', error);
    throw error;
  }
};

/**
 * Phát hiện ngôn ngữ của văn bản
 */
export const detectLanguage = async (text) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/azure/detect-language`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error detecting language:', error);
    throw error;
  }
};

/**
 * Tạo audio phát âm tiếng Hàn
 * @param {string} text - Văn bản tiếng Hàn cần phát âm
 * @param {string} voice - Giọng đọc (mặc định: ko-KR-SunHiNeural)
 * @returns {Promise} - Audio data dạng base64
 */
export const generateKoreanSpeech = async (text, voice = 'ko-KR-SunHiNeural') => {
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/azure/speech/generate`,
      { text, voice },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
};

/**
 * Lấy danh sách giọng đọc tiếng Hàn có sẵn
 */
export const getAvailableVoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/azure/speech/voices`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting available voices:', error);
    throw error;
  }
};

/**
 * Phát audio từ base64 data
 */
export const playAudioFromBase64 = (base64Data) => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    
    // Create URL and play
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
    
    // Clean up URL after playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    return audio;
  } catch (error) {
    console.error('Error playing audio from base64:', error);
    throw error;
  }
};

/**
 * Auto-translate helper: Dịch tự động dựa trên ngôn ngữ phát hiện
 */
export const autoTranslate = async (text) => {
  try {
    // Detect language first
    const detectionResult = await detectLanguage(text);
    const detectedLang = detectionResult.detectedLanguage;
    
    // Translate based on detected language
    if (detectedLang === 'ko') {
      return await translateKoreanToVietnamese(text);
    } else if (detectedLang === 'vi') {
      return await translateVietnameseToKorean(text);
    } else {
      // Default to Korean to Vietnamese if language is not detected
      return await translateKoreanToVietnamese(text);
    }
  } catch (error) {
    console.error('Error in auto-translate:', error);
    throw error;
  }
};
