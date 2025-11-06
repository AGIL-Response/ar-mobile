/**
 * Higher-Order Component for File Source Loading
 * Wraps components that need to load files from fileId and injects source, isLoading, and error props
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { blobToDataUri, filesApi } from '@/api/files';

export interface FileSourceProps {
  /** File ID to load */
  fileId?: string;
  /** Source result (data URI) - injected by HOC */
  sourceResult?: ImageSourcePropType | null;
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
  Component: React.ComponentType<TProps> | React.ForwardRefExoticComponent<TProps>,
  options: WithFileSourceOptions = {}
): React.ForwardRefExoticComponent<Omit<TProps, 'sourceResult' | 'isLoading' | 'error'>> {
  const { autoLoad = true, logErrors = true } = options;

  const WrappedComponent = React.forwardRef<any, Omit<TProps, 'sourceResult' | 'isLoading' | 'error'>>(
    (props, ref) => {
      const { fileId, ...restProps } = props as TProps & { fileId?: string };

      const [fileDataUri, setFileDataUri] = useState<string | null>(null);
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

        setIsLoading(true);
        setError(null);

        try {
          if (logErrors) {
            console.log('🚀 Loading file:', fileId);
          }

          const blob = await filesApi.viewFile({ fileId });
          const dataUri = await blobToDataUri(blob);
          setFileDataUri(dataUri);

          if (logErrors) {
            console.log('✅ File loaded successfully:', fileId);
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
      }, [fileId, fileDataUri, isLoading, logErrors]);

      // Auto-load file when component mounts or fileId changes
      useEffect(() => {
        if (autoLoad && fileId) {
          loadFileContent();
        }
      }, [fileId, autoLoad, loadFileContent]);

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
          isLoading={isLoading}
          error={error}
        />
      );
    }
  );

  WrappedComponent.displayName = `withFileSource(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

