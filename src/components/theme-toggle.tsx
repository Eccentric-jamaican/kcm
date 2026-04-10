"use client"

import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-6 w-12 items-center rounded-full border border-border bg-background transition-colors",
        className
      )}
      aria-label="Toggle theme"
      aria-pressed={isDark}
    >
      <div
        className={cn(
          "absolute h-6 w-6 rounded-full border border-border bg-background transition-transform duration-200",
          isDark ? "translate-x-6" : "translate-x-0"
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          <SunIcon
            className={cn(
              "h-4 w-4 rotate-0 scale-100 transition-all",
              isDark && "-rotate-90 scale-0"
            )}
          />
          <MoonIcon
            className={cn(
              "absolute h-4 w-4 rotate-90 scale-0 transition-all",
              isDark && "rotate-0 scale-100"
            )}
          />
        </div>
      </div>
    </button>
  )
}
