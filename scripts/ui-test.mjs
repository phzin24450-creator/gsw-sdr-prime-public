import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {createStore} from '../src/core.js';
import {createOperatorAuth,passwordHash} from '../src/auth.js';
const store=createStore();const origin='http://127.0.0.1:3084';
const simulatedGemini=process.env.GSW_TEST_GEMINI==='1';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5v8AAAAASUVORK5CYII=', 'base64');
const mockResponse = async (_url, options) => {
 const parts = JSON.parse(options.body).contents[0].parts;
 const text = parts[0].inlineData ? JSON.stringify({
  company: {value:'Ateliê Inventado',evidence:'Ateliê Inventado'},
  sector: {value:'',evidence:''}, intent: {value:'',evidence:''}, opportunity: {value:'',evidence:''},
  uncertainOrder:true, restrictionEvidence:'',
  messages:[{direction:'unknown',time:'09:00',text:'Quero melhorar meu site.',source:1,cropped:false}]
 }) : 'Sugestão simulada para o escritório fictício: quais canais geram visitas ao seu site?';
 return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})};
};
const app=createApp({fetcher:mockResponse,adminKey:'local-test-admin-123456789',metaSecret:'test',verifyToken:'test',store,aiConfig:{geminiApiKey:simulatedGemini?'fake-ui-test':''},operatorAuth:createOperatorAuth({username:'tester',passwordScrypt:await passwordHash('test-password-only-123'),origin,secure:false})});
await new Promise(r=>app.listen(3084,'127.0.0.1',r));
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.GSW_TEST_CHROMIUM});
try{
 for(const width of [360,1440]){
 const context=await browser.newContext({viewport:{width,height:900},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('401'))errors.push(m.text())});
 await page.goto(origin);await page.locator('#username').fill('tester');await page.locator('#password').fill('test-password-only-123');await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.locator('#auth-screen').waitFor({state:'hidden'});
 const phone='00000004'+width;await page.locator('#phone').fill(phone);await page.locator('#open').click();await page.locator('#active-label').filter({hasText:phone}).waitFor();await page.locator('#lead').fill('Quero melhorar o site do meu escritório de advocacia');await page.locator('#generate').click();await page.locator('#copy').waitFor({state:'visible'});await page.waitForFunction(()=>!document.getElementById('copy').disabled);
 assert.equal(store.get(phone).mode,'HUMAN');assert.match(await page.locator('#provider').innerText(),simulatedGemini?/Gemini · IA generativa/:/Regras locais/);assert.ok(await page.locator('#answer').inputValue());
 await page.locator('#answer').fill('Podemos avaliar seu site atual. Você já acompanha as visitas?');await page.locator('#save').click();await page.waitForFunction(()=>!document.getElementById('save').disabled);assert.equal(store.get(phone).drafts.filter(x=>x.status==='PENDING_REVIEW')[0].text,'Podemos avaliar seu site atual. Você já acompanha as visitas?');
 const countBeforeCopy=store.get(phone).drafts.length;
 await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('copiada'));assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/avaliar seu site/);assert.equal(store.get(phone).drafts.length,countBeforeCopy);
 await page.getByText('Avaliar sugestão',{exact:true}).click();await page.locator('#quality-feedback').selectOption('boa');await page.locator('#record-feedback').click();await page.getByText('Avaliação registrada para análise da equipe.').first().waitFor();
 await page.locator('#regen').click();await page.waitForFunction(()=>!document.getElementById('regen').disabled);assert.equal(store.get(phone).messages.length,1);
 await page.screenshot({path:'test-results/v4-'+(simulatedGemini?'simulated-gemini-':'rules-')+width+'.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+width);
 await page.reload();await page.locator('#conversation').selectOption(phone);await page.waitForFunction(()=>document.getElementById('active-label').textContent.includes('Conversa ativa'));
 assert.ok(await page.locator('#answer').inputValue());
 await page.locator('#lead').fill('Não me envie mais mensagens');await page.locator('#generate').click();await page.waitForFunction(()=>!document.getElementById('generate').disabled);assert.equal(store.get(phone).optedOut,true);assert.equal(await page.locator('#copy').isDisabled(),true);
 await page.locator('#conversation-status').selectOption('optout');
 await page.waitForFunction(()=>document.querySelectorAll('#conversation option').length>1);
 assert.ok((await page.locator('#conversation').innerText()).includes('Recusa / opt-out'));
 await page.locator('#conversation-status').selectOption('all');
 await page.locator('#phone').fill('00000005'+width);await page.locator('#open').click();await page.locator('#active-label').filter({hasText:'00000005'+width}).waitFor();await page.locator('#opening').click();await page.waitForFunction(()=>!document.getElementById('copy').disabled);assert.equal(store.get('00000005'+width).messages.length,0);assert.equal(store.get('00000005'+width).drafts[0].intent,'OPENING');
 const countBeforeVisual=store.list().length;
 await page.locator('#standalone-opening summary').click();
 await page.locator('#standalone-generate').click();
 await page.waitForFunction(()=>!document.getElementById('standalone-copy').disabled);
 await page.locator('#standalone-copy').click();
 await page.locator('#standalone-status').filter({hasText:'copiada'}).waitFor();
 assert.ok(await page.evaluate(()=>navigator.clipboard.readText()));
 await page.locator('#standalone-opening summary').click();
 if(simulatedGemini){
  await page.locator('#visual-copilot summary').click();
  await page.locator('#visual-images').setInputFiles({name:'print-ficticio.png',mimeType:'image/png',buffer:png});
  await page.locator('#visual-consent').check();
  await page.locator('#visual-analyze').click();
  await page.locator('#visual-review').waitFor();
  assert.equal(await page.locator('#visual-sector').inputValue(),'Desconhecido');
  assert.equal(await page.locator('#visual-draft').isDisabled(),true);
  await page.locator('#visual-company').fill('Ateliê Corrigido');
  await page.locator('#visual-messages').fill('lead | Quero melhorar meu site.');
  await page.locator('#visual-confirm').check();
  await page.locator('#visual-draft').click();
  await page.waitForFunction(()=>!document.getElementById('visual-copy').disabled);
  await page.locator('#visual-answer').fill('Qual parte do seu site vocês gostariam de melhorar?');
  await page.locator('#visual-copy').click();
  await page.locator('#visual-status').filter({hasText:'copiada'}).waitFor();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/parte do seu site/);
  let whatsappRequest;
  await context.route('https://wa.me/**',async route=>{whatsappRequest={url:route.request().url(),method:route.request().method()};await route.fulfill({status:200,contentType:'text/html',body:'<p>WhatsApp fictício interceptado. Nenhuma rede externa.</p>'});});
  const beforeManual=JSON.stringify(store.list().map(c=>store.get(c.id).messages));
  const popupPromise=context.waitForEvent('page');
  await page.locator('#visual-whatsapp').click();
  const popup=await popupPromise;await popup.waitForLoadState();await popup.close();
  await page.waitForFunction(()=>document.getElementById('visual-status').textContent.includes('Nenhum envio'));
  assert.equal(whatsappRequest?.method,'GET');
  assert.equal(new URL(whatsappRequest.url).searchParams.get('text'),'Qual parte do seu site vocês gostariam de melhorar?');
  assert.equal(JSON.stringify(store.list().map(c=>store.get(c.id).messages)),beforeManual);
  await page.screenshot({path:'test-results/v4-visual-'+width+'.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Visual sem rolagem horizontal '+width);
 }
 assert.equal(store.list().length,countBeforeVisual);
 const activeId=await page.locator('#phone').inputValue();
 await page.locator('#archive-conversation').click();
 await page.locator('#archive-conversation').filter({hasText:'Restaurar'}).waitFor();
 assert.equal(store.list().some(c=>c.id===activeId),false);
 await page.locator('#show-archived').check();
 await page.locator('#conversation option[value="'+activeId+'"]').waitFor({state:'attached'});
 await page.locator('#archive-conversation').click();
 await page.locator('#archive-conversation').filter({hasText:'Arquivar'}).waitFor();
 assert.equal(store.list().some(c=>c.id===activeId),true);
 assert.deepEqual(errors,[]);console.log('UI PASS',simulatedGemini?'SIMULATED_GEMINI':'RULES',width,'login/HUMAN/edit/copy/regenerate/reload/optout/no-overflow/CSP/abordagem-sem-telefone/arquivo'+(simulatedGemini?'/revisão-visual':''));await context.close();
 }
}finally{await browser.close();await new Promise(r=>app.close(r))}
