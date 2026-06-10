import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  InputBase,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import { useGetProductsQuery } from '@/redux/api'
import { useAppSelector } from '@/redux/hooks'
import ProductCard from '@/components/product/ProductCard'
import { CardGridSkeleton } from '@/components/common/Loader'
import { ROUTES } from '@/constants'
import { orders as mockOrders } from '@/mocks/data'
import toast from 'react-hot-toast'

function SectionTitle({ title, to, icon }: { title: string; to?: string; icon?: ReactNode }) {
  return (
    <Box className="flex items-end justify-between mb-4">
      <Box className="flex items-center gap-2">
        {icon}
        <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 } }}>
          {title}
        </Typography>
      </Box>
      {to && (
        <Button component={RouterLink} to={to} endIcon={<ArrowForwardRoundedIcon />} sx={{ color: 'var(--brand-700)' }}>
          View all
        </Button>
      )}
    </Box>
  )
}

const UNITS = ['kg', 'MT', 'Quintal', 'Bag', 'Unit', 'Litre', 'Ton']

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: products, isLoading } = useGetProductsQuery()
  // Storefront content is executive-editable (Redux + localStorage), so read it
  // from the storefront slice rather than the static mock API.
  const { hero, banners } = useAppSelector((s) => s.storefront)
  const user = useAppSelector((s) => s.auth.user)

  // Enquiry form state
  const [enqProduct, setEnqProduct] = useState('')
  const [enqQty, setEnqQty] = useState('')
  const [enqUnit, setEnqUnit] = useState('kg')
  const [enqOrigin, setEnqOrigin] = useState('')
  const [enqNotes, setEnqNotes] = useState('')
  const [enqSubmitting, setEnqSubmitting] = useState(false)

  const featured = products ?? []
  const fresh = products?.filter((p) => p.isNew) ?? []

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`${ROUTES.products}?search=${encodeURIComponent(search)}`)
    }
  }

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!enqProduct.trim()) {
      toast.error('Please enter the product name.')
      return
    }
    if (!enqQty || isNaN(Number(enqQty)) || Number(enqQty) <= 0) {
      toast.error('Please enter a valid quantity.')
      return
    }
    if (!enqOrigin.trim()) {
      toast.error('Please enter the origin.')
      return
    }
    setEnqSubmitting(true)
    setTimeout(() => {
      const now = new Date().toISOString()
      const yr = new Date().getFullYear().toString().slice(-2)
      const mo = String(new Date().getMonth() + 1).padStart(2, '0')
      const ref = `AGP-${yr}${mo}-${String(Math.floor(Math.random() * 8999) + 1000)}`
      mockOrders.unshift({
        id: `o-enq-${Date.now()}`,
        reference: ref,
        placedOn: now,
        status: 'placed',
        paymentStatus: 'pending',
        paymentMode: 'bank_transfer',
        customerName: user?.fullName ?? 'Customer',
        companyName: user?.companyName ?? '',
        customerPhone: user?.mobile ?? '',
        customerCity: user?.city ?? '',
        deliveryAddress: user?.address ?? 'To be confirmed',
        lines: [
          {
            productId: `enq-${Date.now()}`,
            name: enqProduct.trim(),
            image: '',
            quantity: Number(enqQty),
            unit: enqUnit,
            unitPrice: 0,
            lineTotal: 0,
            specifications: {
              ...(enqOrigin.trim() ? { Origin: enqOrigin.trim() } : {}),
              ...(enqNotes.trim() ? { Notes: enqNotes.trim() } : {}),
            },
          },
        ],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        trackingTimeline: [
          { label: 'Order placed', at: now, done: true },
          { label: 'Admin approval', at: null, done: false },
          { label: 'Delivered', at: null, done: false },
        ],
      })
      toast.success(`Enquiry submitted! Reference: ${ref}`)
      setEnqProduct('')
      setEnqQty('')
      setEnqUnit('kg')
      setEnqOrigin('')
      setEnqNotes('')
      setEnqSubmitting(false)
    }, 700)
  }

  return (
    <Box className="animate-fade-up flex flex-col gap-3 md:gap-5">
      {/* Mobile Search Bar above Banner */}
      <Box
        component="form"
        onSubmit={onSearch}
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          px: 2,
          height: 48,
          borderRadius: 3,
          border: '1px solid var(--ink-200)',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'all .15s',
          '&:focus-within': { borderColor: 'var(--brand-500)', boxShadow: '0 4px 12px rgba(28, 124, 88, 0.08)' },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <SearchRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 22, mr: 1 }} />
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, categories…"
          sx={{ flex: 1, fontSize: 14.5 }}
        />
      </Box>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 2, md: 5 },
          overflow: 'hidden',
          p: { xs: 2.25, md: 7 },
          color: '#fff',
          background: 'linear-gradient(135deg, #0E432F 0%, #0A3324 60%, #11543B 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.6,
            background:
              'radial-gradient(50% 60% at 88% 10%, rgba(56,155,115,0.4), transparent 60%), radial-gradient(40% 50% at 5% 95%, rgba(28,124,88,0.3), transparent 60%)',
          }}
        />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} preserveAspectRatio="none">
          <defs>
            <pattern id="hero-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M0 36V0H36" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          {hero.badge && (
            <Chip
              label={hero.badge}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#9DD4BC', fontWeight: 700, letterSpacing: '0.08em', mb: { xs: 1.25, md: 2.5 } }}
            />
          )}
          <Typography sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: { xs: 20, md: 48 }, lineHeight: 1.05, letterSpacing: '-0.025em', mb: { xs: 2, md: 2 } }}>
            {hero.titleLine1}
            {hero.titleLine2 && (
              <>
                <br />
                {hero.titleLine2}
              </>
            )}
          </Typography>
          <Typography sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,0.78)', fontSize: 18, mb: 4, maxWidth: 520 }}>
            {hero.subtitle}
          </Typography>
          <Box className="flex flex-wrap gap-3">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(hero.primaryCtaTo || ROUTES.products)}
              sx={{ bgcolor: '#fff', color: 'var(--brand-800)', '&:hover': { bgcolor: '#EAF6F0' }, py: { xs: 0.8, md: 1.5 }, px: { xs: 1.5, md: 3 }, fontSize: { xs: 12.5, md: 15 } }}
            >
              {hero.primaryCtaLabel}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to={hero.secondaryCtaTo || ROUTES.products}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' }, py: { xs: 0.8, md: 1.5 }, px: { xs: 1.5, md: 3 }, fontSize: { xs: 12.5, md: 15 } }}
            >
              {hero.secondaryCtaLabel}
            </Button>
          </Box>
        </Box>
      </Box>


      {/* Promotional banners */}
      {banners && banners.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: { xs: 'auto', md: 'visible' },
            gap: 2,
            pb: { xs: 1, md: 0 },
            scrollSnapType: { xs: 'x mandatory', md: 'none' },
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {banners.map((b) => (
            <Box
              key={b.id}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                p: { xs: 2.25, md: 4 },
                color: b.accent === 'amber' ? '#3A2A12' : '#fff',
                background:
                  b.accent === 'amber'
                    ? 'linear-gradient(120deg, #E6B26A 0%, #C9842F 100%)'
                    : 'linear-gradient(120deg, #1C7C58 0%, #11543B 100%)',
                flex: { xs: '0 0 100%', md: '1' },
                scrollSnapAlign: 'start',
                minWidth: { xs: 280, md: 'auto' },
              }}
            >
              <CampaignRoundedIcon sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: { xs: 90, md: 120 }, opacity: 0.12 }} />
              <Typography sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: { xs: 20, md: 26 }, mb: 0.5 }}>
                {b.title}
              </Typography>
              <Typography sx={{ opacity: 0.9, fontSize: { xs: 13, md: 14 }, mb: { xs: 1.75, md: 2.5 }, maxWidth: 380 }}>{b.subtitle}</Typography>
              <Button
                component={RouterLink}
                to={ROUTES.products}
                variant="contained"
                sx={{
                  bgcolor: b.accent === 'amber' ? '#3A2A12' : '#fff',
                  color: b.accent === 'amber' ? '#fff' : 'var(--brand-800)',
                  '&:hover': { bgcolor: b.accent === 'amber' ? '#241a0b' : '#EAF6F0' },
                  py: { xs: 0.75, md: 1 },
                  px: { xs: 2, md: 2.5 },
                  fontSize: { xs: 12.5, md: 14 },
                }}
              >
                {b.cta}
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Featured */}
      <Box>
        <SectionTitle title="Featured products" icon={<TrendingUpRoundedIcon sx={{ color: 'var(--brand-600)' }} />} />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : (
          <Box className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Product Enquiry Section ──────────────────────────────────────── */}
      <Box
        sx={{
          borderRadius: { xs: 3, md: 5 },
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F0FAF5 0%, #E6F5EE 50%, #EBF7F2 100%)',
          border: '1.5px solid var(--brand-100)',
          p: { xs: 3, md: 5 },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3.5 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: 'var(--brand-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <HelpOutlineRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", serif',
                fontWeight: 800,
                fontSize: { xs: 18, md: 22 },
                color: 'var(--ink-900)',
                lineHeight: 1.2,
              }}
            >
              Can't find what you need?
            </Typography>
            <Typography sx={{ fontSize: { xs: 13, md: 14 }, color: 'var(--ink-500)', mt: 0.5 }}>
              Submit a product enquiry and our sales team will get back to you shortly.
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleEnquirySubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Row 1: Product Name dropdown */}
          <FormControl required size="small" fullWidth sx={{ bgcolor: '#fff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <InputLabel>Product Name</InputLabel>
            <Select
              value={enqProduct}
              label="Product Name"
              onChange={(e) => setEnqProduct(e.target.value)}
            >
              {featured.map((p) => (
                <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Row 1b: Origin */}
          <TextField
            label="Origin"
            placeholder="e.g. Punjab, Gujarat, Rajasthan…"
            value={enqOrigin}
            onChange={(e) => setEnqOrigin(e.target.value)}
            required
            size="small"
            fullWidth
            sx={{ bgcolor: '#fff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Row 2: Quantity + Unit */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              placeholder="e.g. 500"
              value={enqQty}
              onChange={(e) => setEnqQty(e.target.value)}
              required
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
              sx={{ bgcolor: '#fff', borderRadius: 2, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Unit</InputLabel>
              <Select
                value={enqUnit}
                label="Unit"
                onChange={(e) => setEnqUnit(e.target.value)}
              >
                {UNITS.map((u) => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 3: Notes */}
          <TextField
            label="Notes / Specifications (optional)"
            placeholder="Any specific grade, packing type, delivery location, or other requirements…"
            value={enqNotes}
            onChange={(e) => setEnqNotes(e.target.value)}
            multiline
            minRows={2}
            size="small"
            fullWidth
            sx={{ bgcolor: '#fff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Submit */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={enqSubmitting}
              endIcon={
                enqSubmitting
                  ? <CircularProgress size={16} color="inherit" />
                  : <SendRoundedIcon sx={{ fontSize: 18 }} />
              }
              sx={{
                px: 3.5,
                py: 1,
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 2.5,
                bgcolor: 'var(--brand-600)',
                '&:hover': { bgcolor: 'var(--brand-700)' },
                '&.Mui-disabled': { bgcolor: 'var(--brand-200)', color: '#fff' },
              }}
            >
              {enqSubmitting ? 'Submitting…' : 'Submit Enquiry'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Upcoming arrivals */}
      {fresh.length > 0 && (
        <Box>
          <SectionTitle title="Upcoming arrivals" to={ROUTES.products} />
          <Box className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}
