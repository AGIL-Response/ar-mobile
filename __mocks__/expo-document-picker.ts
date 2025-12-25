module.exports = {
  __esModule: true,
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: 'file:///mock-document.pdf',
        name: 'mock-document.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      },
    ],
  }),
  pickDirectory: jest.fn().mockResolvedValue({
    uri: 'file:///mock-directory',
  }),
  DocumentPickerOptions: {},
  DocumentPickerResult: {},
};
