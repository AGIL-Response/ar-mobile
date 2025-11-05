import { apiClient, handleApiError } from '../api-client';

export interface FileUploadOptions {
  incidentId: string;
  fileUri: string;
  fileName?: string;
  mimeType?: string;
}

export const filesApi = {
  /**
   * Upload a file attachment to an incident
   */
  uploadIncidentAttachment: async (options: FileUploadOptions): Promise<void> => {
    try {
      const { incidentId, fileUri, fileName, mimeType } = options;
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add the file to FormData
      formData.append('file', {
        uri: fileUri,
        name: fileName || 'attachment.jpg',
        type: mimeType || 'image/jpeg',
      } as any);

      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-attached-id': incidentId,
          'x-attached-type': 'incident_attachment',
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
