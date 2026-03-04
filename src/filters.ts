import {
  FilterType,
  type EMAConfig,
  type FilterConfig,
  type FilterInitializationParams,
  type KalmanFilterConfig,
  type KalmanState,
  type SensorDataPoint,
  type SMAConfig,
  type SMAState,
  type EMAState,
} from "./types";

class SMAFilter {
  private readonly config: SMAConfig;
  private state: SMAState;

  constructor(config: SMAConfig, initialState?: SMAState) {
    if (config.windowSize < 1) {
      throw new Error(`SMA windowSize must be ≥1, got ${config.windowSize}`);
    }

    this.config = config;
    this.state = initialState ?? { type: FilterType.SMA, window: [] };

    if (this.state.window.length > config.windowSize) {
      this.state = {
        ...this.state,
        window: this.state.window.slice(-config.windowSize),
      };
    }
  }

  process(rawValue: number, timestamp: Date): SensorDataPoint<SMAState> {
    const newWindow = [...this.state.window, rawValue].slice(-this.config.windowSize);
    const value = newWindow.reduce((a, b) => a + b, 0) / newWindow.length;

    this.state = { type: FilterType.SMA, window: newWindow };
    return { rawValue, value, timestamp, state: this.state };
  }
}

class EMAFilter {
  private readonly alpha: number;
  private state: EMAState;

  constructor(config: EMAConfig, initialState?: EMAState) {
    if (config.alpha === undefined && config.windowSize === undefined) {
      throw new Error("EMA requires alpha or windowSize");
    }

    let alpha = config.alpha;
    if (alpha === undefined) {
      if (config.windowSize! < 1) {
        throw new Error(`EMA windowSize must be ≥1, got ${config.windowSize}`);
      }
      alpha = 2 / (config.windowSize! + 1);
    } else if (alpha <= 0 || alpha >= 1) {
      throw new Error(`EMA alpha must be 0 < α < 1, got ${alpha}`);
    }

    this.alpha = alpha;
    this.state = initialState ?? { type: FilterType.EMA, previousEMA: NaN };
  }

  process(rawValue: number, timestamp: Date): SensorDataPoint<EMAState> {
    let value = rawValue;
    if (!isNaN(this.state.previousEMA)) {
      value = this.alpha * rawValue + (1 - this.alpha) * this.state.previousEMA;
    }

    this.state = { type: FilterType.EMA, previousEMA: value };
    return { rawValue, value, timestamp, state: this.state };
  }
}

class KalmanFilter {
  private readonly config: KalmanFilterConfig;
  private state: KalmanState;

  constructor(config: KalmanFilterConfig, initialState: KalmanState) {
    if (config.q <= 0 || config.r <= 0) {
      throw new Error(`Kalman Q and R must be >0, got Q=${config.q} R=${config.r}`);
    }

    this.config = config;
    this.state = initialState;
  }

  process(rawValue: number, timestamp: Date): SensorDataPoint<KalmanState> {
    const priorEstimate = this.state.estimate;
    const priorError = this.state.errorCovariance + this.config.q;

    const kalmanGain = priorError / (priorError + this.config.r);
    const newEstimate = priorEstimate + kalmanGain * (rawValue - priorEstimate);
    const newError = (1 - kalmanGain) * priorError;

    this.state = {
      type: FilterType.Kalman,
      estimate: newEstimate,
      errorCovariance: newError,
    };

    return { rawValue, value: newEstimate, timestamp, state: this.state };
  }
}

export function createFilter(params: FilterInitializationParams) {
  switch (params.config.type) {
    case FilterType.SMA:
      return new SMAFilter(params.config, params.initialState as SMAState);
    case FilterType.EMA:
      return new EMAFilter(params.config, params.initialState as EMAState);
    case FilterType.Kalman:
      return new KalmanFilter(params.config, params.initialState as KalmanState);
    default:
      throw new Error("Unsupported filter type");
  }
}