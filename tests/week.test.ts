import {afterEach,beforeAll,expect,test} from 'bun:test';
import {resolve} from 'node:path';
const root=resolve(import.meta.dir,'..');
const source=resolve(process.env.UI_SDK_UPSTREAM_DIR??resolve(root,'../vercel-ui'));
const config=await Bun.file(resolve(root,'upstream.json')).json();
beforeAll(()=>{
 const pin=Bun.spawnSync(['git','-C',source,'rev-parse','HEAD'],{timeout:10000});
 expect(pin.exitCode).toBe(0);expect(pin.stdout.toString().trim()).toBe(config.revision);
});
// Each module is imported anew for each host, as each caches what it found.
let fresh=0;
const load=async()=>{
 const query='?host='+fresh++;
 const port=await import(resolve(root,'crates/core/src/foundation/date/week.js')+query);
 const original=await import(resolve(source,'packages/core/src/foundation/date/week.ts')+query);
 return [port.firstDayOfWeek,original.firstDayOfWeek] as const;
};
const tags=[undefined,'','en-US','en-GB','de','de-DE','fr-CA','ar-EG','fa-IR','dv-MV','pt-BR','ja','he-IL','und','zh-Hant-TW','en-US-u-fw-mon','de-u-fw-sun','en-u-ca-gregory-fw-sat','en-US-u-fw-xyz','en-US-u-FW-TUE','x','not a tag','en-'];
const prototype=Intl.Locale.prototype as any;
const getWeekInfo=Object.getOwnPropertyDescriptor(prototype,'getWeekInfo');
afterEach(()=>{
 if(getWeekInfo)Object.defineProperty(prototype,'getWeekInfo',getWeekInfo);
 delete prototype.weekInfo;
});
const hosts:[string,()=>void][]=[
 ['getWeekInfo',()=>{}],
 ['only the CLDR table',()=>{delete prototype.getWeekInfo;}],
 ['the legacy weekInfo getter',()=>{
  delete prototype.getWeekInfo;
  Object.defineProperty(prototype,'weekInfo',{configurable:true,get(){return {firstDay:this.language==='en'?7:6,weekend:[6,7]};}});
 }],
 ['a getWeekInfo that throws',()=>{Object.defineProperty(prototype,'getWeekInfo',{configurable:true,value(){throw new RangeError('no week');}});}],
 ['a getWeekInfo that gives nothing',()=>{
  Object.defineProperty(prototype,'getWeekInfo',{configurable:true,value(){return undefined;}});
  Object.defineProperty(prototype,'weekInfo',{configurable:true,get(){return {firstDay:3,weekend:[6,7]};}});
 }],
];
for(const [host,install] of hosts)test('firstDayOfWeek matches the actual upstream where the host has '+host,async()=>{
 install();
 const [actual,expected]=await load();
 for(const tag of tags){
  expect(actual(tag),String(tag)).toBe(expected(tag));
  // A second call is the cached day.
  expect(actual(tag),String(tag)+' again').toBe(expected(tag));
 }
});
