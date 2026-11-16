// A safe recommendation is a valid technical outcome, not commercial approval.
export function liveOutcome(item,error,plan) {
 if(item.expectedDecision)return {pass:error.code===item.expectedDecision,outcome:error.code};
 if(error.code==='research_required'&&plan?.action==='research'&&typeof plan.researchNeeded==='string'&&plan.researchNeeded.trim())return {pass:true,outcome:'research_recommended',requiresHumanAssessment:true};
 if(error.code==='no_opportunity'&&plan?.action==='do_not_approach'&&typeof plan.contactReason==='string'&&plan.contactReason.trim())return {pass:true,outcome:'no_approach_recommended',requiresHumanAssessment:true};
 return {pass:false,outcome:error.code};
}
