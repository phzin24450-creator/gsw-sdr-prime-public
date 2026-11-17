const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function turnTask(input){
 const observation=fold(input.verifiedObservation);
 if(input.turnPurpose==='cold_outreach'&&/pode existir|desconhecid|outra rota|nao localizou|nao identificou/.test(observation))return {id:'verify_route',instruction:'TAREFA DESTE TURNO: descobrir onde o cliente apresenta o conteúdo observado. Identifique Pedro/PRIME, cite somente o detalhe observado e faça uma pergunta sobre a rota EXISTENTE. Não perguntar se considera/avalia/quer construir site. Não afirmar problema, concentração, exclusividade nem ausência. contactReason registra somente a observação, sem concluir dificuldade.'};
 const latest=fold(input.latestMessage);
 if(/agencia|fornecedor/.test(latest)&&/nao quero|receio|nao vou|manter/.test(latest))return {id:'respect_supplier',instruction:'TAREFA DESTE TURNO: reconhecer a preferência por manter o fornecedor. Não vender independência, projeto isolado ou ausência de alterações. Neste momento responda à preocupação com o fornecedor, não faça uma nova oferta. A decisão sobre formato fica em aberto. Expresse apenas sua intenção de respeitar a agência e a necessidade de alinhamento antes de definir como apresentar a expedição. Não peça aceite da construção nem prometa preservar tecnicamente a estrutura. Sem necessidade de pergunta.'};
 if(/como seria|como funciona|explique|pode explicar/.test(latest))return {id:'explain',instruction:'TAREFA DESTE TURNO: responder à explicação pedida usando somente conteúdo confirmado. Descreva brevemente a apresentação do programa que o cliente já tem e do link informado; não acrescente diferenciais, cronograma, transformação da decisão ou garantia técnica. Não precisa terminar com pergunta genérica.'};
 return {id:'contextual',instruction:'Responda ao último turno respeitando fatos, lacunas, recusas e estágio.'};
}
export function taskIssues(task,text){
 const t=fold(text),issues=[];
 if(task?.id==='verify_route'&&/consider\w*|avali\w*.{0,70}(?:possibilidade|ter um|site proprio)|interesse.{0,40}(?:site|pagina)|faz sentido.{0,50}(?:site|pagina)/.test(t))issues.push('premature_offer');
 if(task?.id==='respect_supplier'&&/sem (?:interferir|alterar|mexer|necessidade de mexer)|(?:funciona|funcionaria).{0,25}independente|projeto isolado|formato independente/.test(t))issues.push('unverified_supplier_compatibility');
 return issues;
}
