import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Divider,
  ListItemIcon,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateHero,
  addBanner,
  updateBanner,
  removeBanner,
  addCategory,
  updateCategory,
  removeCategory,
  addTrustBadge,
  updateTrustBadge,
  removeTrustBadge,
  resetStorefront,
} from '@/redux/slices/storefrontSlice'
import {
  CATEGORY_ICONS,
  TRUST_ICONS,
  categoryIcon,
  trustIcon,
} from '@/utils/contentIcons'

const ACCENTS = [
  { value: 'brand', label: 'Green (brand)' },
  { value: 'amber', label: 'Amber' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: 12.5,
        color: 'var(--ink-600)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid var(--ink-200)', bgcolor: '#fff' }}>
      {children}
    </Box>
  )
}

export default function ExecutiveStorefrontPage() {
  const dispatch = useAppDispatch()
  const { hero, banners, categories, trustBadges } = useAppSelector((s) => s.storefront)
  const [tab, setTab] = useState(0)

  const handleReset = () => {
    if (confirm('Reset all storefront content (hero, banners, categories, trust badges) to defaults?')) {
      dispatch(resetStorefront())
      toast.success('Storefront content reset to defaults')
    }
  }

  return (
    <Box className="flex flex-col gap-5">
      {/* Header */}
      <Box className="flex items-center justify-between flex-wrap gap-3">
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Storefront Content</Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>
            Customise the customer home page hero, promotional banners, categories and product trust badges.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltRoundedIcon />}
          onClick={handleReset}
          sx={{ borderRadius: 2.5, fontWeight: 600 }}
        >
          Reset to defaults
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: '1px solid var(--ink-200)', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab label="Hero Banner" />
        <Tab label={`Promo Banners (${banners.length})`} />
        <Tab label={`Categories (${categories.length})`} />
        <Tab label={`Trust Badges (${trustBadges.length})`} />
      </Tabs>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {tab === 0 && (
        <Panel>
          <SectionLabel>Hero headline & call-to-action</SectionLabel>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Badge / eyebrow text"
              size="small"
              fullWidth
              value={hero.badge}
              onChange={(e) => dispatch(updateHero({ badge: e.target.value }))}
              className="sm:col-span-2"
            />
            <TextField
              label="Title line 1"
              size="small"
              fullWidth
              value={hero.titleLine1}
              onChange={(e) => dispatch(updateHero({ titleLine1: e.target.value }))}
            />
            <TextField
              label="Title line 2"
              size="small"
              fullWidth
              value={hero.titleLine2}
              onChange={(e) => dispatch(updateHero({ titleLine2: e.target.value }))}
            />
            <TextField
              label="Subtitle"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={hero.subtitle}
              onChange={(e) => dispatch(updateHero({ subtitle: e.target.value }))}
              className="sm:col-span-2"
            />
            <TextField
              label="Primary button label"
              size="small"
              fullWidth
              value={hero.primaryCtaLabel}
              onChange={(e) => dispatch(updateHero({ primaryCtaLabel: e.target.value }))}
            />
            <TextField
              label="Primary button link"
              size="small"
              fullWidth
              placeholder="/products"
              value={hero.primaryCtaTo}
              onChange={(e) => dispatch(updateHero({ primaryCtaTo: e.target.value }))}
            />
            <TextField
              label="Secondary button label"
              size="small"
              fullWidth
              value={hero.secondaryCtaLabel}
              onChange={(e) => dispatch(updateHero({ secondaryCtaLabel: e.target.value }))}
            />
            <TextField
              label="Secondary button link"
              size="small"
              fullWidth
              placeholder="/products?sort=price_asc"
              value={hero.secondaryCtaTo}
              onChange={(e) => dispatch(updateHero({ secondaryCtaTo: e.target.value }))}
            />
          </Box>

          {/* Live preview */}
          <Divider sx={{ my: 3 }} />
          <SectionLabel>Preview</SectionLabel>
          <Box
            sx={{
              borderRadius: 4,
              p: { xs: 2.5, md: 4 },
              color: '#fff',
              background: 'linear-gradient(135deg, #0E432F 0%, #0A3324 60%, #11543B 100%)',
            }}
          >
            <Typography sx={{ color: '#9DD4BC', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', mb: 1 }}>
              {hero.badge}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 22, md: 32 }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {hero.titleLine1}
              <br />
              {hero.titleLine2}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, mt: 1.5, maxWidth: 520 }}>
              {hero.subtitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
              <Box sx={{ bgcolor: '#fff', color: 'var(--brand-800)', px: 2, py: 0.75, borderRadius: 2, fontWeight: 700, fontSize: 13 }}>
                {hero.primaryCtaLabel || 'Primary'}
              </Box>
              <Box sx={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', px: 2, py: 0.75, borderRadius: 2, fontWeight: 700, fontSize: 13 }}>
                {hero.secondaryCtaLabel || 'Secondary'}
              </Box>
            </Box>
          </Box>
        </Panel>
      )}

      {/* ── Promo banners ─────────────────────────────────────────────────── */}
      {tab === 1 && (
        <Box className="flex flex-col gap-3">
          {banners.map((b) => (
            <Panel key={b.id}>
              <Box className="flex items-start justify-between gap-2 mb-2">
                <SectionLabel>Promotional banner</SectionLabel>
                <IconButton size="small" onClick={() => dispatch(removeBanner(b.id))} sx={{ color: 'var(--danger, #c0392b)' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Title"
                  size="small"
                  fullWidth
                  value={b.title}
                  onChange={(e) => dispatch(updateBanner({ id: b.id, patch: { title: e.target.value } }))}
                />
                <TextField
                  label="CTA button label"
                  size="small"
                  fullWidth
                  value={b.cta}
                  onChange={(e) => dispatch(updateBanner({ id: b.id, patch: { cta: e.target.value } }))}
                />
                <TextField
                  label="Subtitle"
                  size="small"
                  fullWidth
                  value={b.subtitle}
                  onChange={(e) => dispatch(updateBanner({ id: b.id, patch: { subtitle: e.target.value } }))}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Colour theme"
                  size="small"
                  select
                  fullWidth
                  value={b.accent}
                  onChange={(e) => dispatch(updateBanner({ id: b.id, patch: { accent: e.target.value } }))}
                >
                  {ACCENTS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Panel>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => dispatch(addBanner())}
            sx={{ borderRadius: 2.5, fontWeight: 700, alignSelf: 'flex-start' }}
          >
            Add banner
          </Button>
        </Box>
      )}

      {/* ── Categories ────────────────────────────────────────────────────── */}
      {tab === 2 && (
        <Box className="flex flex-col gap-3">
          {categories.map((c) => (
            <Panel key={c.id}>
              <Box className="flex items-center gap-3">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, var(--brand-50), #fff)',
                    border: '1px solid var(--ink-200)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--brand-600)',
                  }}
                >
                  {categoryIcon(c.icon, { fontSize: 'small' })}
                </Box>
                <Box className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                  <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    value={c.name}
                    onChange={(e) => dispatch(updateCategory({ id: c.id, patch: { name: e.target.value } }))}
                    className="sm:col-span-2"
                  />
                  <TextField
                    label="Product count"
                    size="small"
                    type="number"
                    fullWidth
                    value={c.productCount}
                    onChange={(e) =>
                      dispatch(updateCategory({ id: c.id, patch: { productCount: Number(e.target.value) } }))
                    }
                  />
                  <TextField
                    label="Icon"
                    size="small"
                    select
                    fullWidth
                    value={CATEGORY_ICONS[c.icon] ? c.icon : 'category'}
                    onChange={(e) => dispatch(updateCategory({ id: c.id, patch: { icon: e.target.value } }))}
                  >
                    {Object.entries(CATEGORY_ICONS).map(([key, { label, Icon }]) => (
                      <MenuItem key={key} value={key}>
                        <ListItemIcon sx={{ minWidth: 30, color: 'var(--brand-600)' }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <IconButton size="small" onClick={() => dispatch(removeCategory(c.id))} sx={{ color: 'var(--danger, #c0392b)' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Panel>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => dispatch(addCategory())}
            sx={{ borderRadius: 2.5, fontWeight: 700, alignSelf: 'flex-start' }}
          >
            Add category
          </Button>
        </Box>
      )}

      {/* ── Trust badges ──────────────────────────────────────────────────── */}
      {tab === 3 && (
        <Box className="flex flex-col gap-3">
          <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>
            These badges appear on every product detail page (alongside the auto dispatch &amp; origin badges).
          </Typography>
          {trustBadges.map((t) => (
            <Panel key={t.id}>
              <Box className="flex items-center gap-3">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 2,
                    border: '1px solid var(--ink-200)',
                    bgcolor: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--brand-700)',
                  }}
                >
                  {trustIcon(t.icon, { fontSize: 'small' })}
                </Box>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <TextField
                    label="Label"
                    size="small"
                    fullWidth
                    value={t.label}
                    onChange={(e) => dispatch(updateTrustBadge({ id: t.id, patch: { label: e.target.value } }))}
                  />
                  <TextField
                    label="Icon"
                    size="small"
                    select
                    fullWidth
                    value={TRUST_ICONS[t.icon] ? t.icon : 'verified'}
                    onChange={(e) => dispatch(updateTrustBadge({ id: t.id, patch: { icon: e.target.value } }))}
                  >
                    {Object.entries(TRUST_ICONS).map(([key, { label, Icon }]) => (
                      <MenuItem key={key} value={key}>
                        <ListItemIcon sx={{ minWidth: 30, color: 'var(--brand-700)' }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <IconButton size="small" onClick={() => dispatch(removeTrustBadge(t.id))} sx={{ color: 'var(--danger, #c0392b)' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Panel>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => dispatch(addTrustBadge())}
            sx={{ borderRadius: 2.5, fontWeight: 700, alignSelf: 'flex-start' }}
          >
            Add trust badge
          </Button>
        </Box>
      )}
    </Box>
  )
}
