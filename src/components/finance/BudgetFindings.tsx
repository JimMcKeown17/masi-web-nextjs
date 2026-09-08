"use client";
import {useState} from "react";
import type {BudgetFinding} from "@/lib/types/finance-budgets";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {FinanceExportButtons} from "./FinanceExportButtons";
export function BudgetFindings({findings}: {findings:BudgetFinding[]}) {
 const [severity,setSeverity]=useState("");
 const [scope,setScope]=useState("");
 const visible=findings.filter(f=>(!severity||f.severity===severity)&&(!scope||(scope==="in")===f.in_scope_year));
 const headers=["Kind","Year","Severity","Scope","Code","Message","Line","Source cells","BC","Cached","Recomputed","Delta"];
 const rows=visible.map(f=>["budgets",String(f.accounting_year),f.severity,f.in_scope_year ? "In year" : "Outside year",f.code,f.message,f.line_id??f.node_id??"",f.source_cells.join(", "),String(f.bc??""),f.cached??"unavailable",f.recomputed??"unavailable",f.delta??"unavailable"]);
 return <section className="space-y-4" aria-label="Budget findings"><h2 className="font-serif text-2xl">Budget findings</h2>
 <div className="flex flex-wrap gap-4"><label>Severity<select className="ml-2 rounded border bg-background p-2" value={severity} onChange={e=>setSeverity(e.target.value)}><option value="">All severities</option>{["error","warn","info"].map(s=><option key={s}>{s}</option>)}</select></label>
 <label>Finding year scope<select className="ml-2 rounded border bg-background p-2" value={scope} onChange={e=>setScope(e.target.value)}><option value="">All findings</option><option value="in">In year</option><option value="out">Outside year</option></select></label></div>
 <FinanceExportButtons rows={[headers,...rows]} name="budget-findings"/>
 <Table><TableHeader><TableRow>{headers.map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row,i)=><TableRow key={i}>{row.map((cell,j)=><TableCell key={j}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>
 {rows.length===0 ? <p>No findings match these filters.</p>:null}</section>;
}
