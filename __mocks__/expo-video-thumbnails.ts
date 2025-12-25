module.exports = {
  __esModule: true,
  getThumbnailAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock-thumbnail.jpg',
    width: 320,
    height: 240,
  }),
  getThumbnailsAsync: jest.fn().mockResolvedValue([
    {
      uri: 'file:///mock-thumbnail.jpg',
      width: 320,
      height: 240,
    },
  ]),
  ThumbnailFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
  ThumbnailQuality: {
    Default: 0.8,
    Low: 0.5,
    Medium: 0.7,
    High: 0.9,
  },
};
