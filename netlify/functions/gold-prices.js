export async function handler(event, context) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Fetch gold prices and Ethereum price in parallel
        const [goldResponse, ethResponse] = await Promise.all([
            fetch('https://finans.truncgil.com/today.json').catch(() => null),
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=try').catch(() => null)
        ]);

        if (!goldResponse || !goldResponse.ok) {
            throw new Error('Failed to fetch gold prices');
        }

        const goldData = await goldResponse.json();

        // Merge Ethereum data if available
        if (ethResponse && ethResponse.ok) {
            try {
                const ethData = await ethResponse.json();
                if (ethData.ethereum && ethData.ethereum.try) {
                    const ethPrice = ethData.ethereum.try;
                    // Format like Truncgil: "123.456,78"
                    const formattedPrice = ethPrice.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    goldData['ethereum'] = {
                        "Satış": formattedPrice,
                        "Tür": "Kripto",
                        "Alış": formattedPrice
                    };
                }
            } catch (e) {
                console.warn("ETH parse error", e);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(goldData)
        };

    } catch (error) {
        console.error('Error fetching gold prices:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch gold prices',
                message: error.message
            })
        };
    }
}
