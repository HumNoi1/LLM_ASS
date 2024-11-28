import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    try {
        const response = await axios.post('http://localhost:1234/v1/completions', {
            prompt: prompt,
            max_tokens: 100, // Token limit
        });

        res.status(200).json({ result: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Error communicating with LM Studio' });
    }
}
