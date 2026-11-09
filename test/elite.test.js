import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { createStore } from '../src/core.js';
import { commercialPrompt, handoffAccepted, reviewCopy, polishCopy } from '../src/commercial.js';
import { createReviewedDraft } from '../src/advisor.js';

const phone='000000059001';
const now=Date.parse('2026-11-09T12:00:00Z');
const opening={opening:true,intent:'OPENING',latest:{text:''}};
const verified={observation:'Publicou um catálogo sem pedido online.',sourceUrl:'https://example.test/catalogo',verifiedOn:'2026-11-03'};
const payload=(context, decision=opening, messages=[], drafts=[])=>JSON.parse(commercialPrompt({context,messages,drafts},decision,{now}).input);
const reply=text=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})});
const config={manual:true,geminiApiKey:'simulated'};

test('seleciona cinco aberturas e omite observações sem fonte HTTPS recente',()=>{
  for(const [context,strategy] of [[{},'direta'],[{sector:'Oficina'},'segmento'],[{challenge:'Consultas por telefone'},'pergunta'],
    [verified,'observacao'],[{...verified,goal:'Organizar pedidos'},'oportunidade']]) assert.equal(payload(context).strategy,strategy);
  for(const partial of [{sourceUrl:'http://example.test/'},{sourceUrl:'https://user:pw@example.test/'},{verifiedOn:'2026-05-01'},{verifiedOn:'2026-10-35'}]){
    const result=payload({...verified,...partial});
    assert.equal(result.verifiedObservation,null);
    assert.ok(!JSON.stringify(result).includes(verified.observation));
  }
  assert.equal(payload(verified).verifiedObservation,verified.observation);
  assert.ok(!JSON.stringify(payload(verified)).includes(verified.sourceUrl));
});

const scenarios=[
 ['WhatsApp','Quero organizar pedidos que chegam no WhatsApp.'],
 ['site','Meu escritório precisa de um site. Vocês fazem?'],
 ['sistema','Preciso de um painel para acompanhar revisões.'],
 ['integração','Quero integrar pedidos, estoque e atendimento.'],
 ['preço','Está caro e não tenho orçamento neste trimestre.'],
 ['automação','Não quero robô respondendo aos meus clientes.'],
 ['fornecedor','Já tenho alguém que faz isso e está funcionando.'],
 ['desconfiança','Como sei que a integração não vai atrapalhar?'],
 ['objetivo','Integra com estoque? Resposta curta, por favor.'],
 ['detalhado','Podem explicar o que precisam para avaliar a migração e se dá para manter o sistema?'],
 ['pergunta respondida','São 30 matrículas por mês, como eu disse.'],
 ['avanço','Gostei da proposta e quero avançar com a avaliação.'],
 ['handoff','Pode encaminhar meu contexto ao responsável comercial.'],
 ['follow-up','Combinamos de retomar a conversa sobre o site hoje.']
];
for(const [name,text] of scenarios) test('contexto do caso fictício: '+name,async()=>{
  const store=createStore();store.ingest({phone,id:'lead',text});
  let captured;
  const result=await createReviewedDraft(store,phone,{...config,tone:'estrategico'},async(_,request)=>{
    captured=JSON.parse(JSON.parse(request.body).contents[0].parts[0].text);
    return reply('Rascunho simulado para verificar o contrato de geração.');
  });
  assert.equal(captured.latestMessage,text);
  assert.equal(captured.handoffAccepted,name==='handoff');
  assert.equal(captured.tone,'estrategico');
  assert.equal(result.draft.provider,'gemini');
  assert.equal(store.get(phone).mode,'HUMAN');
});

test('dados de contato omitidos e rascunho separado de mensagem enviada',()=>{
  const decision={intent:'OTHER',latest:{text:'Meu e-mail é lead@example.test e meu telefone é +55 11 91234-5678.'}};
  const result=payload({company:'Loja Fictícia'},decision,[{direction:'inbound',text:decision.latest.text}],[{text:'Qual o volume mensal?'}]);
  assert.ok(!JSON.stringify(result).includes('lead@example.test'));
  assert.ok(!JSON.stringify(result).includes('91234-5678'));
  assert.equal(result.history.length,1);
  assert.match(result.previousDrafts[0].note,/NÃO comprova envio/);
});
test('revisor bloqueia promessas, repetição, múltiplas perguntas e handoff sem aceite',()=>{
  const decision={intent:'OTHER',latest:{text:'Já respondi: 30 por mês.'}};
  const c={messages:[{direction:'outbound',text:'Qual é o volume mensal?'}]};
  assert.equal(reviewCopy('Qual é o volume mensal?',c,decision),'repeated_question');
  assert.equal(reviewCopy('Qual é o prazo? E o volume?',c,decision),'multiple_questions');
  assert.equal(reviewCopy('Vamos encaminhar o contexto.',c,decision),'handoff_without_consent');
  assert.equal(reviewCopy('Já agendei com o responsável.',c,decision),'unsafe_claim');
  assert.equal(reviewCopy('Garanto que vai funcionar.',c,decision),'unsafe_claim');
  assert.equal(reviewCopy('Um painel pode mostrar o responsável, eliminando esse retrabalho.',c,decision),'absolute_outcome');
  assert.equal(reviewCopy('Um painel pode mostrar o responsável e reduzir o retrabalho.',c,decision),null);
  assert.equal(polishCopy('Compreendo perfeitamente. Sua equipe continua respondendo.'),'Sua equipe continua respondendo.');
  assert.equal(polishCopy('Com certeza podemos avaliar.'),'Com certeza podemos avaliar.');
  assert.equal(polishCopy('Podemos organizar a triagem de documentos, sem que o cliente perceba qualquer automação na conversa.'),'Podemos organizar a triagem de documentos, mantendo a conversa com sua equipe.');
  assert.equal(reviewCopy('Os clientes não perceberão a automação.',c,decision),'unverified_visibility');
  assert.equal(reviewCopy('Visitei o seu site.',c,opening),'unsupported_research');
  assert.equal(reviewCopy('Quer saber como estamos aplicando isso no seu segmento?',c,opening),'unsupported_experience');
  assert.equal(reviewCopy('Posso explicar o que propomos para o seu segmento?',c,opening),'unsupported_sector');
  assert.equal(reviewCopy('Posso explicar em uma mensagem por que entrei em contato?',c,opening),null);
  assert.equal(handoffAccepted('Pode encaminhar depois ao responsável.'),false);
  assert.equal(handoffAccepted('Pode me dizer quem é o responsável?'),false);
  assert.equal(handoffAccepted('Pode encaminhar meu contexto ao responsável.'),true);
});
test('falha do revisor e recusa não deixam rascunho copiável',async()=>{
  const s=createStore();s.ingest({phone,id:'a',text:'Tenho uma dúvida.'});
  const bad=await createReviewedDraft(s,phone,config,async()=>reply('Garanto retorno de 100%.'));
  assert.equal(bad.generationMeta.errorCode,'quality_block');assert.equal(s.get(phone).drafts.length,0);
  for(const [id,text] of [['b','Pode encerrar por aqui.'],['c','Parem de me contatar.']]){
    s.ingest({phone,id,text});
    const blocked=await createReviewedDraft(s,phone,config,()=>assert.fail('não chama Gemini'));
    assert.equal(blocked.created,false);
  }
});
test('cliques concorrentes chamam Gemini uma vez e cópia não cria revisão',async()=>{
  const s=createStore();s.ingest({phone,id:'a',text:'Tenho uma dúvida.'});
  let release,calls=0;
  const gate=new Promise(r=>{release=r});
  const mock=async()=>{calls++;await gate;return reply('Podemos avaliar essa necessidade.')};
  const first=createReviewedDraft(s,phone,config,mock);
  const duplicate=await createReviewedDraft(s,phone,config,mock);
  release();
  const {draft}=await first;
  assert.match(duplicate.reason,/em andamento/);assert.equal(calls,1);
  const unchanged=s.editDraft(phone,draft.id,{text:draft.text,expectedVersion:draft.conversationVersion});
  assert.equal(unchanged.draft.id,draft.id);assert.equal(unchanged.unchanged,true);
  const repeated=await createReviewedDraft(s,phone,{...config,regenerate:true},mock);
  assert.equal(repeated.draft.id,draft.id);assert.equal(s.get(phone).drafts.length,1);
});

test('HTTP: primeira abordagem, três estilos, edição idempotente e feedback autenticado',async()=>{
  const store=createStore();
  const key='fictional-admin-key-for-local-tests';
  const app=createApp({store,adminKey:key,metaSecret:'test',verifyToken:'test',aiConfig:{geminiApiKey:'fake'},fetcher:async(_,r)=>{
    const input=JSON.parse(JSON.parse(r.body).contents[0].parts[0].text);
    const drafts={
      consultivo:'Oi, aqui é o Pedro da GSW. Posso te contar por que estou entrando em contato?',
      objetivo:'Oi, sou o Pedro da GSW. Posso explicar rapidamente o motivo do contato?',
      estrategico:'Oi, aqui é o Pedro da GSW. Queria entender se organização de pedidos entra nas prioridades deste trimestre.'
    };
    return reply(drafts[input.tone]);
  }});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const root='http://127.0.0.1:'+app.address().port;
  const route='/api/conversations/'+phone;
  async function post(path,body,auth=true){
    const response=await fetch(root+route+path,{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:'Bearer '+key}:{})},body:JSON.stringify(body)});
    return {code:response.status,...await response.json()};
  }
  try{
    let draft;const variants=new Set();
    for(const tone of ['consultivo','objetivo','estrategico']){
      const result=await post('/draft',{opening:true,regenerate:!!draft,expectedVersion:store.get(phone).version,tone});
      assert.equal(result.created,true);
      draft=result.draft;variants.add(draft.text);
    }
    assert.equal(variants.size,3);
    assert.equal(store.get(phone).messages.length,0);
    assert.equal((await post('/drafts/'+draft.id+'/feedback',{category:'boa'},false)).code,401);
    assert.equal((await post('/drafts/'+draft.id+'/feedback',{category:'boa'})).recorded,true);
    const edit=await post('/drafts/'+draft.id+'/edit',{text:draft.text,expectedVersion:draft.conversationVersion});
    assert.equal(edit.unchanged,true);assert.equal(store.get(phone).drafts.length,3);
    await post('/inbound',{text:'Não quero receber mensagens.'});
    assert.equal((await post('/draft',{opening:true,regenerate:true})).created,false);
    assert.equal((await post('/drafts/'+draft.id+'/edit',{text:draft.text,expectedVersion:draft.conversationVersion})).updated,false);
    const html=await (await fetch(root)).text();
    const script=html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script);assert.doesNotThrow(()=>new Function(script));
  }finally{await new Promise(resolve=>app.close(resolve))}
});

test('fallback que repete versão arquivada mantém a edição atual e a explicação da falha',async()=>{
  const store=createStore();
  const options={...config,opening:true};
  const unavailable=async()=>({ok:false,status:503});
  const original=await createReviewedDraft(store,phone,options,unavailable);
  assert.equal(original.draft.provider,'rules_fallback');
  const edit=store.editDraft(phone,original.draft.id,{text:'Primeiro contato revisado.',expectedVersion:original.draft.conversationVersion});
  const repeated=await createReviewedDraft(store,phone,{...options,regenerate:true},unavailable);
  assert.equal(repeated.created,false);
  assert.equal(repeated.draft.id,edit.draft.id);
  assert.match(repeated.reason,/indisponível.*versão atual foi mantida/);
  assert.equal(store.get(phone).drafts.length,2);
  assert.equal(store.get(phone).version,edit.draft.conversationVersion);
});

test('permissao para explicar ou apresentar opcoes nao autoriza handoff', () => {
  for (const text of ['Pode explicar.', 'Pode apresentar as opções.', 'Sim', 'Pode', 'Agora não quero falar com o responsável.']) {
    assert.equal(handoffAccepted(text), false);
    const decision = {latest: {text}};
    assert.equal(reviewCopy('Vou te encaminhar ao responsável.', {}, decision), 'handoff_without_consent');
    assert.equal(reviewCopy('Posso explicar uma possibilidade de estrutura para o site.', {}, decision), null);
  }
  assert.equal(handoffAccepted('Pode me encaminhar ao responsável de desenvolvimento.'), true);
});

test('abertura excessiva e promessas absolutas sao bloqueadas sem bloquear possibilidade concreta', () => {
  assert.equal(reviewCopy('palavra '.repeat(91), {}, opening), 'opening_too_long');
  for (const text of ['Isso funciona sem aumentar o trabalho.', 'Você ficará em primeiro lugar no Google.', 'Terá retorno financeiro garantido.']) {
    assert.equal(reviewCopy(text, {}, opening), 'absolute_outcome');
  }
  assert.equal(reviewCopy('Um site poderia reunir os serviços e facilitar o pedido de orçamento. Qual serviço vocês querem destacar?', {}, opening), null);
});

test('falar sobre o responsável não autoriza encaminhamento', () => {
  assert.equal(handoffAccepted('Pode falar sobre o responsável de desenvolvimento?'), false);
  assert.equal(handoffAccepted('Pode falar com o responsável de desenvolvimento.'), true);
});

test('bloqueia oferta direta de agentes de IA e permite descrever a tecnologia no projeto', () => {
  assert.equal(reviewCopy('Oferecemos agentes de IA para sua empresa.', {}, opening), 'standalone_ai_offer');
  assert.equal(reviewCopy('Se fizer sentido para esse processo, o sistema pode usar IA na triagem.', {}, opening), null);
});

test('objetivo informado não vira observação externa em abertura', () => {
  const conversation = {context: {goal: 'Mostrar opções de uniformes'}};
  assert.equal(reviewCopy('Notei o trabalho de vocês com uniformes.', conversation, opening), 'unsupported_research');
  assert.equal(reviewCopy('Como vocês apresentam as opções de uniformes hoje?', conversation, opening), null);
});
