"use client"
import { createContext, useContext, useState, ReactNode } from "react"

type LangType = "en" | "hi"

const LangContext = createContext<{ lang: LangType; toggleLang: () => void }>({
  lang: "en",
  toggleLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangType>(
    (typeof window !== "undefined" && (localStorage.getItem("lang") as LangType)) || "en"
  )

  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en"
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>
}

export const useLanguage = () => useContext(LangContext)
