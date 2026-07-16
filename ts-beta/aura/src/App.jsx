import React, { useState, useEffect } from 'react';
import { Play, Pause, Waves, Sparkles, Moon, Volume2 } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import { audioEngine } from './audioEngine';
import './index.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mood, setMood] = useState('Calm');
  const [volume, setVolume] = useState(0.5);

  const handlePlayPause = () => {
    if (!isPlaying) {
      audioEngine.start();
      setIsPlaying(true);
    } else {
      audioEngine.stop();
      setIsPlaying(false);
    }
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
    audioEngine.setMood(newMood);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  };

  // Prevent AudioContext warnings before user interaction
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  return (
    <>
      <div className="gradient-bg"></div>
      <ParticleBackground />
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="glass glass-panel">
          <h1 className="title">
            Aura
          </h1>
          <p className="subtitle">
            Generative ambient soundscapes
          </p>

          <button 
            className="button-glass"
            onClick={handlePlayPause}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              marginBottom: '40px'
            }}
          >
            {isPlaying ? (
              <Pause size={36} fill="currentColor" />
            ) : (
              <Play size={36} fill="currentColor" style={{ marginLeft: '6px' }} />
            )}
          </button>

          <div className="mood-selector">
            <button 
              className={`button-glass mood-btn ${mood === 'Calm' ? 'active' : ''}`}
              onClick={() => handleMoodChange('Calm')}
            >
              <Waves size={16} style={{ marginRight: '8px' }}/> Calm
            </button>
            <button 
              className={`button-glass mood-btn ${mood === 'Deep' ? 'active' : ''}`}
              onClick={() => handleMoodChange('Deep')}
            >
              <Moon size={16} style={{ marginRight: '8px' }}/> Deep
            </button>
            <button 
              className={`button-glass mood-btn ${mood === 'Ethereal' ? 'active' : ''}`}
              onClick={() => handleMoodChange('Ethereal')}
            >
              <Sparkles size={16} style={{ marginRight: '8px' }}/> Ethereal
            </button>
          </div>

          {/* Volume Slider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '30px',
            width: '100%',
            maxWidth: '280px'
          }}>
            <Volume2 size={20} color="rgba(255,255,255,0.6)" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

        </div>
        
        <p style={{ position: 'absolute', bottom: '30px', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', letterSpacing: '1px' }}>
          All logic runs locally on your device
        </p>
      </div>
    </>
  );
}

export default App;
