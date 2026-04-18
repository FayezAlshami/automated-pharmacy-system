import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { PageTransition } from '@/components/layout/PageTransition'
import { DispensingPage } from '@/pages/DispensingPage'
import { ErrorPage } from '@/pages/ErrorPage'
import { PaymentPage } from '@/pages/PaymentPage'
import { QrScanPage } from '@/pages/QrScanPage'
import { SuccessPage } from '@/pages/SuccessPage'
import { VerificationPage } from '@/pages/VerificationPage'
import { WelcomePage } from '@/pages/WelcomePage'
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <WelcomePage />
            </PageTransition>
          }
        />
        <Route
          path="/scan"
          element={
            <PageTransition>
              <QrScanPage />
            </PageTransition>
          }
        />
        <Route
          path="/verification"
          element={
            <PageTransition>
              <VerificationPage />
            </PageTransition>
          }
        />
        <Route
          path="/payment"
          element={
            <PageTransition>
              <PaymentPage />
            </PageTransition>
          }
        />
        <Route
          path="/dispensing"
          element={
            <PageTransition>
              <DispensingPage />
            </PageTransition>
          }
        />
        <Route
          path="/success"
          element={
            <PageTransition>
              <SuccessPage />
            </PageTransition>
          }
        />
        <Route
          path="/error"
          element={
            <PageTransition>
              <ErrorPage />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export function AppRouter() {
  return <AnimatedRoutes />
}
