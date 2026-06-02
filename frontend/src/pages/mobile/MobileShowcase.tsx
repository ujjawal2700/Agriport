import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Avatar,
  Card,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CloseIcon from '@mui/icons-material/Close'
import MicIcon from '@mui/icons-material/Mic'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// ==========================================
// MOCK DATA FOR THE B2B CATALOG
// ==========================================
interface PriceSlab {
  minQty: number
  maxQty: string
  price: number
}

interface Product {
  id: string
  name: string
  category: string
  image: string
  rating: number
  reviewsCount: number
  moq: number
  unit: string
  stock: number
  description: string
  slabs: PriceSlab[]
}

interface CartItem {
  product: Product
  qty: number
}

interface ChatMessage {
  sender: 'bot' | 'user'
  text: string
  time: string
}

interface SupportTicket {
  id: string
  subject: string
  status: string
  date: string
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-01',
    name: 'Premium Urea Fertilizer (High Grade)',
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1599878263158-b11ef8d77f24?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    reviewsCount: 142,
    moq: 5,
    unit: 'Tons',
    stock: 250,
    description: 'Imported granular nitrogen fertilizer designed to stimulate vegetative growth and greening. Nitrogen content: 46% min. Moisture: 1% max. Biuret: 1% max. Packaging: 50kg double lined PP bags.',
    slabs: [
      { minQty: 1, maxQty: '10', price: 340 },
      { minQty: 11, maxQty: '50', price: 310 },
      { minQty: 51, maxQty: '500', price: 285 },
    ]
  },
  {
    id: 'p-02',
    name: 'High-Yield Hybrid Wheat Seeds (HD-3086)',
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60',
    rating: 4.7,
    reviewsCount: 88,
    moq: 2,
    unit: 'Tons',
    stock: 120,
    description: 'Certified top-grade hybrid wheat seeds with excellent rust resistance and exceptional yields. Heat-tolerant during ripening. High protein and gluten index. Germination: 95% minimum.',
    slabs: [
      { minQty: 1, maxQty: '5', price: 480 },
      { minQty: 6, maxQty: '20', price: 440 },
      { minQty: 21, maxQty: '100', price: 400 },
    ]
  },
  {
    id: 'p-03',
    name: 'Broad-Spectrum Organic Pesticide Concentrate',
    category: 'Pesticides',
    image: 'https://images.unsplash.com/photo-1592398418042-f8b1a8d0525d?w=500&auto=format&fit=crop&q=60',
    rating: 4.5,
    reviewsCount: 65,
    moq: 10,
    unit: 'Boxes',
    stock: 380,
    description: 'Advanced plant-derived natural pesticide, harmless to earthworms and friendly insects but highly effective against leafhoppers, whiteflies, and aphids. Packaging: Case of 20 x 1L bottles.',
    slabs: [
      { minQty: 1, maxQty: '10', price: 125 },
      { minQty: 11, maxQty: '40', price: 110 },
      { minQty: 41, maxQty: '200', price: 95 },
    ]
  },
  {
    id: 'p-04',
    name: 'Micro-Drip Irrigation Lateral Pipes (16mm)',
    category: 'Irrigation',
    image: 'https://images.unsplash.com/photo-1463123081488-72993a2ee0ca?w=500&auto=format&fit=crop&q=60',
    rating: 4.9,
    reviewsCount: 93,
    moq: 5,
    unit: 'Rolls',
    stock: 90,
    description: 'Heavy duty, UV-resistant micro-drip lateral hoses. Dripper spacing: 30cm. Flow rate: 2.0L/hr. Made from top quality virgin LLDPE polymer. Standard length: 400m per roll.',
    slabs: [
      { minQty: 1, maxQty: '5', price: 88 },
      { minQty: 6, maxQty: '25', price: 78 },
      { minQty: 26, maxQty: '150', price: 68 },
    ]
  }
]

const MOCK_ANNOUNCEMENTS = [
  { id: 'a1', title: '📢 Stock Alert', desc: 'Premium NPK Fertilizer shipment cleared customs. Fresh stocks updated!' },
  { id: 'a2', title: '⚡ Monsoon Deal', desc: 'Pre-order Seeds now & get a flat 12% cash-back on cart value!' },
  { id: 'a3', title: '💼 Credit Policy', desc: 'New digital credit verification limits up to $50,000 for verified accounts.' }
]

const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Order Shipped 🚚', body: 'Order #GB-78210 has been dispatched. Track in real-time!', type: 'Orders', read: false, time: '2 hours ago' },
  { id: 'n2', title: 'Payment Confirmed ✅', body: 'Invoice #INV-29001 ($4,250.00) has been marked as Paid.', type: 'Payments', read: true, time: '1 day ago' },
  { id: 'n3', title: 'Document Approved 📄', body: 'Your GST Certificate validation was successful.', type: 'Announcements', read: true, time: '2 days ago' },
  { id: 'n4', title: 'Price Drop Alert 💰', body: 'Urea Fertilizer drops by $15/ton. Stock up now!', type: 'Promotions', read: false, time: '3 days ago' },
]

export default function MobileShowcase() {
  // Simulator Controls
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android'>('ios')
  const [globalState, setGlobalState] = useState<'normal' | 'loading' | 'empty' | 'offline' | 'success'>('normal')
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light')

  // Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'login' | 'signup' | 'forgot-password' | 'main'>('splash')
  const [onboardingSlide, setOnboardingSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'orders' | 'notifications' | 'profile' | 'cart'>('home')

  // UI Flow States
  const [biometricScanning, setBiometricScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDetailQty, setProductDetailQty] = useState<number>(5)
  const [cart, setCart] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment'>('cart')
  const [checkoutAddress, setCheckoutAddress] = useState('Shop 14, B2B Trade Complex, New Delhi, India')
  const [checkoutPayment, setCheckoutPayment] = useState<'upi' | 'stripe' | 'bank'>('upi')
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null)
  
  // Custom Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hello! Welcome to Agriport B2B Assistant. How can I help you today?', time: '4:10 PM' }
  ])
  const [chatInput, setChatInput] = useState('')
  
  // Document Center Mock
  const [docsStatus, setDocsStatus] = useState({
    gst: 'Approved',
    license: 'Pending Approval',
    idProof: 'Not Uploaded'
  })

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: 'TK-8910', subject: 'Urea Batch Weight Discrepancy', status: 'In Progress', date: 'June 01, 2026' },
    { id: 'TK-8440', subject: 'Late Shipping Refund Request', status: 'Resolved', date: 'May 20, 2026' }
  ])
  const [showRaiseTicket, setShowRaiseTicket] = useState(false)
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState('Logistics')

  // Auto Splash Screen Timer
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  // Confetti Animation when Success state is activated manually or on checkout order
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    if (globalState === 'success') {
      const startTimer = setTimeout(() => {
        setShowConfetti(true)
      }, 0)
      const endTimer = setTimeout(() => {
        setShowConfetti(false)
      }, 4500)
      return () => {
        clearTimeout(startTimer)
        clearTimeout(endTimer)
      }
    }
  }, [globalState])

  // Voice Search Listening State
  const [voiceListening, setVoiceListening] = useState(false)

  // Auto chatbot response
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { sender: 'user', text: chatInput, time: 'Just now' }
    setChatMessages(prev => [...prev, userMsg])
    const typedText = chatInput.toLowerCase()
    setChatInput('')

    // Delay bot response
    setTimeout(() => {
      let botResponse = "I understand. I am routing this request to your assigned Agriport Sales Manager immediately."
      if (typedText.includes('order') || typedText.includes('shipment') || typedText.includes('track')) {
        botResponse = "Your latest B2B order #GB-78210 is dispatched. It is currently at the Delhi Hub. Current ETA is tomorrow 4:00 PM."
      } else if (typedText.includes('invoice') || typedText.includes('payment') || typedText.includes('gst')) {
        botResponse = "You have 1 pending payment of $12,450.00. You can download invoice PDFs directly under your Profile tab or under the active Order card."
      } else if (typedText.includes('discount') || typedText.includes('coupon') || typedText.includes('offer')) {
        botResponse = "Yes! You can apply coupon code 'AGRIPORT10' during checkout to get a flat 10% discount on orders qualifying above their respective MOQ limits."
      } else if (typedText.includes('hi') || typedText.includes('hello')) {
        botResponse = "Hi there! How can your dedicated B2B logistics team help you today? Ask about orders, pending payments, or product availability!"
      }
      const botMsg: ChatMessage = { sender: 'bot', text: botResponse, time: 'Just now' }
      setChatMessages(prev => [...prev, botMsg])
    }, 1000)
  }

  // Handle Voice Search Simulation
  const triggerVoiceSearch = () => {
    setVoiceListening(true)
    setTimeout(() => {
      setVoiceListening(false)
      setSearchQuery('Urea')
      setSelectedCategory('Fertilizers')
      setActiveTab('products')
      setCurrentScreen('main')
    }, 2000)
  }

  // Cart Calculations
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const slabPrice = getPriceForQty(item.product, item.qty)
      return total + (slabPrice * item.qty)
    }, 0)
  }

  const getPriceForQty = (product: Product, qty: number) => {
    let activePrice = product.slabs[0].price
    for (const slab of product.slabs) {
      if (qty >= slab.minQty) {
        activePrice = slab.price
      }
    }
    return activePrice
  }

  const getGST = () => {
    return Math.round(getSubtotal() * 0.18)
  }

  const getShipping = () => {
    return getSubtotal() > 2000 ? 0 : 150
  }

  const getDiscount = () => {
    return couponApplied ? Math.round(getSubtotal() * 0.10) : 0
  }

  const getGrandTotal = () => {
    return getSubtotal() + getGST() + getShipping() - getDiscount()
  }

  const addToCart = (product: Product, qty: number) => {
    const existing = cart.find(i => i.product.id === product.id)
    if (existing) {
      existing.qty = qty
      setCart([...cart])
    } else {
      setCart([...cart, { product, qty }])
    }
    setSelectedProduct(null)
    setActiveTab('cart')
    setCheckoutStep('cart')
  }

  const placeMockOrder = () => {
    // Switch to success state
    setGlobalState('success')
    setCart([])
    setCheckoutStep('cart')
    setActiveTab('orders')
  }

  return (
    <Box className="app-canvas" sx={{ minHeight: '100vh', py: 4, px: { xs: 2, md: 4 }, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      
      {/* Visual Confetti for Success triggers */}
      {showConfetti && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', background: 'transparent' }}>
          {[...Array(50)].map((_, i) => {
            const size = ((i * 7) % 8) + 4
            const colors = ['#1C7C58', '#C9842F', '#389B73', '#E0A95A', '#11543B']
            const color = colors[i % colors.length]
            const left = (i * 19) % 100
            const animDelay = (i * 0.15) % 3
            return (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: i % 3 === 0 ? '50%' : '2px',
                  top: '-10px',
                  left: `${left}%`,
                  opacity: 0.8,
                  animation: `fade-up 4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  animationDelay: `${animDelay}s`,
                  '@keyframes fade-up': {
                    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
                  }
                }}
              />
            )
          })}
        </Box>
      )}

      <Grid container spacing={4} sx={{ maxWidth: 1400, mx: 'auto' }}>
        
        {/* =======================================================
            LEFT COLUMN: INTERACTIVE CONTROL PANEL & DESIGN SYSTEM
            ======================================================= */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 800, color: '#1C7C58' }}>
              AGRIPORT CRM MOBILE APPS
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, color: '#161B24', mt: 1, letterSpacing: '-0.02em' }}>
              Customer Mobile UI/UX Design System
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7585', mt: 1.5, fontSize: '0.98rem', lineHeight: 1.6 }}>
              A premium, Material 3 & Apple HIG inspired mobile application experience. This live playground presents the exact typography, colors, layouts, and components mapped directly from your B2B web portal. Use the controller below to audit state handling, responsive skins, and user scenarios.
            </Typography>
          </Box>

          {/* Simulator Device Controls Card */}
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3, border: '1px solid #E2E6EC', bgcolor: '#fff' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#161B24', mb: 2 }}>
              🛠️ Interactive Simulator Controller
            </Typography>
            
            <Grid container spacing={3}>
              {/* Toggle Operating System */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7585', display: 'block', mb: 1 }}>
                  CHASSIS OVERLAY
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={deviceOS === 'ios' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setDeviceOS('ios')}
                    sx={{ flex: 1, textTransform: 'none', borderRadius: 2 }}
                  >
                    iOS (iPhone)
                  </Button>
                  <Button
                    size="small"
                    variant={deviceOS === 'android' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setDeviceOS('android')}
                    sx={{ flex: 1, textTransform: 'none', borderRadius: 2 }}
                  >
                    Android (M3)
                  </Button>
                </Box>
              </Grid>

              {/* Force Layout States */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7585', display: 'block', mb: 1 }}>
                  AUDIT INTERACTIVE STATE
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={globalState}
                    onChange={(e) => setGlobalState(e.target.value as 'normal' | 'loading' | 'empty' | 'offline' | 'success')}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="normal">🟢 Normal View</MenuItem>
                    <MenuItem value="loading">⏳ Loading Skeletons</MenuItem>
                    <MenuItem value="empty">📭 Empty State</MenuItem>
                    <MenuItem value="offline">📡 Offline Cache Mode</MenuItem>
                    <MenuItem value="success">🎉 Success Confetti</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Quick Jump Flow Scenario Selector */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7585', display: 'block', mb: 1 }}>
                  QUICK SCENARIO JUMP
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    defaultValue="splash"
                    onChange={(e) => {
                      const val = e.target.value
                      setGlobalState('normal')
                      if (val === 'splash') {
                        setCurrentScreen('splash')
                      } else if (val === 'onboarding') {
                        setCurrentScreen('onboarding')
                        setOnboardingSlide(0)
                      } else if (val === 'login') {
                        setCurrentScreen('login')
                      } else if (val === 'signup') {
                        setCurrentScreen('signup')
                      } else if (val === 'catalog') {
                        setCurrentScreen('main')
                        setActiveTab('products')
                      } else if (val === 'cart') {
                        setCurrentScreen('main')
                        setActiveTab('cart')
                        setCheckoutStep('cart')
                        // Put sample item in cart if empty
                        if (cart.length === 0) {
                          setCart([{ product: MOCK_PRODUCTS[0], qty: 12 }])
                        }
                      } else if (val === 'orders') {
                        setCurrentScreen('main')
                        setActiveTab('orders')
                      } else if (val === 'documents') {
                        setCurrentScreen('main')
                        setActiveTab('profile')
                      } else if (val === 'livechat') {
                        setCurrentScreen('main')
                        setActiveTab('profile')
                      }
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="splash">1. Splash Screen</MenuItem>
                    <MenuItem value="onboarding">2. Swipable Onboarding</MenuItem>
                    <MenuItem value="login">3. Tabbed Login</MenuItem>
                    <MenuItem value="signup">4. B2B Registration Form</MenuItem>
                    <MenuItem value="catalog">5. LOT-Pricing Catalog</MenuItem>
                    <MenuItem value="cart">6. GST Cart & Checkout</MenuItem>
                    <MenuItem value="orders">7. Real-Time Order Timeline</MenuItem>
                    <MenuItem value="documents">8. Document Center</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Core Mobile Design Tokens Specifications List */}
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E6EC', bgcolor: '#fff' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#161B24', mb: 2 }}>
              🎨 Cohesive Design System Tokens
            </Typography>

            <Grid container spacing={3}>
              {/* Typography specs */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                  TYPOGRAPHY SPECIFICATION
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#161B24', fontFamily: '"Bricolage Grotesque"' }}>
                      Bricolage Grotesque
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585' }}>
                      Main Display Headers (H1 - H5), bold B2B totals, and splash screens.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#161B24', fontFamily: '"Plus Jakarta Sans"' }}>
                      Plus Jakarta Sans
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585' }}>
                      Standard body text, form elements, buttons, and subheaders.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Color chips specs */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                  BRAND COLORS PALETTE
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Primary green */}
                  <Box sx={{ textAlign: 'center', width: 75 }}>
                    <Box sx={{ width: '100%', height: 40, bgcolor: '#1C7C58', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>Primary</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585', fontSize: '0.65rem' }}>#1C7C58</Typography>
                  </Box>

                  {/* Dark brand green */}
                  <Box sx={{ textAlign: 'center', width: 75 }}>
                    <Box sx={{ width: '100%', height: 40, bgcolor: '#0E432F', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>Dark Accent</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585', fontSize: '0.65rem' }}>#0E432F</Typography>
                  </Box>

                  {/* Secondary Gold */}
                  <Box sx={{ textAlign: 'center', width: 75 }}>
                    <Box sx={{ width: '100%', height: 40, bgcolor: '#C9842F', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>Gold Secondary</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585', fontSize: '0.65rem' }}>#C9842F</Typography>
                  </Box>

                  {/* Neutral Slate Ink */}
                  <Box sx={{ textAlign: 'center', width: 75 }}>
                    <Box sx={{ width: '100%', height: 40, bgcolor: '#161B24', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>Neutral Ink</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585', fontSize: '0.65rem' }}>#161B24</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#161B24', display: 'block' }}>
                    📐 Border Radius & Shadow Tokens:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7585', display: 'block', mt: 0.5 }}>
                    - UI Elements (Buttons, Inputs): <b>10px</b> / Cards & Sheets: <b>16px</b> / Modals: <b>18px</b>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7585', display: 'block' }}>
                    - Floating Elevation shadow: <b>0 1px 2px rgba(22,27,36,0.04)</b>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* =======================================================
            RIGHT COLUMN: SMARTPHONE FRAME AND INTERACTIVE MOBILE SIMULATOR
            ======================================================= */}
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Main Bezel Container */}
          <Box
            sx={{
              position: 'relative',
              width: 390, // iPhone 15 / Pixel 8 screen width approx
              height: 800,
              borderRadius: deviceOS === 'ios' ? '50px' : '40px',
              border: '12px solid #161B24',
              boxShadow: '0 25px 50px -12px rgba(22, 27, 36, 0.4), 0 0 0 4px #4E5765',
              overflow: 'hidden',
              bgcolor: appTheme === 'light' ? '#F4F6F8' : '#161B24',
              transition: 'all 0.3s ease'
            }}
          >
            {/* iOS Dynamic Island / Notch */}
            {deviceOS === 'ios' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 11,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 110,
                  height: 30,
                  backgroundColor: '#000',
                  borderRadius: 20,
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  boxShadow: 'inset 0 0 4px rgba(255,255,255,0.2)'
                }}
              >
                {/* Dynamic Camera Spotlights */}
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#161B24' }} />
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#081c3c' }} />
              </Box>
            )}

            {/* Android Punch Hole Camera */}
            {deviceOS === 'android' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 14,
                  backgroundColor: '#000',
                  borderRadius: '50%',
                  zIndex: 1000,
                  boxShadow: '0 0 2px rgba(255,255,255,0.5)'
                }}
              />
            )}

            {/* OS STATUS BAR */}
            <Box
              sx={{
                height: 44,
                bgcolor: appTheme === 'light' ? '#F4F6F8' : '#161B24',
                color: appTheme === 'light' ? '#161B24' : '#FFFFFF',
                px: 3,
                pt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 999,
                position: 'relative',
                fontSize: '0.82rem',
                fontWeight: 700,
                transition: 'all 0.3s'
              }}
            >
              {/* Clock left for iOS, right/left depending on OS. Let's do iOS style (left) vs Android style (left) */}
              <Box>{deviceOS === 'ios' ? '9:41' : '10:30'}</Box>
              
              {/* Indicators Right */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Network Bars */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 10 }}>
                  <Box sx={{ width: 3, height: 4, bgcolor: 'currentColor', borderRadius: '1px' }} />
                  <Box sx={{ width: 3, height: 6, bgcolor: 'currentColor', borderRadius: '1px' }} />
                  <Box sx={{ width: 3, height: 8, bgcolor: 'currentColor', borderRadius: '1px' }} />
                  <Box sx={{ width: 3, height: 10, bgcolor: 'currentColor', borderRadius: '1px' }} />
                </Box>
                {/* Wifi */}
                <Typography sx={{ fontSize: '0.8rem', lineHeight: 1 }}>📶</Typography>
                {/* Battery */}
                <Box sx={{ width: 22, height: 11, border: '1.5px solid currentColor', borderRadius: '3px', p: '1px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Box sx={{ height: '100%', width: '80%', bgcolor: 'currentColor', borderRadius: '1px' }} />
                  <Box sx={{ width: 1.5, height: 4, bgcolor: 'currentColor', position: 'absolute', right: -3, top: 2, borderTopRightRadius: '1px', borderBottomRightRadius: '1px' }} />
                </Box>
              </Box>
            </Box>

            {/* ========================================================
                SIMULATOR SCREENS CONTAINER
                ======================================================== */}
            <Box
              sx={{
                height: 702, // 800px total - 12px bezel top/bottom - 44px status bar - 30px indicators
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: appTheme === 'light' ? '#F4F6F8' : '#161B24',
                color: appTheme === 'light' ? '#161B24' : '#FFFFFF',
                '&::-webkit-scrollbar': { width: 0 } // Hide scrollbars
              }}
            >
              
              {/* ==============================================
                  AUDIT STATE LAYER OVERLAY (Loading, Empty, Offline, etc)
                  ============================================== */}
              {globalState === 'offline' && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 8888, bgcolor: appTheme === 'light' ? 'rgba(244,246,248,0.92)' : 'rgba(22,27,36,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '4.5rem', mb: 2 }}>📡</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#C0392B' }}>
                    Network Disconnected
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7585', mt: 1, mb: 4, px: 2 }}>
                    Please check your mobile connection or WiFi. Showing cached inventory catalog list offline.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setGlobalState('normal')}
                    sx={{
                      bgcolor: '#1C7C58',
                      borderRadius: 3,
                      px: 4,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#15694A' }
                    }}
                  >
                    Retry Connection
                  </Button>
                </Box>
              )}

              {/* 1. SPLASH SCREEN */}
              {currentScreen === 'splash' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center', bgcolor: '#0E432F', color: '#fff' }}>
                  <Box sx={{ mb: 2 }}>
                    {/* Visual App Logo Icon */}
                    <Box sx={{ width: 80, height: 80, borderRadius: '24px', bgGradient: 'linear-gradient(135deg, #1C7C58 0%, #15694A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.25)', border: '2px solid #9DD4BC', bgcolor: '#1C7C58' }}>
                      <StorefrontIcon sx={{ fontSize: 44, color: '#fff' }} />
                    </Box>
                  </Box>

                  {/* Brand typography falling back to Logo.tsx styles */}
                  <Typography variant="h4" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, letterSpacing: '-0.02em', mt: 2 }}>
                    <Box component="span" sx={{ color: '#CDEADD' }}>agri</Box>
                    <Box component="span" sx={{ color: '#1C7C58' }}>port</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DD4BC', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700, mt: 0.5, display: 'block', textTransform: 'uppercase' }}>
                    Agriport CRM B2B App
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#EAF6F0', mt: 4, px: 4, fontSize: '0.85rem', opacity: 0.8 }}>
                    "Your Direct B2B Agriculture Global Supply Bridge"
                  </Typography>

                  <Box sx={{ mt: 8 }}>
                    <CircularProgress size={30} sx={{ color: '#9DD4BC' }} />
                  </Box>

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setCurrentScreen('onboarding')}
                    sx={{ color: '#CDEADD', mt: 6, textTransform: 'none', fontSize: '0.8rem' }}
                  >
                    Skip Splash Screen ➔
                  </Button>
                </Box>
              )}

              {/* 2. ONBOARDING SCREEN */}
              {currentScreen === 'onboarding' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, bgcolor: appTheme === 'light' ? '#fff' : '#161B24' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setCurrentScreen('login')} sx={{ color: '#6B7585', textTransform: 'none', fontWeight: 700 }}>
                      Skip
                    </Button>
                  </Box>

                  {/* Swipeable Illustration Slides */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                    {onboardingSlide === 0 && (
                      <Box className="animate-fade-up">
                        <Box sx={{ fontSize: '7rem', mb: 3 }}>🚜</Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#1C7C58', mb: 2 }}>
                          Direct Product Trading
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7585', px: 2, lineHeight: 1.6 }}>
                          Access direct bulk agricultural commodities, certified high-yield seeds, premium fertilizers, and machinery directly from wholesale global sources.
                        </Typography>
                      </Box>
                    )}

                    {onboardingSlide === 1 && (
                      <Box className="animate-fade-up">
                        <Box sx={{ fontSize: '7rem', mb: 3 }}>⚖️</Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#1C7C58', mb: 2 }}>
                          Wholesale LOT Price Slabs
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7585', px: 2, lineHeight: 1.6 }}>
                          Save massive overhead cost with dynamic B2B tiered lot slabs. The larger the volume of your purchase, the cheaper the per-unit pricing slab.
                        </Typography>
                      </Box>
                    )}

                    {onboardingSlide === 2 && (
                      <Box className="animate-fade-up">
                        <Box sx={{ fontSize: '7rem', mb: 3 }}>💸</Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#1C7C58', mb: 2 }}>
                          Escrow & Real-Time Tracking
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7585', px: 2, lineHeight: 1.6 }}>
                          Pay securely via UPI, Razorpay, or wire receipt uploads. Track delivery milestones in-app and access gate passes and GST invoices instantly.
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Bullet Navigation Indicators */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        onClick={() => setOnboardingSlide(i)}
                        sx={{
                          width: onboardingSlide === i ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: onboardingSlide === i ? '#1C7C58' : '#cbd2dc',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Box>

                  {/* Next / Continue actions */}
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (onboardingSlide < 2) {
                        setOnboardingSlide(onboardingSlide + 1)
                      } else {
                        setCurrentScreen('login')
                      }
                    }}
                    sx={{
                      bgcolor: '#1C7C58',
                      borderRadius: 3.5,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#15694A' }
                    }}
                  >
                    {onboardingSlide === 2 ? 'Get Started' : 'Next Benefits ➔'}
                  </Button>
                </Box>
              )}

              {/* 3. LOGIN SCREEN */}
              {currentScreen === 'login' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, bgcolor: appTheme === 'light' ? '#fff' : '#161B24' }}>
                  
                  {/* Biometric Scanning Loader Overlay */}
                  {biometricScanning && (
                    <Box sx={{ position: 'absolute', inset: 0, zIndex: 9999, bgcolor: 'rgba(22,27,36,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <CircularProgress size={60} sx={{ color: '#1C7C58', mb: 3 }} />
                      <FingerprintIcon sx={{ fontSize: 50, color: '#CDEADD', mb: 2, className: 'animate-pulse' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Scanning Biometrics...</Typography>
                      <Typography variant="caption" sx={{ color: '#cbd2dc', mt: 1 }}>Verifying fingerprint / Face ID secure key</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton size="small" onClick={() => setCurrentScreen('onboarding')} sx={{ mr: 1, color: 'inherit' }}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>B2B Buyer Portal</Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, color: '#1C7C58' }}>
                      agriport
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7585' }}>Agriport Sales CRM Authentication</Typography>
                  </Box>

                  {/* Dual Mode Tabs Selection */}
                  <Box sx={{ display: 'flex', bgcolor: '#F4F6F8', p: '4px', borderRadius: 3, mb: 3 }}>
                    <Button sx={{ flex: 1, textTransform: 'none', bgcolor: '#fff', color: '#161B24', borderRadius: 2.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: 700, fontSize: '0.8rem' }}>
                      Mobile + OTP
                    </Button>
                    <Button onClick={() => alert('Email password login is pre-filled, please tap the biometric button to bypass for full high fidelity speed!')} sx={{ flex: 1, textTransform: 'none', color: '#6B7585', borderRadius: 2.5, fontWeight: 700, fontSize: '0.8rem' }}>
                      Email + Pass
                    </Button>
                  </Box>

                  {/* Mobile login form */}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7585', display: 'block', mb: 1 }}>
                    MOBILE REGISTERED NUMBER
                  </Typography>
                  <TextField
                    placeholder="Enter 10-digit mobile number"
                    defaultValue="+1 (555) 900-2026"
                    size="small"
                    fullWidth
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7585', display: 'block', mb: 1 }}>
                    ONE-TIME SMS OTP CODE
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField placeholder="•" size="small" defaultValue="4" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 }, width: '25%' }} slotProps={{ htmlInput: { style: { textAlign: 'center', fontWeight: 'bold' } } }} />
                    <TextField placeholder="•" size="small" defaultValue="2" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 }, width: '25%' }} slotProps={{ htmlInput: { style: { textAlign: 'center', fontWeight: 'bold' } } }} />
                    <TextField placeholder="•" size="small" defaultValue="5" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 }, width: '25%' }} slotProps={{ htmlInput: { style: { textAlign: 'center', fontWeight: 'bold' } } }} />
                    <TextField placeholder="•" size="small" defaultValue="0" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 }, width: '25%' }} slotProps={{ htmlInput: { style: { textAlign: 'center', fontWeight: 'bold' } } }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <FormControlLabel control={<Switch defaultChecked color="success" size="small" />} label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Remember Me</Typography>} />
                    <Button onClick={() => setCurrentScreen('forgot-password')} variant="text" size="small" sx={{ color: '#C9842F', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                      Forgot Pin/OTP?
                    </Button>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => setCurrentScreen('main')}
                    sx={{
                      bgcolor: '#1C7C58',
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      mb: 2,
                      '&:hover': { bgcolor: '#15694A' }
                    }}
                  >
                    Secure Login & Verify
                  </Button>

                  {/* Biometric Quick Login Bypass */}
                  <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
                    <Typography variant="caption" sx={{ color: '#6B7585', display: 'block', mb: 1.5 }}>
                      OR BYPASS INSTANTLY WITH BIOMETRICS
                    </Typography>
                    <IconButton
                      onClick={() => {
                        setBiometricScanning(true)
                        setTimeout(() => {
                          setBiometricScanning(false)
                          setCurrentScreen('main')
                        }, 2000)
                      }}
                      sx={{
                        width: 60,
                        height: 60,
                        border: '2px solid #1C7C58',
                        color: '#1C7C58',
                        bgcolor: '#EAF6F0',
                        boxShadow: '0 4px 10px rgba(28,124,88,0.15)',
                        '&:hover': { bgcolor: '#CDEADD' }
                      }}
                    >
                      <FingerprintIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6B7585', fontSize: '0.85rem' }}>
                      New procurement buyer?{' '}
                      <Button onClick={() => setCurrentScreen('signup')} sx={{ color: '#1C7C58', textTransform: 'none', fontWeight: 800, p: 0 }}>
                        Register Business
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 4. SIGNUP B2B REGISTRATION SCREEN */}
              {currentScreen === 'signup' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, bgcolor: appTheme === 'light' ? '#fff' : '#161B24' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton size="small" onClick={() => setCurrentScreen('login')} sx={{ mr: 1, color: 'inherit' }}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>Register Business</Typography>
                  </Box>

                  {/* B2B detailed Registration Fields */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    <TextField label="Full Name" size="small" defaultValue="Arjun Gupta" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                    <TextField label="Company / Shop Name" size="small" defaultValue="Gupta Wholesalers Pvt Ltd" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                    <TextField label="GST Identification Number" size="small" placeholder="Enter 15-digit GSTIN" defaultValue="07AAAAA1111A1Z1" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                    
                    <FormControl size="small">
                      <InputLabel>Business Category Type</InputLabel>
                      <Select label="Business Category Type" defaultValue="Distributor" sx={{ borderRadius: 2.5 }}>
                        <MenuItem value="Wholesaler">Wholesaler / Trader</MenuItem>
                        <MenuItem value="Retailer">Retail Shop Owner</MenuItem>
                        <MenuItem value="Distributor">Regional Distributor</MenuItem>
                        <MenuItem value="Exporter">International Procurement</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField label="Mobile Number" size="small" defaultValue="+1 (555) 900-2026" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                    <TextField label="Business Address" size="small" defaultValue="Shop 14, Sector 3, B2B Hub, Delhi" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                    
                    {/* Password with Strength Meter */}
                    <Box>
                      <TextField label="Create Password" type="password" size="small" defaultValue="AgriportSecure2026!" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                      {/* Password strength visual color scale */}
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#6B7585', fontWeight: 600 }}>Password Strength</Typography>
                          <Typography variant="caption" sx={{ color: '#1C7C58', fontWeight: 800 }}>STRONG</Typography>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: '#EDEFF3', borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: '100%', bgcolor: '#1C7C58', borderRadius: 2 }} />
                        </Box>
                      </Box>
                    </Box>

                    <FormControlLabel
                      control={<Switch defaultChecked color="success" size="small" />}
                      label={<Typography variant="caption" sx={{ color: '#6B7585', fontWeight: 600 }}>I accept terms & conditions for wholesale trading operations.</Typography>}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => {
                      alert('SMS verification OTP triggered successfully. Directing to Dashboard!')
                      setCurrentScreen('main')
                    }}
                    sx={{
                      bgcolor: '#1C7C58',
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#15694A' }
                    }}
                  >
                    Submit B2B Registration
                  </Button>
                </Box>
              )}

              {/* 5. FORGOT PASSWORD SCREEN */}
              {currentScreen === 'forgot-password' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, bgcolor: appTheme === 'light' ? '#fff' : '#161B24' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton size="small" onClick={() => setCurrentScreen('login')} sx={{ mr: 1, color: 'inherit' }}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>Reset Account Password</Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#6B7585', mb: 3 }}>
                    Enter your registered B2B mobile number or email. We will send a secure 4-digit code to recover your account settings.
                  </Typography>

                  <TextField label="Mobile Number / Email" size="small" defaultValue="+1 (555) 900-2026" sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

                  <Button
                    variant="contained"
                    onClick={() => {
                      alert('Success code verified. Password reset completed successfully!')
                      setCurrentScreen('login')
                    }}
                    sx={{
                      bgcolor: '#1C7C58',
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#15694A' }
                    }}
                  >
                    Send Verification Code
                  </Button>
                </Box>
              )}


              {/* ========================================================
                  6. MAIN NATIVE APP SHELL (Bottom Navigation Tabbed Screens)
                  ======================================================== */}
              {currentScreen === 'main' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* A. LOADING SKELETON AUDIT STATE OVERLAY */}
                  {globalState === 'loading' && (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Search Bar Skeleton */}
                      <Box sx={{ height: 40, bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 2.5, className: 'animate-pulse' }} />
                      
                      {/* Banner skeleton */}
                      <Box sx={{ height: 120, bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 4, className: 'animate-pulse' }} />

                      {/* Header skeleton */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', className: 'animate-pulse' }} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ height: 16, width: '60%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 1, className: 'animate-pulse' }} />
                          <Box sx={{ height: 12, width: '40%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 1, className: 'animate-pulse' }} />
                        </Box>
                      </Box>

                      {/* Three Cards Skeletons */}
                      {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ p: 2, border: '1px solid #EDEFF3', borderRadius: 4, display: 'flex', gap: 2 }}>
                          <Box sx={{ width: 80, height: 80, bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 3, className: 'animate-pulse' }} />
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ height: 14, width: '80%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 1, className: 'animate-pulse' }} />
                            <Box sx={{ height: 10, width: '50%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 1, className: 'animate-pulse' }} />
                            <Box sx={{ height: 18, width: '30%', bgcolor: appTheme === 'light' ? '#EDEFF3' : '#262C38', borderRadius: 1, className: 'animate-pulse' }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* B. EMPTY STATE AUDIT OVERLAY */}
                  {globalState === 'empty' && (
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, my: 'auto' }}>
                      <Box sx={{ fontSize: '5rem', mb: 2 }}>📭</Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>No Items Available</Typography>
                      <Typography variant="body2" sx={{ color: '#6B7585', mt: 1, mb: 3 }}>
                        Your B2B cart or order history is currently empty. Start browsing our wholesale inventory slab catalogs!
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setGlobalState('normal')
                          setActiveTab('products')
                        }}
                        sx={{ bgcolor: '#1C7C58', borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                      >
                        Browse Wholesale Catalog
                      </Button>
                    </Box>
                  )}

                  {/* C. NORMAL VIEW (Render active tabs) */}
                  {globalState === 'normal' && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                      {/* ========================================================
                          TAB 1: HOME DASHBOARD
                          ======================================================== */}
                      {activeTab === 'home' && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          
                          {/* APP HEADER */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: '#1C7C58', width: 40, height: 40, border: '2px solid #EAF6F0', color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: '"Bricolage Grotesque"' }}>
                                GW
                              </Avatar>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#6B7585', fontWeight: 600, display: 'block' }}>WELCOME BACK</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: appTheme === 'light' ? '#161B24' : '#fff' }}>Gupta Wholesalers</Typography>
                              </Box>
                            </Box>
                            
                            {/* Notification icon with count */}
                            <IconButton size="small" onClick={() => setActiveTab('notifications')} sx={{ bgcolor: appTheme === 'light' ? '#fff' : '#262C38', border: '1px solid #E2E6EC' }}>
                              <Box sx={{ position: 'relative' }}>
                                <NotificationsIcon sx={{ color: '#1C7C58' }} />
                                <Box sx={{ position: 'absolute', top: -5, right: -5, width: 8, height: 8, bgcolor: '#C9842F', borderRadius: '50%' }} />
                              </Box>
                            </IconButton>
                          </Box>

                          {/* B2B ANALYTICS CARD / BUSINESS SUMMARY */}
                          <Card elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#161B24', color: '#fff', border: 'none', position: 'relative', overflow: 'hidden' }}>
                            {/* Accent graphics background */}
                            <Box sx={{ position: 'absolute', right: -30, bottom: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(28,124,88,0.15)' }} />
                            
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 7 }}>
                                <Typography variant="caption" sx={{ color: '#CDEADD', fontWeight: 700, letterSpacing: '0.05em' }}>
                                  OUTSTANDING CREDIT AMOUNT
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#EAF6F0', mt: 0.5 }}>
                                  $12,450.00
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C9842F' }} />
                                  <Typography variant="caption" sx={{ color: '#E0A95A', fontWeight: 600 }}>3 invoices overdue</Typography>
                                </Box>
                              </Grid>

                              <Grid size={{ xs: 5 }} sx={{ borderLeft: '1px solid rgba(255,255,255,0.15)', pl: 2 }}>
                                <Typography variant="caption" sx={{ color: '#9DD4BC', display: 'block' }}>TOTAL ORDERS</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>42</Typography>
                                <Typography variant="caption" sx={{ color: '#66B894', display: 'block', mt: 0.5 }}>1 in transit 🚚</Typography>
                              </Grid>
                            </Grid>
                          </Card>

                          {/* QUICK ACTION TILES GRID */}
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                              QUICK B2B ACTIONS
                            </Typography>
                            <Grid container spacing={1.5}>
                              {[
                                { title: 'Browse Products', icon: '🌾', tab: 'products', action: () => { setActiveTab('products'); setSelectedCategory('All') } },
                                { title: 'Pending Dues', icon: '💳', tab: 'profile', action: () => alert('Overdue bills list downloaded to mobile!') },
                                { title: 'Logistics Tracker', icon: '🚚', tab: 'orders', action: () => { setActiveTab('orders') } },
                                { title: 'WhatsApp Help', icon: '💬', tab: 'chat', action: () => { window.open('https://wa.me/5559002026', '_blank') } }
                              ].map((item, idx) => (
                                  <Grid size={{ xs: 3 }} key={idx}>
                                  <Box
                                    onClick={item.action}
                                    sx={{
                                      bgcolor: appTheme === 'light' ? '#fff' : '#262C38',
                                      border: '1px solid #E2E6EC',
                                      borderRadius: 3,
                                      p: 1,
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(22,27,36,0.04)',
                                      '&:hover': { transform: 'scale(1.05)', transition: 'all 0.2s' }
                                    }}
                                  >
                                    <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Box>
                                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#6B7585', lineHeight: 1.1 }}>{item.title}</Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>

                          {/* ANNOUNCEMENT BANNER CAROUSEL */}
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              bgGradient: 'linear-gradient(135deg, #1C7C58 0%, #0E432F 100%)',
                              bgcolor: '#1C7C58',
                              color: '#fff',
                              boxShadow: '0 4px 12px rgba(28,124,88,0.2)'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#CDEADD', letterSpacing: '0.1em' }}>
                                MONSOON PRE-ORDER OFFERS
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Box sx={{ width: 14, height: 3, bgcolor: '#fff', borderRadius: 2 }} />
                                <Box sx={{ width: 4, height: 3, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                                <Box sx={{ width: 4, height: 3, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"', color: '#fff', fontSize: '0.92rem' }}>
                              ⚡ Book high-yield Wheat Seeds HD-3086 this week for flat 12% cash-back!
                            </Typography>
                          </Box>

                          {/* CATEGORY SELECTOR ICONS GRID */}
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                              INVENTORY CATEGORIES
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', gap: 1.5 }}>
                              {['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Irrigation'].map((cat, idx) => {
                                const icons: { [key: string]: string } = {
                                  All: '📦',
                                  Seeds: '🌾',
                                  Fertilizers: '🧪',
                                  Pesticides: '🛡️',
                                  Irrigation: '💦'
                                }
                                return (
                                  <Box
                                    key={idx}
                                    onClick={() => {
                                      setSelectedCategory(cat)
                                      setActiveTab('products')
                                    }}
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      minWidth: 58,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: selectedCategory === cat ? '#EAF6F0' : (appTheme === 'light' ? '#fff' : '#262C38'),
                                        border: selectedCategory === cat ? '2px solid #1C7C58' : '1px solid #E2E6EC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.4rem',
                                        mb: 0.5,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                      }}
                                    >
                                      {icons[cat]}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.68rem', fontWeight: selectedCategory === cat ? 800 : 600, color: selectedCategory === cat ? '#1C7C58' : '#6B7585' }}>
                                      {cat}
                                    </Typography>
                                  </Box>
                                )
                              })}
                            </Box>
                          </Box>

                          {/* RECENT B2B ANNOUNCEMENTS */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                              BULLETIN & LOGISTICS NOTICES
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {MOCK_ANNOUNCEMENTS.map((item) => (
                                <Box
                                  key={item.id}
                                  sx={{
                                    p: 1.5,
                                    bgcolor: appTheme === 'light' ? '#fff' : '#262C38',
                                    border: '1px solid #E2E6EC',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#C9842F' }}>
                                    {item.title}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.7rem', color: '#6B7585', lineHeight: 1.25 }}>
                                    {item.desc}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>

                        </Box>
                      )}

                      {/* ========================================================
                          TAB 2: PRODUCT LISTING & LOT-PRICING
                          ======================================================== */}
                      {activeTab === 'products' && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          
                          {/* Search Header Area */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Search crops, seeds, urea..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: appTheme === 'light' ? '#fff' : '#262C38'
                                }
                              }}
                              slotProps={{
                                input: {
                                  startAdornment: <SearchIcon sx={{ color: '#6B7585', mr: 0.5 }} />
                                }
                              }}
                            />
                            
                            {/* Voice search mic button */}
                            <IconButton onClick={triggerVoiceSearch} sx={{ bgcolor: '#1C7C58', color: '#fff', borderRadius: 3, width: 40, height: 40 }}>
                              <MicIcon />
                            </IconButton>
                          </Box>

                          {/* Voice Listening Overlay */}
                          {voiceListening && (
                            <Box sx={{ position: 'absolute', inset: 0, zIndex: 9999, bgcolor: 'rgba(28,124,88,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                              <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, fontFamily: '"Bricolage Grotesque"' }}>Speak B2B Product Name...</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0px rgba(255,255,255,0.7)' }, '100%': { transform: 'scale(1.1)', boxShadow: '0 0 0 20px rgba(255,255,255,0)' } } }}>
                                  <MicIcon sx={{ fontSize: 40, color: '#1C7C58' }} />
                                </Box>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#CDEADD', mt: 4 }}>"Urea Fertilizer Slabs..."</Typography>
                            </Box>
                          )}

                          {/* Category horizontal scroll selection inside products tab */}
                          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                            {['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Irrigation'].map((cat) => (
                              <Button
                                key={cat}
                                size="small"
                                onClick={() => setSelectedCategory(cat)}
                                variant={selectedCategory === cat ? 'contained' : 'outlined'}
                                sx={{
                                  borderRadius: 2.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  minWidth: 80,
                                  bgcolor: selectedCategory === cat ? '#1C7C58' : 'transparent',
                                  color: selectedCategory === cat ? '#fff' : '#6B7585',
                                  borderColor: selectedCategory === cat ? '#1C7C58' : '#cbd2dc',
                                  fontWeight: 700
                                }}
                              >
                                {cat}
                              </Button>
                            ))}
                          </Box>

                          {/* Product listings */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {MOCK_PRODUCTS
                              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((product) => (
                                <Card
                                  key={product.id}
                                  onClick={() => {
                                    setSelectedProduct(product)
                                    setProductDetailQty(product.moq)
                                  }}
                                  elevation={0}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    bgcolor: appTheme === 'light' ? '#fff' : '#262C38',
                                    border: '1px solid #E2E6EC',
                                    display: 'flex',
                                    gap: 1.5
                                  }}
                                >
                                  {/* Product image */}
                                  <Box
                                    component="img"
                                    src={product.image}
                                    sx={{
                                      width: 90,
                                      height: 90,
                                      borderRadius: 3,
                                      objectFit: 'cover'
                                    }}
                                  />

                                  {/* Product Details right */}
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#C9842F', fontWeight: 800 }}>
                                        {product.category}
                                      </Typography>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: appTheme === 'light' ? '#161B24' : '#fff', lineHeight: 1.2 }}>
                                        {product.name}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#6B7585', display: 'block', mt: 0.5 }}>
                                        ★ {product.rating} ({product.reviewsCount} wholesale deals)
                                      </Typography>
                                    </Box>

                                    {/* MOQ and tiered price highlight */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                      <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7585', display: 'block' }}>
                                          MOQ: <b>{product.moq} {product.unit}</b>
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#1C7C58' }}>
                                          ${product.slabs[0].price} - ${product.slabs[2].price} <Typography component="span" sx={{ fontSize: '0.68rem', color: '#6B7585' }}>/{product.unit}</Typography>
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ bgcolor: '#EAF6F0', color: '#1C7C58', px: 1, py: 0.5, borderRadius: 2, fontSize: '0.65rem', fontWeight: 800 }}>
                                        In Stock
                                      </Box>
                                    </Box>
                                  </Box>
                                </Card>
                              ))}
                          </Box>

                        </Box>
                      )}

                      {/* ========================================================
                          TAB 3: ORDERS MODULE TIMELINE
                          ======================================================== */}
                      {activeTab === 'orders' && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          
                          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>Order Tracking Center</Typography>

                          {/* Filter Tabs */}
                          <Box sx={{ display: 'flex', bgcolor: '#EDEFF3', p: '3px', borderRadius: 3 }}>
                            <Button size="small" sx={{ flex: 1, bgcolor: '#fff', color: '#161B24', borderRadius: 2.5, fontSize: '0.72rem', textTransform: 'none', fontWeight: 700 }}>
                              Active (1)
                            </Button>
                            <Button size="small" sx={{ flex: 1, color: '#6B7585', borderRadius: 2.5, fontSize: '0.72rem', textTransform: 'none', fontWeight: 700 }}>
                              Completed
                            </Button>
                            <Button size="small" sx={{ flex: 1, color: '#6B7585', borderRadius: 2.5, fontSize: '0.72rem', textTransform: 'none', fontWeight: 700 }}>
                              Cancelled
                            </Button>
                          </Box>

                          {/* Active order card */}
                          <Card elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: appTheme === 'light' ? '#fff' : '#262C38', border: '1px solid #E2E6EC' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Order #GB-78210</Typography>
                              <Box sx={{ px: 1, py: 0.25, bgcolor: '#EAF6F0', color: '#1C7C58', borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 800 }}>
                                IN DISPATCH
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                              <Box sx={{ fontSize: '2rem' }}>🧪</Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#6B7585', display: 'block' }}>ITEMS</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>Premium Urea Fertilizer</Typography>
                                <Typography variant="caption" sx={{ color: '#6B7585' }}>12 Tons • Total: $3,720.00</Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* LOGISTICS VERTICAL TIMELINE Progress Tracker */}
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                              DISPATCH MILESTONES
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
                              {[
                                { title: 'Order Placed & Invoiced', desc: 'May 31, 2026 - 11:20 AM', done: true },
                                { title: 'GST Document Cleared', desc: 'June 01, 2026 - 02:40 PM', done: true },
                                { title: 'Fertilizer Batch Dispatched', desc: 'June 02, 2026 - 09:10 AM', done: true, current: true },
                                { title: 'Out for Hub Delivery', desc: 'Est. June 03, 2026', done: false }
                              ].map((step, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                                  
                                  {/* Line joiner */}
                                  {idx < 3 && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        left: 7,
                                        top: 16,
                                        bottom: -20,
                                        width: 2,
                                        bgcolor: step.done ? '#1C7C58' : '#cbd2dc'
                                      }}
                                    />
                                  )}

                                  {/* Dot */}
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: '50%',
                                      border: `3px solid ${step.done ? '#1C7C58' : '#cbd2dc'}`,
                                      bgcolor: step.current ? '#fff' : (step.done ? '#1C7C58' : '#EDEFF3'),
                                      zIndex: 1
                                    }}
                                  />

                                  {/* Details */}
                                  <Box sx={{ mt: -0.5 }}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: step.done ? '#161B24' : '#6B7585' }}>
                                      {step.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#6B7585' }}>
                                      {step.desc}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Logistics metadata and document download buttons */}
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6 }}>
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  onClick={() => alert('GST Invoice PDF downloaded to local storage!')}
                                  sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.68rem', fontWeight: 700 }}
                                >
                                  📥 Invoice PDF
                                </Button>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  onClick={() => alert('Gate Pass PDF barcode downloaded successfully!')}
                                  sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.68rem', fontWeight: 700 }}
                                >
                                  🔑 Gate Pass PDF
                                </Button>
                              </Grid>
                            </Grid>
                          </Card>
                        </Box>
                      )}

                      {/* ========================================================
                          TAB 4: NOTIFICATIONS CENTER
                          ======================================================== */}
                      {activeTab === 'notifications' && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>Inbox Alerts</Typography>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {MOCK_NOTIFICATIONS.map((item) => (
                              <Box
                                key={item.id}
                                sx={{
                                  p: 1.5,
                                  bgcolor: item.read ? 'transparent' : (appTheme === 'light' ? '#fff' : '#262C38'),
                                  border: `1px solid ${item.read ? '#EDEFF3' : '#E2E6EC'}`,
                                  borderRadius: 3,
                                  display: 'flex',
                                  gap: 1.5,
                                  position: 'relative'
                                }}
                              >
                                {/* Unread Indicator Dot */}
                                {!item.read && (
                                  <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, bgcolor: '#1C7C58', borderRadius: '50%' }} />
                                )}

                                <Box sx={{ fontSize: '1.5rem' }}>📢</Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#161B24' }}>
                                    {item.title}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.7rem', color: '#6B7585', mt: 0.5, lineHeight: 1.25 }}>
                                    {item.body}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#cbd2dc', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                                    {item.time}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* ========================================================
                          TAB 5: PROFILE & SUPPORT DRAWER
                          ======================================================== */}
                      {activeTab === 'profile' && (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          
                          {/* Profile Card Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#1C7C58', width: 56, height: 56, fontSize: '1.4rem', fontFamily: '"Bricolage Grotesque"', color: '#fff' }}>
                              GW
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Gupta Wholesalers</Typography>
                              <Typography variant="caption" sx={{ color: '#1C7C58', fontWeight: 700, display: 'block' }}>
                                GSTIN Verified Level 2 ✅
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6B7585' }}>
                                Member since Jan 2026
                              </Typography>
                            </Box>
                          </Box>

                          {/* B2B Document Verification Status */}
                          <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: appTheme === 'light' ? '#fff' : '#262C38', border: '1px solid #E2E6EC' }}>
                            <Typography variant="caption" sx={{ fontWeight: 850, color: '#161B24', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                              B2B DOCUMENT UPLOADS STATUS
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {[
                                { name: 'GST Certificate (Form Reg-06)', status: docsStatus.gst, color: '#1C7C58' },
                                { name: 'Trade License / APMC Permit', status: docsStatus.license, color: '#C9842F' },
                                { name: 'Company PAN & ID Proof', status: docsStatus.idProof, color: '#cbd2dc' }
                              ].map((doc, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{doc.name}</Typography>
                                    <Typography variant="caption" sx={{ color: '#6B7585' }}>Active validation</Typography>
                                  </Box>
                                  
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      // Simulate change status
                                      alert('Simulated file uploader triggered. Status changed to Approved!')
                                      setDocsStatus(prev => ({ ...prev, license: 'Approved', idProof: 'Approved' }))
                                    }}
                                    sx={{
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      px: 1,
                                      bgcolor: doc.status === 'Approved' ? '#EAF6F0' : (doc.status === 'Not Uploaded' ? '#EDEFF3' : '#FFF9E6'),
                                      color: doc.status === 'Approved' ? '#1C7C58' : (doc.status === 'Not Uploaded' ? '#6B7585' : '#C9842F'),
                                      borderRadius: 1.5,
                                      textTransform: 'none'
                                    }}
                                  >
                                    {doc.status} ➕
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                          </Paper>

                          {/* INTERACTIVE B2B LIVE CHAT SIMULATOR */}
                          <Box sx={{ border: '1px solid #E2E6EC', borderRadius: 4, overflow: 'hidden' }}>
                            {/* Chat Header */}
                            <Box sx={{ bgcolor: '#1C7C58', color: '#fff', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>💬 Live CRM B2B Assistant</Typography>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9DD4BC' }} />
                            </Box>

                            {/* Chat messages canvas */}
                            <Box sx={{ height: 180, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#EDEFF3' }}>
                              {chatMessages.map((msg, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    bgcolor: msg.sender === 'user' ? '#1C7C58' : '#fff',
                                    color: msg.sender === 'user' ? '#fff' : '#161B24',
                                    p: 1.5,
                                    borderRadius: 3.5,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.3 }}>{msg.text}</Typography>
                                </Box>
                              ))}
                            </Box>

                            {/* Input container */}
                            <Box sx={{ display: 'flex', borderTop: '1px solid #E2E6EC', p: 0.5, bgcolor: '#fff' }}>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="Ask logistics status, code..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { border: 'none', bgcolor: 'transparent', fontSize: '0.72rem' } }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage() }}
                              />
                              <Button size="small" onClick={handleSendChatMessage} sx={{ color: '#1C7C58', fontWeight: 800, textTransform: 'none' }}>
                                Send
                              </Button>
                            </Box>
                          </Box>

                          {/* GENERAL SETTINGS */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            
                            {/* In-app theme changer inside mobile */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid #E2E6EC', borderRadius: 3, bgcolor: appTheme === 'light' ? '#fff' : '#262C38' }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>In-App Dark Theme</Typography>
                              <Switch
                                size="small"
                                checked={appTheme === 'dark'}
                                onChange={(e) => setAppTheme(e.target.checked ? 'dark' : 'light')}
                              />
                            </Box>

                            {/* Raise ticket toggle action */}
                            <Button
                              onClick={() => setShowRaiseTicket(true)}
                              fullWidth
                              variant="outlined"
                              sx={{ textTransform: 'none', borderRadius: 3, fontSize: '0.75rem', py: 1, borderColor: '#cbd2dc', color: '#161B24' }}
                            >
                              🎫 Raise B2B CRM Support Ticket
                            </Button>

                            {/* Secure Logout trigger */}
                            <Button
                              onClick={() => {
                                alert('Session closed securely. Returning to onboarding Splash screen!')
                                setCurrentScreen('splash')
                              }}
                              fullWidth
                              variant="contained"
                              sx={{ bgcolor: '#C0392B', textTransform: 'none', borderRadius: 3, fontSize: '0.75rem', py: 1 }}
                            >
                              Logout B2B Session ✖️
                            </Button>
                          </Box>

                        </Box>
                      )}

                    </Box>
                  )}

                  {/* ========================================================
                      CART TAB & B2B GST/COUPON CALCULATIONS MODULE
                      ======================================================== */}
                  {activeTab === 'cart' && (
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>
                        {checkoutStep === 'cart' ? 'Procurement Cart' : (checkoutStep === 'address' ? 'Shipping Address' : 'Review & Pay')}
                      </Typography>

                      {/* CART STEPS TIMELINE BARS */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ flex: 1, height: 6, bgcolor: '#1C7C58', borderRadius: 2 }} />
                        <Box sx={{ flex: 1, height: 6, bgcolor: checkoutStep !== 'cart' ? '#1C7C58' : '#EDEFF3', borderRadius: 2 }} />
                        <Box sx={{ flex: 1, height: 6, bgcolor: checkoutStep === 'payment' ? '#1C7C58' : '#EDEFF3', borderRadius: 2 }} />
                      </Box>

                      {/* STEP 1: QUANTITY AND ITEM MODIFIER LIST */}
                      {checkoutStep === 'cart' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {cart.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🛒</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Your cart is empty.</Typography>
                              <Button
                                size="small"
                                onClick={() => setActiveTab('products')}
                                sx={{ color: '#1C7C58', textTransform: 'none', fontWeight: 800, mt: 1 }}
                              >
                                View Lot Pricing Catalog ➔
                              </Button>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {cart.map((item, idx) => {
                                const activePrice = getPriceForQty(item.product, item.qty)
                                return (
                                  <Box
                                    key={idx}
                                    sx={{
                                      p: 1.5,
                                      border: '1px solid #E2E6EC',
                                      borderRadius: 4,
                                      bgcolor: appTheme === 'light' ? '#fff' : '#262C38',
                                      display: 'flex',
                                      gap: 1.5
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      src={item.product.image}
                                      sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover' }}
                                    />
                                    
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>{item.product.name}</Typography>
                                      <Typography variant="caption" sx={{ color: '#cbd2dc', display: 'block' }}>
                                        Tier Price: <b>${activePrice}/{item.product.unit}</b>
                                      </Typography>

                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              if (item.qty > item.product.moq) {
                                                setCart(cart.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty - 1 } : c))
                                              } else {
                                                setCart(cart.filter(i => i.product.id !== item.product.id))
                                              }
                                            }}
                                            sx={{ minWidth: 24, height: 24, p: 0, bgcolor: '#EDEFF3', borderRadius: 1 }}
                                          >
                                            -
                                          </Button>
                                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.qty}</Typography>
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              setCart(cart.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))
                                            }}
                                            sx={{ minWidth: 24, height: 24, p: 0, bgcolor: '#EDEFF3', borderRadius: 1 }}
                                          >
                                            +
                                          </Button>
                                        </Box>
                                        
                                        <Typography sx={{ fontWeight: 800, color: '#1C7C58', fontSize: '0.82rem' }}>
                                          ${activePrice * item.qty}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                )
                              })}

                              {/* B2B COUPON INPUT */}
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <TextField
                                  size="small"
                                  placeholder="Enter B2B Coupon (AGRIPORT10)"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                />
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    if (couponCode.toUpperCase() === 'AGRIPORT10') {
                                      setCouponApplied(true)
                                      alert('Flat 10% coupon discount applied successfully!')
                                    } else {
                                      alert('Invalid coupon. Try AGRIPORT10')
                                    }
                                  }}
                                  sx={{ bgcolor: '#C9842F', borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                                >
                                  Apply
                                </Button>
                              </Box>

                              {/* COST BREAKDOWN INVOICE PREVIEW */}
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, mt: 1, border: '1px solid #E2E6EC' }}>
                                <Typography variant="caption" sx={{ fontWeight: 850, color: '#6B7585', display: 'block', mb: 1.5 }}>
                                  INVOICE COST SUMMARY
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6B7585' }}>Slab Subtotal</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>${getSubtotal()}.00</Typography>
                                  </Box>
                                  
                                  {couponApplied && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#1C7C58' }}>
                                      <Typography variant="body2">Flat 10% B2B Coupon</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 800 }}>-${getDiscount()}.00</Typography>
                                    </Box>
                                  )}

                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6B7585' }}>GST Tax (18% B2B Slab)</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>+${getGST()}.00</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6B7585' }}>Logistics Shipping</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      {getShipping() === 0 ? 'FREE' : `$${getShipping()}.00`}
                                    </Typography>
                                  </Box>
                                  
                                  <Divider sx={{ my: 1 }} />
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Invoice Total</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1C7C58', fontSize: '1rem', fontFamily: '"Bricolage Grotesque"' }}>
                                      ${getGrandTotal()}.00
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>

                              <Button
                                variant="contained"
                                onClick={() => setCheckoutStep('address')}
                                sx={{
                                  bgcolor: '#1C7C58',
                                  borderRadius: 3.5,
                                  py: 1.5,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  '&:hover': { bgcolor: '#15694A' }
                                }}
                              >
                                Proceed to Logistics Delivery
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* STEP 2: SHIPPING ADDRESS SELECTOR */}
                      {checkoutStep === 'address' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block' }}>
                            SELECT DELIVERY WAREHOUSE ADDRESS
                          </Typography>
                          
                          {[
                            'Shop 14, B2B Trade Complex, New Delhi, India',
                            'APMC Warehouse 4B, Sector 19, Vashi, Mumbai, India'
                          ].map((addr, idx) => (
                            <Box
                              key={idx}
                              onClick={() => setCheckoutAddress(addr)}
                              sx={{
                                p: 1.5,
                                border: '1.5px solid',
                                borderColor: checkoutAddress === addr ? '#1C7C58' : '#E2E6EC',
                                bgcolor: checkoutAddress === addr ? '#EAF6F0' : '#fff',
                                borderRadius: 3,
                                cursor: 'pointer'
                              }}
                            >
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#161B24' }}>
                                Warehouse Terminal {idx + 1}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: '#6B7585', mt: 0.5 }}>
                                {addr}
                              </Typography>
                            </Box>
                          ))}

                          <Button
                            variant="contained"
                            onClick={() => setCheckoutStep('payment')}
                            sx={{
                              bgcolor: '#1C7C58',
                              borderRadius: 3,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              mt: 2
                            }}
                          >
                            Proceed to B2B Payment
                          </Button>
                        </Box>
                      )}

                      {/* STEP 3: B2B PAYMENT PREVIEW */}
                      {checkoutStep === 'payment' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7585', display: 'block' }}>
                            SELECT B2B SECURE GATEWAY
                          </Typography>

                          {[
                            { id: 'upi', name: 'Instant UPI (Razorpay)', desc: 'Zero transaction fee. 1% instant cashback slab.' },
                            { id: 'stripe', name: 'Stripe Global Card System', desc: 'Accepts all international credit/debit wires.' },
                            { id: 'bank', name: 'Direct Bank Wire (Receipt Upload)', desc: 'Direct corporate RTGS/NEFT transaction.' }
                          ].map((pay) => (
                            <Box
                              key={pay.id}
                              onClick={() => setCheckoutPayment(pay.id as 'upi' | 'stripe' | 'bank')}
                              sx={{
                                p: 1.5,
                                border: '1.5px solid',
                                borderColor: checkoutPayment === pay.id ? '#1C7C58' : '#E2E6EC',
                                bgcolor: checkoutPayment === pay.id ? '#EAF6F0' : '#fff',
                                borderRadius: 3,
                                cursor: 'pointer'
                              }}
                            >
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 850, color: '#161B24' }}>
                                {pay.name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: '#6B7585', mt: 0.5 }}>
                                {pay.desc}
                              </Typography>
                            </Box>
                          ))}

                          {/* Render visual mock for Bank Wire upload if selected */}
                          {checkoutPayment === 'bank' && (
                            <Box sx={{ p: 2, border: '2px dashed #cbd2dc', borderRadius: 3, textAlign: 'center', bg: '#fff' }}>
                              <CloudUploadIcon sx={{ fontSize: 32, color: '#cbd2dc', mb: 1 }} />
                              <Typography variant="caption" sx={{ display: 'block', color: '#6B7585' }}>
                                Drag or browse corporate RTGS bank transfer receipt PDF/JPG here.
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => {
                                  setUploadedReceipt('wire_receipt.pdf')
                                  alert('Bank wire transaction receipt mock upload success!')
                                }}
                                sx={{ mt: 1, textTransform: 'none', fontSize: '0.7rem', color: '#1C7C58', fontWeight: 800 }}
                              >
                                {uploadedReceipt ? '✅ wire_receipt.pdf Uploaded' : '📁 Mock Upload File'}
                              </Button>
                            </Box>
                          )}

                          {/* Grand total visual CTA button */}
                          <Button
                            variant="contained"
                            onClick={placeMockOrder}
                            sx={{
                              bgcolor: '#1C7C58',
                              borderRadius: 3.5,
                              py: 1.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              '&:hover': { bgcolor: '#15694A' }
                            }}
                          >
                            Authorize & Pay ${getGrandTotal()}.00
                          </Button>
                        </Box>
                      )}

                    </Box>
                  )}

                  {/* ========================================================
                      NATIVE NATIVE FIXED BOTTOM NAVIGATION BAR
                      ======================================================== */}
                  <Box
                    sx={{
                      height: 58,
                      borderTop: '1px solid #E2E6EC',
                      bgcolor: appTheme === 'light' ? '#fff' : '#161B24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      zIndex: 100,
                      position: 'relative',
                      boxShadow: '0 -4px 10px rgba(0,0,0,0.03)'
                    }}
                  >
                    {[
                      { id: 'home', label: 'Home', icon: <HomeIcon /> },
                      { id: 'products', label: 'Catalog', icon: <StorefrontIcon /> },
                      { id: 'orders', label: 'Logistics', icon: <ReceiptLongIcon />, badge: 1 },
                      { id: 'notifications', label: 'Alerts', icon: <NotificationsIcon />, badge: 2 },
                      { id: 'profile', label: 'Corporate', icon: <PersonIcon /> }
                    ].map((tab) => (
                      <Box
                        key={tab.id}
                        onClick={() => {
                          setGlobalState('normal')
                          setActiveTab(tab.id as 'home' | 'products' | 'orders' | 'notifications' | 'profile')
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 1,
                          cursor: 'pointer',
                          color: activeTab === tab.id ? '#1C7C58' : '#6B7585',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {/* active pill layout for Android HIG, simple color change for iOS */}
                        {deviceOS === 'android' && activeTab === tab.id ? (
                          <Box sx={{ bgcolor: '#EAF6F0', borderRadius: 4, px: 2, py: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {tab.icon}
                          </Box>
                        ) : (
                          <Box sx={{ position: 'relative' }}>
                            {tab.icon}
                            {/* Badged counts */}
                            {tab.badge && (
                              <Box sx={{ position: 'absolute', top: -4, right: -4, bgcolor: '#C9842F', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                                {tab.badge}
                              </Box>
                            )}
                          </Box>
                        )}
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: activeTab === tab.id ? 800 : 500, mt: 0.5 }}>
                          {tab.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                </Box>
              )}

            </Box>

            {/* iOS BOTTOM HOME SWIPE INDICATOR BAR */}
            {deviceOS === 'ios' && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 140,
                  height: 5,
                  backgroundColor: appTheme === 'light' ? '#161B24' : '#FFFFFF',
                  borderRadius: 10,
                  zIndex: 9999,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (currentScreen === 'main') {
                    setCurrentScreen('splash')
                  }
                }}
              />
            )}

            {/* Android Soft Button Navigation Bar */}
            {deviceOS === 'android' && (
              <Box
                sx={{
                  height: 30,
                  bgcolor: appTheme === 'light' ? '#F4F6F8' : '#161B24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  px: 4,
                  zIndex: 9999,
                  position: 'relative',
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {/* Back button */}
                <Typography sx={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.8rem' }} onClick={() => {
                  if (currentScreen === 'main') setCurrentScreen('login')
                }}>◀</Typography>
                
                {/* Home circle */}
                <Typography sx={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.75rem' }} onClick={() => setCurrentScreen('splash')}>●</Typography>
                
                {/* Recents square */}
                <Typography sx={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.7rem' }}>■</Typography>
              </Box>
            )}

          </Box>
        </Grid>
      </Grid>

      {/* ========================================================
          POPUP MODALS: PRODUCT DETAILS BOTTOM SHEET OVERLAY
          ======================================================== */}
      {selectedProduct && (
        <Dialog
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          scroll="body"
          fullWidth
          maxWidth="xs"
          slotProps={{
            paper: {
              sx: {
                borderRadius: '24px 24px 0 0',
                m: 0,
                position: 'fixed',
                bottom: 0,
                maxHeight: '92vh',
                overflowY: 'auto',
                border: 'none',
                boxShadow: '0 -8px 24px rgba(0,0,0,0.15)'
              }
            }
          }}
        >
          <Box sx={{ p: 2.5 }}>
            {/* Header close block */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#1C7C58', fontWeight: 800, letterSpacing: '0.05em' }}>
                {selectedProduct.category.toUpperCase()}
              </Typography>
              <IconButton size="small" onClick={() => setSelectedProduct(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Gallery Image */}
            <Box
              component="img"
              src={selectedProduct.image}
              sx={{
                width: '100%',
                height: 180,
                borderRadius: 4,
                objectFit: 'cover',
                mb: 2.5
              }}
            />

            <Typography variant="h5" sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, mb: 1, letterSpacing: '-0.015em' }}>
              {selectedProduct.name}
            </Typography>

            <Typography variant="body2" sx={{ color: '#6B7585', mb: 2.5, lineHeight: 1.55 }}>
              {selectedProduct.description}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            {/* Lot-Slabs pricing visual guide */}
            <Typography variant="caption" sx={{ fontWeight: 850, color: '#C9842F', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
              B2B LOT PRICING TIER SLABS
            </Typography>

            <Grid container spacing={1} sx={{ mb: 3 }}>
              {selectedProduct.slabs.map((slab, idx) => {
                const currentTier = productDetailQty >= slab.minQty && (slab.maxQty === '500' || productDetailQty <= parseInt(slab.maxQty))
                return (
                    <Grid size={{ xs: 4 }} key={idx}>
                    <Box
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1.5px solid',
                        borderColor: currentTier ? '#1C7C58' : '#E2E6EC',
                        bgcolor: currentTier ? '#EAF6F0' : '#fff'
                      }}
                    >
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#161B24' }}>
                        {slab.minQty === 51 ? '51+' : `${slab.minQty}-${slab.maxQty}`} {selectedProduct.unit}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#1C7C58', mt: 0.5 }}>
                        ${slab.price}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>

            {/* LOT pricing interactive calculator slider */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7585' }}>
                  Procurement Order Volume
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  {productDetailQty} {selectedProduct.unit} (MOQ: {selectedProduct.moq})
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={Math.min((productDetailQty / selectedProduct.stock) * 100, 100)}
                sx={{ height: 6, borderRadius: 2, bgcolor: '#EDEFF3', '& .MuiLinearProgress-bar': { bgcolor: '#1C7C58' } }}
              />

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                <Button
                  size="small"
                  onClick={() => {
                    if (productDetailQty > selectedProduct.moq) setProductDetailQty(productDetailQty - 1)
                  }}
                  sx={{ minWidth: 28, height: 28, bgcolor: '#EDEFF3', borderRadius: '50%', fontWeight: 'bold' }}
                >
                  -
                </Button>
                <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 'bold' }}>{productDetailQty}</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    if (productDetailQty < selectedProduct.stock) setProductDetailQty(productDetailQty + 1)
                  }}
                  sx={{ minWidth: 28, height: 28, bgcolor: '#EDEFF3', borderRadius: '50%', fontWeight: 'bold' }}
                >
                  +
                </Button>
              </Box>
            </Box>

            {/* Total Estimated Cost Calculator */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, mb: 3, bgcolor: '#F4F6F8', border: '1px solid #E2E6EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7585', display: 'block' }}>ESTIMATED TOTAL</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C9842F' }}>
                  Qualifies for ${getPriceForQty(selectedProduct, productDetailQty)} Slab
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1C7C58', fontFamily: '"Bricolage Grotesque"' }}>
                ${getPriceForQty(selectedProduct, productDetailQty) * productDetailQty}.00
              </Typography>
            </Paper>

            {/* Actions Grid */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    alert(`Direct corporate quote requested for ${productDetailQty} ${selectedProduct.unit}. We will assign a logistics manager shortly!`)
                    setSelectedProduct(null)
                  }}
                  sx={{ py: 1.25, borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#cbd2dc', color: '#161B24' }}
                >
                  Request B2B Quote
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => addToCart(selectedProduct, productDetailQty)}
                  sx={{ py: 1.25, borderRadius: 3, textTransform: 'none', fontWeight: 700, bgcolor: '#1C7C58', '&:hover': { bgcolor: '#15694A' } }}
                >
                  Add to B2B Cart
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      )}

      {/* POPUP MODALS: RAISE TICKET */}
      {showRaiseTicket && (
        <Dialog open={showRaiseTicket} onClose={() => setShowRaiseTicket(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
          <DialogTitle sx={{ fontWeight: 800, fontFamily: '"Bricolage Grotesque"' }}>Raise CRM Support Ticket</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="Logistics">Logistics & Delivery Delay</MenuItem>
                  <MenuItem value="Billing">GST / Invoice Discrepancy</MenuItem>
                  <MenuItem value="Quality">Product Batch Quality Issue</MenuItem>
                  <MenuItem value="Tech">Account / Biometrics Error</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Describe B2B Concern"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Describe your delivery status or billing concern in detail..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setShowRaiseTicket(false)} sx={{ textTransform: 'none', color: '#6B7585', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!newTicketSubject.trim()) return
                const newTk = {
                  id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
                  subject: newTicketSubject,
                  status: 'In Progress',
                  date: 'Today'
                }
                setTickets([newTk, ...tickets])
                setShowRaiseTicket(false)
                setNewTicketSubject('')
                alert(`Support ticket ${newTk.id} registered successfully! Agriport Support will reply in 1 hour.`)
              }}
              sx={{ bgcolor: '#1C7C58', textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}
            >
              Submit Support Ticket
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  )
}
