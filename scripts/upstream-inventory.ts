import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'..');
const config=await Bun.file(resolve(root,'upstream.json')).json();
const source=resolve(process.env.UI_SDK_UPSTREAM_DIR??resolve(root,config.defaultCheckout));
function git(...args:string[]){
 const result=Bun.spawnSync(['git','-C',source,...args],{timeout:10000,stdout:'pipe',stderr:'pipe'});
 if(result.exitCode!==0)throw Error(new TextDecoder().decode(result.stderr));
 return new TextDecoder().decode(result.stdout);
}
if(git('rev-parse','HEAD').trim()!==config.revision)throw Error('Upstream checkout does not match upstream.json.');
const scope=(path:string)=>{
 if(path.startsWith('packages/core/src/'))return 'core';
 if(path.startsWith('packages/web/src/'))return 'web';
 if(path.startsWith('apps/docs/content/docs/')){
  const section=path.slice('apps/docs/content/docs/'.length).split('/')[0];
  return ['react','vue','svelte','solid'].includes(section)?'docs-deferred-frameworks':'docs-content';
 }
 if(path.startsWith('apps/docs/'))return 'docs-application';
 if(path.startsWith('examples/')&&path.includes('/web/'))return 'web-examples';
 if(path.startsWith('examples/')&&path.endsWith('.css'))return 'example-styles';
 if(path.startsWith('tests/')||/^packages\/(core|web)\/test\//.test(path))return 'reference-tests';
 if(path.startsWith('assets/'))return 'assets';
};
const paths=git('ls-files','-z').split('\0').filter(Boolean).filter(path=>scope(path));
const files=await Promise.all(paths.map(async path=>{
 const bytes=await Bun.file(resolve(source,path)).bytes();
 return {path,area:scope(path),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
}));
const packages:Record<string,unknown>={};
for(const name of ['core','web']){
 const pkg=await Bun.file(resolve(source,'packages',name,'package.json')).json();
 packages[name]={name:pkg.name,version:pkg.version,exports:pkg.exports};
}
const inventory={schemaVersion:1,upstream:config.repository,revision:config.revision,license:config.license,packages,files};
const output=JSON.stringify(inventory,null,2)+'\n',destination=resolve(root,'docs/upstream-inventory.json');
if(process.argv.includes('--check')){
 if(!await Bun.file(destination).exists()||await Bun.file(destination).text()!==output)throw Error('Source inventory is stale. Run bun scripts/upstream-inventory.ts.');
}else await Bun.write(destination,output);
const counts:Record<string,number>={};for(const file of files)counts[file.area]=(counts[file.area]??0)+1;
console.log(JSON.stringify({revision:config.revision,files:files.length,counts},null,2));
