import {expect, test} from "@playwright/test";

test("scrollbar presses match on real LTR/RTL, detached, text, root and iframe nodes", async ({page}) => {
  await page.goto("/");
  const rows=await page.evaluate(async()=>{
    const modules=[await import("/reference/scrollbar.js"),await import("/ported/scrollbar.js")];
    const outer=document.createElement("div");
    outer.style.cssText="position:absolute;left:30px;top:40px;width:180px;height:110px;overflow:scroll;border:3px solid black;padding:5px;";
    outer.innerHTML='<div style="width:500px;height:500px">overflow</div>';
    document.body.append(outer);
    const frame=document.createElement("iframe");document.body.append(frame);
    const child=frame.contentDocument!.createElement("div");frame.contentDocument!.body.append(child);
    const results=[];
    for(const direction of ["ltr","rtl"]){
      outer.dir=direction;
      for(const node of [outer,document.documentElement,document.createElement("div"),document.createTextNode("label"),child]){
        const rect=node instanceof Element?node.getBoundingClientRect():{left:0,top:0,width:0,height:0};
        for(const [x,y]of [[0,0],[3,3],[20,20],[rect.width-4,20],[20,rect.height-4],[rect.width,rect.height]]){
          const event=new PointerEvent("pointerdown",{clientX:rect.left+x,clientY:rect.top+y});
          results.push(modules.map(module=>module.pressedScrollbar(event,node)));
        }
      }
    }
    outer.remove();frame.remove();return results;
  });
  for(const [original,ported]of rows)expect(ported).toBe(original);
});

test("scrollbar DOM reads preserve root and zero-size early exits, getter order and thrown identity", async({page})=>{
  await page.goto("/");
  const rows=await page.evaluate(async()=>{
    const modules=[await import("/reference/scrollbar.js"),await import("/ported/scrollbar.js")];
    const originalStyle=window.getComputedStyle;
    try{return ["ordinary","root","zero","throw"].map(kind=>modules.map(module=>{
      const calls:string[]=[];const marker={};
      const field=(object:object,name:string,value:unknown)=>Object.defineProperty(object,name,{configurable:true,get(){calls.push(name);if(kind==="throw"&&name==="clientLeft")throw marker;return value;}});
      const target=document.createElement("div");
      const doc={};field(doc,"documentElement",kind==="root"?target:document.documentElement);field(target,"ownerDocument",doc);
      for(const [name,value]of Object.entries({clientWidth:kind==="zero"?0:80,clientHeight:kind==="zero"?0:60,clientLeft:17,clientTop:2}))field(target,name,value);
      const rect={};for(const[name,value]of Object.entries({left:30,top:40,width:100,height:80}))field(rect,name,value);
      Object.defineProperty(target,"getBoundingClientRect",{value(){calls.push("rect()");return rect;}});
      const style={};for(const[name,value]of Object.entries({borderTopWidth:"2px",borderRightWidth:"nonsense",borderBottomWidth:"-0",borderLeftWidth:"1px"}))field(style,name,value);
      window.getComputedStyle=(()=>{calls.push("style()");return style;}) as typeof getComputedStyle;
      const event={};field(event,"clientX",120);field(event,"clientY",48);
      try{return {value:module.pressedScrollbar(event,target),calls,thrown:false};}catch(error){return {calls,thrown:error===marker};}
    }));}finally{window.getComputedStyle=originalStyle;}
  });
  for(const [original,ported]of rows)expect(ported).toEqual(original);
});
