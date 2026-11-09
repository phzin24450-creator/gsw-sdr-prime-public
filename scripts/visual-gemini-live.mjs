import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { analyzeVisual, draftVisual } from '../src/visual.js';
import { fold } from '../src/intent.js';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY ausente no ambiente isolado. Nenhuma chamada autenticada foi feita.');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.GSW_TEST_CHROMIUM });
try {
  const page = await browser.newPage({ viewport: { width: 650, height: 440 } });
  async function print(company, messages, cropped = false) {
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
    return { mimeType: 'image/png', data: data.toString('base64') };
  }

  const company = 'Oficina Fictícia Pinhal Azul';
  const initial = await print(company, [['sdr', '10:02', 'Qual processo vocês querem organizar?'],
    ['lead', '10:03', 'Fabricamos móveis sob medida e fazemos orçamentos por planilha.']]);
  const continuation = await print(company, [['lead', '10:03', 'Fabricamos móveis sob medida e fazemos orçamentos por planilha.'],
    ['lead', '10:04', 'Quero saber se um painel ajuda a acompanhar os orçamentos.']]);
  const full = await analyzeVisual({ consent: true, images: [continuation, initial, initial] });
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
  const reply = await draftVisual({ reviewed: true, company, sector: full.sector.value, messages: reviewed });
  assert.equal(reply.provider, 'gemini');
  assert.match(fold(reply.text), /orcament|planilha|painel/);
  console.log('PASS Gemini real · empresa, nicho, papéis, ordem, deduplicação, intenção, oportunidade e rascunho.');

  const cropped = await print('Cabeçalho fora do recorte', [
    ['lead', '11:05', 'Vocês podem me explicar como funciona?'],
    ['lead', '11:06', 'Também queria saber se existe uma opção para']
  ], true);
  const incomplete = await analyzeVisual({ consent: true, images: [cropped] });
  assert.equal(incomplete.company.status, 'unknown');
  assert.equal(incomplete.sector.status, 'unknown');
  console.log('PASS Gemini real · print cortado, empresa e nicho desconhecidos.');

  const optOut = await print('Contato fictício', [
    ['lead', '12:00', 'Não me envie mais mensagens, por favor.'],
    ['lead', '12:01', 'O e-mail fictício é teste@example.invalid.']
  ]);
  const blocked = await analyzeVisual({ consent: true, images: [optOut] });
  assert.equal(blocked.blocked, true);
  assert.doesNotMatch(JSON.stringify(blocked), /teste@example\.invalid/);
  await assert.rejects(draftVisual({ reviewed: true, messages: blocked.messages }, { blocked: blocked.blocked }), /Nenhuma abordagem/);
  console.log('PASS Gemini real · opt-out, dado fictício mascarado e geração bloqueada.');
} finally {
  await browser.close();
}
