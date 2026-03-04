
export enum FilterType {
  SMA = "SMA",
  EMA = "EMA",
  Kalman = "Kalman",
}

export interface SMAConfig {
  readonly type: FilterType.SMA;
  readonly windowSize: number;
}

export interface EMAConfig {
  readonly type: FilterType.EMA;
  readonly alpha?: number;
  readonly windowSize?: number;
}

export interface KalmanFilterConfig {
  readonly type: FilterType.Kalman;
  readonly q: number;
  readonly r: number;
}

export type FilterConfig = SMAConfig | EMAConfig | KalmanFilterConfig;

export interface SMAState {
  readonly type: FilterType.SMA;
  readonly window: readonly number[];
}

export interface EMAState {
  readonly type: FilterType.EMA;
  readonly previousEMA: number;
}

export interface KalmanState {
  readonly type: FilterType.Kalman;
  readonly estimate: number;
  readonly errorCovariance: number;
}

export type FilterState = SMAState | EMAState | KalmanState;

export interface SensorDataResult<T extends FilterState> {
  readonly value: number;
  readonly timestamp: Date;
  readonly state: T;
}

export interface FilterInitializationParams {
  readonly config: FilterConfig;
  readonly initialState: FilterState;
}

// For consumers who want to track full history
export interface SensorDataPoint<T extends FilterState> extends SensorDataResult<T> {
  readonly rawValue: number;
}

// For error handling in processing pipeline
export type ProcessingResult<T extends FilterState> =
  | { success: true; result: SensorDataResult<T> }
  | { success: false; error: Error; timestamp: Date };