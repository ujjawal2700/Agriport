import { useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Button, Chip, InputBase } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useGetProductsQuery, useGetCategoriesQuery, useGetBannersQuery } from '@/redux/api'
import ProductCard from '@/components/product/ProductCard'
import { CardGridSkeleton } from '@/components/common/Loader'
import { ROUTES } from '@/constants'

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

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: products, isLoading } = useGetProductsQuery()
  const { data: categories } = useGetCategoriesQuery()
  const { data: banners } = useGetBannersQuery()

  const featured = products?.filter((p) => p.isFeatured) ?? []
  const fresh = products?.filter((p) => p.isNew) ?? []

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`${ROUTES.products}?search=${encodeURIComponent(search)}`)
    }
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
          <Chip
            label="WHOLESALE B2B MARKETPLACE"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#9DD4BC', fontWeight: 700, letterSpacing: '0.08em', mb: { xs: 1.25, md: 2.5 } }}
          />
          <Typography sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: { xs: 20, md: 48 }, lineHeight: 1.05, letterSpacing: '-0.025em', mb: { xs: 2, md: 2 } }}>
            Source smarter.
            <br />
            Buy in bulk, pay less.
          </Typography>
          <Typography sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,0.78)', fontSize: 18, mb: 4, maxWidth: 520 }}>
            Lot-based wholesale pricing across agro commodities, packaging, tools and more —
            with verified suppliers and transparent dispatch.
          </Typography>
          <Box className="flex flex-wrap gap-3">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.products)}
              sx={{ bgcolor: '#fff', color: 'var(--brand-800)', '&:hover': { bgcolor: '#EAF6F0' }, py: { xs: 0.8, md: 1.5 }, px: { xs: 1.5, md: 3 }, fontSize: { xs: 12.5, md: 15 } }}
            >
              Browse marketplace
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to={ROUTES.products + '?sort=price_asc'}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' }, py: { xs: 0.8, md: 1.5 }, px: { xs: 1.5, md: 3 }, fontSize: { xs: 12.5, md: 15 } }}
            >
              Today's bulk deals
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Categories */}
      <Box>
        <SectionTitle title="Shop by category" to={ROUTES.products} />
        <Box className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories?.map((c) => (
            <Box
              key={c.id}
              component={RouterLink}
              to={`${ROUTES.products}?category=${encodeURIComponent(c.name)}`}
              sx={{
                textDecoration: 'none',
                p: 2.5,
                borderRadius: 3,
                border: '1px solid var(--ink-200)',
                backgroundColor: '#fff',
                transition: 'all .15s',
                display: 'block',
                '&:hover': { borderColor: 'var(--brand-500)', boxShadow: '0 4px 12px rgba(22,27,36,0.06)' },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, var(--brand-50), #fff)',
                  border: '1px solid var(--ink-200)',
                  display: 'grid',
                  placeItems: 'center',
                  mb: 1.5,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--brand-600)', fontSize: 22 }}>
                  ◈
                </span>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', lineHeight: 1.25 }}>
                {c.name}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }} className="tnum">
                {c.productCount} products
              </Typography>
            </Box>
          ))}
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
        <SectionTitle title="Featured products" to={ROUTES.products} icon={<TrendingUpRoundedIcon sx={{ color: 'var(--brand-600)' }} />} />
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

      {/* New arrivals */}
      {fresh.length > 0 && (
        <Box>
          <SectionTitle title="New arrivals" to={ROUTES.products} />
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
