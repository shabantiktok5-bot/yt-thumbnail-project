import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailData, setThumbnailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically detects if it should use the Netlify variable or fallback to localhost
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setThumbnailData(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/thumbnail`, { videoUrl });
      setThumbnailData(response.data.thumbnails);
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
        <form onSubmit={handleDownload} className="search-box">
          <input
            type="text"
            placeholder="Paste YouTube Video Link Here..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Fetching...' : 'Grab Thumbnail'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {thumbnailData && (
          <div className="thumbnail-results">
            <h3>Download Links:</h3>
            <div className="result-grid">
              {thumbnailData.maxres && (
                <div className="card">
                  <h4>Maximum Resolution (1080p)</h4>
                  <img src={thumbnailData.maxres} alt="Max Res" />
                  <a href={thumbnailData.maxres} target="_blank" rel="noreferrer" download>Download</a>
                </div>
              )}
              {thumbnailData.hq && (
                <div className="card">
                  <h4>High Quality (480p)</h4>
                  <img src={thumbnailData.hq} alt="High Quality" />
                  <a href={thumbnailData.hq} target="_blank" rel="noreferrer" download>Download</a>
                </div>
              )}
              {thumbnailData.mq && (
                <div className="card">
                  <h4>Medium Quality (360p)</h4>
                  <img src={thumbnailData.mq} alt="Medium Quality" />
                  <a href={thumbnailData.mq} target="_blank" rel="noreferrer" download>Download</a>
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