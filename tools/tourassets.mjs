import {build} from 'esbuild';
import {cp,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=join(root,'tour');
const common={absWorkingDir:root,bundle:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'};
await mkdir(out,{recursive:true});
await build({...common,entryPoints:['landing/client.jsx','landing/tour.css','landing/fonts.css'],
  outdir:out,format:'esm',splitting:true,minify:true,target:'es2020',chunkNames:'chunks/[name]-[hash]',
  loader:{'.woff2':'file','.woff':'file'},assetNames:'fonts/[name]-[hash]',external:['/images/*'],legalComments:'external'});
const scratch=await mkdtemp(join(root,'node_modules','.cashahead-tour-'));
try{
  const file=join(scratch,'render.cjs');
  await build({...common,entryPoints:['landing/render.jsx'],platform:'node',packages:'external',format:'cjs',outfile:file});
  const {default:renderer}=await import(pathToFileURL(file));
  const template=await readFile(join(root,'index.html'),'utf8');
  await writeFile(join(out,'index.html'),template.replace('<!--tour-content-->',()=>renderer.renderTour()));
}finally{await rm(scratch,{recursive:true,force:true});}
for(const family of ['@fontsource-variable/bricolage-grotesque','@fontsource-variable/fraunces','@fontsource/ibm-plex-mono']){
  await cp(join(root,'node_modules',family,'LICENSE'),join(out,'fonts',family.split('/')[1]+'-LICENSE.txt'));
}
