import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { PodcastPlayerProvider } from '@/src/components/podcast/PlayerContext'
import { useRefreshAuthMutation } from '@/state/auth/api'
import { useAuthSelector } from '@/state/auth/selectors'
import { ensureTradlyInit } from '@/api/tradly-init'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import VerifyOtpPage from '../pages/VerifyOtpPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import HomePage from '../pages/HomePage'
import TitleDetailPage from '../pages/TitleDetailPage'
import WatchPage from '../pages/WatchPage'
import MyListPage from '../pages/MyListPage'
import PlansPage from '../pages/PlansPage'
import { PodcastsPage, PodcastShowPage } from '../pages/PodcastsPage'
import EpisodePage, { RssFeedPage } from '../pages/EpisodePage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import ThankYouPage from '../pages/ThankYouPage'
import OrdersPage from '../pages/OrdersPage'
import OrderDetailPage from '../pages/OrderDetailPage'
import CategoryListingsPage from '../pages/CategoryListingsPage'
import PaymentPage from '../pages/PaymentPage'
import PaymentReturnPage from '../pages/PaymentReturnPage'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [refreshAuth] = useRefreshAuthMutation()
  const isAuthenticated = useAuthSelector(s => s.isAuthenticated)

  useEffect(() => {
    const init = async () => {
      // Initialize the Tradly SDK (tenant key resolution) before anything
      // else; without this every auth/listing call fails.
      await ensureTradlyInit()
      if (isAuthenticated) {
        try { await refreshAuth() } catch { /* stay logged out silently */ }
      }
      setReady(true)
    }
    init()
  }, [])

  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#141414', color: '#22c55e', fontWeight: 800, fontSize: 28 }}>
      VIDEOHUB
    </div>
  )
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthSelector(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function PodcastShowRoute() {
  const { slug = "" } = useParams<{ slug: string }>()
  return <PodcastShowPage slug={slug} />
}

function EpisodeRoute() {
  const { slug = "" } = useParams<{ slug: string }>()
  return <EpisodePage slug={slug} />
}

function RssRoute() {
  const { slug = "" } = useParams<{ slug: string }>()
  return <RssFeedPage showSlug={slug} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <PodcastPlayerProvider>
        <Routes>
          {/* Auth */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Netflix-style browse */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<HomePage kind="movie" />} />
          <Route path="/series" element={<HomePage kind="series" />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/title/:slug" element={<TitleDetailPage />} />
          <Route path="/watch/:slug" element={<WatchPage />} />

          {/* Podcasts — list UX, persistent player, RSS distribution */}
          <Route path="/podcasts" element={<PodcastsPage />} />
          <Route path="/podcast/:slug" element={<PodcastShowRoute />} />
          <Route path="/podcast/:slug/rss" element={<RssRoute />} />
          <Route path="/episode/:slug" element={<EpisodeRoute />} />

          {/* Legacy marketplace routes (kept for checkout) */}
          <Route path="/listing/:slug" element={<TitleDetailPage />} />
          <Route path="/lc/:slug" element={<CategoryListingsPage />} />

          {/* Protected */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment-return" element={<PaymentReturnPage />} />
          <Route path="/checkouts/:reference/thank-you" element={<ProtectedRoute><ThankYouPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PodcastPlayerProvider>
      </AppInitializer>
    </BrowserRouter>
  )
}
