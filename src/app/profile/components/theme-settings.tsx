"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ThemeOption = {
  value: string
  label: string
  description: string
  icon: React.ElementType
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean, bright interface",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes at night",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follows your OS preference",
    icon: Monitor,
  },
]

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  // Avoid hydration mismatch — only render after mounting
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Choose how the interface looks. Your preference is saved locally in your browser.
        </p>
      </div>

      {/* Theme option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = mounted && theme === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200",
                "hover:border-primary/60 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card"
              )}
            >
              {/* Check mark on selected */}
              {isSelected && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}

              {/* Icon preview block */}
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-xl border transition-colors",
                  isSelected
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-7" />
              </div>

              <div>
                <p className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Live preview strip */}
      {mounted && (
        <div className="rounded-xl border p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Preview
          </p>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              A
            </div>
            <div className="space-y-1 flex-1">
              <div className="h-2.5 w-28 rounded-full bg-foreground/20" />
              <div className="h-2 w-20 rounded-full bg-foreground/10" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-7 w-14 rounded-md bg-primary opacity-90" />
              <div className="h-7 w-14 rounded-md border bg-card" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Currently using: <span className="font-medium text-foreground capitalize">{resolvedTheme ?? "—"}</span>
          </p>
        </div>
      )}
    </div>
  )
}
