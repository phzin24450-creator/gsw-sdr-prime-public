// Synthetic, bounded commercial acceptance. No real lead data or messaging.
import {mkdir,writeFile} from 'node:fs/promises';
import {requestModelDraft,prepareDecision,GEMINI_MODEL} from '../src/advisor.js';
const cases=[
 ['marina', {company:'Brisa Técnica Climatização',sector:'Climatização'}, ['Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?']],
 ['recepcionista',{company:'Brisa Técnica Climatização',sector:'Climatização'},['Sou a Marina da recepção. Não decido sobre tecnologia. Qual o assunto?']],
 ['site-confirmado',{company:'Ateliê Aurora Fictício',sector:'Marcenaria'},['Sou a dona. Não temos site; só enviamos fotos pelo WhatsApp. Quero uma página para apresentar nossos móveis sob medida e os contatos.']],
 ['site-adequado',{company:'Clínica Cedro Fictícia'},['Temos um site atualizado que apresenta nossos serviços e recebe contatos normalmente. Estamos satisfeitos com a agência atual.']],
 ['landing-page',{company:'Estúdio Lume Fictício'},['Já temos um bom site institucional. Queremos apresentar só o workshop fictício de fotografia, com programa, data e link de inscrição que já existe.']],
 ['fora-escopo',{company:'Oficina Vale Fictícia'},['Vocês fazem automação de WhatsApp e sistemas? Não estou procurando site.']],
 ['preco',{company:'Flor Bela Fictícia'},['Quanto custa uma landing page para apresentar uma oferta?']],
 ['recusa',{},['Não temos interesse, obrigado.']],
 ['optout',{},['Não me mande mais mensagens.']]
];
const selected=new Set((process.env.PRIME_LIVE_CASES||'').split(',').filter(Boolean));
await mkdir('test-results/prime-live',{recursive:true});let failures=0;
for(const [id,context,turns] of cases){
 if(selected.size&&!selected.has(id))continue;
 const conversation={mode:'HUMAN',context,messages:turns.map((text,i)=>({id:String(i),direction:'inbound',text})),drafts:[]};
 const decision=prepareDecision(conversation,{manual:true});
 const report={id,synthetic:true,model:GEMINI_MODEL,context,messages:conversation.messages,rejectedDrafts:[],commercialApproval:'Requires complete response assessment; technical success is insufficient'};
 if(!decision.canDraft){report.blocked=true;report.pass=['recusa','optout'].includes(id);}
 else try{
  const r=await requestModelDraft(conversation,decision,{onQualityRejection:x=>report.rejectedDrafts.push(x)});
  report.response=r.text;report.metadata=r.generationMeta;
  report.pass=r.generationMeta.qualityReview==='gemini_semantic_and_local'&&!!r.generationMeta.commercialDecision?.knowledge;
 }catch(e){report.pass=false;report.error={code:e.code,stage:e.stage||null,httpStatus:e.httpStatus||null,qualityIssues:e.qualityIssues||[]};}
 await writeFile('test-results/prime-live/'+id+'.json',JSON.stringify(report,null,2)+'\n');
 console.log(report.pass?'PASS':'FAIL',id,report.error?.code||'');if(!report.pass)failures++;
 if(report.error?.code==='quota_exceeded')break;
 await new Promise(r=>setTimeout(r,7000));
}
if(failures)process.exitCode=1;
