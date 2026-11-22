import {sampleStudio,judgeStudio,blankStudio,todayLocal} from './ledger.js';
const key=mode=>'cashahead.studio.v1.'+mode;
const storageFor=mode=>mode==='judge'?sessionStorage:localStorage;
export function restartJudgeDemo(){
  sessionStorage.removeItem(key('judge'));
}
export function read(mode){
  const raw=storageFor(mode).getItem(key(mode));
  if(raw){const s=JSON.parse(raw);if(s.version!==1)throw Error('Unrecognised studio data version.');return mode==='own'?{...s,date:todayLocal()}:s;}
  if(mode==='judge')return judgeStudio();
  return mode==='own'?blankStudio():sampleStudio();
}
export async function update(mode,change){
  const write=()=>{const result=change(read(mode));storageFor(mode).setItem(key(mode),JSON.stringify(result));return result;};
  return navigator.locks ? navigator.locks.request(key(mode),write):write();
}
