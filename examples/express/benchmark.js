const axios = require('axios');
setTimeout(async () => {
console.log(`\nTesting performance...`);

try {
    // Warmup
    console.log('Warmup...');
    for (let i = 0; i < 10; i++) {
    await axios.get(`http://localhost/animal`);
    }
    
    // Performance test
    console.log('Running 1000 requests...');
    const startTotal = performance.now();
    
    for (let i = 0; i < 1000; i++) {
    await axios.get(`http://localhost/animal`);
    }

    const endTotal = performance.now();
    const totalDuration = endTotal - startTotal;
    const throughput = 1000 / (totalDuration / 1000); 

    console.log(`\nResults:`);
    console.log(`Total duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
    console.log(`Avg per request: ${(totalDuration / 1000).toFixed(2)}ms`);
    
} catch (err) {
    console.error('Test failed:', err.message);
}
}, 2000);

