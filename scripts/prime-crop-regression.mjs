import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {analyzeVisual} from '../src/visual.js';
await mkdir('test-results/prime-crop',{recursive:true});
const image=await readFile(new URL('../test/fixtures/prime-cropped.png',import.meta.url));
const result=await analyzeVisual({consent:true,images:[{mimeType:'image/png',data:image.toString('base64')}]});
await writeFile('test-results/prime-crop/result.json',JSON.stringify(result,null,2));
assert.equal(result.company.status,'unknown');assert.equal(result.sector.status,'unknown');assert.equal(result.opportunity.status,'unknown');
console.log('PASS real Gemini cropped image: company, sector and opportunity unknown');
