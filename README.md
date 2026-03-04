# 📡 sensor-smooth — Tame noisy sensor data with smooth precision

**Crush signal noise like a pro!** sensor-smooth is a zero-dependency toolkit for smoothing shaky sensor readings. Perfect for IoT devices, robotics, and any system dealing with real-world data jitters.

## 🚀 Quick Start

```typescript
// REMOVED external import: import { createFilter, FilterType } from 'sensor-smooth';

// Simple Moving Average (SMA)
const smaFilter = createFilter({
  filterType: FilterType.SMA,
  windowSize: 5,
  initialValue: 23.5
});

// Exponential Moving Average (EMA)
const emaFilter = createFilter({
  filterType: FilterType.EMA,
  smoothingFactor: 0.3,
  initialValue: 42
});

// Kalman Filter
const kalmanFilter = createFilter({
  filterType: FilterType.Kalman,
  processNoise: 0.01,
  measurementNoise: 0.1,
  initialEstimate: 50,
  initialError: 1
});

// Process data points
const rawData = [24.6, 25.1, 24.8, 24.9, 25.3];
let state = smaFilter.initialState;

for (const value of rawData) {
  const result = smaFilter.processData(value, state);
  console.log(`Raw: ${value} → Smooth: ${result.smoothedValue}`);
  state = result.newState;
}
```

## 📦 Installation

```bash
bun add sensor-smooth  # For Bun users
npm install sensor-smooth  # For Node.js warriors
```

## 📖 API Spotlight

### Core Function
```typescript
createFilter(params: FilterInitializationParams): FilterInstance
```

### Filter Configurations
**SMA** (Simple Moving Average):
```typescript
interface SMAConfig {
  windowSize: number;  // How many values to average
  initialValue: number;
}
```

**EMA** (Exponential Moving Average):
```typescript
interface EMAConfig {
  smoothingFactor: number;  // 0-1 (higher = faster response)
  initialValue: number;
}
```

**Kalman Filter**:
```typescript
interface KalmanFilterConfig {
  processNoise: number;     // System model confidence
  measurementNoise: number; // Sensor accuracy estimate
  initialEstimate: number;
  initialError: number;
}
```

## 🧠 Filter Selection Guide

- **SMA**: Your go-to for simple noise reduction. Best when:
  - Data doesn't change rapidly
  - You want simple, predictable smoothing
  - Processing power is limited

- **EMA**: Great for responsive systems. Choose when:
  - Recent data matters more than old
  - You need low memory usage
  - Quick adaptation is important

- **Kalman**: The heavy lifter. Use for:
  - Complex systems with known noise profiles
  - Predictive tracking of values
  - Fusion of multiple sensor inputs

## 🤝 Contributing

Found a bug? Have a killer feature idea? Let's make sensor-smooth better together!
1. Fork it 🍴
2. Code it 💻
3. Test it 🧪
4. PR it 🚀

We celebrate clear code and clear documentation!

## 📄 License

MIT Licensed — Go build something amazing!