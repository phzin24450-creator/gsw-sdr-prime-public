// Transport fixtures only: these do not simulate semantic understanding.
// Regression tests supply explicit expert annotations for actual propositions.
export function transportAudit(options) {
 const input=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
 return {claimAudit:input.claimUnits.map(u=>({id:u.id,classification:'non_assertive',domain:'other',language:'non_assertive',evidence:[],reason:'Transport fixture only',missingAction:'none',acceptable:true})),quality:{factualSafety:'pass',planQuality:'pass',messageQuality:'pass'}};
}
