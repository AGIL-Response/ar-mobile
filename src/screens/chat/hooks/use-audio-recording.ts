/**
 * Hook for handling audio recording
 * Single Responsibility: Manage audio recording state and lifecycle
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, Alert } from 'react-native';
import { AudioRecorder } from '@/utils/audioRecorder';
import type { MediaFile } from '@/utils/media';

export interface UseAudioRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  formatTime: (seconds: number) => string;
}

export function useAudioRecording(
  onRecordingComplete: (audioFile: MediaFile) => void
): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordingTimeRef = useRef(0);

  const resetRecordingState = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.destroy();
      audioRecorderRef.current = null;
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const appState = AppState.currentState;
      if (appState !== 'active') {
        Alert.alert(
          'App must be active',
          'Please ensure the app is in the foreground to start recording.'
        );
        return;
      }

      const isSupported = await AudioRecorder.isSupported();
      if (!isSupported) {
        Alert.alert('Permission required', 'Please grant permission to access your microphone');
        return;
      }

      const audioRecorder = new AudioRecorder({
        onStop: (audioFile) => {
          if (recordingTimeRef.current < 1) {
            resetRecordingState();
            return;
          }
          onRecordingComplete(audioFile);
          resetRecordingState();
        },
        onError: (error: Error) => {
          console.error('Recording error:', error);
          Alert.alert('Recording Error', error.message);
          resetRecordingState();
        },
      });

      audioRecorderRef.current = audioRecorder;
      await audioRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        Alert.alert('Recording Error', error.message);
      }
      resetRecordingState();
    }
  }, [onRecordingComplete, resetRecordingState]);

  const stopRecording = useCallback(async () => {
    if (audioRecorderRef.current) {
      await audioRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancel();
    }
    resetRecordingState();
  }, [resetRecordingState]);

  useEffect(() => {
    return () => {
      resetRecordingState();
    };
  }, [resetRecordingState]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  };
}

