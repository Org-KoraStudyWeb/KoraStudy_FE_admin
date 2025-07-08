class CloudinaryService {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dfqfh3hzu';
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'korastudy_preset';
    this.apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY || '217639887482219';
  }

  async uploadFile(file, type = 'auto') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('resource_type', type);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${type}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        resourceType: data.resource_type,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        duration: data.duration, // for video/audio files
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadImage(file) {
    return this.uploadFile(file, 'image');
  }

  async uploadAudio(file) {
    return this.uploadFile(file, 'video'); // Cloudinary uses 'video' for audio files
  }

  generatePreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }

  // Validate file types and sizes
  validateFile(file, type) {
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB
      audio: 20 * 1024 * 1024, // 20MB
    };

    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Định dạng file ${type} không được hỗ trợ`);
    }

    if (file.size > maxSizes[type]) {
      const maxSizeMB = maxSizes[type] / (1024 * 1024);
      throw new Error(`Kích thước file ${type} không được vượt quá ${maxSizeMB}MB`);
    }

    return true;
  }
}

export default new CloudinaryService();
