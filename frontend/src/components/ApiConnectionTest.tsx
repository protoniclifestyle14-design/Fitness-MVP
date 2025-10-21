"use client"
import React, { useState, useEffect } from 'react';
import { healthCheck, register, login, getCurrentUser } from '@/lib/api';

export default function ApiConnectionTest() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Checking backend connection...');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    const results: string[] = [];

    try {
      // Test 1: Health check
      results.push('🔍 Testing backend health endpoint...');
      const health = await healthCheck();
      if (health.ok) {
        results.push('✅ Backend is healthy!');
        setBackendStatus('connected');
        setStatusMessage('Backend connected successfully!');
      } else {
        results.push('❌ Backend health check failed');
        setBackendStatus('error');
        setStatusMessage('Backend is not responding correctly');
      }

      setTestResults([...results]);
    } catch (error) {
      results.push(`❌ Connection error: ${error}`);
      setBackendStatus('error');
      setStatusMessage('Could not connect to backend');
      setTestResults([...results]);
    }
  };

  const testRegistration = async () => {
    const results = [...testResults];
    try {
      results.push('🔍 Testing user registration...');
      const randomEmail = `test${Date.now()}@example.com`;
      const response = await register({
        email: randomEmail,
        password: 'password123',
        name: 'Test User',
      });
      results.push(`✅ Registration successful! User ID: ${response.user.id}`);
      results.push(`📧 Email: ${response.user.email}`);
      results.push(`🔑 Access token received: ${response.access_token.substring(0, 20)}...`);
      setTestResults([...results]);
    } catch (error) {
      results.push(`❌ Registration error: ${error}`);
      setTestResults([...results]);
    }
  };

  const testLogin = async () => {
    const results = [...testResults];
    try {
      // First register a user
      results.push('🔍 Creating test user...');
      const randomEmail = `test${Date.now()}@example.com`;
      await register({
        email: randomEmail,
        password: 'password123',
        name: 'Test User',
      });
      results.push('✅ User created');

      // Now login
      results.push('🔍 Testing login...');
      const response = await login({
        email: randomEmail,
        password: 'password123',
      });
      results.push(`✅ Login successful!`);
      results.push(`👤 User: ${response.user.email}`);
      results.push(`📊 Workouts completed: ${response.stats?.total_workouts || 0}`);
      setTestResults([...results]);
    } catch (error) {
      results.push(`❌ Login error: ${error}`);
      setTestResults([...results]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Connection Test</h1>
          <p className="text-gray-400">Testing frontend-backend integration</p>
        </div>

        {/* Connection Status */}
        <div className={`p-6 rounded-lg mb-6 ${
          backendStatus === 'connected' ? 'bg-green-500/20 border border-green-500' :
          backendStatus === 'error' ? 'bg-red-500/20 border border-red-500' :
          'bg-yellow-500/20 border border-yellow-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              backendStatus === 'error' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Backend URL: http://localhost:4000
          </p>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testBackendConnection}
            className="bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            🔄 Test Connection
          </button>
          <button
            onClick={testRegistration}
            disabled={backendStatus !== 'connected'}
            className="bg-green-600 hover:bg-green-700 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 Test Register
          </button>
          <button
            onClick={testLogin}
            disabled={backendStatus !== 'connected'}
            className="bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔐 Test Login
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-black/40 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-2 font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="py-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-400 mb-2">ℹ️ About this test page</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Frontend is running on port 3000</li>
            <li>• Backend is running on port 4000 with a mock database</li>
            <li>• All API calls go through the /lib/api.ts utility</li>
            <li>• Authentication uses JWT tokens stored in localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
