'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SWRConfig value={swrConfig}>
                    {children}
                </SWRConfig>
            </AuthProvider>
        </ThemeProvider>
    )
} 