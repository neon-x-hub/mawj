"use client";

import { HeroUIProvider } from '@heroui/react';
import { LedgexProvider } from './lib/state-ledger/LedgexProvider';
import { FoldersProvider } from './components/context/folders/foldersContext';
import { ProjectsProvider } from './components/context/projects/projectsContext';
import { TemplatesProvider } from './components/context/templates/templatesContext';


export default function Providers({ children }) {
    return (
        <HeroUIProvider>
            <LedgexProvider>
                <FoldersProvider>
                    <ProjectsProvider>
                        <TemplatesProvider>
                            {children}
                        </TemplatesProvider>
                    </ProjectsProvider>
                </FoldersProvider>
            </LedgexProvider>
        </HeroUIProvider>
    );
}
