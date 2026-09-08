"use client";
import {financeCurrentMessage} from "@/lib/finance/currentMessage";
import {useState} from "react";
import {useAuth} from "@clerk/nextjs";
import useSWR from "swr";
import {useUser} from "@/components/providers/UserProvider";
import {canAccessFinance} from "@/lib/finance/access";
import {financeRunsCacheKey,getFinanceCurrent,getFinanceRun} from "@/lib/api/finance-runs";
import {Button} from "@/components/ui/button";
import {FinanceBudgetsView} from "./FinanceBudgets";
import {BudgetFindings} from "./BudgetFindings";
export function FinanceBudgets({findingsOnly=false,year:requestedYear}: {findingsOnly?:boolean;year?:number}) {
 const {userId,getToken}=useAuth();const user=useUser();
 const [year,setYear]=useState(new Date().getFullYear());
 if(!userId||!canAccessFinance(user?.capabilities))return <p role="alert">Finance read access is required.</p>;
 const selectedYear=requestedYear??year;
 return <div className="space-y-4">{requestedYear===undefined ? <label>Accounting year<input className="ml-2 rounded border bg-background p-2" type="number" min={1} max={32767} value={year} onChange={event=>{const n=Number(event.target.value);if(Number.isInteger(n)&&n>0&&n<=32767)setYear(n);}}/></label>:null}
 <BudgetReaderSession key={`${userId}:${selectedYear}`} userId={userId} getToken={getToken} year={selectedYear} findingsOnly={findingsOnly}/></div>;
}
function BudgetReaderSession({userId,getToken,year,findingsOnly}: {userId:string;getToken:()=>Promise<string|null>;year:number;findingsOnly:boolean}) {
 async function token(){const value=await getToken();if(!value)throw new Error("Not authenticated");return value;}
 const current=useSWR(financeRunsCacheKey(userId,`current:${year}`),async()=>getFinanceCurrent(await token(),year));
 const id=!current.error ? current.data?.runs.budgets?.id:undefined;
 const detail=useSWR(id ? financeRunsCacheKey(userId,`detail:${id}`):null,async()=>getFinanceRun(await token(),id!));
 const error=current.error||detail.error;
 if(error)return <p role="alert">Could not load approved budgets. {error instanceof Error ? error.message:""} <Button onClick={()=>{void current.mutate();void detail.mutate();}}>Retry budgets</Button></p>;
 if(current.isLoading||detail.isLoading)return <p role="status">Loading approved budgets…</p>;
 if(!id)return <p>No approved budget run for {year}.</p>;
 const run=detail.data;
 if(!run)return <p role="status">Loading approved budgets…</p>;
 if(run.kind!=="budgets"||run.status!=="approved"||run.accounting_year!==year||!run.payload)return <p role="alert">Approved budget data is unavailable. Refresh the current run.</p>;
 return findingsOnly ? <><p className="break-all">Budget run: {id}. Pinned ledger: {run.dependency_run}.</p>{current.data&&!current.data.compatible ? <p role="status">{financeCurrentMessage(current.data)}</p>:null}<BudgetFindings key={id} findings={run.payload.findings}/></> : <FinanceBudgetsView key={id} payload={run.payload} manifest={run.manifest} runId={id} compatibility={current.data}/>;
}
