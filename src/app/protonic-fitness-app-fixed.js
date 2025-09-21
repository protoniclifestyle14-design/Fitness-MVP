import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Activity,
    Mic,
    Volume2,
    Zap,
    Video,
    Trophy,
    Heart,
    Award,
    Dumbbell,
    Share2,
    Flame,
    Target,
    BarChart3,
    Camera,
    X,
    Play,
    Pause,
    RotateCcw,
    Users,
    Calendar,
    TrendingUp,
    Star,
    CheckCircle,
    Timer,
    MessageCircle
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
        daysRemaining: 18,
        reward: 500,
        difficulty: 'Medium'
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
        daysRemaining: 9,
        reward: 300,
        difficulty: 'Easy'
    },
    {
        id: 3,
        title: 'Flexibility Master',
        description: '15-minute daily stretching routine for 21 days',
        type: 'flexibility',
        duration: '21 days',
        participants: 64,
        creator: 'Yoga Mike',
        progress: 0,
        daysRemaining: 21,
        reward: 400,
        difficulty: 'Easy'
    }
];

const DEFAULT_HABITS = [
    {
        id: 1,
        name: 'Morning Routine',
        description: 'Wake up at 6 AM and exercise',
        progress: 85,
        streak: 12,
        bestStreak: 18,
        totalDays: 45
    },
    {
        id: 2,
        name: 'Quit Stress Eating',
        description: 'Stop eating when stressed',
        progress: 60,
        streak: 7,
        bestStreak: 12,
        totalDays: 30
    },
    {
        id: 3,
        name: 'Evening Meditation',
        description: '10 minutes before bed',
        progress: 40,
        streak: 3,
        bestStreak: 8,
        totalDays: 15
    }
];

const DEFAULT_TRAINERS = [
    {
        id: 1,
        name: 'Dr. Sarah Chen',
        specialty: 'Strength Training',
        rating: 4.9,
        available: true,
        nextAvailable: 'Today 3:00 PM',
        price: '$80/hr',
        sessions: 156,
        image: '👩‍⚕️'
    },
    {
        id: 2,
        name: 'Marcus Williams',
        specialty: 'HIIT Training',
        rating: 4.8,
        available: true,
        nextAvailable: 'Today 4:30 PM',
        price: '$65/hr',
        sessions: 203,
        image: '💪'
    },
    {
        id: 3,
        name: 'Elena Rodriguez',
        specialty: 'Yoga & Mindfulness',
        rating: 4.9,
        available: false,
        nextAvailable: 'Tomorrow 9:00 AM',
        price: '$55/hr',
        sessions: 189,
        image: '🧘‍♀️'
    }
];

const DEFAULT_WORKOUTS = [
    {
        id: 1,
        name: 'Morning Energizer',
        duration: 20,
        difficulty: 'Beginner',
        equipment: 'None',
        calories: 150,
        type: 'Cardio',
        rating: 4.8,
        completions: 1247
    },
    {
        id: 2,
        name: 'Core Crusher',
        duration: 15,
        difficulty: 'Intermediate',
        equipment: 'Mat',
        calories: 120,
        type: 'Strength',
        rating: 4.6,
        completions: 856
    },
    {
        id: 3,
        name: 'HIIT Blast',
        duration: 25,
        difficulty: 'Advanced',
        equipment: 'None',
        calories: 300,
        type: 'HIIT',
        rating: 4.9,
        completions: 2103
    }
];

function useVoiceRecognition(onCommand) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const startListening = useCallback(() => {
        setIsListening(true);
        setTranscript('');

        const commands = [
            'Start morning workout',
            'Show my progress',
            'Check my habits',
            'Show analytics',
            'Join a challenge',
            'Book a trainer session',
            'Start body scan',
            'Play relaxing music',
            'Check my streak',
            'Show recommended workouts'
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

const WelcomeScreen = ({ isListening, transcript, startListening, aiResponse, onSignup, onGuest }) => {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/20"></div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-white to-cyan-400 bg-clip-text text-transparent mb-4">
                        PROTONIC
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        The world's first voice-powered AI fitness coach. Transform your body with revolutionary technology.
                    </p>
                </div>

                <div className="mb-12">
                    <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-500 ${
                        isListening
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/50 scale-110'
                            : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'
                    } cursor-pointer group`}
                         onClick={startListening}
                    >
                        {isListening ? (
                            <div className="flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <Mic className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                        )}

                        {isListening && (
                            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                        )}
                    </div>

                    <p className="mt-4 text-sm text-gray-400">
                        {isListening ? 'Listening...' : 'Tap to activate voice control'}
                    </p>

                    {transcript && (
                        <div className="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30">
                            <p className="text-purple-300">"{transcript}"</p>
                        </div>
                    )}

                    {aiResponse && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 backdrop-blur-sm rounded-lg border border-cyan-500/30">
                            <p className="text-cyan-300">{aiResponse}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 w-full max-w-md">
                    <button
                        onClick={onSignup}
                        className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                        Get Started Free
                    </button>

                    <button
                        onClick={onGuest}
                        className="w-full py-4 px-8 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-600 hover:border-gray-500"
                    >
                        Continue as Guest
                    </button>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                            <Mic className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-400">Voice Control</p>
                    </div>

                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto">
                            <Camera className="w-6 h-6 text-cyan-400" />
                        </div>
                        <p className="text-sm text-gray-400">AI Body Scan</p>
                    </div>

                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                            <Trophy className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-sm text-gray-400">Gamification</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeScreen = ({ user, onVoiceCommand }) => {
    const [selectedTab, setSelectedTab] = useState('home');

    if (selectedTab === 'analytics') {
        return <AnalyticsScreen onBack={() => setSelectedTab('home')} />;
    }

    if (selectedTab === 'challenges') {
        return <ChallengesScreen onBack={() => setSelectedTab('home')} />;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>

                <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Welcome back, {user.name}! 🔥</h1>
                            <p className="text-gray-400">Ready to crush your goals today?</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onVoiceCommand}
                                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300"
                            >
                                <Mic className="w-6 h-6" />
                            </button>

                            <div className="text-right">
                                <div className="flex items-center space-x-1">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="font-bold text-yellow-400">{user.xp}</span>
                                </div>
                                <p className="text-xs text-gray-400">Level {user.level}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-4 rounded-xl border border-orange-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <Flame className="w-6 h-6 text-orange-400" />
                                <span className="text-2xl font-bold text-orange-400">{user.streak}</span>
                            </div>
                            <p className="text-sm text-gray-300">Day Streak</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-4 rounded-xl border border-green-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <Target className="w-6 h-6 text-green-400" />
                                <span className="text-2xl font-bold text-green-400">{user.weeklyGoal}%</span>
                            </div>
                            <p className="text-sm text-gray-300">Weekly Goal</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Quick Start</h2>
                                <button
                                    onClick={() => setSelectedTab('challenges')}
                                    className="text-sm text-purple-400 hover:text-purple-300"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 text-left hover:scale-105 transition-all">
                                    <Video className="w-8 h-8 text-purple-400 mb-2" />
                                    <h3 className="font-semibold mb-1">Start Workout</h3>
                                    <p className="text-xs text-gray-400">20 min • Beginner</p>
                                </button>

                                <button className="p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl border border-cyan-500/30 text-left hover:scale-105 transition-all">
                                    <Camera className="w-8 h-8 text-cyan-400 mb-2" />
                                    <h3 className="font-semibold mb-1">Body Scan</h3>
                                    <p className="text-xs text-gray-400">AI posture analysis</p>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Today's Habits</h2>
                                <button className="text-sm text-cyan-400 hover:text-cyan-300">
                                    Manage
                                </button>
                            </div>

                            <div className="space-y-3">
                                {DEFAULT_HABITS.slice(0, 2).map((habit) => (
                                    <div key={habit.id} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{habit.name}</h3>
                                            <div className="flex items-center space-x-2">
                                                <Flame className="w-4 h-4 text-orange-400" />
                                                <span className="text-sm text-orange-400">{habit.streak}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${habit.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400">{habit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 p-4">
                <div className="flex justify-around">
                    <button
                        onClick={() => setSelectedTab('home')}
                        className={`p-3 rounded-xl ${selectedTab === 'home' ? 'bg-purple-600' : 'bg-transparent'}`}
                    >
                        <Activity className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setSelectedTab('challenges')}
                        className={`p-3 rounded-xl ${selectedTab === 'challenges' ? 'bg-purple-600' : 'bg-transparent'}`}
                    >
                        <Trophy className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setSelectedTab('analytics')}
                        className={`p-3 rounded-xl ${selectedTab === 'analytics' ? 'bg-purple-600' : 'bg-transparent'}`}
                    >
                        <BarChart3 className="w-6 h-6" />
                    </button>
                    <button className="p-3 rounded-xl bg-transparent">
                        <Users className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnalyticsScreen = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Your Progress</h1>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-8 h-8 text-purple-400" />
                            <span className="text-3xl font-bold text-purple-400">1,247</span>
                        </div>
                        <h3 className="font-semibold mb-1">Total XP</h3>
                        <p className="text-sm text-gray-400">+127 this week</p>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <Timer className="w-8 h-8 text-green-400" />
                            <span className="text-3xl font-bold text-green-400">24h</span>
                        </div>
                        <h3 className="font-semibold mb-1">Workout Time</h3>
                        <p className="text-sm text-gray-400">This month</p>
                    </div>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 className="font-semibold mb-4">Weekly Activity</h3>
                    <div className="h-32 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 rounded-lg flex items-end justify-center space-x-2 p-4">
                        {[20, 45, 65, 30, 80, 55, 70].map((height, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div
                                    className="w-6 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-xs text-gray-400 mt-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 className="font-semibold mb-4">Achievement Progress</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium">First Week Champion</h4>
                                    <p className="text-sm text-gray-400">Complete 7 days in a row</p>
                                </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Habit Master</h4>
                                    <p className="text-sm text-gray-400">30-day streak (18/30)</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">18</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengesScreen = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Challenges</h1>
            </div>

            <div className="space-y-4">
                {DEFAULT_CHALLENGES.map((challenge) => (
                    <div key={challenge.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">{challenge.title}</h3>
                                <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>

                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4 text-cyan-400" />
                                        <span className="text-cyan-400">{challenge.participants}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        <span className="text-purple-400">{challenge.duration}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <span className="text-yellow-400">{challenge.reward} XP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs ${
                    challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                }`}>
                  {challenge.difficulty}
                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Progress</span>
                                <span className="text-sm text-gray-400">{challenge.progress}/{challenge.progress + challenge.daysRemaining} days</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                                    style={{ width: `${(challenge.progress / (challenge.progress + challenge.daysRemaining)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">by {challenge.creator}</span>
                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-sm font-medium hover:scale-105 transition-all">
                                {challenge.progress > 0 ? 'Continue' : 'Join Challenge'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ProtonicApp() {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [user, setUser] = useState({
        name: 'Sarah',
        level: 12,
        xp: 1247,
        streak: 7,
        weeklyGoal: 85
    });

    const [aiResponse, setAiResponse] = useState('');

    const { isListening, transcript, startListening } = useVoiceRecognition((command) => {
        const responses = {
            'Start morning workout': "Great choice! I've prepared a 20-minute energizing routine perfect for your current fitness level.",
            'Show my progress': "You're crushing it! 7-day streak and 85% towards your weekly goal. Keep up the amazing work!",
            'Check my habits': "Your morning routine is at 85% consistency. You're building incredible discipline!",
            'Show analytics': "Let me pull up your detailed progress report with insights and recommendations.",
            'Join a challenge': "I found 3 active challenges that match your interests. The 30-Day Morning Routine looks perfect for you!",
            'Book a trainer session': "Dr. Sarah Chen is available today at 3:00 PM for strength training. Should I book it?",
            'Start body scan': "Activating AI body scan. Please stand in front of your camera with arms at your sides.",
            'Play relaxing music': "Playing your personalized focus playlist. Perfect for your afternoon workout!",
            'Check my streak': "Incredible! You're on a 7-day streak. Just 23 more days to unlock the 30-day champion badge!",
            'Show recommended workouts': "Based on your progress, I recommend the HIIT Blast workout. It's perfectly calibrated for your fitness level."
        };

        const response = responses[command] || "I heard you say '" + command + "'. How can I help you with that?";
        setAiResponse(response);

        setTimeout(() => setAiResponse(''), 5000);
    });

    const handleSignup = () => {
        setCurrentScreen('home');
    };

    const handleGuest = () => {
        setCurrentScreen('home');
    };

    if (currentScreen === 'welcome') {
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

    return (
        <HomeScreen
            user={user}
            onVoiceCommand={startListening}
        />
    );
}