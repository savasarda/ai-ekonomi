import { useState, useEffect } from 'react'

export function useGoldPrices() {
    const [goldPrices, setGoldPrices] = useState(null)
    const [goldFetchError, setGoldFetchError] = useState(false)
    const [lastUpdateTime, setLastUpdateTime] = useState(null)

    const fetchGoldPrices = async () => {
        setGoldFetchError(false)
        try {
            // Use Vite proxy in development, Netlify Function in production
            const isDev = import.meta.env.DEV
            const endpoint = isDev
                ? '/api/truncgil/today.json'  // Vite proxy
                : '/.netlify/functions/gold-prices'  // Netlify Function

            const response = await fetch(endpoint)

            if (response.ok) {
                const goldData = await response.json()
                setGoldPrices(goldData)
                setLastUpdateTime(new Date())
                return
            }
            throw new Error('API Error')
        } catch (e) {
            console.warn("Live price fetch failed.", e)
            setGoldFetchError(true)
            setGoldPrices(null)
        }
    }

    useEffect(() => {
        fetchGoldPrices(); // Fetch immediately
        const interval = setInterval(fetchGoldPrices, 60000); // Update every 60s
        return () => clearInterval(interval);
    }, [])

    return { goldPrices, goldFetchError, fetchGoldPrices, lastUpdateTime }
}
