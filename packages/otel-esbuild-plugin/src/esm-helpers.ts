import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

export function getDirname(): string {
    //@ts-ignore
  return path.dirname(fileURLToPath(import.meta.url));
}

export function requireResolve(specifier: string, options?: { paths?: string[] }): string {
 //@ts-ignore
    const req = createRequire(import.meta.url);
  return options ? req.resolve(specifier, options) : req.resolve(specifier);
}
