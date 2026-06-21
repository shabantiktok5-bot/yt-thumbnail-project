const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Completely open up CORS so Netlify's domain security allows the fetch
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Flat-object API endpoint mapping cleanly to response.data queries
app.get('/get-thumbnail', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'YouTube URL is required' });
    }

    try {
        let videoId = '';
        
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (videoUrl.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(videoUrl).search);
            videoId = urlParams.get('v');
        } else if (videoUrl.includes('youtube.com/embed/')) {
            videoId = videoUrl.split('youtube.com/embed/')[1].split(/[?#]/)[0];
        } else if (videoUrl.includes('youtube.com/shorts/')) {
            videoId = videoUrl.split('youtube.com/shorts/')[1].split(/[?#]/)[0];
        }

        if (!videoId) {
            return res.status(400).json({ error: 'Could not extract valid YouTube Video ID' });
        }

        // Return flat links matching what frontend response.data saves directly
        return res.json({
            maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
            hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            default: `https://img.youtube.com/vi/${videoId}/default.jpg`
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error processing URL' });
    }
});

// App environment sanity root check
app.get('/', (req, res) => {
    res.send('YouTube Thumbnail Downloader Backend is Running Live!');
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});