"use client"

import React, {useCallback, useState} from 'react';
import {
    Activity,
    Award,
    BarChart3,
    Camera,
    Dumbbell,
    Flame,
    Heart,
    Mic,
    Target,
    Trophy,
    Video,
    Volume2,
    Zap
} from 'lucide-react';

const DEFAULT_CHALLENGES = [
  {
    id: 1,
    title: '30-Day Morning Routine',
    description: 'Wake up at 6 AM and do 10 push-ups every day for 30 days',
    type: 'fitness',
    duration: '30 days',
    participants: 127,
    creator: 'Alex Chen',
    progress: 12,
    daysRemaining: 18
  },
  {
    id: 2,
    title: 'Hydration Hero Challenge',
    description: 'Drink 8 glasses of water daily for 2 weeks',
    type: 'wellness',
    duration: '14 days',
    participants: 89,
    creator: 'Sarah K.',
    progress: 5,
    daysRemaining: 9
  }
];

const DEFAULT_HABITS = [
  {
    id: 1,
    name: 'Morning Routine',
    description: 'Wake up at 6 AM and exercise',
    progress: 85,
    streak: 12
  },
  {
    id: 2,
    name: 'Quit Stress Eating',
    description: 'Stop eating when stressed',
    progress: 60,
    streak: 7
  }
];

const DEFAULT_TRAINERS = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    specialty: 'Strength Training',
    rating: 4.9,
    available: true,
    nextAvailable: 'Today 3:00 PM'
  },
  {
    id: 2,
    name: 'Marcus Williams',
    specialty: 'HIIT Training',
    rating: 4.8,
    available: true,
    nextAvailable: 'Today 4:30 PM'
  }
];

const DEFAULT_WORKOUTS = [
  {
    id: 1,
    name: 'Morning Energizer',
    duration: 20,
    difficulty: 'Beginner',
    equipment: 'None',
    calories: 150
  },
  {
    id: 2,
    name: 'Core Crusher',
    duration: 15,
    difficulty: 'Intermediate',
    equipment: 'Mat',
    calories: 120
  }
];

function useVoiceRecognition(onCommand: (command: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    
    // Simulate voice recognition
    const commands = [
      'Start morning workout',
      'Show my progress', 
      'Check my habits',
      'Show analytics'
    ];
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    setTimeout(() => {
      setTranscript(randomCommand);
      onCommand(randomCommand);
      setIsListening(false);
      setTimeout(() => setTranscript(''), 3000);
    }, 2000);
  }, [onCommand]);

  return { isListening, transcript, startListening };
}

interface WelcomeScreenProps {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    aiResponse: string;
    onSignup: () => void;
    onGuest: () => void;
}

const WelcomeScreen = ({ isListening, transcript, startListening, aiResponse, onSignup, onGuest } : WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30"></div>
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-8 shadow-2xl animate-pulse">
            <Activity className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              PROTONIC
            </span>
          </h1>
          <div className="text-3xl font-light text-gray-400 tracking-wider mb-6">INERTIA</div>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            Voice-powered fitness with live trainers, habit science, and social challenges
          </p>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 mb-8 ${
              isListening
                ? 'bg-red-500 scale-110 animate-pulse shadow-2xl shadow-red-500/50'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 shadow-2xl shadow-cyan-500/30'
            }`}
          >
            {isListening ? (
              <div className="flex flex-col items-center">
                <Volume2 className="w-16 h-16 text-white mb-3 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <Mic className="w-16 h-16 text-white" />
            )}
          </button>
          <h2 className="text-3xl font-bold mb-4">
            {isListening ? 'Listening...' : 'Say "Sign up" or "Guest mode"'}
          </h2>
          <p className="text-gray-400 text-lg">
            {isListening ? 'Tell me how you would like to get started...' : 'Tap to talk or use the buttons below'}
          </p>
        </div>

        {transcript && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-lg mx-auto">
            <p className="text-sm text-gray-400 mb-2">You said:</p>
            <p className="text-xl font-semibold text-center">"{transcript}"</p>
          </div>
        )}

        <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 max-w-lg mx-auto mb-8">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-cyan-400 font-medium">AI Coach</span>
          </div>
          <p className="text-gray-200 leading-relaxed">{aiResponse}</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={onSignup}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
          >
            Create Account
          </button>
          <button
            onClick={onGuest}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 py-4 rounded-2xl font-bold text-lg transition-all"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

interface SignupScreenProps {
  onSkip: () => void;
}

const SignupScreen = ({ onSkip }: SignupScreenProps) => {
  const handleSocialLogin = (provider: string) => {
    // In a real app, this would trigger OAuth flow
    console.log(`Login with ${provider}`);
    onSkip(); // For demo, just continue to app
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Join Protonic</h2>
            <p className="text-gray-400">Create your account and get started</p>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-center text-sm text-gray-400 mb-4">Log in with:</p>
            
            {/* Google */}
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full bg-white hover:bg-gray-100 text-black py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="w-full bg-black border border-white hover:bg-gray-900 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-black text-xs font-bold">🍎</span>
              </div>
              <span>Continue with Apple</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <span>Continue with Facebook</span>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handleSocialLogin('Instagram')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">📷</span>
              </div>
              <span>Continue with Instagram</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 py-4 rounded-xl font-bold transition-all mb-4"
          >
            Continue to App
          </button>

          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

interface VoiceHomeScreenProps {
  currentUser: { name?: string; isGuest?: boolean } | null;
  userMetrics: {
    level: number;
    currentStreak: number;
    heartRateAvg: number;
    vo2Max: number;
    xp: number;
    nextLevelXp: number;
    totalWorkouts: number;
    totalMinutes: number;
    caloriesBurned: number;
  };
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  aiResponse: string;
  setCurrentView: (view: string) => void;
}

const VoiceHomeScreen = ({
  currentUser,
  userMetrics,
  transcript,
  isListening,
  startListening,
  aiResponse,
  setCurrentView
}: VoiceHomeScreenProps) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {currentUser && !currentUser.isGuest && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-3 text-white font-bold">
                {currentUser.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </div>
            )}
            <div>
              <div className="text-gray-400 text-sm">
                {currentUser?.isGuest ? 'Guest Mode' : `Welcome back, ${currentUser?.name?.split(' ')[0] || 'User'}!`}
              </div>
              <div className="font-bold flex items-center">
                <span>Level {userMetrics.level}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Flame className="w-4 h-4 mr-1 text-orange-400" />
                  {userMetrics.currentStreak} day streak
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('analytics')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30">
            <div className="flex items-center justify-between mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Avg HR</span>
            </div>
            <div className="text-xl font-bold">{userMetrics.heartRateAvg}</div>
            <div className="text-xs text-gray-400">bpm</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30">
            <div className="flex items-center justify-between mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400">VO2 Max</span>
            </div>
            <div className="text-xl font-bold">{userMetrics.vo2Max}</div>
            <div className="text-xs text-green-400">↗ 8%</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30">
            <div className="flex items-center justify-between mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">XP</span>
            </div>
            <div className="text-xl font-bold">{userMetrics.xp}</div>
            <div className="text-xs text-gray-400">/{userMetrics.nextLevelXp}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-2xl bg-cyan-500">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            PROTONIC
          </h1>
          <p className="text-lg font-light text-gray-400 tracking-wider">FITNESS AI</p>
        </div>

        <div className="flex flex-col items-center justify-center mb-6">
          {/* Main Voice Button */}
          <button
            onClick={startListening}
            disabled={isListening}
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 mb-6 ${
              isListening
                ? 'bg-red-500 scale-110 animate-pulse shadow-2xl shadow-red-500/50'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 shadow-2xl shadow-cyan-500/30'
            }`}
          >
            {isListening ? (
              <div className="flex flex-col items-center">
                <Volume2 className="w-14 h-14 text-white mb-2 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <Mic className="w-14 h-14 text-white" />
            )}
          </button>

          {/* AI Body Scan Button */}
          <button
            onClick={() => setCurrentView('bodyScan')}
            className="w-full max-w-sm bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-green-500/30 mb-4"
          >
            <div className="flex items-center justify-center space-x-3">
              <Camera className="w-6 h-6 text-white" />
              <span>AI Body Scan</span>
            </div>
          </button>

          {/* Secondary Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('analytics')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/30"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentView('challenges')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xl shadow-yellow-500/30"
            >
              <Trophy className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentView('workouts')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xl shadow-red-500/30"
            >
              <Dumbbell className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">
          {isListening ? 'Listening...' : 'Voice Command Ready'}
        </h2>
        <p className="text-gray-400 text-center max-w-sm mx-auto mb-8">
          {isListening ? "I'm listening for your command..." : "Say 'start workout', 'show progress', or tap below"}
        </p>

        {transcript && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6 max-w-lg mx-auto">
            <p className="text-sm text-gray-400 mb-2">You said:</p>
            <p className="text-lg font-semibold text-center">"{transcript}"</p>
          </div>
        )}

        <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 max-w-lg mx-auto">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-cyan-500">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-cyan-400">AI Coach</span>
          </div>
          <p className="text-gray-200 leading-relaxed">{aiResponse}</p>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentView('workouts')}
            className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 text-center hover:bg-red-500/30 transition-colors"
          >
            <Dumbbell className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-bold">Workouts</div>
          </button>
          <button
            onClick={() => setCurrentView('trainers')}
            className="bg-green-500/20 border border-green-500/30 rounded-2xl p-3 text-center hover:bg-green-500/30 transition-colors"
          >
            <Video className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-bold">Trainers</div>
          </button>
          <button
            onClick={() => setCurrentView('habits')}
            className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-3 text-center hover:bg-purple-500/30 transition-colors"
          >
            <Target className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-bold">Habits</div>
          </button>
          <button
            onClick={() => setCurrentView('challenges')}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-3 text-center hover:bg-yellow-500/30 transition-colors"
          >
            <Trophy className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-bold">Challenges</div>
          </button>
        </div>
      </div>
    </div>
  );
};

interface AnalyticsScreenProps {
  userMetrics: {
    totalWorkouts: number;
    totalMinutes: number;
    caloriesBurned: number;
    vo2Max: number;
  };
  setCurrentView: (view: string) => void;
}

const AnalyticsScreen = ({ userMetrics, setCurrentView }: AnalyticsScreenProps) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
          ← Back
        </button>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div></div>
      </div>
      <div className="p-6 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <div className="text-sm text-gray-400">Total Workouts</div>
            <div className="text-2xl font-bold">{userMetrics.totalWorkouts}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <div className="text-sm text-gray-400">Total Minutes</div>
            <div className="text-2xl font-bold">{userMetrics.totalMinutes}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <div className="text-sm text-gray-400">Calories Burned</div>
            <div className="text-2xl font-bold">{userMetrics.caloriesBurned}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
            <div className="text-sm text-gray-400">VO₂ Max</div>
            <div className="text-2xl font-bold">{userMetrics.vo2Max}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BodyScanScreenProps {
  setCurrentView: (view: string) => void;
  setAiResponse: (response: string) => void;
}

interface ScanResults {
  overallScore: number;
  areas: Array<{
    area: string;
    score: number;
    issue: string;
    recommendation: string;
    exercises: string[];
  }>;
  preferences: string;
}

const BodyScanScreen = ({ setCurrentView, setAiResponse }: BodyScanScreenProps) => {
  const [scanStage, setScanStage] = useState<'setup' | 'scanning' | 'analyzing' | 'results'>('setup');
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const startScan = () => {
    setCameraActive(true);
    setScanStage('scanning');
    
    // Simulate camera activation and scan process
    setTimeout(() => {
      setScanStage('analyzing');
      setTimeout(() => {
        // Simulate AI analysis results
        const results: ScanResults = {
          overallScore: 78,
          areas: [
            {
              area: 'Posture',
              score: 65,
              issue: 'Forward head posture detected',
              recommendation: 'Focus on neck strengthening and chest stretching',
              exercises: ['Chin Tucks', 'Wall Angels', 'Upper Trap Stretches']
            },
            {
              area: 'Core Stability',
              score: 82,
              issue: 'Good core engagement, slight imbalance',
              recommendation: 'Continue core work with rotational movements',
              exercises: ['Russian Twists', 'Dead Bug', 'Pallof Press']
            },
            {
              area: 'Hip Alignment',
              score: 88,
              issue: 'Excellent hip mobility and alignment',
              recommendation: 'Maintain current hip flexibility routine',
              exercises: ['Hip Circles', 'Clamshells', 'Pigeon Pose']
            }
          ],
          preferences: 'Based on your scan, focusing on posture correction will give you the biggest improvements.'
        };
        
        setScanResults(results);
        setScanStage('results');
        setAiResponse("Body scan complete! I've identified key areas for improvement and created a personalized movement plan for you.");
      }, 3000);
    }, 2000);
  };

  const retakeScan = () => {
    setScanStage('setup');
    setScanResults(null);
    setCameraActive(false);
  };

  if (scanStage === 'setup') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">AI Body Scan</h2>
          <div></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">AI Posture Analysis</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Our AI will analyze your posture and movement patterns to identify areas for improvement and suggest personalized exercises.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md mx-auto mb-8">
            <h4 className="font-bold mb-3">Instructions:</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Stand 3-4 feet from your camera</li>
              <li>• Ensure good lighting</li>
              <li>• Wear fitted clothing</li>
              <li>• Stand naturally with arms at sides</li>
              <li>• Look straight ahead</li>
            </ul>
          </div>
          
          <button
            onClick={startScan}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
          >
            Start Body Scan
          </button>
        </div>
      </div>
    );
  }

  if (scanStage === 'scanning') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">Scanning...</h2>
          <div></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-80 h-96 bg-gray-800 rounded-2xl mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 animate-pulse"></div>
            <div className="absolute inset-4 border-2 border-green-500 rounded-xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-16 bg-green-500/50 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="text-green-400 text-sm font-medium">Camera Active</div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Hold Still...</h3>
            <p className="text-gray-400">AI is capturing your posture data</p>
            
            <div className="flex justify-center mt-6">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scanStage === 'analyzing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">Analyzing...</h2>
          <div></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-spin">
            <Zap className="w-16 h-16 text-white" />
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">AI Analysis in Progress</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Processing your posture data and identifying movement patterns...
            </p>
            
            <div className="mt-8 space-y-2">
              <div className="text-sm text-green-400">✓ Posture mapping complete</div>
              <div className="text-sm text-yellow-400">⏳ Analyzing muscle imbalances</div>
              <div className="text-sm text-gray-500">⏳ Generating exercise recommendations</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scanStage === 'results' && scanResults) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">Scan Results</h2>
          <button onClick={retakeScan} className="text-green-400 font-medium">
            Retake
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl p-6 border border-green-500/30 mb-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">Overall Score</h3>
                <div className="text-6xl font-black text-green-400 mb-2">{scanResults?.overallScore}</div>
                <div className="text-gray-400">Good posture with room for improvement</div>
              </div>
            </div>
            
            {/* AI Coach Recommendation */}
            <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-cyan-400 font-medium">AI Coach Recommendation</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{scanResults?.preferences}</p>
            </div>
            
            {/* Detailed Areas */}
            <div className="space-y-4">
              {scanResults?.areas.map((area, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-lg">{area.area}</h4>
                    <div className={`text-2xl font-bold ${area.score >= 80 ? 'text-green-400' : area.score >= 65 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {area.score}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{area.issue}</p>
                  <p className="text-cyan-300 mb-4">{area.recommendation}</p>
                  
                  <div>
                    <h5 className="font-medium text-sm text-gray-400 mb-2">Recommended Exercises:</h5>
                    <div className="flex flex-wrap gap-2">
                      {area.exercises.map((exercise, i) => (
                        <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => setCurrentView('workouts')}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-4 rounded-xl font-bold transition-all"
              >
                Start Corrective Workout
              </button>
              <button
                onClick={retakeScan}
                className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20 py-4 rounded-xl font-medium transition-all"
              >
                Take Another Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

interface GenericScreenProps {
  title: string;
  items: Array<{
    id: number;
    name?: string;
    title?: string;
    description?: string;
    specialty?: string;
    type?: string;
    duration?: string | number;
    nextAvailable?: string;
  }>;
  setCurrentView: (view: string) => void;
}

const GenericScreen = ({ title, items, setCurrentView }: GenericScreenProps) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
          ← Back
        </button>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div></div>
      </div>
      <div className="p-6 flex-1">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <div className="font-bold">{item.name || item.title}</div>
              <div className="text-sm text-gray-400 mt-1">
                {item.description || `${item.specialty || item.type} • ${item.duration || item.nextAvailable}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ProtonicFitnessApp() {
  const [currentView, setCurrentView] = useState('welcome');
  const [currentUser, setCurrentUser] = useState<{ name?: string; isGuest?: boolean } | null>(null);
  const [aiResponse, setAiResponse] = useState("Hi! I'm your AI fitness coach. Say 'start workout', 'show trainers', or 'guest mode' to begin.");

  const userMetrics = {
    totalWorkouts: 127,
    totalMinutes: 3420,
    caloriesBurned: 24500,
    currentStreak: 7,
    level: 12,
    xp: 8750,
    nextLevelXp: 10000,
    heartRateAvg: 142,
    vo2Max: 45.2
  };

  const onVoiceCommand = useCallback((command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes('guest mode')) {
      setCurrentUser({ name: 'Guest User', isGuest: true });
      setCurrentView('home');
      setAiResponse("Welcome! You're in guest mode.");
    } else if (lower.includes('body scan') || lower.includes('posture') || lower.includes('scan me')) {
      setCurrentView('bodyScan');
      setAiResponse("Let's analyze your posture and movement patterns to create a personalized workout plan!");
    } else if (lower.includes('progress') || lower.includes('analytics')) {
      setCurrentView('analytics');
      setAiResponse("Here's your fitness dashboard!");
    } else if (lower.includes('workout')) {
      setCurrentView('workouts');
      setAiResponse("Let's start your workout!");
    } else {
      setAiResponse("I can help with workouts, body scans, progress tracking, or other fitness goals.");
    }
  }, []);

  const { isListening, transcript, startListening } = useVoiceRecognition(onVoiceCommand);

  const handleSignup = () => {
    setCurrentView('signup');
  };

  const handleGuest = () => {
    setCurrentUser({ name: 'Guest User', isGuest: true });
    setCurrentView('home');
  };

  const handleCompleteSignup = () => {
    setCurrentUser({ name: 'New User' });
    setCurrentView('home');
  };

  if (currentView === 'welcome') {
    return (
      <WelcomeScreen
        isListening={isListening}
        transcript={transcript}
        startListening={startListening}
        aiResponse={aiResponse}
        onSignup={handleSignup}
        onGuest={handleGuest}
      />
    );
  }

  if (currentView === 'signup') {
    return <SignupScreen onSkip={handleCompleteSignup} />;
  }

  if (currentView === 'home') {
    return (
      <VoiceHomeScreen
        currentUser={currentUser}
        userMetrics={userMetrics}
        transcript={transcript}
        isListening={isListening}
        startListening={startListening}
        aiResponse={aiResponse}
        setCurrentView={setCurrentView}
      />
    );
  }

  if (currentView === 'analytics') {
    return <AnalyticsScreen userMetrics={userMetrics} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'bodyScan') {
    return <BodyScanScreen setCurrentView={setCurrentView} setAiResponse={setAiResponse} />;
  }

  if (currentView === 'workouts') {
    return <GenericScreen title="Workouts" items={DEFAULT_WORKOUTS} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'trainers') {
    return <GenericScreen title="Trainers" items={DEFAULT_TRAINERS} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'habits') {
    return <GenericScreen title="Habits" items={DEFAULT_HABITS} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'challenges') {
    return <GenericScreen title="Challenges" items={DEFAULT_CHALLENGES} setCurrentView={setCurrentView} />;
  }

  return null;
}