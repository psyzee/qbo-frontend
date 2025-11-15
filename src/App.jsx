import React, { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"
const API_KEY = import.meta.env.VITE_RECEIPTS_API_KEY || "devkey"

function ReceiptPreviewHTML(r){
  const items = (r.line_items||[])
    .map(li=>`<tr class='border-b'><td style="padding:6px 0">${li.name||''}</td><td style="padding:6px 0">${li.description||''}</td><td style='text-align:right;padding:6px 0'>${li.amount||''}</td></tr>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset='utf-8'/>
    <title>Receipt</title>
    <style>
      body{font-family:Roboto,sans-serif;background:#f7f7f7;padding:20px;}
      .card{width:80mm;margin:auto;background:white;padding:16px;border:2px solid #111;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.08);}
      h1{text-align:center;font-family:'Playfair Display',serif;margin:0 0 6px 0;}
      .meta{font-size:12px;color:#444;margin-bottom:8px;text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      td{font-size:13px}
      .total{margin-top:8px;text-align:right;font-weight:700}
      .footer{margin-top:12px;text-align:center;font-size:12px;color:#444}
      .btns{margin-top:12px;text-align:center}
      button{margin:4px;padding:6px 12px;border:none;border-radius:6px;background:#ffcb74;cursor:pointer}
      @media print{.btns{display:none};body{padding:0}}
    </style>
  </head>
  <body>
    <div class='card'>
      <h1>Nations Prayer Mountain</h1>
      <div class="meta">P.O BOX 8085 Kampala Ug • TEL: +256706695466 / +256771930796 • info@worldtrumpetmission.org</div>
      <hr/>
      <div><strong>Date:</strong> ${r.txn_date || ''}</div>
      <div><strong>Receipt #:</strong> ${r.meta?.txn_number || ''}</div>
      <div><strong>With thanks from:</strong> ${r.customer || ''}</div>
      <div><strong>Contact:</strong> ${r.billing_email || ''}</div>

      <table>
        ${items}
      </table>

      <div class="total">Total: ${r.total || ''}</div>
      <div><strong>Served By:</strong> ${r.meta?.served_by || ''}</div>

      <div class="footer">May the Lord Answer your Prayers</div>

      <div class="btns">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
    </div>
  </body>
  </html>`;
}

function ReceiptRow({r,onOpen,onPrint}){
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-neutral-300 mb-4 hover:shadow-md transition">
      <div className="flex justify-between">
        <div>
          <div className="text-lg font-semibold">{r.customer||"Guest"}</div>
          <div className="text-xs text-neutral-500">{r.txn_date} • #{r.meta?.txn_number}</div>
        </div>
        <div className="text-right self-center font-bold">UGX {r.total}</div>
      </div>

      <div className="flex gap-3 mt-3">
        <button onClick={()=>onOpen(r)} className="px-3 py-1.5 rounded-lg bg-accent text-dark shadow hover:scale-105 transition">👁 Preview</button>
        <button onClick={()=>onPrint(r)} className="px-3 py-1.5 rounded-lg bg-mid text-white shadow hover:scale-105 transition">🖨 Print</button>
      </div>
    </div>
  )
}

export default function App(){
  const [receipts,setReceipts] = useState([])
  const [page,setPage] = useState(1)
  const timer = useRef(null)
  const perPage = 10
  const maxKeep = 50

  async function load(){
    try{
      const res = await fetch(API_BASE + '/receipts', { headers: { "X-API-KEY": API_KEY } })
      if(res.status===401){ console.warn("Invalid API key"); return }
      const data = await res.json()
      const arr = Array.isArray(data)?data:(data.receipts||data)
      const sorted = arr.sort((a,b)=> (b.txn_date||'').localeCompare(a.txn_date)).slice(0,maxKeep)
      setReceipts(sorted)
    }catch(e){ console.error(e) }
  }

  useEffect(()=>{
    load()
    timer.current = setInterval(load,5000)
    return ()=> clearInterval(timer.current)
  },[])

  function openReceipt(r){
    const html = ReceiptPreviewHTML(r)
    const w = window.open("","_blank","width=420,height=640,scrollbars=yes")
    if(w){
      w.document.write(html)
      w.document.close()
    } else {
      alert("Popup blocked — allow popups for preview/print.")
    }
  }

  function printReceipt(r){
    openReceipt(r)
  }

  const totalPages = Math.max(1, Math.ceil(receipts.length / perPage))
  const visible = receipts.slice((page-1)*perPage, page*perPage)

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-dark text-light p-6 hidden md:block">
        <img src="https://worldtrumpetmission.org/wp-content/uploads/2021/06/cropped-wtm.png" className="w-16 rounded mb-3"/>
        <h1 className="font-playfair text-xl mb-6">QBO RECEIPTS</h1>

        <button onClick={()=>window.location.href=API_BASE + '/connect'} className="w-full mb-3 px-4 py-2 rounded-xl bg-accent text-dark shadow hover:scale-105 transition">🔌 Connect</button>
        <button onClick={load} className="w-full px-4 py-2 rounded-xl bg-mid text-white shadow hover:scale-105 transition">🔁 Refresh</button>

        <div className="mt-6 text-sm">
          <div>📞 0740744216</div>
          <div>📞 0792168477</div>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-light">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-2xl mb-4">Recent Receipts</h2>
          {visible.map(r=>(<ReceiptRow key={r.id} r={r} onOpen={openReceipt} onPrint={printReceipt}/>))}
          <div className="flex items-center gap-3 mt-4">
            <button className="px-3 py-1 rounded bg-mid text-white" onClick={()=>setPage(1)}>First</button>
            <button className="px-3 py-1 rounded bg-mid text-white" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <div>Page {page} / {totalPages}</div>
            <button className="px-3 py-1 rounded bg-mid text-white" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
            <button className="px-3 py-1 rounded bg-mid text-white" onClick={()=>setPage(totalPages)}>Last</button>
          </div>
        </div>
      </main>
    </div>
)
