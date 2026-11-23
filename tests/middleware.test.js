const test = require('node:test');
const assert = require('node:assert/strict');
const validateTask = require('../backend/middleware/validateTask');
const authorizeRoles = require('../backend/middleware/authorizeRoles');

function responseMock() {
    return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('validación: rechaza título vacío', () => {
    const req = { method: 'POST', body: { title: '   ' } };
    const res = responseMock(); let called = false;
    validateTask(req, res, () => { called = true; });
    assert.equal(res.statusCode, 400);
    assert.equal(called, false);
});

test('validación: acepta una tarea válida', () => {
    const req = { method: 'POST', body: { title: 'Preparar entrega', description: 'Revisar pruebas' } };
    const res = responseMock(); let called = false;
    validateTask(req, res, () => { called = true; });
    assert.equal(called, true);
    assert.equal(res.statusCode, 200);
});

test('roles: bloquea a usuario estándar en ruta administrativa', () => {
    const req = { user: { id: '123', role: 'user' } };
    const res = responseMock(); let called = false;
    authorizeRoles('admin')(req, res, () => { called = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
});

test('roles: permite al administrador', () => {
    const req = { user: { id: '123', role: 'admin' } };
    const res = responseMock(); let called = false;
    authorizeRoles('admin')(req, res, () => { called = true; });
    assert.equal(called, true);
});
