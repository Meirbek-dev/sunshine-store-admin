import {ClerkProvider} from "@clerk/nextjs";
import {ruRU} from "@clerk/localizations";
import {Inter} from "next/font/google";

import {ModalProvider} from "@/providers/modal-provider";
import {ToastProvider} from "@/providers/toast-provider";
import {ThemeProvider} from "@/providers/theme-provider";

import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Панель управления", description: "Панель управления электронной коммерцией",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    return (<ClerkProvider localization={ruRU}>
        <html lang="ru">
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider/>
            <ModalProvider/>
            {children}
        </ThemeProvider>
        </body>
        </html>
    </ClerkProvider>);
}
