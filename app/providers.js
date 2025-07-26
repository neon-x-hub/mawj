"use client";

import { HeroUIProvider } from '@heroui/react';
import { LedgexProvider } from './lib/state-ledger/LedgexProvider';

export default function Providers({ children }) {
    return (
        <HeroUIProvider>
            <LedgexProvider>
                {children}
            </LedgexProvider>
        </HeroUIProvider>
    );
}
