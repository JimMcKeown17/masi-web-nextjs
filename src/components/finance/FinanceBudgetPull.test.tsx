import test from 'node:test';
import {budgetDomTest, domPrelude} from './budgetDomTest';

test('Sheets refresh creates a candidate against the selected ledger and never approves it', () => budgetDomTest(domPrelude + `
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import {runFixture} from './src/components/finance/financeRunTestFixture';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
const ledger=runFixture({id:'ledger-one',status:'approved',schema_version:'2.0.0',facts_sha256:'facts'});
const candidate=runFixture({id:'budget-one',kind:'budgets',status:'candidate',manifest:golden.manifest,payload:golden.derived});
const posts=[];
window.fetch=(url,init)=>{
  if(init?.method==='POST'){posts.push({url,init});return json(candidate,201);}
  if(url.includes('/current/'))return json({runs:{},compatible:true});
  if(url.includes('/runs/budget-one/'))return json(candidate);
  return json({results:url.includes('status=approved')?[ledger]:[],next:null,previous:null});
};
window.result=(async()=>{try{
  root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
  await until(()=>button('Budget'),'kind');
  check(!button('Refresh budget from Google Sheets'),'Funders must not offer budget refresh');
  button('Budget').click();await until(()=>button('Budget')?.getAttribute('aria-selected')==='true','budget tab');
  await until(()=>select('Management Accounts source')?.options.length===2,'ledger choices');
  check(select('Management Accounts source').value==='ledger-one','Newest eligible ledger defaults automatically');
  change(select('Management Accounts source'),'ledger-one');
  await until(()=>button('Refresh budget from Google Sheets')&&!button('Refresh budget from Google Sheets').disabled,'refresh enabled');
  button('Refresh budget from Google Sheets').click();
  await until(()=>document.body.textContent.includes('Import complete'),'candidate');
  check(posts.length===1&&posts[0].url==='/finance/runs/pull-budget/','Only the pull request is sent');
  check(posts[0].init.headers.Authorization==='Bearer token-actor-A','Bearer auth');
  check(JSON.stringify(JSON.parse(posts[0].init.body))===JSON.stringify({year:2026,ledger_run_id:'ledger-one'}),'Only year and ledger are submitted');
  check(select('Management Accounts source').value==='ledger-one','Selected ledger retained');
  check(button('Review and approve'),'Candidate remains reviewable');
}finally{root.unmount();}})();`));

test('Sheets access failure explains upload fallback and preserves the selected ledger', () => budgetDomTest(domPrelude + `
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import {runFixture} from './src/components/finance/financeRunTestFixture';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
const ledger=runFixture({id:'ledger-one',status:'approved',schema_version:'2.0.0',facts_sha256:'facts'});
const candidate=runFixture({id:'budget-one',kind:'budgets',status:'candidate',manifest:golden.manifest,payload:golden.derived});
const posts=[];
window.fetch=(url,init)=>{
 if(init?.method==='POST'){posts.push({url,init});return url.includes('pull-budget')?json({code:'BUDGET_PULL_ACCESS_DENIED'},503):json(candidate,201);}
 if(url.includes('/current/'))return json({runs:{},compatible:true});
 if(url.includes('/runs/budget-one/'))return json(candidate);
 return json({results:url.includes('status=approved')?[ledger]:[],next:null,previous:null});
};
window.result=(async()=>{try{
 root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
 await until(()=>button('Budget'),'kind');button('Budget').click();await until(()=>button('Budget')?.getAttribute('aria-selected')==='true','budget tab');
 await until(()=>select('Management Accounts source')?.options.length===2,'ledgers');change(select('Management Accounts source'),'ledger-one');
 await until(()=>!button('Refresh budget from Google Sheets').disabled,'ready');button('Refresh budget from Google Sheets').click();
 await until(()=>document.querySelector('[role=alert]'),'safe failure');
 check(document.querySelector('[role=alert]').textContent.includes('Google Sheets access was denied'),'Specific access guidance');
 check(document.querySelector('[role=alert]').textContent.includes('upload an exported workbook'),'Actionable fallback');
 check(select('Management Accounts source').value==='ledger-one','Ledger remains selected');
 const input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:[new File(['synthetic'], '20260907 - Synthetic.xlsx')]});input.dispatchEvent(new Event('change',{bubbles:true}));
 await until(()=>!button('Upload budget workbook').disabled,'fallback ready');button('Upload budget workbook').click();
 await until(()=>document.body.textContent.includes('Import complete'),'fallback candidate');
 check(posts.length===2,'One pull and one upload only');
 check(new URL(posts[1].url,'https://test.invalid').searchParams.get('ledger_run_id')==='ledger-one','Fallback uses same ledger');
}finally{root.unmount();}})();`));

test('a delayed dependency page cannot fetch its next page after an account switch', () => budgetDomTest(domPrelude + `
import {FinanceUpload} from './src/components/finance/FinanceUpload';
let resolvePage;const requests=[];let replaced=false;
window.fetch=(url,init)=>{
 requests.push({url,auth:init.headers.Authorization,replaced});
 if(url.includes('status=approved'))return new Promise(resolve=>{resolvePage=resolve;});
 if(url.includes('/current/'))return json({runs:{},compatible:true});
 return json({results:[],next:null,previous:null});
};
function Replacement(){React.useLayoutEffect(()=>{replaced=true;},[]);return <p>B committed</p>;}
window.result=(async()=>{try{
 root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
 await until(()=>button('Budget'),'kind');button('Budget').click();await until(()=>button('Budget')?.getAttribute('aria-selected')==='true','budget tab');
 await until(()=>resolvePage,'first dependency page');
 root.render(<SWRConfig value={config}><Replacement/></SWRConfig>);
 await until(()=>replaced,'B committed');await pause();
 resolvePage(new Response(JSON.stringify({results:[],next:'/finance/runs/?cursor=second',previous:null})));
 await pause();await pause();
 check(!requests.some(request=>request.replaced&&request.url.includes('cursor=second')),'No next-page request from the old context');
}finally{root.unmount();}})();`));

test('default skips ineligible sources and preserves an explicit older approved selection', () => budgetDomTest(domPrelude + `
import {FinanceUpload} from './src/components/finance/FinanceUpload';
import {runFixture} from './src/components/finance/financeRunTestFixture';
import golden from './src/lib/finance/fixtures/budget-run-1.0.0.json';
const newest=runFixture({id:'newest',status:'approved',facts_sha256:'facts'});
const older=runFixture({id:'older',status:'approved',facts_sha256:'facts'});
const legacy=runFixture({id:'legacy',status:'approved',schema_version:'1.0.0',facts_sha256:null});
const candidate=runFixture({id:'budget-choice',kind:'budgets',manifest:golden.manifest,payload:golden.derived});
const posts=[];
window.fetch=(url,init)=>{
 if(init?.method==='POST'){posts.push({url,body:JSON.parse(init.body)});return json(candidate,201);}
 if(url.includes('/current/'))return json({runs:{},compatible:true});
 if(url.includes('/runs/budget-choice/'))return json(candidate);
 return json({results:url.includes('status=approved')?[legacy,newest,older]:[],next:null,previous:null});
};
window.result=(async()=>{try{
 root.render(<SWRConfig value={config}><FinanceUpload/></SWRConfig>);
 await until(()=>button('Budget'),'kind');
 check(button('Management Accounts').getAttribute('aria-selected')==='true','Workbook name matches operator terminology');
 button('Budget').click();await until(()=>button('Budget')?.getAttribute('aria-selected')==='true','budget tab');
 await until(()=>select('Management Accounts source')?.value==='newest','eligible default');
 check(![...select('Management Accounts source').options].some(option=>option.value==='legacy'),'Legacy is not eligible');
 change(select('Management Accounts source'),'older');
 await pause();button('Refresh budget from Google Sheets').click();
 await until(()=>document.body.textContent.includes('Awaiting approval'),'approval guidance');
 check(posts.length===1&&posts[0].body.ledger_run_id==='older','Manual source is retained and no approval is sent');
 check(select('Management Accounts source').value==='older','Source survives refresh');
 const summary=document.querySelector('[aria-label="Selected run summary"]');
 check(summary.textContent.indexOf('Awaiting approval')<summary.textContent.indexOf('Findings'),'Next step precedes long findings');
 check(summary.querySelector('button').textContent==='Review and approve','Approval action precedes budget preview and findings');
}finally{root.unmount();}})();`));
