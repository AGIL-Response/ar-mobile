module.exports = {
  __esModule: true,
   useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    seek: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  VideoView: 'VideoView',
};
