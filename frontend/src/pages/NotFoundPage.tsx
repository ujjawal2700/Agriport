import { Box, Typography, Button, Container } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/constants'

export default function NotFoundPage() {
  return (
    <Box className="app-canvas min-h-screen grid place-items-center">
      <Container maxWidth="sm" className="text-center">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </Box>
        <Typography sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 120, lineHeight: 1, color: 'var(--brand-600)' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" size="large" component={RouterLink} to={ROUTES.home}>
          Back to marketplace
        </Button>
      </Container>
    </Box>
  )
}
