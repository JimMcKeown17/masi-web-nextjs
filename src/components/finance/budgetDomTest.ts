import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx"))("esbuild");
const { JSDOM } = require("jsdom");
export async function budgetDomTest(contents: string) {
  const { outputFiles } = await build({stdin:{contents,resolveDir:process.cwd(),loader:"tsx"},bundle:true,write:false,platform:"browser",jsx:"automatic",define:{"process.env.NODE_ENV":'"production"',"process.env.NEXT_PUBLIC_API_URL":'""'},plugins:[{name:"test-auth",setup(plugin: {onResolve:(options:unknown,callback:(args:{path:string})=>unknown)=>void;onLoad:(options:unknown,callback:()=>unknown)=>void}) {
    plugin.onResolve({filter:/^(@clerk\/nextjs|@\/components\/providers\/UserProvider)$/},args=>({path:args.path,namespace:"auth"}));
    plugin.onLoad({filter:/.*/,namespace:"auth"},()=>({contents:`export const useAuth=()=>({userId:window.actor ?? 'actor-A',getToken:async()=> 'token-'+(window.actor ?? 'actor-A')});export const useUser=()=>({capabilities:window.capabilities ?? ['finance.read','finance.publish']});`}));
  }}]});
  const dom = new JSDOM('<div id="root"></div>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://test.invalid"});
  // Next client components read build-time environment flags in the browser bundle.
  dom.window.process={env:{}};
  dom.window.Response=Response;
  dom.window.Blob=Blob;
  dom.window.TextEncoder=TextEncoder;
  dom.window.TextDecoder=TextDecoder;
  try {dom.window.eval(outputFiles[0].text); await dom.window.result;} finally {dom.window.close();}
}
export const domPrelude = `
import React from 'react'; import {createRoot} from 'react-dom/client'; import {SWRConfig} from 'swr';
const root=createRoot(document.getElementById('root'));
const config={provider:()=>new Map(),revalidateOnFocus:false,shouldRetryOnError:false,dedupingInterval:0};
const pause=()=>new Promise(r=>setTimeout(r,5));
async function until(fn,label){for(let i=0;i<200;i++){if(fn())return;await pause();}throw new Error('Timed out: '+label+' '+document.body.textContent);}
function check(value,label){if(!value)throw new Error(label);}
const button=label=>[...document.querySelectorAll('button')].find(e=>e.textContent===label);
const select=label=>[...document.querySelectorAll('label')].find(e=>e.textContent.startsWith(label))?.querySelector('select');
function change(element,value){element.value=value;element.dispatchEvent(new Event('change',{bubbles:true}));}
const json=(data,status=200)=>Promise.resolve(new Response(JSON.stringify(data),{status}));
`;
