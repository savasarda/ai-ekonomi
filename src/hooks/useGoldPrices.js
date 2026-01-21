import { useState, useEffect } from 'react'

export function useGoldPrices() {
    const [goldPrices, setGoldPrices] = useState(null)
    const [goldFetchError, setGoldFetchError] = useState(false)
    const [lastUpdateTime, setLastUpdateTime] = useState(null)

    const fetchGoldPrices = async () => {
        setGoldFetchError(false)
        try {
            // Trying GenelPara API (Proxy) & CoinGecko for ETH
            const [resGold, resEth] = await Promise.all([
                fetch('/api/truncgil/today.json').catch(e => null),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=try').catch(e => null)
            ])

            if (resGold && resGold.ok) {
                const goldData = await resGold.json()

                // Merge Ethereum Data if available
                if (resEth && resEth.ok) {
                    try {
                        const ethData = await resEth.json()
                        if (ethData.ethereum && ethData.ethereum.try) {
                            const ethPrice = ethData.ethereum.try
                            // Format like Truncgil: "123.456,78"
                            const formattedPrice = ethPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            goldData['ethereum'] = {
                                "Satış": formattedPrice,
                                "Tür": "Kripto",
                                "Alış": formattedPrice
                            }
                        }
                    } catch (e) {
                        console.warn("ETH parse error", e)
                    }
                }

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
