import api from './api';

export interface UploadResponse {
  code: number;
  message: string;
  data: string; // The URL of the uploaded file
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

    const response = await api.post<UploadResponse>(`/v1/files/upload`, formData, {
      params: { folderName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
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

    const response = await api.post<UploadResponse>(`/v1/files/upload-video`, formData, {
      params: { folderName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },
};