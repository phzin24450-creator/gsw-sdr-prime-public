import {mkdir,writeFile} from 'node:fs/promises';
import {refinementCases} from './prime-refinement-cases.mjs';
import {requestModelDraft,prepareDecision,GEMINI_MODEL} from '../src/advisor.js';
import {commercialPrompt} from '../src/commercial.js';
if(!process.env.GEMINI_API_KEY){console.error('Credencial dedicada não disponível; zero chamadas reais.');process.exit(2);}
await mkdir('test-results/prime-refinement',{recursive:true});let failed=0;
for(const item of refinementCases){
 const context={...item.context,...(item.context.sourceUrl?{verifiedOn:new Date().toISOString().slice(0,10)}:{})};
 const c={mode:'HUMAN',context,messages:item.turns.map(([direction,text],i)=>({id:String(i),direction,text})),drafts:[]};
 const d=prepareDecision(c,{manual:true,opening:!c.messages.length});
 const e={id:item.id,synthetic:true,model:GEMINI_MODEL,expected:item.expected,input:JSON.parse(commercialPrompt(c,d.canDraft?d:{latest:c.messages.at(-1)||{text:''}}).input),calls:0,generatedCandidates:[],rejectedDrafts:[],commercialApproval:'Pending human assessment of the full response; not implied by pass'};
 if(!d.canDraft){e.decision='blocked';e.pass=item.expectedDecision==='blocked';}
 else try{
  const r=await requestModelDraft(c,d,{onGeneratedCandidate:x=>e.generatedCandidates.push(x),onQualityRejection:x=>e.rejectedDrafts.push(x)},async(...args)=>{e.calls++;return fetch(...args);});
  e.response=r.text;e.metadata=r.generationMeta;e.pass=!item.expectedDecision&&!!r.generationMeta.commercialDecision?.contactPlan&&r.generationMeta.qualityReview==='gemini_semantic_and_local';
 }catch(err){e.error={code:err.code||'unknown',httpStatus:err.httpStatus||null,stage:err.stage||null};e.plan=err.contactPlan||null;e.pass=!!item.expectedDecision&&err.code===item.expectedDecision;}
 if(!e.pass)failed++;
 await writeFile('test-results/prime-refinement/'+item.id+'.json',JSON.stringify(e,null,2)+'\n');
 console.log(e.pass?'PASS':'FAIL',item.id,'calls='+e.calls,e.error?.code||'');
 if(e.error?.code==='quota_exceeded')break;
 if(e.calls)await new Promise(r=>setTimeout(r,8000));
}
if(failed)process.exitCode=1;
