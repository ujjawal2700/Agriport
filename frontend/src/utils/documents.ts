import type { Order } from '@/types'
import { formatMoney, formatDate } from './format'
import { currentUser } from '@/mocks/data'

// Opens a print-ready document in a new window. The browser's "Save as PDF"
// turns this into a downloadable invoice / gate pass — no backend required.
function openPrintable(title: string, bodyHtml: string) {
  const win = window.open('', '_blank', 'width=820,height=900')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>${title}</title>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', system-ui, Arial, sans-serif; color:#161B24; margin:0; padding:48px; }
    .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #11543B; padding-bottom:20px; margin-bottom:28px; }
    .brand { font-weight:800; font-size:26px; color:#0E432F; letter-spacing:-0.02em; }
    .muted { color:#6B7585; font-size:13px; }
    .tag { display:inline-block; background:#EAF6F0; color:#11543B; font-weight:700; font-size:12px; padding:4px 10px; border-radius:6px; letter-spacing:0.06em; }
    table { width:100%; border-collapse:collapse; margin-top:18px; }
    th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#6B7585; border-bottom:1px solid #E2E6EC; padding:10px 8px; }
    td { padding:12px 8px; border-bottom:1px solid #EDEFF3; font-size:14px; }
    .right { text-align:right; }
    .totals { margin-top:18px; margin-left:auto; width:300px; }
    .totals .row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; }
    .totals .grand { border-top:2px solid #161B24; margin-top:8px; padding-top:10px; font-weight:800; font-size:18px; }
    .foot { margin-top:48px; color:#9AA4B2; font-size:12px; text-align:center; }
    .grid2 { display:flex; gap:48px; margin-bottom:8px; }
    @media print { body { padding:24px; } }
  </style></head><body>${bodyHtml}
  <script>window.onload=()=>{window.print()}</script></body></html>`)
  win.document.close()
}

export function downloadInvoice(order: Order) {
  const rows = order.lines
    .map(
      (l) => `<tr><td>${l.name}</td><td class="right">${l.quantity} ${l.unit}</td>
      <td class="right">${formatMoney(l.unitPrice)}</td><td class="right">${formatMoney(l.lineTotal)}</td></tr>`,
    )
    .join('')
  openPrintable(
    `Invoice ${order.invoiceNo ?? order.reference}`,
    `<div class="head">
      <div><div class="brand">Agriport</div><div class="muted">Wholesale Trading · CRM</div></div>
      <div class="right"><span class="tag">TAX INVOICE</span>
      <div class="muted" style="margin-top:8px">${order.invoiceNo ?? order.reference}</div>
      <div class="muted">${formatDate(order.placedOn)}</div></div>
    </div>
    <div class="grid2">
      <div><div class="muted">BILLED TO</div><strong>${currentUser.companyName}</strong>
      <div class="muted">${currentUser.address}</div><div class="muted">GST: ${currentUser.gstNumber}</div></div>
      <div><div class="muted">ORDER</div><strong>${order.reference}</strong>
      <div class="muted">Payment: ${order.paymentMode.toUpperCase()} · ${order.paymentStatus}</div></div>
    </div>
    <table><thead><tr><th>Product</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${formatMoney(order.subtotal)}</span></div>
      <div class="row"><span>GST (5%)</span><span>${formatMoney(order.tax)}</span></div>
      <div class="row"><span>Shipping</span><span>${formatMoney(order.shipping)}</span></div>
      <div class="row grand"><span>Total</span><span>${formatMoney(order.total)}</span></div>
    </div>
    <div class="foot">This is a system-generated invoice for client review. © Agriport — B2B Wholesale Trading Platform.</div>`,
  )
}

export function downloadGatePass(order: Order) {
  const rows = order.lines
    .map((l) => `<tr><td>${l.name}</td><td class="right">${l.quantity} ${l.unit}</td></tr>`)
    .join('')
  openPrintable(
    `Gate Pass ${order.gatePassNo ?? order.reference}`,
    `<div class="head">
      <div><div class="brand">Agriport</div><div class="muted">Warehouse Gate Pass</div></div>
      <div class="right"><span class="tag">GATE PASS</span>
      <div class="muted" style="margin-top:8px">${order.gatePassNo ?? '—'}</div></div>
    </div>
    <div class="grid2">
      <div><div class="muted">ORDER REF</div><strong>${order.reference}</strong></div>
      <div><div class="muted">PICKUP</div><strong>${order.pickupAddress ?? '—'}</strong></div>
    </div>
    <table><thead><tr><th>Product</th><th class="right">Quantity</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="foot">Present this gate pass at the warehouse for collection. Security verification required.</div>`,
  )
}
