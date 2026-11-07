import test from 'node:test';
import assert from 'node:assert/strict';
import { createOperatorAuth,passwordHash } from '../src/auth.js';
import { createApp } from '../src/server.js';
import { createStore } from '../src/core.js';
const password='synthetic-test-password-12345';
const hash=await passwordHash(password);
const origin='https://gsw.example';
const request=(cookie,site=origin)=>({headers:{cookie,origin:site},socket:{remoteAddress:'127.0.0.1'}});
const config={username:'pedro',passwordScrypt:hash,origin};
test('login: cookie seguro, expiração e revogação; sem senha na sessão',async()=>{
  let clock=1000;
  const auth=createOperatorAuth({...config,now:()=>clock});
  const r=await auth.login(request(),{username:'pedro',password});
  assert.equal(r.status,200);assert.match(r.cookie,/__Host-gsw_session=/);
  for(const flag of ['HttpOnly','SameSite=Strict','Secure','Path=/'])assert.ok(r.cookie.includes(flag));
  const cookie=r.cookie.split(';')[0];
  assert.equal(auth.session(request(cookie)).username,'pedro');
  assert.equal(auth.session(request(cookie)).password,undefined);
  clock+=3600001;assert.equal(auth.session(request(cookie)),undefined);
  const again=await auth.login(request(),{username:'pedro',password});
  assert.notEqual(again.cookie,r.cookie);
  assert.match(auth.logout(request(again.cookie.split(';')[0])),/Max-Age=0/);
  assert.equal(auth.session(request(again.cookie.split(';')[0])),undefined);
});
test('login rejeita origem externa e limita senhas incorretas',async()=>{
  const auth=createOperatorAuth(config);
  assert.equal((await auth.login(request('', 'https://evil.example'),{username:'pedro',password})).status,403);
  for(let i=0;i<5;i++)assert.equal((await auth.login(request(),{username:'pedro',password:'incorrect'})).status,401);
  assert.equal((await auth.login(request(),{username:'pedro',password})).status,429);
});
test('HTTP: sessão protege acesso, bloqueia CSRF e exclusão, logout revoga; CSP usa nonce',async()=>{
  const auth=createOperatorAuth({...config,secure:false});
  const app=createApp({adminKey:'synthetic-admin-secret-12345',metaSecret:'meta',verifyToken:'token',operatorAuth:auth});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+app.address().port;
  try{
    assert.equal((await fetch(url+'/api/status')).status,401);
    const login=await fetch(url+'/auth/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username:'pedro',password})});
    assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
    const headers={cookie,origin,'content-type':'application/json'};
    assert.equal((await fetch(url+'/api/conversations',{headers})).status,200);
    assert.equal((await fetch(url+'/api/conversations/5511999999999/mode',{method:'POST',headers:{...headers,origin:'https://evil.example'},body:'{"mode":"HUMAN"}'})).status,403);
    assert.equal((await fetch(url+'/api/conversations/5511999999999',{method:'DELETE',headers,body:'{"confirm":"DELETE"}'})).status,403);
    const page=await fetch(url+'/');const html=await page.text();
    const nonce=/script-src 'nonce-([^']+)'/.exec(page.headers.get('content-security-policy'))[1];
    assert.ok(html.includes('<script nonce="'+nonce+'">'));assert.ok(!html.includes('__CSP_NONCE__'));assert.ok(!page.headers.get('content-security-policy').includes('unsafe-inline'));
    const second=await fetch(url+'/');assert.notEqual(page.headers.get('content-security-policy'),second.headers.get('content-security-policy'));
    assert.equal((await fetch(url+'/auth/logout',{method:'POST',headers})).status,200);
    assert.equal((await fetch(url+'/api/conversations',{headers})).status,401);
  }finally{await new Promise(r=>app.close(r))}
});
test('readiness acusa falha do banco e não revela detalhes',async()=>{
  const store={...createStore(),ping:async()=>{throw Error('private-database-credential')}};
  const app=createApp({adminKey:'synthetic-admin-secret-12345',metaSecret:'meta',verifyToken:'token',store});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  try{const response=await fetch('http://127.0.0.1:'+app.address().port+'/ready');assert.equal(response.status,503);assert.deepEqual(await response.json(),{ok:false});}finally{await new Promise(r=>app.close(r))}
});
test('operador registra mensagem manual, respeita opt-out e nunca envia',async()=>{
  const auth=createOperatorAuth({...config,secure:false}),store=createStore();
  const app=createApp({adminKey:'synthetic-admin-secret-12345',metaSecret:'meta',verifyToken:'token',operatorAuth:auth,store});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+app.address().port;
  try{
    const login=await fetch(url+'/auth/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username:'pedro',password})});
    const headers={cookie:login.headers.get('set-cookie').split(';')[0],origin,'content-type':'application/json'};
    const path='/api/conversations/5511999999999/inbound';
    assert.equal((await fetch(url+path,{method:'POST',headers,body:'{"text":""}'})).status,400);
    const response=await fetch(url+path,{method:'POST',headers,body:JSON.stringify({text:'Não me mande mais mensagens'})});
    assert.equal(response.status,200);assert.equal((await response.json()).accepted,true);
    assert.equal(store.get('5511999999999').optedOut,true);
    assert.equal((await fetch(url+'/api/conversations/5511999999999/send',{method:'POST',headers})).status,404);
  }finally{await new Promise(r=>app.close(r))}
});
