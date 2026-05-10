import api from './api';

export interface UploadResponse {
  signature: string;
  format: string;
  resource_type: string;
  secure_url: string;
  url: string;
  public_id: string;
  [key: string]: any;
}

export const fileService = {
  /**
   * Upload an image, banner, or poster to a specific folder
   * @param file The file object to upload
   * @param folderName The destination folder on Cloudinary
   * @returns URL of the uploaded image
   */
  uploadFile: async (file: File, folderName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Lưu ý: api interceptor đã unwrap data, nên kết quả trả về là mảng các UploadResponse
    const response = await api.post<any>(`/files/upload`, formData, {
      params: { folderName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0].secure_url || data[0].url;
    }
    return typeof data === 'string' ? data : '';
  },

  /**
   * Upload a video to a specific folder
   * @param file The video file to upload
   * @param folderName The destination folder on Cloudinary
   * @returns URL of the uploaded video
   */
  uploadVideo: async (file: File, folderName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<any>(`/files/upload-video`, formData, {
      params: { folderName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0].secure_url || data[0].url;
    }
    return typeof data === 'string' ? data : '';
  },
};