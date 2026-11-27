import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ThemeProvider } from 'next-themes'
import { DeviceProgressPrompt } from '@/features/checklist'
import { LastVehicleRedirect, LegacyIntervalRedirect } from '@/features/garage'
import { IdentityProvider, NewPasswordDialog } from '@/features/identity'
import { persistOptions, queryClient } from '@/lib/api/queryClient'
import { missingConfig } from '@/lib/supabase'
import { AppLayout, VehicleLayout } from '@/shared/layout'
import { Garage } from '@/pages/Garage'
import { Home } from '@/pages/Home'
import { Interval } from '@/pages/Interval'
import { VehicleScope } from '@/pages/VehicleScope'
import { EmptyState, Toaster, Typography } from '@/ui'

export default function App() {
  if (missingConfig) {
    return (
      <div className="mx-auto max-w-md p-6">
        <EmptyState message="Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example)." />
      </div>
    )
  }
  // next-themes renders an inline <script> meant for SSR; React never runs it in a client-only app and
  // warns about it. A non-JS type keeps it inert and quiet.
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem scriptProps={{ type: 'application/json' }}>
      {/* resumePausedMutations: checklist changes made offline in an earlier visit are sent once restored. */}
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
        onSuccess={() => void queryClient.resumePausedMutations()}
      >
        <BrowserRouter>
          <IdentityProvider>
            <Routes>
              <Route index element={<LastVehicleRedirect />} />
              <Route element={<AppLayout title={<Typography as="h1" variant="heading">Garage</Typography>} />}>
                <Route path="garage" element={<Garage />} />
              </Route>
              <Route path="interval/:miles" element={<LegacyIntervalRedirect />} />
              <Route path=":vehicleId" element={<VehicleScope />}>
                <Route element={<VehicleLayout />}>
                  <Route index element={<Home />} />
                </Route>
                <Route path="interval/:interval" element={<Interval />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <DeviceProgressPrompt />
            <NewPasswordDialog />
          </IdentityProvider>
        </BrowserRouter>
      </PersistQueryClientProvider>
      <Toaster />
    </ThemeProvider>
  )
}
