import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,extname} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml',
  '.webp':'image/webp','.mp4':'video/mp4','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const asset=/^\/(?:index\.html|styles\.css|mark\.svg|src\/[a-z]+\.js|images\/[\w-]+\.(?:mp4|webp)|tour\/(?:[\w.-]+\.(?:css|js|txt)|(?:chunks|fonts)\/[\w.-]+\.(?:js|woff2?|txt)))$/;
async function serveMovie(req,res,file,headers){
  const {size}=await stat(file);
  headers['Accept-Ranges']='bytes';
  let start=0,end=size-1,status=200;
  if(req.headers.range){
    const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    if(match){start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
    if(!match||start>end||start>=size){res.writeHead(416,{'Content-Range':'bytes */'+size});res.end();return;}
    status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
  }
  res.writeHead(status,{...headers,'Content-Length':end-start+1});
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
}
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
      if(extname(file)==='.mp4'){await serveMovie(req,res,file,headers);return;}
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
