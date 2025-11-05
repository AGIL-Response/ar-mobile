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

export interface FileViewOptions {
  fileId: string;
  assigneeId?: string;
  teamId?: string;
  offset?: number;
  limit?: number;
}

/**
 * Convert blob to data URI for displaying in React Native
 */
export const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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

  /**
   * View/download a file by ID
   * Returns the raw file content as blob
   */
  viewFile: async (options: FileViewOptions): Promise<Blob> => {
    try {
      const { fileId, assigneeId, teamId, offset = 0, limit = 100 } = options;
      
      console.log('🚀 File View Request:', {
        fileId,
        assigneeId,
        teamId,
        offset,
        limit
      });

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (assigneeId) queryParams.append('assigneeId', assigneeId);
      if (teamId) queryParams.append('teamId', teamId);
      queryParams.append('offset', offset.toString());
      queryParams.append('limit', limit.toString());

      const queryString = queryParams.toString();
      const url = `/files/view/${fileId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url, {
        responseType: 'blob', // Important: Get raw binary data
      });

      console.log('✅ File View Response:', {
        size: response.data.size,
        type: response.data.type
      });

      return response.data;
    } catch (error) {
      console.error('❌ File View Error:', error);
      throw handleApiError(error);
    }
  },
};
