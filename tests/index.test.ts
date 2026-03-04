import { describe, it, expect } from "bun:test";
import { FilterType, createFilter, type SensorDataPoint } from "../src/index";

function variance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
}

describe("SMA Filter", () => {
  it("should compute correct average within window size", () => {
    const config = { type: FilterType.SMA, windowSize: 3 };
    const filter = createFilter({
      config,
      initialState: { type: FilterType.SMA, window: [] }
    });

    let result = filter.process(1, new Date());
    expect(result.value).toBe(1);

    result = filter.process(2, new Date());
    expect(result.value).toBe(1.5);

    result = filter.process(3, new Date());
    expect(result.value).toBe(2);

    result = filter.process(4, new Date());
    expect(result.value).toBe(3);
    expect((result.state as any).window).toEqual([2, 3, 4]);
  });

  it("should throw error for invalid windowSize", () => {
    expect(() => createFilter({
      config: { type: FilterType.SMA, windowSize: 0 },
      initialState: { type: FilterType.SMA, window: [] }
    })).toThrow("SMA windowSize must be ≥1, got 0");
  });
});

describe("EMA Filter", () => {
  it("should respond to step changes based on alpha", () => {
    const config = { type: FilterType.EMA, alpha: 0.5 };
    const filter = createFilter({
      config,
      initialState: { type: FilterType.EMA, previousEMA: 10 }
    });

    let result = filter.process(20, new Date());
    expect(result.value).toBe(15);

    result = filter.process(20, new Date());
    expect(result.value).toBe(17.5);

    result = filter.process(20, new Date());
    expect(result.value).toBe(18.75);
  });

  it("should calculate alpha from windowSize if not provided", () => {
    const config = { type: FilterType.EMA, windowSize: 5 };
    const filter = createFilter({
      config,
      initialState: { type: FilterType.EMA, previousEMA: NaN }
    });

    filter.process(10, new Date());
    const result = filter.process(10, new Date());
    expect(result.value).toBeCloseTo(10, 2);
  });
});

describe("Kalman Filter", () => {
  it("should reduce noise variance in simulated data", () => {
    const trueValue = 5;
    const measurements = [5.1, 4.9, 5.2, 4.8, 5.0, 5.3, 4.7];
    const config = { type: FilterType.Kalman, q: 0.1, r: 0.1 };
    const initialState = {
      type: FilterType.Kalman,
      estimate: 5,
      errorCovariance: 1
    };

    const filter = createFilter({ config, initialState });
    const estimates = measurements.map(m => filter.process(m, new Date()).value);
    
    expect(variance(estimates)).toBeLessThan(variance(measurements));
    expect(estimates[estimates.length - 1]).toBeCloseTo(trueValue, 0);
  });

  it("should maintain state between measurements", () => {
    const config = { type: FilterType.Kalman, q: 0.01, r: 0.1 };
    const initialState = {
      type: FilterType.Kalman,
      estimate: 0,
      errorCovariance: 1
    };

    const filter = createFilter({ config, initialState });
    const firstResult = filter.process(10, new Date());
    const secondResult = filter.process(10, new Date());

    expect(secondResult.value).toBeGreaterThan(firstResult.value);
    expect(secondResult.state.errorCovariance).toBeLessThan(firstResult.state.errorCovariance);
  });
});