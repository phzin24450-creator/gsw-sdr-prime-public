import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {commercialPrompt} from '../src/commercial.js';
import {summarizeQualification} from '../src/qualification.js';
import {PRIME_POLICY} from '../src/brand.js';
test('Current identity and portfolio override legacy data without rewriting history',()=>{
 const c={context:{company:'Empresa fictícia',offer:'Automação antiga'},messages:[{direction:'outbound',text:'A GSW faz sistemas.'},{direction:'inbound',text:'Agora preciso de um site.'}]};
 const original=JSON.stringify(c);const p=commercialPrompt(c,{latest:{text:'Agora preciso de um site.'}});
 assert.match(p.system,/EXCLUSIVAMENTE sites profissionais e landing pages/);assert.match(p.system,/não alteram esta política atual/);
 assert.doesNotMatch(p.system,/A GSW/);assert.equal(JSON.stringify(c),original);
 assert.deepEqual(summarizeQualification(c).services,['Sites profissionais']);
});
test('Owner negotiates directly while optional human controls remain available',()=>{
 assert.match(PRIME_POLICY,/conduz diretamente diagnóstico, proposta, negociação e fechamento/);
 assert.match(PRIME_POLICY,/Não há encaminhamento obrigatório/);
});
test('Visible PRIME identity has no former commercial brand and includes favicon',async()=>{
 const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');
 assert.match(html,/<title>PRIME<\/title>/);assert.match(html,/rel="icon"/);assert.doesNotMatch(html,/GSW|Responsável de desenvolvimento/);
});
test('Qualification does not offer excluded services from old conversations',()=>{
 const c={messages:[{direction:'inbound',text:'Quero sistema, automação, SEO, tráfego e painel.'}]};
 assert.deepEqual(summarizeQualification(c).services,[]);
});
test('Sender identity is independent of the prospect company',()=>{
 const p=commercialPrompt({context:{company:'Brisa Técnica Fictícia'},messages:[]},{latest:{text:''},opening:true});
 assert.deepEqual(JSON.parse(p.input).senderIdentity,{name:'Pedro',company:'PRIME',role:'proprietário que conduz a negociação'});
});
