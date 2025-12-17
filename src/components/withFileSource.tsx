/**
 * Higher-Order Component for File Source Loading
 * Wraps components that need to load files from fileId and injects source, isLoading, and error props
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  blobToUri,
  cacheFileUri,
  filesApi,
  getCachedFileUri,
} from '@/api/files';

export interface FileSourceProps {
  /** File ID to load */
  fileId?: string;
  /** Source result (data URI) - injected by HOC */
  sourceResult?: ImageSourcePropType | null;
  /** File mime type - injected by HOC */
  mimeType?: string | null;
  /** Loading state - injected by HOC */
  isLoading?: boolean;
  /** Error state - injected by HOC */
  error?: string | null;
}

export interface WithFileSourceOptions {
  /** Whether to auto-load on mount (default: true) */
  autoLoad?: boolean;
  /** Whether to show errors in console (default: true) */
  logErrors?: boolean;
}

/**
 * Higher-order component that handles file loading from fileId
 * and injects sourceResult, isLoading, and error props to the wrapped component
 *
 * @param Component Component to wrap
 * @param options Configuration options
 * @returns Wrapped component with file loading capabilities
 */
export function withFileSource<
  TProps extends FileSourceProps = FileSourceProps,
>(
  Component:
    | React.ComponentType<TProps>
    | React.ForwardRefExoticComponent<TProps>,
  options: WithFileSourceOptions = {}
): React.ForwardRefExoticComponent<
  Omit<TProps, 'sourceResult' | 'isLoading' | 'error' | 'mimeType'>
> {
  const { autoLoad = true, logErrors = true } = options;

  const WrappedComponent = React.forwardRef<
    any,
    Omit<TProps, 'sourceResult' | 'isLoading' | 'error' | 'mimeType'>
  >((props, ref) => {
    const { fileId, ...restProps } = props as unknown as { fileId?: string };

    const [fileDataUri, setFileDataUri] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to load file content
    const loadFileContent = useCallback(async () => {
      if (!fileId) {
        return; // No fileId provided
      }

      if (fileDataUri || isLoading) {
        return; // Already loaded or loading
      }

      // Check cache first (async validation for file:// URIs)
      const cached = await getCachedFileUri(fileId);
      if (cached) {
        if (logErrors) {
          console.log('📦 Using cached file:', fileId);
        }
        setFileDataUri(cached.uri);
        setMimeType(cached.mimeType);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (logErrors) {
          console.log('🚀 Loading file:', fileId);
        }

        const { blob, type } = await filesApi.viewFile({ fileId });
        const blobMimeType = type || null;

        // Convert blob to appropriate URI based on mime type
        // Videos need file:// URI, images can use data:// URI
        const uri = await blobToUri(blob, blobMimeType);

        // Cache the result for future use
        cacheFileUri(fileId, uri, blobMimeType);

        setFileDataUri(uri);
        setMimeType(blobMimeType);

        if (logErrors) {
          console.log(
            '✅ File loaded successfully:',
            fileId,
            'type:',
            blob.type
          );
        }
      } catch (err) {
        const errorMessage = 'Failed to load file';
        setError(errorMessage);

        if (logErrors) {
          console.error('❌ Failed to load file:', fileId, err);
        }
      } finally {
        setIsLoading(false);
      }
    }, [fileId, fileDataUri, isLoading]);

    // Reset state when fileId changes
    useEffect(() => {
      setFileDataUri(null);
      setMimeType(null);
      setError(null);
    }, [fileId]);

    // Auto-load file when component mounts or fileId changes
    useEffect(() => {
      if (autoLoad && fileId) {
        loadFileContent();
      }
    }, [fileId, loadFileContent]);

    // Convert data URI to ImageSourcePropType
    const sourceResult: ImageSourcePropType | null = fileDataUri
      ? { uri: fileDataUri }
      : null;

    return (
      <Component
        ref={ref}
        {...(restProps as TProps)}
        fileId={fileId}
        sourceResult={sourceResult}
        mimeType={mimeType}
        isLoading={isLoading}
        error={error}
        testID={`withFileSource-${fileId}`}
      />
    );
  });

  WrappedComponent.displayName = `withFileSource(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
