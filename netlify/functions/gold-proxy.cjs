exports.handler = async function (event, context) {
    try {
        // The splat parameter contains the path after /api/truncgil/
        // For example: /api/truncgil/today.json -> splat = "today.json"
        const path = event.path.split('/').pop() || 'today.json'

        console.log('Fetching gold prices from:', `https://finans.truncgil.com/${path}`)

        // Fetch from the actual API
        const response = await fetch(`https://finans.truncgil.com/${path}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'API request failed' })
            }
        }

        const data = await response.json()

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify(data)
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        }
    }
}
