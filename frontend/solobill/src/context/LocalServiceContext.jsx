import React, { createContext, useContext, useEffect, useState } from "react"

const LocalServiceContext = createContext(null)

export function LocalServiceProvider({ children }) {
  const [service, setService] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    async function detect() {
      try {
        const res = await fetch("http://localhost:7777/health", {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Not running")

        const data = await res.json()
        setService(data)
      } catch {
        setService(null)
      } finally {
        setChecked(true)
      }
    }

    detect()
  }, [])

  return (
    <LocalServiceContext.Provider value={{ service, checked }}>
      {children}
    </LocalServiceContext.Provider>
  )
}

export function useLocalService() {
  return useContext(LocalServiceContext)
}
