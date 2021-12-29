import { diag } from '@opentelemetry/api';
import { ProfilingData, ProfilingExporter } from './types';
import * as fs from 'fs';

export interface DebugExporterOptions {}

export class DebugExporter implements ProfilingExporter {
  runTimestamp = Date.now();
  profileIndex = 0;

  constructor(options: DebugExporterOptions) {

  }

  send(data: ProfilingData) {
    const baseName = `profile-${this.runTimestamp}-${this.profileIndex++}.json`;
    fs.writeFile(baseName, JSON.stringify(data), err => {
      if (err) {
        diag.error(`error writing to ${baseName}`, err);
      }
    });
  }
}
