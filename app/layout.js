// I18n
import { t, getLang } from '@/app/i18n'

// Global styles
import "./globals.css";

// Providers
import Providers from "./providers";


// Layout Components
import SideBar from './components/shared/SideBar';

export const metadata = {
    title: "موج | Mawj",
    description: "Create and share cards, videos and all that is useful",
};

export default function RootLayout({ children }) {

    const lang = getLang();

    return (
        <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <body className="bg-gray-200 rounded-none">
                <Providers>
                    <div className="flex w-full h-screen gap-6 flex-row p-4 box-border">

                        {/* Sidebar */}
                        <SideBar />

                        {/* Main Content */}
                        <div className="flex-1 h-full overflow-y-auto scrollbar-hide r30">
                            {children}
                        </div>

                    </div>
                </Providers>
            </body>
        </html>
    );
}
