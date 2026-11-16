// Prepared only. Running this suite requires the owner's separate approval.
import {liveOutcome} from './prime-live-outcome.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {refinementCases} from './prime-refinement-cases.mjs';
import {requestModelDraft,prepareDecision,GEMINI_MODEL} from '../src/advisor.js';
import {commercialPrompt} from '../src/commercial.js';
if(process.env.PRIME_ROUND2_REAL_AUTHORIZED!=='yes'||!process.env.GEMINI_API_KEY){
 console.error('Rodada real 2 não habilitada: exige autorização específica e segredo dedicado. Zero chamadas.');process.exit(2);
}
const dir='test-results/prime-round2';await mkdir(dir,{recursive:true});
let failed=0,totalCalls=0,stopReason=null,providerFailures=0;
for(const item of refinementCases){
 const context={...item.context,...(item.context.sourceUrl?{verifiedOn:new Date().toISOString().slice(0,10)}:{})};
 const c={mode:'HUMAN',context,messages:item.turns.map(([direction,text],i)=>({id:String(i),direction,text})),drafts:[]};
 const d=prepareDecision(c,{manual:true,opening:!c.messages.length});
 const e={id:item.id,synthetic:true,model:GEMINI_MODEL,expected:item.expected,input:JSON.parse(commercialPrompt(c,d.canDraft?d:{latest:c.messages.at(-1)||{text:''}}).input),calls:0,generatedCandidates:[],rejectedDrafts:[],commercialApproval:'Pending human review; automated pass is not commercial approval'};
 if(stopReason&&d.canDraft){e.skipped=stopReason;e.pass=false;}
 else if(!d.canDraft){e.decision='blocked';e.pass=item.expectedDecision==='blocked';}
 else try{
  const r=await requestModelDraft(c,d,{onGeneratedCandidate:x=>e.generatedCandidates.push(x),onQualityRejection:x=>e.rejectedDrafts.push(x)},async(...args)=>{
   if(totalCalls>=20)throw Error('Suite request budget reached');totalCalls++;e.calls++;return fetch(...args);
  });
  e.response=r.text;e.metadata=r.generationMeta;
  e.pass=!item.expectedDecision&&r.generationMeta.qualityReview==='gemini_semantic_and_local'&&r.generationMeta.claimLedger.length>0&&Object.values(r.generationMeta.qualityAssessment).every(x=>x==='pass');
 }catch(err){
  e.error={code:err.code||'unknown',httpStatus:err.httpStatus||null,stage:err.stage||null};e.telemetry=err.telemetry||null;e.plan=err.contactPlan||null;
  Object.assign(e,liveOutcome(item,err,e.plan));
  if(['quota_exceeded','invalid_key','permission_denied','invalid_request','invalid_model','model_unavailable'].includes(err.code))stopReason=err.code;
  if(['timeout','network_error','provider_unavailable'].includes(err.code)&&++providerFailures>=2)stopReason='provider_unreliable';
  if(totalCalls>=20)stopReason='suite_budget';
 }
 if(!e.pass)failed++;
 await writeFile(`${dir}/${item.id}.json`,JSON.stringify(e,null,2)+'\n');
 console.log(e.pass?'PASS':'FAIL',item.id,`calls=${e.calls}`,e.error?.code||e.skipped||'');
 if(e.calls)await new Promise(r=>setTimeout(r,8000));
}
await writeFile(`${dir}/summary.json`,JSON.stringify({synthetic:true,model:GEMINI_MODEL,totalCalls,failed,stopReason,commercialApproval:'Pending human evaluation'},null,2)+'\n');
if(failed)process.exitCode=1;
