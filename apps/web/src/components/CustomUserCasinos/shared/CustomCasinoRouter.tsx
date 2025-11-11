// @ts-nocheck
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserPage } from '../UserPage/UserPage'
import CustomGamesRouter from '@/components/CustomUserCasinos/CustomGames/shared/CustomGamePage/CustomGameRouter'
import { LeftPanel } from '@/components/shared/Panels/LeftPanel'

/**
 * CustomCasinoRouter - Handles all routing related to custom casinos
 * and their games in a centralized component
 */
const CustomCasinoRouter: React.FC = () => {
  return (
    <Routes>
      {/* Casino main page */}
      <Route path=':username' element={<UserPage />} />

      {/* Casino game instances */}
      <Route path=':username/games/:gameType/:instanceId' element={<CustomGamesRouter />} />

      {/* Casino Left Panel instances */}
      <Route path='/custom/:username/games/:gameType/:instanceId/*' element={<LeftPanel />} />

      {/* Default redirect if no path matches */}
      <Route path='*' element={<Navigate to='/discover' replace />} />
    </Routes>
  )
}

export default CustomCasinoRouter
