// Mock structured-clone for Expo winter runtime
module.exports = {
  __esModule: true,
  default: (value: any) => {
    // Simple deep clone using JSON (works for most test cases)
    return JSON.parse(JSON.stringify(value));
  },
};

