import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createApp} from '../src/server.js';
import {createStore} from '../src/core.js';
import {createOperatorAuth,passwordHash} from '../src/auth.js';
const store=createStore();const origin='http://127.0.0.1:3084';
const simulatedGemini=process.env.GSW_TEST_GEMINI==='1';
const app=createApp({fetcher:async()=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'Sugestão simulada para o escritório fictício: quais canais geram visitas ao seu site?'}]}}]})}),adminKey:'local-test-admin-123456789',metaSecret:'test',verifyToken:'test',store,aiConfig:{geminiApiKey:simulatedGemini?'fake-ui-test':''},operatorAuth:createOperatorAuth({username:'tester',passwordScrypt:await passwordHash('test-password-only-123'),origin,secure:false})});
await new Promise(r=>app.listen(3084,'127.0.0.1',r));
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [360,1440]){
 const context=await browser.newContext({viewport:{width,height:900},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('401'))errors.push(m.text())});
 await page.goto(origin);await page.locator('#username').fill('tester');await page.locator('#password').fill('test-password-only-123');await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.locator('#auth-screen').waitFor({state:'hidden'});
 const phone='00000004'+width;await page.locator('#phone').fill(phone);await page.locator('#open').click();await page.locator('#active-label').filter({hasText:phone}).waitFor();await page.locator('#lead').fill('Quero melhorar o site do meu escritório de advocacia');await page.locator('#generate').click();await page.locator('#copy').waitFor({state:'visible'});await page.waitForFunction(()=>!document.getElementById('copy').disabled);
 assert.equal(store.get(phone).mode,'HUMAN');assert.match(await page.locator('#provider').innerText(),simulatedGemini?/Gemini · IA generativa/:/Regras locais/);assert.ok(await page.locator('#answer').inputValue());
 await page.locator('#answer').fill('Podemos avaliar seu site atual. Você já acompanha as visitas?');await page.locator('#save').click();await page.waitForFunction(()=>!document.getElementById('save').disabled);assert.equal(store.get(phone).drafts.filter(x=>x.status==='PENDING_REVIEW')[0].text,'Podemos avaliar seu site atual. Você já acompanha as visitas?');
 await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('copiada'));assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/avaliar seu site/);
 await page.locator('#regen').click();await page.waitForFunction(()=>!document.getElementById('regen').disabled);assert.equal(store.get(phone).messages.length,1);
 await page.screenshot({path:'test-results/v4-'+(simulatedGemini?'simulated-gemini-':'rules-')+width+'.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+width);
 await page.reload();await page.locator('#conversation').selectOption(phone);await page.waitForFunction(()=>document.getElementById('active-label').textContent.includes('Conversa ativa'));
 assert.ok(await page.locator('#answer').inputValue());
 await page.locator('#lead').fill('Não me envie mais mensagens');await page.locator('#generate').click();await page.waitForFunction(()=>!document.getElementById('generate').disabled);assert.equal(store.get(phone).optedOut,true);assert.equal(await page.locator('#copy').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log('UI PASS',simulatedGemini?'SIMULATED_GEMINI':'RULES',width,'login/HUMAN/edit/copy/regenerate/reload/optout/no-overflow/CSP');await context.close();
 }
}finally{await browser.close();await new Promise(r=>app.close(r))}
