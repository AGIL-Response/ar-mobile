import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { FileUpload } from './file-upload';

describe('FileUpload', () => {
  it('renders label and placeholder', () => {
    render(<FileUpload label="Upload" />);
    expect(screen.getByText('Upload')).toBeTruthy();
    expect(screen.getByText(/Tap to select/)).toBeTruthy();
  });

  it('shows required indicator if required', () => {
    render(<FileUpload label="Files" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('is disabled with prop', () => {
    render(<FileUpload disabled />);
    expect(screen.getByText(/Tap to select/)).toBeTruthy();
  });

  it('renders file list and remove button', () => {
    const files = [
      { uri: 'x', name: 'Resume.pdf', type: 'application/pdf', size: 111 },
      { uri: 'y', name: 'Photo.jpg', type: 'image/jpeg', size: 2048 },
    ];
    const onFileRemove = jest.fn();
    render(<FileUpload label="U" files={files} onFileRemove={onFileRemove} />);
    expect(screen.getByText('Resume.pdf')).toBeTruthy();
    expect(screen.getByText('Photo.jpg')).toBeTruthy();
    fireEvent.press(screen.getAllByRole('button')[1]); // Remove button for Photo.jpg
    expect(onFileRemove).toHaveBeenCalledWith(1);
  });

  it('shows error and helper text', () => {
    render(<FileUpload error="Bad file" helperText="Help msg" />);
    expect(screen.getByText('Bad file')).toBeTruthy();
    expect(screen.queryByText('Help msg')).toBeNull();
  });

  it('shows only helper text if no error', () => {
    render(<FileUpload helperText="Optional" />);
    expect(screen.getByText('Optional')).toBeTruthy();
  });
});
