import {beforeAll,expect,test} from 'bun:test';
import {resolve} from 'node:path';
import {fractionOf,valueAt} from '../crates/core/src/foundation/number/scale.js';
const root=resolve(import.meta.dir,'..');
const source=resolve(process.env.UI_SDK_UPSTREAM_DIR??resolve(root,'../vercel-ui'));
const config=await Bun.file(resolve(root,'upstream.json')).json();
beforeAll(()=>{
 const pin=Bun.spawnSync(['git','-C',source,'rev-parse','HEAD'],{timeout:10000});
 expect(pin.exitCode).toBe(0);expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const original=await import(resolve(source,'packages/core/src/foundation/number/scale.ts'));
const values=[-Infinity,-1e308,-1,-Number.MIN_VALUE,-0,0,Number.MIN_VALUE,0.25,0.5,1,10,1e308,Infinity,NaN];
const scales=[undefined,'linear','log',{to:(value:number)=>value*value,from:(value:number)=>Math.sqrt(value)},{to:(value:number)=>-value,from:(value:number)=>-value}] as const;
for(const [name,actual] of [['fractionOf',fractionOf],['valueAt',valueAt]] as const)test(name+' preserves exact original scaling including non-finite ranges and custom mappings',()=>{
 for(const value of values)for(const min of values)for(const max of values)for(const scale of scales){
  const result=actual(value,{min,max},scale),expected=original[name](value,{min,max},scale);
  expect(Object.is(result,expected),`${name}(${value},{${min},${max}},${String(scale)})`).toBe(true);
 }
});

test('custom mapping getters, receiver and range reads retain original order',()=>{
 for(const name of ['fractionOf','valueAt'] as const){
  const states=[];
  for(const implementation of [{fractionOf,valueAt},original]){
   const calls:unknown[]=[],bounds={low:1,high:100};
   const range={get min(){calls.push('min');return bounds.low;},get max(){calls.push('max');return bounds.high;}};
   const mapping={get to(){calls.push('get to');return function(this:unknown,value:number){calls.push(['to',this===undefined,value]);bounds.high-=1;return value;};},get from(){calls.push('get from');return function(this:unknown,value:number){calls.push(['from',this===undefined,value]);return value;};}};
   const result=implementation[name](0.5,range,mapping);states.push({result,calls});
  }
  expect(states[0]).toEqual(states[1]);
 }
});


test("built-in logarithmic mappings retain the functions captured at module initialization",()=>{
 const log=Math.log,exp=Math.exp;
 try {
  Math.log=()=>123; Math.exp=()=>456;
  const range={min:1,max:100};
  expect(fractionOf(10,range,"log")).toBe(original.fractionOf(10,range,"log"));
  expect(valueAt(0.5,range,"log")).toBe(original.valueAt(0.5,range,"log"));
 } finally { Math.log=log; Math.exp=exp; }
});
