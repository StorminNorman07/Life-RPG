import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import Navigation from "@/components/Navigation";
import AccountCloudSync from "@/components/cloud/AccountCloudSync";
import ProfileSync from "@/components/social/ProfileSync";
import { AppDialogProvider } from "@/components/ui/AppDialogProvider";

import {
  AchievementProvider,
} from "@/context/AchievementContext";

import {
  CharacterProvider,
} from "@/context/CharacterContext";

import {
  FocusAudioProvider,
} from "@/context/FocusAudioContext";

import {
  FocusTimerProvider,
} from "@/context/FocusTimerContext";

import {
  GameProvider,
} from "@/context/GameContext";

import {
  PremiumProvider,
} from "@/context/PremiumContext";


export const metadata:
  Metadata = {
  title:
    "Life RPG",

  description:
    "Build better habits, grow your stats, and bring your progress to life.",

  applicationName:
    "Life RPG",

  manifest:
    "/manifest.webmanifest",

  appleWebApp: {
    capable:
      true,

    title:
      "Life RPG",

    statusBarStyle:
      "black-translucent",
  },

  icons: {
    icon: [
      {
        url:
          "/icon-192x192.png",

        sizes:
          "192x192",

        type:
          "image/png",
      },

      {
        url:
          "/icon-512x512.png",

        sizes:
          "512x512",

        type:
          "image/png",
      },
    ],

    apple: [
      {
        url:
          "/apple-touch-icon.png",

        sizes:
          "180x180",

        type:
          "image/png",
      },
    ],
  },
};


export const viewport:
  Viewport = {
  themeColor:
    "#000000",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          overflow-x-hidden
          bg-black
          text-white
        "
        suppressHydrationWarning
      >
        <AppDialogProvider>
          <AccountCloudSync
            publicContent={
              children
            }
          >
            <PremiumProvider>
              <GameProvider>
                <AchievementProvider>
                  <CharacterProvider>
                    <FocusTimerProvider>
                      <FocusAudioProvider>
                        <ProfileSync />

                        <Navigation />

                        {children}
                      </FocusAudioProvider>
                    </FocusTimerProvider>
                  </CharacterProvider>
                </AchievementProvider>
              </GameProvider>
            </PremiumProvider>
          </AccountCloudSync>
        </AppDialogProvider>
      </body>
    </html>
  );
}
