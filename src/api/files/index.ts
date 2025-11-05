import { apiClient, handleApiError } from '../api-client';

export interface FileUploadOptions {
  incidentId: string;
  fileUri: string;
  fileName: string;
  mimeType: string;
}

export interface FileUploadResponse {
  code: string;
  data?: any;
  message?: string;
}

export const filesApi = {
  /**
   * Upload a file attachment to an incident
   */
  uploadIncidentAttachment: async (options: FileUploadOptions): Promise<FileUploadResponse> => {
    try {
      const { incidentId, fileUri, fileName, mimeType } = options;
      
      console.log('🚀 File Upload Request:', {
        incidentId,
        fileName,
        mimeType,
        fileUri: fileUri.substring(0, 50) + '...' // Log truncated URI for privacy
      });
      
      // Read file as binary data (similar to curl --data-binary)
      const fileResponse = await fetch(fileUri);
      const fileBlob = await fileResponse.blob();

      console.log('📁 File Info:', {
        size: fileBlob.size,
        type: fileBlob.type || mimeType
      });

      const response = await apiClient.post<FileUploadResponse>('/files/upload', fileBlob, {
        headers: {
          'x-attached-id': incidentId,
          'x-file-name': fileName,
          'x-attached-type': 'incident_attachment',
          'Content-Type': mimeType,
        },
      });

      console.log('✅ File Upload Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ File Upload Error:', error);
      throw handleApiError(error);
    }
  },
};
