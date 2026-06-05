import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded'

import { useGetOrdersQuery } from '@/redux/api'
import { orders as mockOrders } from '@/mocks/data'
import { salesRecords as mockSalesRecords } from '@/mocks/salesData'
import type { Order, OrderStatus, SaleRecord, PaymentStatus } from '@/types'
import StatusChip from '@/components/common/StatusChip'
import ProductThumb from '@/components/common/ProductThumb'
import { formatDate, formatMoney } from '@/utils/format'
import { generateQuotationInvoice } from '@/utils/documents'
import toast from 'react-hot-toast'

type Filter = 'all' | OrderStatus

export default function ExecutiveEnquiriesPage() {
  const { data: serverOrders, refetch } = useGetOrdersQuery()
  const [rows, setRows] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [myCustomersOnly, setMyCustomersOnly] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Order | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // ── Pricing dialog state ────────────────────────────────────────────────────
  const [pricingOpen, setPricingOpen] = useState(false)
  const [pricingEnquiry, setPricingEnquiry] = useState<Order | null>(null)
  const [linePrices, setLinePrices] = useState<Record<string, number>>({})
  const [shippingCharge, setShippingCharge] = useState(1500)
  // Stored WhatsApp message after invoice generation
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)

  useEffect(() => {
    // Read directly from the shared array in data.ts to ensure session updates are visible
    setRows([...mockOrders])
  }, [serverOrders])

  // Count enquiries per status
  const counts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {})
  }, [rows])

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    const s = search.toLowerCase()
    return rows.filter((o) => {
      // Search
      const matchSearch =
        o.reference.toLowerCase().includes(s) ||
        (o.companyName && o.companyName.toLowerCase().includes(s)) ||
        (o.customerName && o.customerName.toLowerCase().includes(s))
      if (!matchSearch) return false

      // Tab filter
      if (filter !== 'all' && o.status !== filter) return false

      // Sales Executive assignment filter (Rahul Verma)
      // Rohan Mehta (Megha Trading Co.) and Sana Qureshi (Qureshi Agro) are owned by Rahul Verma.
      if (myCustomersOnly) {
        const belongsToMe =
          o.companyName === 'Megha Trading Co.' ||
          o.companyName === 'Qureshi Agro' ||
          o.customerName === 'Rohan Mehta' ||
          o.customerName === 'Sana Qureshi'
        if (!belongsToMe) return false
      }

      return true
    })
  }, [rows, filter, search, myCustomersOnly])

  const patchOrder = (id: string, status: OrderStatus, paymentStatus?: PaymentStatus, timelineLabel?: string, extra?: Partial<Order>) => {
    const updated = mockOrders.map((o) => {
      if (o.id === id) {
        const newTimeline = o.trackingTimeline.map((t) => {
          if (t.label === timelineLabel || t.label.toLowerCase().includes(status)) {
            return { ...t, done: true, at: new Date().toISOString() }
          }
          return t
        })
        return {
          ...o,
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
          trackingTimeline: newTimeline,
          ...extra,
        }
      }
      return o
    })
    
    // Update shared memory
    mockOrders.length = 0
    mockOrders.push(...updated)
    setRows([...mockOrders])

    // Update active modal reference if open
    if (selectedEnquiry && selectedEnquiry.id === id) {
      const activeObj = mockOrders.find((x) => x.id === id)
      if (activeObj) setSelectedEnquiry(activeObj)
    }

    refetch()
  }

  /** Open the price-entry dialog instead of immediately confirming */
  const handleConfirm = (o: Order) => {
    setPricingEnquiry(o)
    // Pre-fill with any existing quoted prices, or 0
    const initial = Object.fromEntries(
      o.lines.map((l) => [l.productId, o.quotedPrices?.[l.productId] ?? l.unitPrice ?? 0]),
    )
    setLinePrices(initial)
    setShippingCharge(o.quotedShipping ?? 1500)
    setWhatsappMsg(null)
    setPricingOpen(true)
  }

  /** Confirm enquiry, save prices, generate invoice, prepare WhatsApp message */
  const handlePricingConfirm = () => {
    if (!pricingEnquiry) return
    const allFilled = pricingEnquiry.lines.every((l) => (linePrices[l.productId] ?? 0) > 0)
    if (!allFilled) {
      toast.error('Please enter a price for every product before confirming.')
      return
    }
    // Save prices to the order object
    patchOrder(pricingEnquiry.id, 'confirmed', undefined, 'Admin approval', {
      quotedPrices: { ...linePrices },
      quotedShipping: shippingCharge,
    })
    // Generate printable invoice + get WhatsApp message string
    const msg = generateQuotationInvoice(pricingEnquiry, linePrices, shippingCharge)
    setWhatsappMsg(msg)
    toast.success(`Enquiry ${pricingEnquiry.reference} confirmed! Invoice generated.`)
  }

  const handleSendWhatsApp = (order: Order, msg: string) => {
    const phone = order.customerPhone?.replace(/[^0-9]/g, '') ?? ''
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleRePrintInvoice = (o: Order) => {
    const prices = o.quotedPrices ?? Object.fromEntries(o.lines.map((l) => [l.productId, l.unitPrice ?? 0]))
    const msg = generateQuotationInvoice(o, prices, o.quotedShipping ?? 1500)
    setWhatsappMsg(msg)
  }

  const handleCancelSubmit = () => {
    if (!selectedEnquiry) return
    patchOrder(selectedEnquiry.id, 'cancelled', 'refunded', 'Cancelled', {
      cancellationReason: cancelReason || 'Cancelled by sales executive',
      refundStatus: 'No refund required (B2B Enquiry)',
    })
    toast.success(`Enquiry ${selectedEnquiry.reference} cancelled.`)
    setCancelOpen(false)
    setCancelReason('')
  }

  const handleRecordSale = (o: Order) => {
    // 1. Mark order status as completed & payment as paid
    patchOrder(o.id, 'completed', 'paid', 'Delivered')

    // 2. Generate sales records for each line item and insert into mockSalesRecords
    o.lines.forEach((line, index) => {
      const record: SaleRecord = {
        id: `s-${Date.now()}-${index}`,
        ref: `SL-${o.reference.slice(-4)}-${index}`,
        customer: o.companyName || o.customerName || 'Unknown Customer',
        product: line.name,
        quantity: line.quantity,
        unit: line.unit,
        amount: line.lineTotal,
        date: new Date().toISOString(),
        paymentStatus: 'paid',
        by: 'Rahul Verma', // Logged-in executive
      }
      mockSalesRecords.unshift(record)
    })

    toast.success(`Deal Closed! Sale recorded for ${o.reference}.`)
  }

  const getTimelineDate = (timeline: Order['trackingTimeline'], label: string) => {
    const found = timeline.find((t) => t.label.toLowerCase().includes(label.toLowerCase()))
    return found && found.at ? formatDate(found.at, true) : 'Pending'
  }

  return (
    <Box className="flex flex-col gap-6 animate-fade-up">
      {/* Stats Summary Bar */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Enquiries', val: rows.length, color: 'var(--ink-700)', bg: 'var(--ink-50)' },
          { label: 'Pending Review', val: counts.placed ?? 0, color: 'orange', bg: '#FFF7ED' },
          { label: 'Confirmed', val: counts.confirmed ?? 0, color: 'var(--brand-700)', bg: 'var(--brand-50)' },
          { label: 'Completed (Deals Closed)', val: counts.completed ?? 0, color: 'green', bg: '#F0FDF4' },
        ].map((stat, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              borderRadius: 4,
              border: '1px solid var(--ink-200)',
              bgcolor: stat.bg,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{stat.label}</Typography>
            <Typography
              className="tnum"
              sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 32, color: stat.color, mt: 0.5 }}
            >
              {stat.val}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tabs Filter */}
      <Box sx={{ borderBottom: '1px solid var(--ink-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="scrollable" scrollButtons="auto">
          <Tab value="all" label={`All (${rows.length})`} />
          <Tab value="placed" label={`Placed (${counts.placed ?? 0})`} />
          <Tab value="confirmed" label={`Confirmed (${counts.confirmed ?? 0})`} />
          <Tab value="completed" label={`Completed (${counts.completed ?? 0})`} />
          <Tab value="cancelled" label={`Cancelled (${counts.cancelled ?? 0})`} />
        </Tabs>
        <FormControlLabel
          control={<Switch checked={myCustomersOnly} onChange={(e) => setMyCustomersOnly(e.target.checked)} color="primary" />}
          label="My Customers Only"
          sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontSize: 13.5, fontWeight: 600, color: 'var(--ink-600)' } }}
        />
      </Box>

      {/* Search and Filters */}
      <Box className="flex gap-3 items-center">
        <TextField
          placeholder="Search by ref, customer, or business name..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchRoundedIcon sx={{ color: 'var(--ink-400)', mr: 1 }} fontSize="small" />,
            },
          }}
          sx={{ bgcolor: '#fff', borderRadius: 2 }}
        />
      </Box>

      {/* Enquiries List */}
      {filteredEnquiries.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            border: '1px solid var(--ink-200)',
            borderRadius: 4,
            bgcolor: '#fff',
          }}
        >
          <ReceiptLongRoundedIcon sx={{ fontSize: 48, color: 'var(--ink-300)', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'var(--ink-800)' }}>No enquiries found</Typography>
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)', mt: 0.5 }}>
            No customer enquiries match your current filters.
          </Typography>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEnquiries.map((enquiry) => {
            const itemCount = enquiry.lines.reduce((n, l) => n + l.quantity, 0)
            const isMine =
              enquiry.companyName === 'Megha Trading Co.' ||
              enquiry.companyName === 'Qureshi Agro' ||
              enquiry.customerName === 'Rohan Mehta' ||
              enquiry.customerName === 'Sana Qureshi'

            return (
              <Box key={enquiry.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: isMine ? '1.5px solid var(--brand-300)' : '1px solid var(--ink-200)',
                    bgcolor: '#fff',
                    boxShadow: 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: isMine ? 'var(--brand-500)' : 'var(--ink-400)',
                      boxShadow: '0 4px 12px rgba(22,27,36,0.04)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box className="flex justify-between items-start gap-2 mb-3">
                      <Box>
                        <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 15.5, color: 'var(--ink-900)' }}>
                          {enquiry.reference}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', mt: 0.25 }}>
                          Placed on: {formatDate(enquiry.placedOn)}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-1.5">
                        {isMine && (
                          <Chip
                            label="MY CUSTOMER"
                            size="small"
                            sx={{
                              bgcolor: 'var(--brand-50)',
                              color: 'var(--brand-700)',
                              fontSize: 10,
                              fontWeight: 700,
                              height: 20,
                              borderRadius: 1,
                            }}
                          />
                        )}
                        <StatusChip kind="order" value={enquiry.status} />
                      </Box>
                    </Box>

                    {/* Customer info */}
                    <Box sx={{ bgcolor: 'var(--ink-50)', p: 1.5, borderRadius: 2, mb: 3 }}>
                      <Box className="flex items-center gap-2 mb-1">
                        <BusinessRoundedIcon sx={{ fontSize: 15, color: 'var(--ink-500)' }} />
                        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
                          {enquiry.companyName || 'Unknown Company'}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <ContactsRoundedIcon sx={{ fontSize: 15, color: 'var(--ink-500)' }} />
                        <Typography sx={{ fontSize: 12.5, color: 'var(--ink-600)' }}>
                          {enquiry.customerName} · {enquiry.customerCity}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Requested items breakdown summary */}
                    <Box sx={{ mb: 3.5 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-400)', letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1 }}>
                        Requested Products ({enquiry.lines.length})
                      </Typography>
                      <Box className="flex flex-col gap-2">
                        {enquiry.lines.map((l, idx) => (
                          <Box key={idx} className="flex justify-between items-center text-sm">
                            <Typography sx={{ fontWeight: 500, fontSize: 13.5, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {l.name}
                            </Typography>
                            <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-700)' }}>
                              {l.quantity} {l.unit}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.75 }} />

                    <Box className="flex justify-between items-center">
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                        Total volume: <strong>{itemCount} units</strong>
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedEnquiry(enquiry)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        Review details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Enquiry Detail Dialog */}
      <Dialog open={Boolean(selectedEnquiry)} onClose={() => setSelectedEnquiry(null)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        {selectedEnquiry && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                  Review Enquiry: {selectedEnquiry.reference}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-400)', mt: 0.25 }}>
                  Submitted: {formatDate(selectedEnquiry.placedOn, true)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedEnquiry(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
              {/* Customer information section */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Customer details
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4" sx={{ bgcolor: 'var(--ink-50)', p: 2, borderRadius: 3 }}>
                  <Box>
                    <Box className="flex items-center gap-2 mb-1.5">
                      <BusinessRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>COMPANY NAME</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                      {selectedEnquiry.companyName || '—'}
                    </Typography>
                  </Box>

                  <Box>
                    <Box className="flex items-center gap-2 mb-1.5">
                      <ContactsRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>CONTACT PERSON</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                      {selectedEnquiry.customerName || '—'}
                    </Typography>
                  </Box>

                  <Box>
                    <Box className="flex items-center gap-2 mb-1.5">
                      <PhoneRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>PHONE NUMBER</Typography>
                    </Box>
                    <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14 }}>
                      {selectedEnquiry.customerPhone || '—'}
                    </Typography>
                  </Box>

                  <Box>
                    <Box className="flex items-center gap-2 mb-1.5">
                      <PlaceRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>LOCATION / CITY</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                      {selectedEnquiry.customerCity || '—'}
                    </Typography>
                  </Box>

                  <Box className="sm:col-span-2">
                    <Box className="flex items-center gap-2 mb-1.5">
                      <PlaceRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>DELIVERY ADDRESS</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 500, fontSize: 13.5 }}>
                      {selectedEnquiry.deliveryAddress || 'Pickup from Agriport Warehouse'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Items Breakdown list with specs */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Requested Items & Specifications
                </Typography>
                <Box className="flex flex-col gap-3">
                  {selectedEnquiry.lines.map((line) => {
                    const specs = line.specifications || {}
                    const size = specs['Specific Size'] || 'Default'
                    const container = specs['Container Option'] || 'Not specified'
                    const packing = specs['Packing Type'] || 'Standard'

                    return (
                      <Box
                        key={line.productId}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid var(--ink-200)',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ width: 64, height: 64, flexShrink: 0 }}>
                          <ProductThumb id={line.productId} name={line.name} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{line.name}</Typography>
                          <Box className="flex gap-2 flex-wrap mt-1.5">
                            <Chip label={`Size: ${size}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11.5 }} />
                            <Chip label={`Container: ${container}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11.5 }} />
                            <Chip label={`Packing: ${packing}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11.5 }} />
                          </Box>
                        </Box>
                        <Typography className="tnum" sx={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-700)', minWidth: 80, textAlign: 'right' }}>
                          {line.quantity} {line.unit}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Timeline tracking status */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Timeline tracking
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4" sx={{ pl: 1 }}>
                  {[
                    { label: 'Placed', date: getTimelineDate(selectedEnquiry.trackingTimeline, 'placed') },
                    { label: 'Confirmed (Approved)', date: getTimelineDate(selectedEnquiry.trackingTimeline, 'approval') },
                    { label: 'Delivered (Sale Recorded)', date: getTimelineDate(selectedEnquiry.trackingTimeline, 'delivered') },
                  ].map((step, idx) => (
                    <Box key={idx} className="flex items-center gap-2">
                      <CheckCircleRoundedIcon
                        sx={{ color: step.date !== 'Pending' ? 'var(--brand-500)' : 'var(--ink-300)', fontSize: 20 }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{step.label}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)' }}>{step.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
              <Box>
                {selectedEnquiry.status === 'placed' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelRoundedIcon />}
                    onClick={() => setCancelOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Cancel enquiry
                  </Button>
                )}
              </Box>
              <Box className="flex gap-2">
                <Button
                  onClick={() => setSelectedEnquiry(null)}
                  variant="outlined"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                  Close
                </Button>

                {selectedEnquiry.status === 'placed' && (
                  <Button
                    variant="contained"
                    startIcon={<CurrencyRupeeRoundedIcon />}
                    onClick={() => handleConfirm(selectedEnquiry)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Set Prices & Confirm
                  </Button>
                )}

                {(selectedEnquiry.status === 'confirmed' || selectedEnquiry.status === 'completed') && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PrintRoundedIcon />}
                      onClick={() => handleRePrintInvoice(selectedEnquiry)}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Print Invoice
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => {
                        const msg = `Hello ${selectedEnquiry.customerName ?? 'Customer'},\n\nPlease find your quotation from *Agriport* for Enquiry ${selectedEnquiry.reference}. For full invoice, please contact your sales executive.\n\nRegards,\nRahul Verma — Agriport Sales`
                        handleSendWhatsApp(selectedEnquiry, msg)
                      }}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Send to WhatsApp
                    </Button>
                  </>
                )}

                {selectedEnquiry.status === 'confirmed' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ShoppingCartRoundedIcon />}
                    onClick={() => {
                      handleRecordSale(selectedEnquiry)
                      setSelectedEnquiry(null)
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Record Sale (Log Deal)
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Price Entry Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={pricingOpen}
        onClose={() => { if (!whatsappMsg) { setPricingOpen(false); setPricingEnquiry(null) } }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Set Prices & Generate Invoice</Typography>
            {pricingEnquiry && (
              <Typography sx={{ fontSize: 12.5, color: 'var(--ink-400)', mt: 0.25 }}>
                {pricingEnquiry.reference} · {pricingEnquiry.companyName || pricingEnquiry.customerName}
              </Typography>
            )}
          </Box>
          {!whatsappMsg && (
            <IconButton size="small" onClick={() => { setPricingOpen(false); setPricingEnquiry(null) }}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          {pricingEnquiry && !whatsappMsg && (
            <>
              <Typography sx={{ fontSize: 13.5, color: 'var(--ink-600)' }}>
                Enter the <strong>agreed unit price (₹)</strong> for each product. Line totals will be calculated automatically.
              </Typography>

              {/* Product price rows */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pricingEnquiry.lines.map((line) => {
                  const unitPrice = linePrices[line.productId] ?? 0
                  const lineTotal = unitPrice * line.quantity
                  return (
                    <Box
                      key={line.productId}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid var(--ink-200)',
                        bgcolor: '#FAFAFA',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ width: 48, height: 48, flexShrink: 0 }}>
                          <ProductThumb id={line.productId} name={line.name} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{line.name}</Typography>
                          <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                            Requested: <strong>{line.quantity} {line.unit}</strong>
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          label="Unit Price"
                          size="small"
                          type="number"
                          value={unitPrice || ''}
                          onChange={(e) =>
                            setLinePrices((prev) => ({ ...prev, [line.productId]: Number(e.target.value) }))
                          }
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography sx={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 600 }}>₹</Typography>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{ flex: 1 }}
                          placeholder="Enter price per unit"
                        />
                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                          <Typography sx={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Line Total</Typography>
                          <Typography
                            className="tnum"
                            sx={{ fontWeight: 800, fontSize: 16, color: lineTotal > 0 ? 'var(--brand-700)' : 'var(--ink-300)' }}
                          >
                            {lineTotal > 0 ? formatMoney(lineTotal) : '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>

              {/* Shipping charge */}
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Shipping Charge"
                  size="small"
                  type="number"
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(Number(e.target.value))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 600 }}>₹</Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ width: 200 }}
                />

                {/* Live totals preview */}
                {(() => {
                  const subtotal = pricingEnquiry.lines.reduce(
                    (s, l) => s + (linePrices[l.productId] ?? 0) * l.quantity,
                    0,
                  )
                  const gst = Math.round(subtotal * 0.05)
                  const grand = subtotal + gst + shippingCharge
                  return (
                    <Box sx={{ flex: 1, bgcolor: 'var(--ink-50)', p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>Subtotal</Typography>
                        <Typography className="tnum" sx={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(subtotal)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>GST (5%)</Typography>
                        <Typography className="tnum" sx={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(gst)}</Typography>
                      </Box>
                      <Divider sx={{ my: 0.75 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-700)' }}>Grand Total</Typography>
                        <Typography className="tnum" sx={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-700)' }}>{formatMoney(grand)}</Typography>
                      </Box>
                    </Box>
                  )
                })()}
              </Box>
            </>
          )}

          {/* ── Post-generation: WhatsApp send panel ── */}
          {whatsappMsg && pricingEnquiry && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <strong>Invoice generated & enquiry confirmed!</strong> Now send the quotation to the customer via WhatsApp.
              </Alert>
              <Box
                sx={{
                  bgcolor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: 3,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  color: 'var(--ink-700)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                {whatsappMsg}
              </Box>
              <Typography sx={{ fontSize: 12, color: 'var(--ink-400)' }}>
                Customer phone: <strong>{pricingEnquiry.customerPhone || 'Not available'}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1.5, flexWrap: 'wrap' }}>
          {!whatsappMsg ? (
            <>
              <Button
                onClick={() => { setPricingOpen(false); setPricingEnquiry(null) }}
                variant="outlined"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintRoundedIcon />}
                onClick={handlePricingConfirm}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Confirm & Generate Invoice
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => { setPricingOpen(false); setPricingEnquiry(null); setWhatsappMsg(null) }}
                variant="outlined"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Done
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintRoundedIcon />}
                onClick={() => pricingEnquiry && generateQuotationInvoice(pricingEnquiry, linePrices, shippingCharge)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                Re-print Invoice
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={() => pricingEnquiry && handleSendWhatsApp(pricingEnquiry, whatsappMsg)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe5d' } }}
              >
                Send to WhatsApp
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Cancel Reason Dialog ──────────────────────────────────────────────── */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16.5 }}>Cancel Enquiry</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-600)', mb: 2 }}>
            Are you sure you want to cancel this B2B enquiry? Please provide a reason:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Stock unavailable, Customer requested cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Back
          </Button>
          <Button
            onClick={handleCancelSubmit}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
