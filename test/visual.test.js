import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeVisual, createVisualReview, draftVisual } from '../src/visual.js';
import { createApp } from '../src/server.js';
import { createStore } from '../src/core.js';

const PNG = { mimeType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5v8AAAAASUVORK5CYII=' };
const JPEG = { mimeType: 'image/jpeg', data: '/9j/AA==' };
const config = { geminiApiKey: 'fictitious-test-key' };
const row = (text, fields = {}) => ({ text, source: 1, time: '10:00', direction: 'inbound', cropped: false, ...fields });
const sample = {
  company: { value: 'Ateliê Inventado', evidence: 'Ateliê Inventado' },
  sector: { value: 'móveis sob medida', evidence: 'fabricamos móveis sob medida' },
  intent: { value: 'organizar orçamento', evidence: 'queremos organizar os orçamentos' },
  opportunity: { value: 'painel de orçamentos', evidence: 'queremos organizar os orçamentos' },
  uncertainOrder: false, restrictionEvidence: '',
  messages: [
    row('Como funciona o atendimento?', { direction: 'outbound', time: '09:59' }),
    row('Aqui fabricamos móveis sob medida e queremos organizar os orçamentos.')
  ]
};
const complete = text => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }] }) });
const mock = value => async () => complete(JSON.stringify(value));
const analyze = (value, images = [PNG]) => analyzeVisual({ consent: true, images }, config, mock(value));

test('análise multimodal envia imagens únicas e separa evidência visível de hipóteses', async () => {
  const result = await analyzeVisual({ consent: true, images: [PNG, PNG] }, config, async (url, options) => {
    assert.match(url, /models\/gemini-.*:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], config.geminiApiKey);
    const body = JSON.parse(options.body);
    assert.deepEqual(body.contents[0].parts, [{ inlineData: PNG }]);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    return complete(JSON.stringify(sample));
  });
  assert.equal(result.company.status, 'visible');
  assert.equal(result.sector.status, 'hypothesis');
  assert.equal(result.intent.value, 'organizar orçamento');
  assert.equal(result.opportunity.value, 'painel de orçamentos');
  assert.deepEqual(result.messages.map(m => m.direction), ['outbound', 'inbound']);
});

test('print cortado, remetente incerto e ordem fora de sequência exigem revisão', async () => {
  const result = await analyze({
    ...sample, company: { value: 'Empresa Imaginada', evidence: '' },
    messages: [row('Quero um [trecho cortado]', { time: '11:02', cropped: true }), row('Oi', { time: '11:00', direction: 'unknown' })]
  });
  assert.equal(result.uncertainOrder, true);
  assert.equal(result.messages[0].time, '11:02');
  assert.equal(result.messages[1].direction, 'unknown');
  assert.equal(result.company.value, 'Desconhecido');
  for (const key of ['sector', 'intent', 'opportunity']) assert.equal(result[key].status, 'unknown');
  assert.match(result.messages[0].text, /trecho cortado/);
  await assert.rejects(draftVisual({ reviewed: true, messages: result.messages }), /remetente/);
});

test('deduplica sobreposição com horário sem apagar repetições do mesmo print ou sem horário', async () => {
  const message = row('Vocês têm site?');
  const result = await analyze({
    ...sample, messages: [message, message, { ...message, source: 2 },
      row('Sim', { time: '' }), row('Sim', { source: 2, time: '' })]
  }, [PNG, JPEG]);
  assert.deepEqual(result.messages.map(item => item.text), ['Vocês têm site?', 'Vocês têm site?', 'Sim', 'Sim']);
});

test('oculta dados pessoais na leitura e no texto revisado enviado para geração', async () => {
  const privateText = 'Meu número é +55 (00) 91234-5678, e-mail ficticio@example.invalid, CPF 000.000.000-00.';
  const result = await analyze({ ...sample, messages: [row(privateText)] });
  assert.equal(result.messages[0].text.match(/\[dado oculto\]/g).length, 3);
  const draft = await draftVisual({ reviewed: true, messages: [row(privateText)] }, {
    config, fetcher: async (_url, options) => {
      assert.doesNotMatch(options.body, /example.invalid|91234|000\.000\.000/);
      return complete('Qual processo vocês gostariam de organizar primeiro?');
    }
  });
  assert.equal(draft.provider, 'gemini');
});

test('consentimento, formato, tamanho e falha do provedor são tratados antes da revisão', async () => {
  const never = () => assert.fail('não deveria chamar Gemini');
  await assert.rejects(analyzeVisual({ images: [PNG] }, config, never), /Confirme/);
  await assert.rejects(analyzeVisual({ consent: true, images: [PNG, PNG, PNG, PNG, PNG] }, config, never), /1 a 4/);
  await assert.rejects(analyzeVisual({ consent: true, images: [{ ...PNG, mimeType: 'image/jpeg' }] }, config, never), /válidos/);
  await assert.rejects(analyzeVisual({ consent: true, images: [{ ...PNG, data: 'A'.repeat(4194305) }] }, config, never), /3 MB/);
  await assert.rejects(analyzeVisual({ consent: true, images: [PNG] }, { geminiApiKey: '' }, never), /indisponível/);
  await assert.rejects(analyzeVisual({ consent: true, images: [PNG] }, config, async () => ({ ok: false, status: 429 })), /HTTP 429/);
  await assert.rejects(analyzeVisual({ consent: true, images: [PNG] }, config, async () => complete('{')), /leitura completa/);
});

test('bloqueia recusa, opt-out, pedido humano e último turno do SDR', async () => {
  const never = () => assert.fail('não deveria gerar texto');
  for (const text of ['Não, obrigada.', 'Parem de me mandar mensagens.', 'Quero falar com uma pessoa', 'Pode retirar meu contato']) {
    assert.equal((await analyze({ ...sample, messages: [row(text)] })).blocked, true);
    await assert.rejects(draftVisual({ reviewed: true, messages: [row(text), row('Quanto custa?')] }, { config, fetcher: never }), /bloqueada|Nenhuma abordagem/);
  }
  const semantic = 'Favor não retomar esta negociação.';
  assert.equal((await analyze({ ...sample, restrictionEvidence: semantic, messages: [row(semantic)] })).blocked, true);
  assert.equal((await analyze({ ...sample, messages: [row('Não, obrigado.', { direction: 'outbound' })] })).blocked, false);
  await assert.rejects(draftVisual({ reviewed: true, messages: [...sample.messages, row('Fico no aguardo', { direction: 'outbound' })] }, { config, fetcher: never }), /última mensagem/);
});

test('token de revisão protege restrição original e vincula o operador', () => {
  const reviews = createVisualReview();
  const token = reviews.issue(true, 'pedro-teste');
  assert.equal(reviews.verify(token, 'pedro-teste'), true);
  assert.throws(() => reviews.verify(token.replace('.1.', '.0.'), 'pedro-teste'), /inválida/);
  assert.throws(() => reviews.verify(token, 'outro'), /inválida/);
});

test('rotas exigem autorização e revisão, preservam correções e não criam contato ou envio', async t => {
  const key = 'admin-apenas-teste-visual-12345';
  const store = createStore();
  const server = createApp({
    adminKey: key, metaSecret: 'fake', verifyToken: 'fake', store, aiConfig: config,
    fetcher: async (_url, options) => {
      const body = JSON.parse(options.body);
      if (body.contents[0].parts[0].inlineData) return complete(JSON.stringify(sample));
      const input = JSON.parse(body.contents[0].parts[0].text);
      if (input.intent !== 'OPENING') {
        assert.equal(input.commercialContext.company, 'Empresa corrigida');
        assert.equal(input.commercialContext.sector, undefined);
        assert.equal(input.history[1].text, 'Quero organizar a fila.');
        assert.equal(input.handoffAccepted, false);
      }
      return complete('Qual etapa da operação vocês gostariam de organizar primeiro?');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = 'http://127.0.0.1:' + server.address().port;
  const post = (path, body, authenticated = true) => fetch(url + '/api/visual/' + path, {
    method: 'POST', headers: { 'content-type': 'application/json', ...(authenticated ? { authorization: 'Bearer ' + key } : {}) },
    body: JSON.stringify(body)
  });
  const input = { consent: true, images: [PNG] };
  assert.equal((await post('analyze', input, false)).status, 401);
  const analysis = await (await post('analyze', input)).json();
  const draft = { reviewToken: analysis.reviewToken, company: 'Empresa corrigida', sector: 'Desconhecido',
    messages: [row('Qual sua prioridade?', { direction: 'outbound' }), row('Quero organizar a fila.')] };
  assert.equal((await post('draft', draft)).status, 400);
  const generated = await post('draft', { ...draft, reviewed: true });
  assert.equal(generated.status, 200);
  assert.equal((await generated.json()).provider, 'gemini');
  assert.equal((await post('draft', { ...draft, reviewed: true, reviewToken: '' })).status, 400);
  assert.equal((await post('opening', { reviewed: true })).status, 200);
  assert.deepEqual(store.list(), []);
});
