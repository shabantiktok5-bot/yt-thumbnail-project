const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// UPGRADED: This formula now perfectly extracts IDs from regular videos, shorts, and mobile links!
const getYoutubeId = (url) => {
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
};

app.get('/get-thumbnail', (req, res) => {
    const videoUrl = req.query.url;
    const videoId = getYoutubeId(videoUrl);

    if (videoId) {
        res.json({
            success: true,
            maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, 
            hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,         
            mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,         
            sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`          
        });
    } else {
        res.status(400).json({ success: false, message: "Invalid YouTube URL specified." });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));