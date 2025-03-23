// Example code for Google Fit OAuth in a React frontend

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/auth/callback';
const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read';

function StepsTracker() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [stepsData, setStepsData] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user has a token stored
    const token = localStorage.getItem('googleFitToken');
    if (token) {
      const tokenData = JSON.parse(token);
      const expiresAt = tokenData.expires_at;

      if (expiresAt && expiresAt > Date.now()) {
        setConnected(true);
        fetchStepsData(tokenData);
      } else {
        // Token expired
        localStorage.removeItem('googleFitToken');
        setConnected(false);
      }
    }
  }, []);

  const connectToGoogleFit = () => {
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('oauth_state', state);

    const authUrl = `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_CLIENT_ID}
      &redirect_uri=${encodeURIComponent(REDIRECT_URI)}
      &response_type=code
      &scope=${encodeURIComponent(SCOPES)}
      &access_type=offline
      &prompt=consent
      &state=${state}`;

    window.location.href = authUrl;
  };

  const handleCallback = async (code, state) => {
    // This function would be called by your OAuth callback route
    const savedState = localStorage.getItem('oauth_state');
    if (state !== savedState) {
      setError('OAuth state mismatch, possible CSRF attack');
      return;
    }

    try {
      // Exchange code for token (this would typically happen on your backend)
      const response = await axios.post('/api/auth/google-fit-token', { code });
      const tokenData = response.data;

      // Save token to localStorage
      localStorage.setItem('googleFitToken', JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000)
      }));

      setConnected(true);
      fetchStepsData(tokenData);
    } catch (err) {
      setError('Failed to authenticate with Google Fit');
      console.error(err);
    }
  };

  const fetchStepsData = async (tokenData) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('/api/steps/get-steps', {
        user_id: userId,
        token_info: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at
        },
        time_range: timeRange
      });

      setStepsData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch steps data');
      console.error(err);

      // Handle authorization errors
      if (err.response && err.response.data &&
          err.response.data.error_details === 'Authorization may have expired') {
        localStorage.removeItem('googleFitToken');
        setConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    const token = localStorage.getItem('googleFitToken');
    if (token) {
      fetchStepsData(JSON.parse(token));
    }
  };

  return (
    <div className="steps-tracker">
      <h2>Step Tracking</h2>

      {!connected ? (
        <button onClick={connectToGoogleFit} disabled={loading}>
          Connect with Google Fit
        </button>
      ) : (
        <>
          <div className="time-range-selector">
            <button
              className={timeRange === 'today' ? 'active' : ''}
              onClick={() => handleTimeRangeChange('today')}
            >
              Today
            </button>
            <button
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => handleTimeRangeChange('week')}
            >
              This Week
            </button>
            <button
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => handleTimeRangeChange('month')}
            >
              This Month
            </button>
          </div>

          {loading ? (
            <p>Loading steps data...</p>
          ) : stepsData ? (
            <div className="steps-data">
              <div className="total-steps">
                <h3>{stepsData.total_steps.toLocaleString()}</h3>
                <p>steps</p>
              </div>

              <div className="goal-progress">
                <h4>Goal Progress</h4>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{width: `${stepsData.goal_progress.progress_percent}%`}}
                  ></div>
                </div>
                <p>{stepsData.goal_progress.progress_percent}% of daily goal</p>
                <p className="status">{stepsData.goal_progress.status}</p>

                {stepsData.goal_progress.steps_remaining > 0 && (
                  <p className="remaining">
                    {stepsData.goal_progress.steps_remaining.toLocaleString()} steps to go
                  </p>
                )}
              </div>

              {stepsData.daily_data && stepsData.daily_data.length > 0 && (
                <div className="daily-breakdown">
                  <h4>Daily Breakdown</h4>
                  <ul>
                    {stepsData.daily_data.map(day => (
                      <li key={day.date}>
                        <span className="date">{day.date}</span>
                        <span className="steps">{day.steps.toLocaleString()} steps</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>No steps data available</p>
          )}
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default StepsTracker;