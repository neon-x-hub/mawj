"use client";

import { HeroUIProvider } from '@heroui/react';
import { LedgexProvider } from './lib/state-ledger/LedgexProvider';
import { FoldersProvider } from './components/context/folders/foldersContext';


export default function Providers({ children }) {
    return (
        <HeroUIProvider>
            <LedgexProvider>
                <FoldersProvider>
                    {children}
                </FoldersProvider>
            </LedgexProvider>
        </HeroUIProvider>
    );
}
