exports.handler = async function (event, context) {
    try {
        // Extract the path after /api/truncgil/
        const path = event.path.replace('/.netlify/functions/gold-proxy/', '')

        // Fetch from the actual API
        const response = await fetch(`https://finans.truncgil.com/${path}`, {
            headers: {
                'Accept': 'application/json',
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
