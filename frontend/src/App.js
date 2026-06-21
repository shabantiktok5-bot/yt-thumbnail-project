import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnails, setThumbnails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brokenImages, setBrokenImages] = useState({});

  // Quick validation logic to ensure a YouTube URL format exists
  const isValidYoutubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleFetchThumbnail = async () => {
    setError('');
    setThumbnails(null);
    setBrokenImages({}); 

    if (!videoUrl) {
      setError('Please paste a YouTube URL first!');
      return;
    }

    if (!isValidYoutubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube, Shorts, or mobile video link.');
      return;
    }

    setLoading(true);
    try {
      // Connect directly to your live Render URL endpoint
      const response = await axios.get(`https://yt-thumbnail-backend-hhej.onrender.com/get-thumbnail?url=${encodeURIComponent(videoUrl)}`);
      
      // Directly check for data contents instead of checking a missing success key
      if (response.data && response.data.default) {
        setThumbnails(response.data);
      } else {
        setError('Could not fetch thumbnails. Make sure the URL is correct.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server. Make sure your backend server is running!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Thumbnail Downloader</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Paste YouTube Video Link Here..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button onClick={handleFetchThumbnail} disabled={loading}>
            {loading ? 'Fetching...' : 'Grab Thumbnail'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {thumbnails && (
          <div className="thumbnail-results">
            <h3>Download Links:</h3>
            <div className="result-grid">
              {thumbnails.maxres && !brokenImages.maxres && (
                <div className="card">
                  <h4>Maximum Resolution (1080p)</h4>
                  <img 
                    src={thumbnails.maxres} 
                    alt="Max Res" 
                    onError={() => setBrokenImages(prev => ({ ...prev, maxres: true }))}
                  />
                  <a href={thumbnails.maxres} target="_blank" rel="noreferrer" download>Download</a>
                </div>
              )}
              {thumbnails.hq && (
                <div className="card">
                  <h4>High Quality (480p)</h4>
                  <img src={thumbnails.hq} alt="High Quality" />
                  <a href={thumbnails.hq} target="_blank" rel="noreferrer" download>Download</a>
                </div>
              )}
              {thumbnails.mq && (
                <div className="card">
                  <h4>Medium Quality (360p)</h4>
                  <img src={thumbnails.mq} alt="Medium Quality" />
                  <a href={thumbnails.mq} target="_blank" rel="noreferrer" download>Download</a>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;