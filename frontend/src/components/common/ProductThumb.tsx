import { Box } from '@mui/material'

// Deterministic, fully-offline product imagery. A seeded gradient + monogram +
// faint crate motif — cohesive across the catalog and never a broken image.
const PALETTES = [
  ['#0E432F', '#1C7C58'],
  ['#11543B', '#389B73'],
  ['#1F4F68', '#2C6E8F'],
  ['#262C38', '#4E5765'],
  ['#5A3B1E', '#A66A1F'],
  ['#0A3324', '#15694A'],
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function monogram(name: string): string {
  const words = name.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean)
  return (words[0]?.[0] ?? 'G') + (words[1]?.[0] ?? words[0]?.[1] ?? '')
}

interface Props {
  id: string
  name: string
  category?: string
  rounded?: number
  className?: string
  height?: number | string
  variant?: number
}

export default function ProductThumb({
  id,
  name,
  category,
  rounded = 14,
  className,
  height = '100%',
  variant = 0,
}: Props) {
  const idx = (hash(id) + variant) % PALETTES.length
  const [a, b] = PALETTES[idx]
  const angle = (hash(id + 'a') % 60) + 120

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: `${rounded}px`,
        overflow: 'hidden',
        background: `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`,
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
      }}
    >
      {/* faint crate / lot grid motif */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, opacity: 0.16 }}
      >
        <defs>
          <pattern id={`p-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 20V0H20" fill="none" stroke="#fff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill={`url(#p-${id})`} />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 80% at 80% 10%, rgba(255,255,255,0.18), transparent 60%)',
        }}
      />
      <Box
        sx={{
          fontFamily: '"Bricolage Grotesque", serif',
          fontWeight: 800,
          fontSize: '2.4rem',
          color: 'rgba(255,255,255,0.94)',
          letterSpacing: '-0.03em',
          textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 1,
        }}
      >
        {monogram(name).toUpperCase()}
      </Box>
      {category && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            px: 1,
            py: '2px',
            borderRadius: 1,
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.92)',
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {category}
        </Box>
      )}
    </Box>
  )
}
