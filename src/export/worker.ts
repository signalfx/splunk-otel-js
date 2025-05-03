import { parentPort } from 'node:worker_threads';

console.log('worker.js?', parentPort);
parentPort?.on('message', (data) => {
  console.log('worker received', data);
});
