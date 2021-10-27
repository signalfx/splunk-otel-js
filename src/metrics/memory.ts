import * as process from 'process';

export interface MemoryInfo {
  rss: number,
  heapTotal: number;
  heapUsed: number;
}

export function collectMemoryInfo() {
  const usage = process.memoryUsage();

  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed
  };
}