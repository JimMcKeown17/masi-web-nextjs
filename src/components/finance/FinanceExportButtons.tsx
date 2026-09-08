"use client";
import {useRef,useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {displayExport,downloadFinanceBlob} from "@/lib/finance/export";
export function FinanceExportButtons({rows,name}: {rows:string[][];name:string}) {
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const active=useRef(true);useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function run(format:"csv"|"xlsx") {
  setBusy(true);setError("");
  try {const blob=await displayExport(rows,format);if(active.current)downloadFinanceBlob(blob,`${name}.${format}`);}
  catch {if(active.current)setError("Export failed. Retry the download.");}
  finally{if(active.current)setBusy(false);}
 }
 return <div className="flex flex-wrap gap-2">{(["csv","xlsx"] as const).map(format=><Button key={format} variant="outline" disabled={busy} onClick={()=>void run(format)}>Export {format.toUpperCase()}</Button>)}{error ? <p role="alert">{error}</p> : null}</div>;
}
