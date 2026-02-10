const http = require('http');

function test(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'localhost', port: 8085, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(opts, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => { console.log(`${method} ${path} => ${res.statusCode}: ${b.substring(0, 200)}`); resolve(); });
    });
    req.on('error', e => { console.log(`ERR: ${e.message}`); resolve(); });
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  await test('POST', '/api/opportunities/apply', { email: 'test@test.com', opportunityId: 'opp-1' });
  await test('POST', '/api/feed/posts/69897d3bb2938e1ef65020cf/like', { email: 'test@test.com' });
  await test('POST', '/api/projects/69897d3cb2938e1ef65020d5/join', { email: 'test@test.com', role: 'Frontend', message: 'hi' });
  await test('GET', '/api/projects?email=test@test.com', null);
})();
