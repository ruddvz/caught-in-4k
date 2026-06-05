const { describe, expect, it, beforeEach, afterEach } = require('@jest/globals');
const http = require('http');

describe('api-proxy POST /api/access/verify', () => {
    let server;
    let port;

    beforeEach(async () => {
        process.env.C4K_ACCESS_KEYS = 'abcd-1234-efgh';
        jest.resetModules();
        const { app } = require('../api-proxy');
        server = http.createServer(app);
        await new Promise((resolve) => {
            server.listen(0, '127.0.0.1', () => {
                port = server.address().port;
                resolve();
            });
        });
    });

    afterEach(async () => {
        delete process.env.C4K_ACCESS_KEYS;
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        jest.resetModules();
    });

    it('returns 400 for invalid body', async () => {
        const response = await fetch(`http://127.0.0.1:${port}/api/access/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });

    it('returns 403 for wrong key when gate enabled', async () => {
        const response = await fetch(`http://127.0.0.1:${port}/api/access/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'wrong-key-1234' }),
        });
        expect(response.status).toBe(403);
        const payload = await response.json();
        expect(payload.valid).toBe(false);
    });

    it('returns 200 for allowed key', async () => {
        const response = await fetch(`http://127.0.0.1:${port}/api/access/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'abcd-1234-efgh' }),
        });
        expect(response.status).toBe(200);
        const payload = await response.json();
        expect(payload.valid).toBe(true);
    });
});
