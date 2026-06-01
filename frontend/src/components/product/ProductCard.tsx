import { Card, Box, Typography, Chip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ProductThumb from '@/components/common/ProductThumb'
import StatusChip from '@/components/common/StatusChip'
import { ROUTES } from '@/constants'
import { formatMoney } from '@/utils/format'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const bulk = product.pricingSlabs[product.pricingSlabs.length - 1]
  return (
    <Card
      component={RouterLink}
      to={ROUTES.productDetail(product.id)}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 6px 16px rgba(22,27,36,0.08), 0 2px 6px rgba(22,27,36,0.05)',
          borderColor: '#9DD4BC',
        },
      }}
    >
      <Box sx={{ position: 'relative', height: 180 }}>
        <ProductThumb id={product.id} name={product.name} category={product.category} rounded={0} />
        <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 0.75 }}>
          {product.isNew && (
            <Chip
              size="small"
              icon={<BoltRoundedIcon sx={{ fontSize: 14 }} />}
              label="New"
              sx={{ bgcolor: 'rgba(255,255,255,0.92)', fontWeight: 700, backdropFilter: 'blur(4px)' }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box className="flex items-center justify-between gap-2 mb-1.5">
          <StatusChip kind="stock" value={product.stockStatus} />
          <Box className="flex items-center gap-0.5">
            <StarRoundedIcon sx={{ fontSize: 16, color: '#E0A95A' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700 }} className="tnum">
              {product.rating.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 15,
            lineHeight: 1.35,
            mb: 1.5,
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>

        <Box className="flex items-end justify-between">
          <Box>
            <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>
              FROM
            </Typography>
            <Typography
              className="tnum"
              sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}
            >
              {formatMoney(bulk.price)}
              <Box component="span" sx={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-500)', ml: 0.5 }}>
                /{product.unit}
              </Box>
            </Typography>
          </Box>
          <Box className="text-right">
            <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>MOQ</Typography>
            <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14 }}>
              {product.moq} {product.unit}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}
