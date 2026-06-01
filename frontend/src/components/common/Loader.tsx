import { Box, CircularProgress, Skeleton } from '@mui/material'

export function Loader({ height = 240 }: { height?: number | string }) {
  return (
    <Box sx={{ height, display: 'grid', placeItems: 'center' }}>
      <CircularProgress size={28} thickness={4} />
    </Box>
  )
}

/** Skeleton grid used while product lists load. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ border: '1px solid var(--ink-200)', borderRadius: 4, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={170} />
          <Box sx={{ p: 2 }}>
            <Skeleton width="80%" height={22} />
            <Skeleton width="50%" height={18} />
            <Skeleton width="40%" height={28} sx={{ mt: 1 }} />
          </Box>
        </Box>
      ))}
    </div>
  )
}
