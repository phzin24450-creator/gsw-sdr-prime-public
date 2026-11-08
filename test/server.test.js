import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createApp } from '../src/server.js';
import { createStore, MODES } from '../src/core.js';
const phone='5511999999999';
async function testServer(fn) {
  const store=createStore();
  const app=createApp({ adminKey:'testing-admin-secret-12345',metaSecret:'meta-secret',verifyToken:'verify-token',demo:true,store,aiConfig:{apiKey:''}});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  try {return await fn({url:'http://127.0.0.1:'+app.address().port,store})}
  finally { await new Promise(resolve=>app.close(resolve)); }
}
test('webhook valida challenge e assinatura de Meta',async()=>testServer(async({url,store})=>{
  const verify=await fetch(url+'/webhook/meta?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=12345');
  assert.equal(verify.status,200); assert.equal(await verify.text(),'12345');
  const payload={object:'whatsapp_business_account',entry:[{changes:[{field:'messages',value:{messages:[{id:'wamid.123',from:phone,type:'text',text:{body:'Oi'}}]}}]}]};
  const data=JSON.stringify(payload),signature='sha256='+createHmac('sha256','meta-secret').update(data).digest('hex');
  const rejected=await fetch(url+'/webhook/meta',{method:'POST',body:data,headers:{'content-type':'application/json','x-hub-signature-256':'sha256=deadbeef'}});
  assert.equal(rejected.status,401);
  const accepted=await fetch(url+'/webhook/meta',{method:'POST',body:data,headers:{'content-type':'application/json','x-hub-signature-256':signature}});
  assert.equal(accepted.status,200);assert.equal((await accepted.json()).accepted,1);
  const duplicate=await fetch(url+'/webhook/meta',{method:'POST',body:data,headers:{'content-type':'application/json','x-hub-signature-256':signature}});
  assert.equal((await duplicate.json()).accepted,0);
  assert.equal(store.get(phone).messages.length,1);
}));
test('painel exige chave e gera rascunho manual em HUMAN e AI_ACTIVE',async()=>testServer(async({url,store})=>{
  assert.equal((await fetch(url+'/api/conversations')).status,401);
  const headers={authorization:'Bearer testing-admin-secret-12345','content-type':'application/json'};
  const m=await fetch(url+'/api/demo/inbound',{method:'POST',headers,body:JSON.stringify({phone,id:'demo-1',text:'Qual valor do site?'})});
  assert.equal(m.status,200);
  const noDraft=await fetch(url+'/api/conversations/'+phone+'/draft',{method:'POST',headers});
  assert.equal((await noDraft.json()).created,true);
  assert.equal(store.get(phone).mode,MODES.HUMAN);
  const change=await fetch(url+'/api/conversations/'+phone+'/mode',{method:'POST',headers,body:JSON.stringify({mode:MODES.AI_ACTIVE})});
  assert.equal(change.status,200);
  const draft=await fetch(url+'/api/conversations/'+phone+'/draft',{method:'POST',headers});
  assert.equal((await draft.json()).created,true);
  assert.equal(store.get(phone).drafts.length,2);
  // Não há rota de envio Meta nesta versão.
  assert.equal((await fetch(url+'/api/conversations/'+phone+'/send',{method:'POST',headers})).status,404);
}));
