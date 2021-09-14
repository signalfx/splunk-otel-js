const http = require('http');
const assert = require('assert');
const util = require('util');

const request = (options) => {
	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
		  console.log(`STATUS: ${res.statusCode}`);
		  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		  res.setEncoding('utf8');
		  let data = '';
		  res.on('data', (chunk) => {
		  	data += chunk;
		    console.log(`BODY: ${chunk}`);
		  });
		  res.on('end', () => {
		  	resolve(data);
		    console.log('No more data in response.');
		  });
		}).end();
	});
};

const collectorUrl = new URL(process.env.COLLECTOR_URL ?? 'http://localhost:8378');
collectorUrl.searchParams.set('count', 5);
collectorUrl.searchParams.set('timeout', 8);
request(collectorUrl)
	.then((ret) => {
		const data = JSON.parse(ret);
		const getTags = (e) => {
			return Object.fromEntries(e.tags.map((t) => [t.key, t.vStr]));
		};
		console.log(
			data.map((e) => {
				const tags = getTags(e);
				return [e.operationName, tags['otel.library.name'], ...(e.references ?? [])];
			})
		);

		assert.strictEqual(data.length, 21);
		data.forEach((span) => {
			const tags = getTags(span);
			if (tags['otel.library.name'].match(/http/)) {
				return assert.match(span.operationName, /GET \//);
			} else if (tags['otel.library.name'].match(/express/)) {
				return assert.strictEqual(typeof tags['http.route'], 'string');
			}
			assert.fail(`Unknown lib: ${util.inspect(tags['otel.library.name'])}`);
		});
	});


setTimeout(() => {
	request(process.env.REQ_URL ?? 'http://localhost:8080/all');
}, 1000);
