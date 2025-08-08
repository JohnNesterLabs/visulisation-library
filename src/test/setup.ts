// Test setup file
import '@testing-library/jest-dom';

// Mock D3.js for testing
jest.mock('d3', () => ({
  select: jest.fn(),
  scaleLinear: jest.fn(),
  scaleBand: jest.fn(),
  axisBottom: jest.fn(),
  axisLeft: jest.fn(),
  line: jest.fn(),
  area: jest.fn(),
  pie: jest.fn(),
  arc: jest.fn(),
  sum: jest.fn(),
  max: jest.fn(),
  min: jest.fn(),
  extent: jest.fn(),
  easeLinear: jest.fn(),
  easeElastic: jest.fn(),
  curveMonotoneX: jest.fn(),
  interpolate: jest.fn(),
}));
