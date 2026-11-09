import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, MODES, normalizePhone } from '../src/core.js';
test('normaliza telefone', () => {
  assert.equal(normalizePhone('+55 (11) 99999-9999'), '5511999999999');
  assert.equal(normalizePhone('abc'), null);
});
test('modo humano por padrao e recebimento em memoria', () => {
  const s = createStore(); const phone = '5511999999999';
  assert.equal(s.get(phone).mode, MODES.HUMAN);
  assert.equal(s.ingest({phone, id:'m1', text:'Oi'}).accepted, true);
  assert.equal(s.get(phone).messages.length, 1);
});
test('deduplica mensagem', () => {
  const s = createStore(); const m = {phone:'5511999999999', id:'m1', text:'Oi'};
  assert.equal(s.ingest(m).accepted, true);
  assert.equal(s.ingest(m).accepted, false);
  assert.equal(s.get(m.phone).messages.length, 1);
});
test('pedido de humano prevalece sobre IA', () => {
  const s = createStore(); const ph = '5511999999999';
  s.setMode(ph, MODES.AI_ACTIVE); const prior = s.get(ph).version;
  s.ingest({phone:ph, id:'m1', text:'Quero falar com atendente'});
  assert.equal(s.get(ph).mode, MODES.HANDOFF_PENDING);
  assert.ok(s.get(ph).version > prior);
});
test('nao permite modos arbitrarios', () => {
  assert.throws(() => createStore().setMode('5511999999999', 'AUTO'), /Modo invalido/);
});
