# Feature: Dark Mode

## Status: done

## User Stories
- Theme toggle: switch between light and dark mode — done
- System preference: default to OS theme — done
- Persist preference: remember choice across sessions — done (next-themes localStorage)

## Implemented
- [x] ThemeProvider wrapping the app (next-themes, attribute="class", system default)
- [x] suppressHydrationWarning on html tag
- [x] Dark mode CSS variables in globals.css (oklch color scheme)
- [x] Tailwind 4 dark variant configured (@custom-variant dark)
- [x] ThemeToggle component (Sun/Moon icons, hydration-safe)
- [x] Toggle in protected layout header
- [x] Toggle in login page (top-right corner)
- [x] Toggle in signup page (top-right corner)
- [x] Sonner toast respects current theme (resolvedTheme)
- [x] Turbopack http2 stub for Axios compatibility

## Files
- `src/components/providers/theme-provider.tsx` — next-themes wrapper
- `src/components/theme-toggle.tsx` — Sun/Moon toggle button
- `src/components/ui/sonner.tsx` — Updated to use dynamic theme
- `src/app/layout.tsx` — ThemeProvider + suppressHydrationWarning
- `src/app/(protected)/layout.tsx` — Toggle in header
- `src/app/(public)/login/page.tsx` — Toggle top-right
- `src/app/(public)/signup/page.tsx` — Toggle top-right
- `next.config.ts` — Turbopack http2 resolve alias
- `src/lib/stubs/empty.js` — Empty module stub for Node.js modules

## Notes
- Uses `next-themes` v1.0.0-beta.0 (upgraded from 0.4.6 to fix React 19 script tag warning)
- Dark CSS variables were already defined in globals.css by shadcn/ui init
- Tailwind 4 dark variant was already configured
- The only infrastructure needed was ThemeProvider + html attribute
- Fixed a pre-existing Axios + Turbopack build error (http2 module not found)
