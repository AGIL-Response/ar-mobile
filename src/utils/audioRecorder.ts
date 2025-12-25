/**
 * Audio Recorder Utility
 * Handles audio recording and returns m4a format files
 * Similar to chat-kit's audioRecorder implementation
 */

import { Audio } from 'expo-av';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export interface AudioRecorderOptions {
  onDataAvailable?: (data: Blob) => void;
  onStop?: (audioFile: { uri: string; name: string; type: string; size: number; mimeType: string }) => void;
  onError?: (error: Error) => void;
}

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private recordingUri: string | null = null;
  private recordingStartTime: number = 0;
  private isUnloaded: boolean = false;
  private options: AudioRecorderOptions;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = options;
  }

  /**
   * Check if audio recording is supported
   */
  static async isSupported(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async start(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      // Note: staysActiveInBackground should be false to avoid background recording issues
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Small delay to ensure audio mode is set before creating recording
      // This helps avoid "background" errors when the app is actually in foreground
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          // Handle recording status updates if needed
          if (status.isDoneRecording) {
            console.log('Recording finished');
          }
        }
      );

      this.recording = recording;
      this.recordingStartTime = Date.now();
      this.isUnloaded = false;
      console.log('🎙️ Started audio recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to start recording';
      if (error instanceof Error) {
        if (error.message.includes('background')) {
          errorMessage = 'Please ensure the app is in the foreground to start recording';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (this.options.onError) {
        this.options.onError(new Error(errorMessage));
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Stop recording and create audio file
   */
  async stop(): Promise<void> {
    if (!this.recording || this.isUnloaded) {
      console.warn('No active recording to stop');
      return;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      this.isUnloaded = true;
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      this.recordingUri = uri;

      // Get file info using legacy API
      const fileInfo = await FileSystemLegacy.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Recorded file does not exist');
      }

      // Create MediaFile-like object
      const audioFile = {
        uri,
        name: `audio-message-${Date.now()}.m4a`,
        type: 'audio',
        size: fileInfo.size || 0,
        mimeType: 'audio/mp4', // m4a files use audio/mp4 MIME type
      };

      console.log('🎵 Audio file created:', {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size,
        uri: uri.substring(0, 50) + '...',
      });

      // Cleanup
      this.recording = null;
      this.isUnloaded = false; // Reset for next recording

      if (this.options.onStop) {
        this.options.onStop(audioFile);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      // If we successfully unloaded but failed to get file info, mark as unloaded
      // to prevent double-unload errors
      if (this.isUnloaded) {
        this.recording = null;
        this.isUnloaded = false; // Reset for next recording
      }
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    } finally {
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancel(): Promise<void> {
    if (this.recording && !this.isUnloaded) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.isUnloaded = true;
        const uri = this.recording.getURI();
        
        // Delete the file if it exists
        if (uri) {
          try {
            await FileSystemLegacy.deleteAsync(uri, { idempotent: true });
          } catch (error) {
            console.warn('Error deleting canceled recording:', error);
          }
        }
      } catch (error) {
        // If already unloaded, just log and continue cleanup
        if (error instanceof Error && error.message.includes('already been unloaded')) {
          console.log('Recording already unloaded, skipping unload step');
        } else {
          console.error('Error canceling recording:', error);
        }
      } finally {
        this.recording = null;
        this.recordingUri = null;
        this.isUnloaded = false;
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
        });
      }
    } else if (this.recording && this.isUnloaded) {
      // Recording was already unloaded, just clean up references
      this.recording = null;
      this.recordingUri = null;
      this.isUnloaded = false;
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording !== null;
  }

  /**
   * Get recording duration in seconds
   */
  getDuration(): number {
    if (this.recordingStartTime === 0) return 0;
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.cancel();
  }
}

