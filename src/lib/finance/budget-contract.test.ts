import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import Ajv from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {displayExport,displayCsv} from "./export";
import ExcelJS from "exceljs";
test("budget golden validates the approved copied schema with fixed digests",()=>{
 const schema=readFileSync(new URL('./budget-run-1.0.0.json',import.meta.url));
 const golden=readFileSync(new URL('./fixtures/budget-run-1.0.0.json',import.meta.url));
 const ajv=new Ajv({strict:false});addFormats(ajv);const validate=ajv.compile(JSON.parse(schema.toString()));assert.equal(validate(JSON.parse(golden.toString())),true,JSON.stringify(validate.errors));
 assert.equal(createHash('sha256').update(schema).digest('hex'),'4e35186a43eaf30cacb9ffc305db8c7f1be954905b9d87ee12afbfae417889b8');
 assert.equal(createHash('sha256').update(golden).digest('hex'),'86c6ada0f86a592d3228544cfe5917d3183a61910e5c97769735d6a49f7c0497');
});
test("CSV and genuine XLSX preserve display strings and formula-like text without evaluation",async()=>{
 const rows=[["Label","Budget"],["=malicious()","-R 0,99"],["Line","budget not set"]];
 const csv=await(await displayExport(rows,'csv')).text();assert.equal(csv,displayCsv(rows));assert.ok(csv.includes("'=malicious()"));
 const blob=await displayExport(rows,'xlsx');const wb=new ExcelJS.Workbook();await wb.xlsx.load(await blob.arrayBuffer());
 assert.deepEqual(wb.worksheets[0].getSheetValues().slice(1).map(row=>(row as string[]).slice(1)),rows);
 assert.equal(wb.worksheets[0].getCell('A2').type,ExcelJS.ValueType.String);
});
