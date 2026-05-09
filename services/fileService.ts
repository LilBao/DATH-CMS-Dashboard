export interface UploadResponse {
  success: boolean;
  message?: string;
  url: string;
}

export const fileService = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.url;
    } else {
      throw new Error(result.message || "Upload failed");
    }
  },

  uploadVideo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Video upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.url;
    } else {
      throw new Error(result.message || "Video upload failed");
    }
  },
};