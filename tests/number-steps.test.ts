import {beforeAll,expect,test} from 'bun:test';
import {resolve} from 'node:path';
import {clamp,wrap} from '../crates/core/src/foundation/number/steps.js';
const root=resolve(import.meta.dir,'..');
const source=resolve(process.env.UI_SDK_UPSTREAM_DIR??resolve(root,'../vercel-ui'));
const config=await Bun.file(resolve(root,'upstream.json')).json();
beforeAll(()=>{
 const pin=Bun.spawnSync(['git','-C',source,'rev-parse','HEAD'],{timeout:10000});
 expect(pin.exitCode).toBe(0);expect(pin.stdout.toString().trim()).toBe(config.revision);
});
const original=await import(resolve(source,'packages/core/src/foundation/number/steps.ts'));
const values=[-Infinity,-1e308,-360,-1,-Number.MIN_VALUE,-0,0,Number.MIN_VALUE,0.5,1,10,360,1e308,Infinity,NaN];
for(const [name,actual] of [['clamp',clamp],['wrap',wrap]] as const)test(name+' matches the actual upstream across finite values, infinities, NaN and signed zero',()=>{
 for(const value of values)for(const min of values)for(const max of values){
  const result=actual(value,min,max),expected=original[name](value,min,max);
  expect(Object.is(result,expected),`${name}(${value},${min},${max})`).toBe(true);
 }
});
