const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function turnTask(input){
 const observation=fold(input.verifiedObservation);
 if(input.turnPurpose==='cold_outreach'&&/pode existir|desconhecid|outra rota|nao localizou|nao identificou/.test(observation))return {id:'verify_route',instruction:'TAREFA DESTE TURNO: descobrir onde o cliente apresenta o conteúdo observado. Identifique Pedro/PRIME, cite somente o detalhe observado e faça uma pergunta sobre a rota EXISTENTE. Não perguntar se considera/avalia/quer construir site. Não afirmar problema, concentração, exclusividade nem ausência. contactReason registra somente a observação, sem concluir dificuldade.'};
 const latest=fold(input.latestMessage);
 if(/agencia|fornecedor/.test(latest)&&/nao quero|receio|nao vou|manter/.test(latest))return {id:'respect_supplier',instruction:'TAREFA DESTE TURNO: reconhecer a preferência por manter o fornecedor. Não vender independência, projeto isolado ou ausência de alterações. Neste momento responda à preocupação com o fornecedor, não faça uma nova oferta. A decisão sobre formato fica em aberto. Reconheça em linguagem simples que o cliente quer manter a agência; use o objetivo específico já declarado no histórico, sem inventar outro. Proponha um próximo passo reversível sob decisão do cliente: perguntar se ele prefere avaliar a ideia junto com a agência antes de definir o formato. Não diga que já haverá integração nem contate terceiros. Não peça aceite da construção nem prometa preservar tecnicamente a estrutura. No máximo uma pergunta concreta, se ainda não respondida. Não termine apenas com manter o tema em aberto, alinhamento necessário ou gestão vigente: isso não ajuda o cliente a decidir. Comece direto pelo conteúdo; não use Entendo perfeitamente/Compreendo perfeitamente, elogio ou empatia roteirizada.'};
 if(/como seria|como funciona|explique|pode explicar/.test(latest))return {id:'explain',instruction:'TAREFA DESTE TURNO: responder à explicação pedida usando somente conteúdo confirmado. Descreva brevemente a apresentação do programa que o cliente já tem e do link informado; não acrescente diferenciais, cronograma, transformação da decisão ou garantia técnica. Não precisa terminar com pergunta genérica.'};
 return {id:'contextual',instruction:'Responda ao último turno respeitando fatos, lacunas, recusas e estágio.'};
}
export function taskIssues(task,text){
 const t=fold(text),issues=[];
 if(task?.id==='verify_route'&&/consider\w*|avali\w*.{0,70}(?:possibilidade|ter um|site proprio)|interesse.{0,40}(?:site|pagina)|faz sentido.{0,50}(?:site|pagina)/.test(t))issues.push('premature_offer');
 if(task?.id==='respect_supplier'&&/sem (?:interferir|alterar|mexer|necessidade de mexer)|(?:funciona|funcionaria).{0,25}independente|projeto isolado|formato independente/.test(t))issues.push('unverified_supplier_compatibility');
 if(task?.id==='respect_supplier'&&/gestao vigente|premissa clara|manteremos.{0,50}ponto em aberto/.test(t))issues.push('bureaucratic_supplier_reply');
 return issues;
}
