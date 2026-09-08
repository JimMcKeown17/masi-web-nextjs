"use client";
import {useEffect,useRef,useState} from "react";
import {useAuth} from "@clerk/nextjs";
import useSWR from "swr";
import {useUser} from "@/components/providers/UserProvider";
import {canAccessFinance} from "@/lib/finance/access";
import {financeRunsCacheKey,financePageCursor,getFinanceRunRows,exportFinanceRunRows} from "@/lib/api/finance-runs";
import {downloadFinanceBlob} from "@/lib/finance/export";
import {formatRand} from "@/lib/finance/money";
import {Button} from "@/components/ui/button";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import type {BudgetLine} from "@/lib/types/finance-budgets";
export function BudgetContributors({line,runId,year}: {line:BudgetLine;runId:string;year:number}) {
 const {userId,getToken}=useAuth();const user=useUser();
 if(!userId||!canAccessFinance(user?.capabilities))return <p role="alert">Finance read access is required.</p>;
 return <ContributorsSession key={`${userId}:${runId}:${year}:${line.id}`} line={line} runId={runId} year={year} userId={userId} getToken={getToken}/>;
}
function ContributorsSession({line,runId,year,userId,getToken}: {line:BudgetLine;runId:string;year:number;userId:string;getToken:()=>Promise<string|null>}) {
 const [cursor,setCursor]=useState<string>();const [exporting,setExporting]=useState(false);const [exportError,setExportError]=useState("");
 const active=useRef(true);useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const bc=String(line.bc);
 async function token(){const value=await getToken();if(!value||!active.current)throw new Error("Session changed. Sign in again.");return value;}
 const result=useSWR(financeRunsCacheKey(userId,`rows:budgets:${runId}:${year}:${JSON.stringify(bc)}:${cursor??""}`),async()=>getFinanceRunRows(await token(),runId,{year,bc,cursor}));
 async function download(format:"csv"|"xlsx") {setExporting(true);setExportError("");try{const blob=await exportFinanceRunRows(await token(),runId,{year,bc},format);if(active.current)downloadFinanceBlob(blob,`budget-contributors-${runId}.${format}`);}catch{if(active.current)setExportError("Contributor export failed. Retry the download.");}finally{if(active.current)setExporting(false);}}
 return <section className="space-y-3 rounded border p-4" aria-label="Budget contributors"><h2 className="font-serif text-xl">Contributors for {line.label}</h2><p>Full ledger amounts before budget share. Applied share: {line.actual_share}. BC: {bc}.</p>
 {result.isLoading ? <p role="status">Loading contributors…</p>:null}{result.error ? <p role="alert">Could not load contributors. <Button onClick={()=>void result.mutate()}>Retry contributors</Button></p>:null}
 {result.data&&!result.error ? <><p className="break-all">Pinned ledger: {result.data.ledger_run_id}. Management Accounts SHA-256: {result.data.management_accounts_sha256}</p>
 <Table><TableHeader><TableRow>{["Date","Description","Paid by","Category 1","Category 2","Category 3","BC","Full amount"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{result.data.results.map(row=><TableRow key={row.row_key}>{[row.date,row.description,row.paid_by,row.category_1,row.category_2,row.category_3,row.bc,formatRand(row.amount)].map((cell,i)=><TableCell key={i}>{cell??""}</TableCell>)}</TableRow>)}</TableBody></Table>
 {result.data.results.length===0 ? <p>No contributors for this BC and year.</p>:null}
 <div className="flex flex-wrap gap-2"><Button disabled={!result.data.previous} onClick={()=>setCursor(financePageCursor(result.data!.previous))}>Previous contributors</Button><Button disabled={!result.data.next} onClick={()=>setCursor(financePageCursor(result.data!.next))}>Next contributors</Button></div></>:null}
 <div className="flex flex-wrap gap-2">{(["csv","xlsx"] as const).map(format=><Button key={format} variant="outline" disabled={exporting||Boolean(result.error)||!result.data} onClick={()=>void download(format)}>Download contributors {format.toUpperCase()}</Button>)}</div>{exportError ? <p role="alert">{exportError}</p>:null}
 </section>;
}
