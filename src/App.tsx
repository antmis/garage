import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { getVehicle, DEFAULT_VEHICLE_ID } from '@/data'
import { ChecklistProvider } from '@/features/checklist'
import { IdentityProvider } from '@/features/identity'
import { AppLayout } from '@/shared/layout'
import { Home } from '@/pages/Home'
import { Toaster } from '@/ui'

export default function App() {
  // Single vehicle for now. To add more, read `:vehicleId` from the route and pass
  // getVehicle(id) here instead of the default.
  const vehicle = getVehicle(DEFAULT_VEHICLE_ID)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <IdentityProvider>
          <ChecklistProvider vehicle={vehicle}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
              </Route>
            </Routes>
          </ChecklistProvider>
        </IdentityProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
