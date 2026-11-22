import './prepare.mjs';
import {mkdir,copyFile,cp,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=join(root,'dist');
await mkdir(join(dist,'src'),{recursive:true});
const files=['styles.css','mark.svg',...(await readdir(join(root,'src'))).filter(n=>n.endsWith('.js')).map(n=>'src/'+n)];
for(const file of files){
  if(file.endsWith('.js'))execFileSync(process.execPath,['--check',join(root,file)]);
  await copyFile(join(root,file),join(dist,file));
}
await cp(join(root,'images'),join(dist,'images'),{recursive:true});
await cp(join(root,'tour'),join(dist,'tour'),{recursive:true,filter:src=>src!==join(root,'tour','index.html')});
await copyFile(join(root,'tour','index.html'),join(dist,'index.html'));
const html=await readFile(join(dist,'index.html'),'utf8');
if(!html.includes('/src/app.js')||!html.includes('id="studio-opening"'))throw Error('Missing workspace or camera tour entry');
console.log('Production static build with camera tour and workspace in dist/');
