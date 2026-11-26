import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { analyzeVisual, draftVisual } from '../src/visual.js';
import { fold } from '../src/intent.js';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY ausente no ambiente isolado. Nenhuma chamada autenticada foi feita.');
  process.exit(1);
}

const evidenceDir = new URL('../test-results/gemini-v42-live/', import.meta.url);
await mkdir(evidenceDir, { recursive: true });
async function record(name, data) {
  await writeFile(new URL(name + '.json', evidenceDir), JSON.stringify(data, null, 2) + '\n');
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.GSW_TEST_CHROMIUM });
try {
  const page = await browser.newPage({ viewport: { width: 650, height: 440 } });
  async function print(name, company, messages, cropped = false) {
    await page.setContent(`<style>
      body{margin:0;background:#e7ded2;font:22px Arial;color:#17252a}
      header{padding:20px;background:#075e54;color:white;font-weight:bold}
      main{display:flex;flex-direction:column;gap:12px;padding:22px;overflow:hidden}
      .bubble{background:white;border-radius:10px;padding:12px;max-width:75%;align-self:flex-start}
      .sdr{background:#dcf8c6;align-self:flex-end} small{font-size:15px;display:block;text-align:right}
    </style><header></header><main></main>`);
    await page.evaluate(({ company, messages }) => {
      document.querySelector('header').textContent = company;
      for (const [side, time, text] of messages) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble ' + side;
        bubble.textContent = text;
        const clock = document.createElement('small');
        clock.textContent = time;
        bubble.append(clock);
        document.querySelector('main').append(bubble);
      }
    }, { company, messages });
    const data = await page.screenshot(cropped ? { clip: { x: 0, y: 76, width: 650, height: 106 } } : {});
    await writeFile(new URL(name + '.png', evidenceDir), data);
    return { mimeType: 'image/png', data: data.toString('base64') };
  }

  const company = 'Oficina Fictícia Pinhal Azul';
  const initial = await print('01-inicio', company, [['sdr', '10:02', 'Qual processo vocês querem organizar?'],
    ['lead', '10:03', 'Fabricamos móveis sob medida e fazemos orçamentos por planilha.']]);
  const continuation = await print('02-continuacao', company, [['lead', '10:03', 'Fabricamos móveis sob medida e fazemos orçamentos por planilha.'],
    ['lead', '10:04', 'Quero saber se um painel ajuda a acompanhar os orçamentos.']]);
  const full = await analyzeVisual({ consent: true, images: [continuation, initial, initial] });
  await record('01-extracao-completa', full);
  assert.match(fold(full.company.value), /pinhal azul/);
  assert.match(fold(full.sector.value), /mov|marcen|mobil/);
  assert.notEqual(full.intent.status, 'unknown');
  assert.notEqual(full.opportunity.status, 'unknown');
  assert.equal(full.messages.filter(row => fold(row.text).includes('por planilha')).length, 1);
  assert.deepEqual(full.messages.map(row => row.direction).sort(), ['inbound', 'inbound', 'outbound']);
  const times = full.messages.map(row => row.time);
  assert.ok(full.uncertainOrder || times.join(',') === '10:02,10:03,10:04');
  assert.equal(full.blocked, false);
  const reviewed = [...full.messages].sort((a, b) => a.time.localeCompare(b.time));
  const corrected = {
    reviewed: true,
    company: 'Marcenaria Fictícia Pinhal Azul',
    sector: 'Marcenaria sob medida',
    messages: reviewed.map((message, index) => index === reviewed.length - 1
      ? { ...message, text: 'Quero saber se um painel ajuda a acompanhar os orçamentos que estão aguardando retorno.' }
      : message)
  };
  await record('02-revisao-manual-sem-telefone', corrected);
  await assert.rejects(draftVisual({ ...corrected, reviewed: false }), /Confirme a revisão/);
  let sentToGemini = false;
  const reply = await draftVisual(corrected, {
    fetcher: async (url, options) => {
      const prompt = JSON.parse(options.body);
      assert.match(options.body, /Marcenaria Fictícia Pinhal Azul/);
      assert.match(options.body, /aguardando retorno/);
      assert.doesNotMatch(options.body, /"phone"|"telefone"/i);
      assert.ok(prompt.contents.length > 0);
      sentToGemini = true;
      return fetch(url, options);
    }
  });
  await record('03-resposta-comercial-completa', reply);
  assert.ok(sentToGemini);
  assert.equal(reply.provider, 'gemini');
  assert.match(fold(reply.text), /orcament|planilha|painel/);
  console.log('PASS Gemini real · empresa, nicho, papéis, ordem, deduplicação, intenção, oportunidade e rascunho.');

  const cropped = await print('03-recorte', 'Cabeçalho fora do recorte', [
    ['lead', '11:05', 'Vocês podem me explicar como funciona?'],
    ['lead', '11:06', 'Também queria saber se existe uma opção para']
  ], true);
  const incomplete = await analyzeVisual({ consent: true, images: [cropped] });
  await record('04-extracao-do-recorte', incomplete);
  assert.equal(incomplete.company.status, 'unknown');
  assert.equal(incomplete.sector.status, 'unknown');
  console.log('PASS Gemini real · print cortado, empresa e nicho desconhecidos.');

  const optOut = await print('04-opt-out', 'Contato fictício', [
    ['lead', '12:00', 'Não me envie mais mensagens, por favor.'],
    ['lead', '12:01', 'O e-mail fictício é teste@example.invalid.']
  ]);
  const blocked = await analyzeVisual({ consent: true, images: [optOut] });
  await record('05-extracao-opt-out', blocked);
  assert.equal(blocked.blocked, true);
  assert.doesNotMatch(JSON.stringify(blocked), /teste@example\.invalid/);
  const neverGenerate = () => assert.fail('O bloqueio deveria impedir a chamada de geração.');
  await assert.rejects(draftVisual({
    reviewed: true, messages: blocked.messages.map(message => ({ ...message, direction: 'inbound' }))
  }, { blocked: blocked.blocked, fetcher: neverGenerate }), /Nenhuma abordagem/);
  console.log('PASS Gemini real · opt-out, dado fictício mascarado e geração bloqueada.');

  const refusal = await print('05-recusa', 'Contato fictício', [
    ['sdr', '13:00', 'Querem conhecer uma opção de painel?'],
    ['lead', '13:01', 'Não tenho interesse. Obrigado.']
  ]);
  const refused = await analyzeVisual({ consent: true, images: [refusal] });
  await record('06-extracao-recusa', refused);
  assert.equal(refused.blocked, true);
  await assert.rejects(draftVisual({
    reviewed: true, messages: [{ direction: 'inbound', text: 'Não tenho interesse. Obrigado.' }]
  }, { blocked: refused.blocked, fetcher: neverGenerate }), /Nenhuma abordagem/);
  await record('07-resultado', { status: 'pass', provider: full.provider, model: full.model,
    manualReview: true, phoneRequired: false, draftsBlocked: ['opt-out', 'recusa'],
    channel: 'rascunho para envio manual', sentMessages: 0 });
  console.log('PASS Gemini real · recusa bloqueada; nenhuma mensagem enviada.');
} finally {
  await browser.close();
}
