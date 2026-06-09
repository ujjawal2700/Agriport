import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import SectionCard from '@/components/common/SectionCard'
import { useGetCrmCustomersQuery, useGetFollowUpsQuery } from '@/redux/api'
import { formatMoney, fromNow, initials } from '@/utils/format'
import type { CRMCustomer, CustomerStage, FollowUp } from '@/types'
import toast from 'react-hot-toast'

const STAGE_META: Record<CustomerStage, { label: string; color: 'success' | 'info' | 'warning' | 'default' }> = {
  active: { label: 'Active', color: 'success' },
  prospect: { label: 'Prospect', color: 'info' },
  lead: { label: 'Lead', color: 'warning' },
  dormant: { label: 'Dormant', color: 'default' },
}

export default function CustomersPage() {
  const { data: custData } = useGetCrmCustomersQuery()
  const { data: fuData } = useGetFollowUpsQuery()
  const [customers, setCustomers] = useState<CRMCustomer[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', phone: '+91', city: '', gst: '' })

  useEffect(() => {
    if (custData) setCustomers(custData)
  }, [custData])
  useEffect(() => {
    if (fuData) setFollowUps(fuData)
  }, [fuData])

  const toggle = (id: string) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, done: !f.done } : f)))
  }

  const addCustomer = () => {
    const c: CRMCustomer = {
      id: `cu-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      city: form.city.trim() || '—',
      stage: 'lead',
      value: 0,
      lastContact: new Date().toISOString(),
      owner: 'Rahul Verma',
      gst: form.gst.trim() || undefined,
    }
    setCustomers((prev) => [c, ...prev])
    toast.success('Customer added as a new lead')
    setOpen(false)
    setForm({ name: '', company: '', phone: '+91', city: '', gst: '' })
  }

  return (
    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Box className="lg:col-span-2">
        <SectionCard
          title="My customers"
          subtitle={`${customers.length} relationships`}
          action={<Button variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={() => setOpen(true)}>Add customer</Button>}
          padded={false}
        >
          <Box sx={{ px: 3, pb: 1 }}>
            {customers.map((c, i) => {
              const m = STAGE_META[c.stage]
              return (
                <Box key={c.id} className="flex items-center gap-3" sx={{ py: 1.75, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'var(--brand-600)', fontSize: 13 }}>{initials(c.name)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{c.company}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }} className="tnum">{c.name} · {c.city} · {c.phone}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13.5 }}>{formatMoney(c.value)}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)' }}>last: {fromNow(c.lastContact)}</Typography>
                  </Box>
                  <Chip size="small" label={m.label} color={m.color === 'default' ? 'default' : m.color} variant={m.color === 'default' ? 'filled' : 'outlined'} />
                </Box>
              )
            })}
          </Box>
        </SectionCard>
      </Box>

      <Box>
        <SectionCard title="Follow-ups" subtitle="Scheduled touchpoints">
          <Box className="flex flex-col">
            {followUps.map((f, i) => (
              <Box key={f.id} className="flex items-start gap-1.5" sx={{ py: 1.25, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                <Checkbox checked={f.done} onChange={() => toggle(f.id)} size="small" sx={{ p: 0.5, mt: 0.25 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, textDecoration: f.done ? 'line-through' : 'none', color: f.done ? 'var(--ink-400)' : 'var(--ink-900)' }}>
                    {f.company}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{f.note}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)', textTransform: 'capitalize' }} className="tnum">
                    {f.type} · {fromNow(f.dueOn)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700 }}>Add customer</DialogTitle>
        <DialogContent dividers>
          <Box className="flex flex-col gap-3 pt-1">
            <TextField label="Person name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} size="small" autoFocus />
            <TextField label="GST (Optional)" value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} size="small" />
            <TextField label="Company name" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} size="small" />
            <TextField label="Address" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} size="small" />
            <TextField label="Phone number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={addCustomer} variant="contained" disabled={!form.name.trim() || !form.company.trim()}>Add customer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
