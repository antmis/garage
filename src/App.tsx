import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { getVehicle, DEFAULT_VEHICLE_ID } from '@/data'
import { ChecklistProvider } from '@/features/checklist'
import { IdentityProvider } from '@/features/identity'
import { AppLayout } from '@/shared/layout'
import { Home } from '@/pages/Home'
import { Interval } from '@/pages/Interval'
import { Toaster } from '@/ui'

export default function App() {
  // Single vehicle for now. To add more, read `:vehicleId` from the route and pass
  // getVehicle(id) here instead of the default.
  const vehicle = getVehicle(DEFAULT_VEHICLE_ID)
  // next-themes renders an inline <script> meant for SSR; React never runs it in a client-only app and
  // warns about it. A non-JS type keeps it inert and quiet.
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem scriptProps={{ type: 'application/json' }}>
      <BrowserRouter>
        <IdentityProvider>
          <ChecklistProvider vehicle={vehicle}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
              </Route>
              <Route path="/interval/:miles" element={<Interval />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChecklistProvider>
        </IdentityProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
