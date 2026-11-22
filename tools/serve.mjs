import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,extname} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml',
  '.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const asset=/^\/(?:index\.html|styles\.css|mark\.svg|src\/[a-z]+\.js|images\/[\w-]+\.webp|tour\/(?:[\w.-]+\.(?:css|js|txt)|(?:chunks|fonts)\/[\w.-]+\.(?:js|woff2?|txt)))$/;
export function serve({port=4317,production=false}={}){
  const folder=production?join(root,'dist'):root;
  const server=createServer(async(req,res)=>{
    let path;try{path=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400);res.end();return;}
    const appRoute=/^\/(?:app|mine)(?:\/(?:invoices|forecast|rescue|bills|deposit|bank|settings))?\/?$/.test(path);
    if(appRoute||path==='/')path='/index.html';
    if(!asset.test(path)){res.writeHead(404);res.end('Not found');return;}
    const file=join(folder,!production&&path==='/index.html'?'tour/index.html':path.slice(1));
    const headers={'Content-Type':mime[extname(file)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
    try{
      const data=await readFile(file);res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);
    }catch{res.writeHead(404);res.end('Not found');}
  });
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});
}
if(process.argv[1] && fileURLToPath(import.meta.url).toLowerCase()===process.argv[1].toLowerCase()){
  const p=process.argv.indexOf('--port');
  const server=await serve({port:Number(p<0?(process.env.PORT||4317):process.argv[p+1]),production:process.argv.includes('--production')});
  console.log('CashAhead running at http://127.0.0.1:'+server.address().port);
}
