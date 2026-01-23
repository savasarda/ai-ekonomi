import { useState, useEffect } from 'react'

export function useGoldPrices() {
    const [goldPrices, setGoldPrices] = useState(null)
    const [goldFetchError, setGoldFetchError] = useState(false)
    const [lastUpdateTime, setLastUpdateTime] = useState(null)

    const fetchGoldPrices = async () => {
        setGoldFetchError(false)
        try {
            // Using stable Legacy API (today.json)
            const [resGold, resEth] = await Promise.all([
                fetch(`/api/truncgil/today.json?_=${new Date().getTime()}`, {
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                }).catch(e => null),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=try').catch(e => null)
            ])

            if (resGold && resGold.ok) {
                const data = await resGold.json()
                const updateDate = data.Update_Date || new Date();


                // Merge Ethereum
                if (resEth && resEth.ok) {
                    try {
                        const ethData = await resEth.json()
                        const ethPrice = ethData?.ethereum?.try;
                        if (ethPrice) {
                            const ethFormatted = ethPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            data['ethereum'] = {
                                "Alış": ethFormatted,
                                "Satış": ethFormatted,
                                "Tür": "Kripto"
                            }
                        }
                    } catch (e) { console.warn(e) }
                }

                setGoldPrices(data)
                setLastUpdateTime(new Date()) // User requested local system time
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
