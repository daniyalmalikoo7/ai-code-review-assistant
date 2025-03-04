// backend/tests/mocks/fetch.mock.ts
// Mock implementation for node-fetch

// Create a simple mock for fetch
const mockFetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Map(),
  })
);

// Export as both default and named export to match node-fetch
export default mockFetch;
export { mockFetch as fetch }; 