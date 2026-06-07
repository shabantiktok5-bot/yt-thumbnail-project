import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnails, setThumbnails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track broken images so we can hide them cleanly if YouTube didn't generate them
  const [brokenImages, setBrokenImages] = useState({});

  // Client-side quick link validation
  const isValidYoutubeUrl = (url) => {
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    return regExp.test(url);
  };

  const handleFetchThumbnail = async () => {
    setError('');
    setThumbnails(null);
    setBrokenImages({}); // Reset broken image tracking

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
      const response = await axios.get(`http://localhost:5000/get-thumbnail?url=${encodeURIComponent(videoUrl)}`);
      if (response.data.success) {
        setThumbnails(response.data);
      } else {
        setError('Could not fetch thumbnails. Make sure the URL is correct.');
      }
    } catch (err) {
      setError('Error connecting to the server. Make sure your backend server is running!');
    } finally {
      setLoading(false);
    }
  };

  // Clear button helper to wipe the screen clean
  const handleClear = () => {
    setVideoUrl('');
    setThumbnails(null);
    setError('');
    setBrokenImages({});
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download automatically. Try right-clicking the image.');
    }
  };

  const handleImageError = (key) => {
    setBrokenImages(prev => ({ ...prev, [key]: true }));
  };

  // Dynamically filter out images that YouTube returns as non-existent or broken
  const resolutionOptions = thumbnails ? [
    { id: 'maxres', label: 'Ultra HD (1080p / 720p Max)', btnText: 'Download HD Thumbnail', url: thumbnails.maxres, name: 'hd-thumbnail.jpg' },
    { id: 'hq', label: 'High Quality (720p / 480p HQ)', btnText: 'Download SD Thumbnail', url: thumbnails.hq, name: 'sd-thumbnail.jpg' },
    { id: 'mq', label: 'Medium Quality (480p MQ)', btnText: 'Download Medium quality', url: thumbnails.mq, name: 'mq-thumbnail.jpg' },
    { id: 'sd', label: 'Standard Quality (360p SD)', btnText: 'Download standard quality', url: thumbnails.sd, name: 'standard-thumbnail.jpg' }
  ].filter(option => !brokenImages[option.id]) : [];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh', color: '#333' }}>
      
      <header style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ color: '#ff0000', fontSize: '42px', marginBottom: '10px', fontWeight: 'bold' }}>
          Free YouTube Thumbnail Downloader
        </h1>
        <p style={{ color: '#666', fontSize: '19px', maxWidth: '800px', margin: '0 auto' }}>
          Grab YouTube thumbnails in all available resolutions instantly. Free, fast, and high quality.
        </p>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 30px auto' }}>
          <input 
            type="text" 
            placeholder="Paste YouTube Link Here (e.g., https://www.youtube.com/watch?v=...)" 
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
          />
          <br />
          
          <button 
            onClick={handleFetchThumbnail}
            disabled={loading}
            style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '14px 40px', fontSize: '17px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
          >
            {loading ? 'Fetching...' : 'Get Thumbnail Images'}
          </button>

          {/* THE NEW INSTANT CLEAR BUTTON */}
          {(videoUrl || thumbnails) && (
            <button 
              onClick={handleClear}
              style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '14px 30px', fontSize: '17px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Clear
            </button>
          )}
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{error}</p>}

        {thumbnails && (
          <div style={{ marginTop: '35px', borderTop: '2px solid #f4f4f9', paddingTop: '35px' }}>
            <h2 style={{ color: '#222', fontSize: '24px', marginBottom: '30px', textAlign: 'center' }}>Your Available Downloads:</h2>
            
            {resolutionOptions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No valid resolutions found for this video.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {resolutionOptions.map((option) => (
                  <div key={option.id} style={{ background: '#f9f9fb', padding: '25px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px', color: '#444' }}>{option.label}</p>
                    <img 
                      src={option.url} 
                      alt={option.label} 
                      style={{ width: '100%', borderRadius: '6px', height: 'auto', display: 'block', margin: '0 auto 20px auto', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }} 
                      onError={() => handleImageError(option.id)}
                    />
                    <button 
                      onClick={() => downloadImage(option.url, option.name)}
                      style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px 25px', fontSize: '15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '90%' }}
                    >
                      📥 {option.btnText}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <section style={{ maxWidth: '1100px', margin: '60px auto 40px auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#111', marginBottom: '30px' }}>Frequently Asked Questions (FAQ)</h2>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff0000', fontSize: '19px' }}>How do I download a YouTube thumbnail in different sizes?</h3>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>Just paste the link above. Our system extracts every single image resolution option generated by YouTube—including Full HD, High Quality, and Standard sizes—giving you a dedicated download button for each.</p>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ff0000', fontSize: '19px' }}>Why do some sizes not appear for certain videos?</h3>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>If a video is older or uploaded in low quality, YouTube may not generate a High-Definition version of the thumbnail. Our application automatically filters out non-existent dimensions so you always get functional downloads.</p>
        </div>
      </section>

    </div>
  );
}

export default App;