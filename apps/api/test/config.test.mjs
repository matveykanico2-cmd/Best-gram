import test from 'node:test';
import assert from 'node:assert/strict';

test('api database schema is built', async () => {
  const module = await import('../dist/db/schema.js');
  assert.equal(typeof module.users, 'object');
});
