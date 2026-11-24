import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

describe('API Endpoints', () => {
  it('GET /health deve responder 200 ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
  });

  it('GET /sum deve somar dois números corretamente', async () => {
    const res = await fetch(`${baseUrl}/sum?a=4&b=6`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.result, 10);
  });

  it('GET /sum deve devolver 400 se faltar um número', async () => {
    const res = await fetch(`${baseUrl}/sum?a=4`);
    assert.equal(res.status, 400);
    assert.ok((await res.json()).error);
  });

  for (const qs of ['a=abc&b=1', 'a=1&b=', 'a=Infinity&b=1', '']) {
    it(`GET /sum?${qs} deve devolver 400`, async () => {
      const res = await fetch(`${baseUrl}/sum?${qs}`);
      assert.equal(res.status, 400);
    });
  }
});