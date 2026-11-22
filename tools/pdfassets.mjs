import {copyFile,readFile,writeFile} from 'node:fs/promises';

const asset=name=>new URL('../node_modules/pdfmake/'+name,import.meta.url);
const output=name=>new URL('../src/'+name,import.meta.url);
const license=await readFile(asset('LICENSE'),'utf8');
const engine=await readFile(asset('build/pdfmake.min.js'),'utf8');
await writeFile(output('pdfengine.js'),'/*! '+license+' */\n'+engine);
await copyFile(asset('build/vfs_fonts.js'),output('pdffonts.js'));
