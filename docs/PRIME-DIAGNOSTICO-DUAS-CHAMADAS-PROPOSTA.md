# Proposta executável: diagnóstico de duas chamadas

Autorização recebida para duas chamadas; execução ainda bloqueada pela ausência de workflow compatível. Nenhuma chamada realizada. O workflow existente prime-reasoning-validation-test.yml usa 06bc215 e limite de 15 chamadas; não deve ser reexecutado para este diagnóstico.

Proposta: adicionar APENAS .github/workflows/prime-transport-two-call.yml na branch work/v4.2-visual-copilot, mantendo proteções e workflows existentes. O push dessa adição executará o diagnóstico abaixo, usando o ambiente gemini-v42-tests e seu segredo existente. Não faz checkout nem executa código da aplicação, não instala dependências e não faz deploy. Isso mede transporte mínimo, não qualidade comercial nem o schema completo da aplicação.

```yaml
name: PRIME two-call transport diagnostic
on:
  push:
    branches: [work/v4.2-visual-copilot]
    paths: ['.github/workflows/prime-transport-two-call.yml']
permissions:
  contents: read
concurrency:
  group: prime-transport-two-call
  cancel-in-progress: false
jobs:
  diagnostic:
    if: github.ref == 'refs/heads/work/v4.2-visual-copilot' && github.run_attempt == 1
    runs-on: ubuntu-latest
    timeout-minutes: 3
    environment:
      name: gemini-v42-tests
      deployment: false
    steps:
      - name: Two bounded synthetic calls
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_V42_TEST_API_KEY }}
        shell: bash
        run: |
          node --input-type=module <<'NODE'
          const key=process.env.GEMINI_API_KEY;
          if(!key){console.log('{"stop":"missing_secret","calls":0}');process.exit(1);}
          let calls=0;
          for(const level of ['MINIMAL','MEDIUM']){
            const body=JSON.stringify({
              contents:[{role:'user',parts:[{text:'Teste fictício de transporte. Retorne apenas o objeto JSON com status igual a ok.'}]}],
              generationConfig:{temperature:0,maxOutputTokens:4096,thinkingConfig:{thinkingLevel:level},responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{status:{type:'STRING',enum:['ok']}},required:['status']}}
            });
            const controller=new AbortController();
            const timer=setTimeout(()=>controller.abort(),45000),start=Date.now();
            const record={stage:'transport',thinkingLevel:level,attempt:++calls,requestBytes:Buffer.byteLength(body),httpStatus:null};
            let passed=false;
            try{
              const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',{
                method:'POST',redirect:'error',signal:controller.signal,
                headers:{'x-goog-api-key':key,'content-type':'application/json'},body
              });
              record.httpStatus=r.status;
              if(r.ok){
                const data=await r.json(),candidate=data.candidates?.[0];
                record.tokens=Object.fromEntries(['promptTokenCount','candidatesTokenCount','thoughtsTokenCount','totalTokenCount'].filter(k=>Number.isSafeInteger(data.usageMetadata?.[k])&&data.usageMetadata[k]>=0).map(k=>[k,data.usageMetadata[k]]));
                if(['STOP','MAX_TOKENS','SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(candidate?.finishReason))record.finishReason=candidate.finishReason;
                const raw=(candidate?.content?.parts||[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('');
                passed=!controller.signal.aborted&&candidate?.finishReason==='STOP'&&JSON.parse(raw).status==='ok';
              }else{
                await r.body?.cancel();
              }
            }catch{
              record.errorCode=controller.signal.aborted?'timeout':'network_or_invalid_response';
            }finally{
              clearTimeout(timer);record.durationMs=Date.now()-start;
            }
            record.pass=passed;console.log(JSON.stringify(record));
            if(!passed){console.log(JSON.stringify({stop:'first_failure',calls}));process.exit(1);}
          }
          console.log(JSON.stringify({completed:true,calls}));
          NODE
```

Não imprime corpo de resposta, pensamento, chave, cabeçalhos ou erro bruto. Interrompe em qualquer falha, sem retry. Limite de duas chamadas por execução; reexecução via botão é bloqueada por run_attempt. Novos pushes nesse arquivo seriam nova execução e exigem respeitar nova autorização. Sucesso não aprova a geração comercial e não demonstra causalidade do 503.
