import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Activity,
    Award,
    Bike,
    Camera,
    ChevronRight,
    Dumbbell,
    Flame,
    Heart,
    Menu,
    MessageCircle,
    Mic,
    Moon,
    Music,
    Plus,
    Share2,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Volume2,
    Zap
} from 'lucide-react';
import { register as registerUser, login as loginUser, getCurrentUser } from '@/lib/api';

const ProtonicFitnessApp = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [user, setUser] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [workoutInProgress, setWorkoutInProgress] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);
    const [totalSets, setTotalSets] = useState(3);
    const [isRecording, setIsRecording] = useState(false);
    const [repCount, setRepCount] = useState(0);
    const [coachSpeaking, setCoachSpeaking] = useState(false);
    const [lastVoiceCommand, setLastVoiceCommand] = useState('');
    const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [selectedTier, setSelectedTier] = useState(null);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [signupError, setSignupError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isDemoMode, setIsDemoMode] = useState(false);
    const recognitionRef = useRef(null);

    const subscriptionTiers = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
                '5 workouts per month',
                'Basic voice commands',
                'Community access',
                'Progress tracking',
                'Limited workout library'
            ],
            locked: [
                'AI form correction',
                'Live trainers',
                'Unlimited workouts',
                'Advanced analytics',
                'Wearable sync',
                'Challenges & competitions'
            ],
            color: 'from-gray-500 to-gray-600',
            badge: null
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$12.99',
            period: 'month',
            features: [
                'Unlimited workouts',
                'Full voice control',
                'AI form correction',
                'Advanced analytics',
                'Wearable integration',
                'All challenges',
                'Social features',
                'Mood-based workouts',
                'Progress tracking',
                'Weekly reports'
            ],
            locked: [
                'Live trainer sessions',
                'Priority support',
                'Custom meal plans'
            ],
            color: 'from-cyan-500 to-purple-600',
            badge: 'MOST POPULAR'
        },
        {
            id: 'elite',
            name: 'Elite',
            price: '$29.99',
            period: 'month',
            features: [
                'Everything in Pro',
                'Live trainer sessions (4/month)',
                'Priority 24/7 support',
                'Custom meal plans',
                'Personal nutrition coach',
                '1-on-1 form reviews',
                'Exclusive challenges',
                'Early feature access',
                'No ads',
                'Family plan (5 users)'
            ],
            locked: [],
            color: 'from-yellow-500 to-orange-500',
            badge: 'BEST VALUE'
        }
    ];

    // Initialize continuous voice recognition
    useEffect(() => {
        if (workoutInProgress && 'webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsVoiceActive(true);
            };

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript.toLowerCase().trim();

                // Process voice commands
                if (event.results[current].isFinal) {
                    handleVoiceCommand(transcript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    recognition.start(); // Restart if no speech detected
                }
            };

            recognition.onend = () => {
                if (workoutInProgress) {
                    recognition.start(); // Keep it running during workout
                }
            };

            recognition.start();
            recognitionRef.current = recognition;

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            };
        }
    }, [workoutInProgress]);

    // Text-to-speech for coach feedback
    const speakCoachFeedback = (text) => {
        setCoachSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => setCoachSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // Handle voice commands during workout
    const handleVoiceCommand = (command) => {
        setLastVoiceCommand(command);

        if (command.includes('next set') || command.includes('next')) {
            if (currentSet < totalSets) {
                setCurrentSet(prev => prev + 1);
                setIsRecording(false);
                speakCoachFeedback(`Great work! Moving to set ${currentSet + 1}. Remember to keep your back straight and core engaged. Take a deep breath, and begin when ready.`);
            } else {
                speakCoachFeedback("Excellent! You've completed all sets. Moving to the next exercise.");
            }
        }
        else if (command.includes('start recording') || command.includes('start set') || command.includes('go')) {
            setIsRecording(true);
            setRepCount(0);
            speakCoachFeedback("Starting now. Focus on controlled movements. I'm watching your form.");
        }
        else if (command.includes('stop') || command.includes('pause')) {
            setIsRecording(false);
            speakCoachFeedback("Set paused. Take your rest time.");
        }
        else if (command.includes('how many') || command.includes('count')) {
            speakCoachFeedback(`You're at ${repCount} reps. Keep it up!`);
        }
        else if (command.includes('form check') || command.includes('check form')) {
            const formTips = [
                "Your form looks good! Keep your shoulders back and chest up.",
                "Nice! Try to go a bit deeper on the next rep.",
                "Great control! Make sure you're breathing steadily.",
                "Looking strong! Keep that core tight throughout the movement."
            ];
            speakCoachFeedback(formTips[Math.floor(Math.random() * formTips.length)]);
        }
        else if (command.includes('take a break') || command.includes('rest')) {
            setIsRecording(false);
            speakCoachFeedback("Taking a break. Use this time to hydrate and stretch.");
        }
        else if (command.includes('done') || command.includes('finished')) {
            speakCoachFeedback(`Awesome work! You completed ${repCount} reps in this set. Rest up for the next one.`);
            setIsRecording(false);
        }
    };

    // Simulate rep counting with AI form detection
    useEffect(() => {
        if (isRecording && workoutInProgress) {
            const repInterval = setInterval(() => {
                setRepCount(prev => {
                    const newCount = prev + 1;
                    // Give encouragement every 5 reps
                    if (newCount % 5 === 0 && newCount > 0) {
                        speakCoachFeedback(`${newCount} reps! You're crushing it!`);
                    }
                    return newCount;
                });
            }, 2500); // Simulate detecting a rep every 2.5 seconds

            return () => clearInterval(repInterval);
        }
    }, [isRecording, workoutInProgress]);

    // Give pre-set coaching tips
    const givePreSetCoaching = () => {
        const tips = [
            "Before you start: keep your core tight, breathe steadily, and maintain proper posture throughout.",
            "Remember: quality over quantity. Focus on controlled movements and full range of motion.",
            "Quick tip: inhale on the way down, exhale on the way up. Let's get it!",
            "Set yourself up for success: feet shoulder-width apart, chest up, shoulders back. You've got this!"
        ];
        speakCoachFeedback(tips[Math.floor(Math.random() * tips.length)]);
    };

    const moods = [
        { id: 'energetic', name: 'Energetic', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
        { id: 'stressed', name: 'Stressed', icon: '😰', color: 'from-red-500 to-pink-500' },
        { id: 'tired', name: 'Tired', icon: '😴', color: 'from-blue-500 to-purple-500' },
        { id: 'motivated', name: 'Motivated', icon: '💪', color: 'from-green-500 to-teal-500' }
    ];

    const mockUser = {
        name: 'Alex',
        level: 12,
        xp: 3450,
        nextLevelXp: 4000,
        streak: 7,
        thisWeek: 5,
        totalWorkouts: 45,
        coins: 850,
        achievements: 23,
        workoutsCompleted: 45,
        stats: {
            strength: 75,
            endurance: 60,
            flexibility: 45,
            speed: 55
        },
        bodyMetrics: {
            weight: 165,
            bodyFat: 18,
            muscleMass: 135,
            restingHR: 62
        },
        personalRecords: [
            { id: 1, name: 'Pushups', value: 45, unit: 'reps', date: '2025-01-15' },
            { id: 2, name: 'Squats', value: 50, unit: 'reps', date: '2025-01-10' },
            { id: 3, name: 'Plank', value: 180, unit: 'sec', date: '2025-01-12' }
        ],
        weeklyProgress: {
            monday: 320,
            tuesday: 450,
            wednesday: 0,
            thursday: 380,
            friday: 520,
            saturday: 290,
            sunday: 0
        },
        personalBests: {
            longestStreak: 21,
            mostCaloriesDay: 847,
            totalWorkouts: 45,
            totalMinutes: 1847
        },
        recentBadges: [
            { id: 1, name: 'Week Warrior', icon: '🔥', earned: '2 days ago' },
            { id: 2, name: '50 Workouts', icon: '💪', earned: '1 week ago' },
            { id: 3, name: 'Early Bird', icon: '🌅', earned: '2 weeks ago' }
        ],
        wearables: {
            connected: ['Apple Watch'],
            heartRate: 142,
            steps: 8247,
            activeMinutes: 67
        }
    };

    const classCategories = [
        { id: 1, name: 'Strength', count: 234, icon: Dumbbell, color: 'bg-zinc-800' },
        { id: 2, name: 'Cardio', count: 189, icon: Activity, color: 'bg-zinc-800' },
        { id: 3, name: 'Yoga', count: 156, icon: Users, color: 'bg-zinc-800' },
        { id: 4, name: 'HIIT', count: 98, icon: Zap, color: 'bg-zinc-800' },
        { id: 5, name: 'Cycling', count: 145, icon: Bike, color: 'bg-zinc-800' },
        { id: 6, name: 'Meditation', count: 67, icon: Moon, color: 'bg-zinc-800' }
    ];

    const featuredClasses = [
        {
            id: 1,
            title: '30 Min Full Body Strength',
            instructor: 'Sarah Chen',
            duration: '30 min',
            level: 'Intermediate',
            rating: 4.9,
            color: 'bg-red-600'
        },
        {
            id: 2,
            title: '20 Min HIIT Cardio',
            instructor: 'Marcus Pro',
            duration: '20 min',
            level: 'Advanced',
            rating: 4.8,
            color: 'bg-orange-500'
        }
    ];

    const challenges = [
        { id: 1, name: '30-Day Plank Challenge', participants: 1247, prize: '500 coins', progress: 12, total: 30 },
        { id: 2, name: 'Weekend Warrior', participants: 856, prize: 'Exclusive Badge', progress: 1, total: 2 },
        { id: 3, name: 'Squad Goals', participants: 423, prize: '1000 coins', progress: 3, total: 5 }
    ];

    const socialFeed = [
        { id: 1, user: 'Sarah M.', action: 'completed HIIT Blast', time: '2m ago', likes: 24 },
        { id: 2, user: 'Mike T.', action: 'hit 50-day streak! 🔥', time: '15m ago', likes: 156 },
        { id: 3, user: 'Emma L.', action: 'unlocked Warrior Badge', time: '1h ago', likes: 43 }
    ];

    const liveTrainers = [
        { id: 1, name: 'Coach Sarah', specialty: 'HIIT', available: true, rating: 4.9, price: '$25/session' },
        { id: 2, name: 'Marcus Pro', specialty: 'Strength', available: true, rating: 4.8, price: '$30/session' },
        { id: 3, name: 'Yoga Elena', specialty: 'Yoga', available: false, rating: 4.9, price: '$20/session' }
    ];

    const handleWelcomeVoiceCommand = useCallback(() => {
        setIsListening(true);
        setTranscript('');

        setTimeout(() => {
            const commands = [
                'Start a high energy workout',
                'Show me my progress this week',
                'Join the plank challenge',
                'Book a session with Coach Sarah',
                'Check my form',
                'Find workout buddies near me'
            ];
            const cmd = commands[Math.floor(Math.random() * commands.length)];
            setTranscript(cmd);

            setTimeout(() => {
                const responses = [
                    'Great! Starting your personalized HIIT workout...',
                    'You\'ve completed 5 workouts this week, burning 1,247 calories!',
                    'You\'re now registered for the 30-Day Plank Challenge!',
                    'Coach Sarah has availability at 3 PM today. Booking now...',
                    'AI form analysis activated. Position yourself in frame.',
                    'Found 12 users nearby looking for workout partners!'
                ];
                setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
                setIsListening(false);

                setTimeout(() => {
                    setTranscript('');
                    setAiResponse('');
                }, 4000);
            }, 1500);
        }, 2000);
    }, []);

    const startMoodBasedWorkout = (mood) => {
        setSelectedMood(mood);
        setWorkoutInProgress(true);
        setCurrentScreen('workout');
        setCurrentSet(1);
        setRepCount(0);
        // Give initial coaching when workout starts
        setTimeout(() => {
            speakCoachFeedback(`Welcome to your ${mood.name} workout! I'm your AI coach and I'll be monitoring your form throughout. Just say "start set" when you're ready, or "next set" to move forward. Let's warm up those muscles!`);
        }, 500);
    };

    // Helper function to create a complete user object with all required properties
    const createCompleteUser = (baseData) => {
        return {
            id: baseData.id,
            name: baseData.name || 'User',
            email: baseData.email,
            email_verified: baseData.email_verified || false,
            subscriptionTier: baseData.subscriptionTier || null,
            profile: baseData.profile || null,
            stats: baseData.stats || null,
            level: baseData.level || 1,
            xp: baseData.xp || 0,
            nextLevelXp: baseData.nextLevelXp || 1000,
            streak: baseData.streak || 0,
            thisWeek: baseData.thisWeek || 0,
            totalWorkouts: baseData.totalWorkouts || baseData.workoutsCompleted || 0,
            coins: baseData.coins || 0,
            achievements: baseData.achievements || 0,
            workoutsCompleted: baseData.workoutsCompleted || 0,
            bodyMetrics: baseData.bodyMetrics || {
                weight: 0,
                bodyFat: 0,
                muscleMass: 0,
                restingHR: 0
            },
            personalRecords: baseData.personalRecords || [],
            wearables: baseData.wearables || {
                connected: [],
                heartRate: 0,
                steps: 0,
                activeMinutes: 0
            },
            weeklyProgress: baseData.weeklyProgress || {
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            },
            personalBests: baseData.personalBests || {
                longestStreak: 0,
                mostCaloriesDay: 0,
                totalWorkouts: 0,
                totalMinutes: 0
            },
            recentBadges: baseData.recentBadges || []
        };
    };

    const handleSignup = async () => {
        setSignupError('');

        if (!signupForm.name || !signupForm.email || !signupForm.password) {
            setSignupError('Please fill in all fields');
            return;
        }

        if (signupForm.password.length < 8) {
            setSignupError('Password must be at least 8 characters');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupForm.email)) {
            setSignupError('Please enter a valid email address');
            return;
        }

        setIsSigningUp(true);

        try {
            const response = await registerUser({
                email: signupForm.email,
                password: signupForm.password,
                name: signupForm.name
            });

            const newUser = createCompleteUser({
                id: response.user.id,
                name: signupForm.name,
                email: response.user.email,
                email_verified: response.user.email_verified,
                subscriptionTier: null,
                profile: response.profile,
                stats: response.stats,
                workoutsCompleted: response.stats?.total_workouts || 0,
                streak: response.stats?.streak || 0
            });

            setUser(newUser);
            setCurrentScreen('pricing');
            setSignupForm({ name: '', email: '', password: '' });
        } catch (error) {
            console.error('Signup error:', error);
            setSignupError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSigningUp(false);
        }
    };

    const handleLogin = async () => {
        setLoginError('');

        if (!loginForm.email || !loginForm.password) {
            setLoginError('Please fill in all fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginForm.email)) {
            setLoginError('Please enter a valid email address');
            return;
        }

        setIsLoggingIn(true);

        try {
            const response = await loginUser({
                email: loginForm.email,
                password: loginForm.password
            });

            const loggedInUser = createCompleteUser({
                id: response.user.id,
                name: response.profile?.name || 'User',
                email: response.user.email,
                email_verified: response.user.email_verified,
                subscriptionTier: 'free',
                profile: response.profile,
                stats: response.stats,
                level: 1,
                xp: 0,
                nextLevelXp: 1000,
                streak: response.stats?.streak || 0,
                coins: 0,
                achievements: 0,
                workoutsCompleted: response.stats?.total_workouts || 0
            });

            setUser(loggedInUser);
            setIsDemoMode(false);
            setCurrentScreen('home');
            setLoginForm({ email: '', password: '' });
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleDemoMode = () => {
        const demoUser = createCompleteUser({
            id: 'demo',
            name: 'Alex',
            email: 'demo@protonic.fitness',
            email_verified: false,
            subscriptionTier: 'free',
            level: 12,
            xp: 3450,
            nextLevelXp: 4000,
            streak: 7,
            thisWeek: 5,
            totalWorkouts: 45,
            coins: 850,
            achievements: 23,
            workoutsCompleted: 45,
            bodyMetrics: {
                weight: 165,
                bodyFat: 18,
                muscleMass: 135,
                restingHR: 62
            },
            personalRecords: [
                { id: 1, name: 'Pushups', value: 45, unit: 'reps', date: '2025-01-15' },
                { id: 2, name: 'Squats', value: 50, unit: 'reps', date: '2025-01-10' },
                { id: 3, name: 'Plank', value: 180, unit: 'sec', date: '2025-01-12' }
            ],
            stats: {
                strength: 75,
                endurance: 60,
                flexibility: 45,
                speed: 55
            },
            weeklyProgress: {
                monday: 320,
                tuesday: 450,
                wednesday: 0,
                thursday: 380,
                friday: 520,
                saturday: 290,
                sunday: 0
            },
            personalBests: {
                longestStreak: 21,
                mostCaloriesDay: 847,
                totalWorkouts: 45,
                totalMinutes: 1847
            },
            recentBadges: [
                { id: 1, name: 'Week Warrior', icon: '🔥', earned: '2 days ago' },
                { id: 2, name: '50 Workouts', icon: '💪', earned: '1 week ago' },
                { id: 3, name: 'Early Bird', icon: '🌅', earned: '2 weeks ago' }
            ],
            wearables: {
                connected: ['Apple Watch'],
                heartRate: 142,
                steps: 8247,
                activeMinutes: 67
            }
        });
        setUser(demoUser);
        setIsDemoMode(true);
        setCurrentScreen('home');
    };

    const handleSubscriptionSelect = (tierId) => {
        setSelectedTier(tierId);
        // Update user with selected tier
        setUser({ ...user, subscriptionTier: tierId });

        if (tierId === 'free') {
            // Free tier - go straight to app
            setCurrentScreen('home');
        } else {
            // Paid tiers - go to payment
            setCurrentScreen('payment');
        }
    };

    // Pricing Screen
    if (currentScreen === 'pricing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-y-auto pb-20">
                <div className="px-6 pt-6">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black mb-2">Choose Your Plan</h1>
                        <p className="text-gray-400">Start your fitness journey today</p>
                    </div>

                    <div className="space-y-4 max-w-4xl mx-auto">
                        {subscriptionTiers.map((tier) => (
                            <div
                                key={tier.id}
                                className={`relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border-2 ${
                                    tier.badge ? 'border-cyan-500' : 'border-white/10'
                                } hover:border-cyan-400 transition-all cursor-pointer`}
                                onClick={() => handleSubscriptionSelect(tier.id)}
                            >
                                {tier.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-1 rounded-full text-xs font-bold">
                      {tier.badge}
                    </span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black">{tier.price}</span>
                                            {tier.period !== 'forever' && (
                                                <span className="text-gray-400">/{tier.period}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center text-2xl`}>
                                        {tier.id === 'free' ? '🆓' : tier.id === 'pro' ? '⚡' : '👑'}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <p className="text-sm font-bold text-cyan-400">INCLUDED:</p>
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <span className="text-green-400 mt-0.5">✓</span>
                                            <span className="text-sm text-gray-300">{feature}</span>
                                        </div>
                                    ))}

                                    {tier.locked.length > 0 && (
                                        <>
                                            <p className="text-sm font-bold text-gray-500 mt-4">NOT INCLUDED:</p>
                                            {tier.locked.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <span className="text-gray-600 mt-0.5">✗</span>
                                                    <span className="text-sm text-gray-500">{feature}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                <button
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                        tier.badge
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-xl'
                                            : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                >
                                    {tier.id === 'free' ? 'Start Free' : `Choose ${tier.name}`}
                                </button>

                                {tier.id === 'pro' && (
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        7-day free trial • Cancel anytime
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto mt-8 text-center">
                        <p className="text-sm text-gray-400 mb-4">All plans include:</p>
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                            <span>• No contracts</span>
                            <span>• Cancel anytime</span>
                            <span>• Secure payments</span>
                            <span>• 30-day money back</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Screen
    if (currentScreen === 'payment') {
        const selectedTierInfo = subscriptionTiers.find(t => t.id === selectedTier);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <button onClick={() => setCurrentScreen('pricing')} className="mb-6 text-gray-300 flex items-center gap-2">
                            ← Back to Plans
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4 shadow-2xl">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl font-black mb-2">Complete Payment</h1>
                            <p className="text-gray-400">
                                {selectedTierInfo?.name} - {selectedTierInfo?.price}/{selectedTierInfo?.period}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-300">Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-300">CVC</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Billing Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mt-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">Subtotal</span>
                                    <span className="font-bold">{selectedTierInfo?.price}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">Tax</span>
                                    <span className="font-bold">$0.00</span>
                                </div>
                                <div className="border-t border-cyan-500/30 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-lg">Total Due Today</span>
                                        <span className="font-bold text-2xl text-cyan-400">{selectedTierInfo?.price}</span>
                                    </div>
                                </div>
                                {selectedTierInfo?.id === 'pro' && (
                                    <p className="text-xs text-gray-400 mt-3 text-center">
                                        7-day free trial included • You won&#39;t be charged until trial ends
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentScreen('home')}
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all mt-6"
                            >
                                Start My {selectedTierInfo?.name} Plan
                            </button>

                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-500">
                                    🔒 Secure payment powered by Stripe
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">Cancel anytime, no questions asked</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">30-day money-back guarantee</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">Encrypted & secure payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Login Screen
    if (currentScreen === 'login') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <button onClick={() => setCurrentScreen('welcome')} className="mb-6 text-gray-300 flex items-center gap-2">
                            ← Back
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4 shadow-2xl">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl font-black mb-2">Welcome Back</h1>
                            <p className="text-gray-400">Log in to continue your fitness journey</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    placeholder="alex@example.com"
                                    value={loginForm.email}
                                    onChange={(e) => {
                                        setLoginForm({ ...loginForm, email: e.target.value });
                                        setLoginError('');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={loginForm.password}
                                    onChange={(e) => {
                                        setLoginForm({ ...loginForm, password: e.target.value });
                                        setLoginError('');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            {loginError && (
                                <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 flex items-start gap-2">
                                    <span className="text-red-400">⚠️</span>
                                    <p className="text-sm text-red-300">{loginError}</p>
                                </div>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-400">
                                    Don&#39;t have an account?{' '}
                                    <button
                                        onClick={() => setCurrentScreen('signup')}
                                        className="text-cyan-400 font-bold"
                                    >
                                        Create Account
                                    </button>
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 mb-4">Or try the app first</p>
                            <button
                                onClick={handleDemoMode}
                                className="w-full bg-white/5 border border-white/20 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Signup Screen
    if (currentScreen === 'signup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <button onClick={() => setCurrentScreen('welcome')} className="mb-6 text-gray-300 flex items-center gap-2">
                            ← Back
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4 shadow-2xl">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl font-black mb-2">Create Account</h1>
                            <p className="text-gray-400">Join 500,000+ users transforming their fitness</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Alex Johnson"
                                    value={signupForm.name}
                                    onChange={(e) => {
                                        setSignupForm({ ...signupForm, name: e.target.value });
                                        setSignupError('');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    placeholder="alex@example.com"
                                    value={signupForm.email}
                                    onChange={(e) => {
                                        setSignupForm({ ...signupForm, email: e.target.value });
                                        setSignupError('');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={signupForm.password}
                                    onChange={(e) => {
                                        setSignupForm({ ...signupForm, password: e.target.value });
                                        setSignupError('');
                                    }}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            {signupError && (
                                <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 flex items-start gap-2">
                                    <span className="text-red-400">⚠️</span>
                                    <p className="text-sm text-red-300">{signupError}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSignup}
                                disabled={isSigningUp}
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSigningUp ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-400">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setCurrentScreen('login')}
                                        className="text-cyan-400 font-bold"
                                    >
                                        Sign In
                                    </button>
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">AI Voice Coach included free</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">Join 500k+ active community</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-green-400">✓</span>
                                </div>
                                <p className="text-sm text-gray-300">14-day free trial, cancel anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Welcome Screen
    if (currentScreen === 'welcome' && !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(0,0,0,0))]"></div>

                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-8 shadow-2xl animate-pulse">
                            <Activity className="w-16 h-16" />
                        </div>
                        <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                            PROTONIC
                        </h1>
                        <div className="text-2xl font-light text-gray-400 tracking-wider mb-6">FITNESS</div>
                        <p className="text-lg text-gray-300 max-w-md mx-auto">
                            AI Voice Coach • Live Trainers • Social Challenges
                        </p>
                        <p className="text-sm text-cyan-400 mt-4">
                            Try the voice demo below or sign up to start!
                        </p>
                    </div>

                    <button
                        onClick={handleWelcomeVoiceCommand}
                        disabled={isListening}
                        className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-8 transition-all duration-300 ${
                            isListening
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110'
                                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105'
                        } shadow-2xl`}
                    >
                        <Mic className="w-12 h-12" />
                        <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-ping bg-red-400' : ''} opacity-75`}></div>
                    </button>

                    {transcript && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 max-w-md">
                            <p className="text-sm text-gray-300 italic">&#34;{transcript}&#34;</p>
                        </div>
                    )}

                    {aiResponse && (
                        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-4 mb-8 max-w-md border border-cyan-500/30">
                            <p className="text-sm text-white">{aiResponse}</p>
                        </div>
                    )}

                    <div className="space-y-4 w-full max-w-sm relative z-20">
                        <button
                            onClick={() => setCurrentScreen('signup')}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                        >
                            GET IT
                        </button>
                        <button
                            onClick={handleDemoMode}
                            className="w-full bg-white/10 backdrop-blur-lg py-4 rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                        >
                            TRY IT
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-400 relative z-20">
                        <p>Join 500,000+ users worldwide</p>
                        <button
                            onClick={() => setCurrentScreen('login')}
                            className="mt-2 text-cyan-400 font-semibold"
                        >
                            Already have an account? Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Home Dashboard
    if (currentScreen === 'home') {
        return (
            <div className="min-h-screen bg-black text-white pb-24">
                {/* Demo Mode Banner */}
                {isDemoMode && (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">
                            🎮 Demo Mode - Your progress won&#39;t be saved.{' '}
                            <button
                                onClick={() => setCurrentScreen('signup')}
                                className="underline font-black hover:text-white transition-colors"
                            >
                                Create Account
                            </button>
                            {' '}to save your workouts!
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Welcome back,</p>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                        </div>
                        <button className="p-2">
                            <Menu className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="px-4 py-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-900 rounded-xl p-4">
                            <p className="text-3xl font-bold text-white">{user.streak}</p>
                            <p className="text-xs text-gray-500">Day Streak</p>
                        </div>
                        <div className="bg-zinc-900 rounded-xl p-4">
                            <p className="text-3xl font-bold text-white">{user.thisWeek}</p>
                            <p className="text-xs text-gray-500">This Week</p>
                        </div>
                        <div className="bg-zinc-900 rounded-xl p-4">
                            <p className="text-3xl font-bold text-white">{user.totalWorkouts}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-zinc-900 rounded-xl p-4 text-left">
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mb-3">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-semibold text-white">Connect Wearable</p>
                            <p className="text-xs text-gray-500">Track live metrics</p>
                        </button>
                        <button className="bg-zinc-900 rounded-xl p-4 text-left">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-semibold text-white">Import History</p>
                            <p className="text-xs text-gray-500">From other apps</p>
                        </button>
                    </div>
                </div>

                {/* Body Metrics */}
                <div className="px-4 py-4">
                    <h2 className="text-lg font-bold mb-3">Body Metrics</h2>
                    <div className="bg-zinc-900 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Weight</p>
                                <p className="text-2xl font-bold">{user.bodyMetrics.weight} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Body Fat</p>
                                <p className="text-2xl font-bold text-red-500">{user.bodyMetrics.bodyFat}<span className="text-sm font-normal">%</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Muscle Mass</p>
                                <p className="text-2xl font-bold">{user.bodyMetrics.muscleMass} <span className="text-sm font-normal text-gray-400">lbs</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Resting HR</p>
                                <p className="text-2xl font-bold text-red-500">{user.bodyMetrics.restingHR} <span className="text-sm font-normal text-gray-400">bpm</span></p>
                            </div>
                        </div>
                        <button className="w-full bg-zinc-800 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-zinc-700 transition-colors">
                            Update Metrics
                        </button>
                    </div>
                </div>

                {/* Personal Records */}
                <div className="px-4 py-2">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold">Personal Records</h2>
                        <button className="text-red-500 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-2">
                        {user.personalRecords.map(record => (
                            <div key={record.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{record.name}</p>
                                    <p className="text-xs text-gray-500">{record.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-red-500">{record.value}</p>
                                    <p className="text-xs text-gray-500">{record.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connect Music */}
                <div className="px-4 py-4">
                    <h2 className="text-lg font-bold mb-3">Connect Music</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-zinc-900 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                            <Music className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Spotify</span>
                        </button>
                        <button className="bg-zinc-900 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                            <Music className="w-5 h-5 text-pink-500" />
                            <span className="font-medium">Apple Music</span>
                        </button>
                    </div>
                </div>

                {/* Browse Classes */}
                <div className="px-4 py-2">
                    <h2 className="text-lg font-bold mb-3">Browse Classes</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {classCategories.map(category => {
                            const IconComponent = category.icon;
                            return (
                                <button key={category.id} className="bg-zinc-900 rounded-xl p-4 text-center hover:bg-zinc-800 transition-colors">
                                    <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                    <p className="font-medium text-sm">{category.name}</p>
                                    <p className="text-xs text-gray-500">{category.count}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Featured Classes */}
                <div className="px-4 py-4">
                    <h2 className="text-lg font-bold mb-3">Featured Classes</h2>
                    <div className="space-y-3">
                        {featuredClasses.map(classItem => (
                            <button key={classItem.id} className="w-full bg-zinc-900 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-800 transition-colors">
                                <div className={`w-12 h-12 ${classItem.color} rounded-xl flex items-center justify-center`}>
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-white">{classItem.title}</p>
                                    <p className="text-sm text-gray-500">{classItem.instructor}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">{classItem.duration}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-400">{classItem.level}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-yellow-500">★ {classItem.rating}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-3">
                    <div className="flex justify-around">
                        <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center">
                            <Activity className="w-6 h-6 mb-1 text-red-500" />
                            <span className="text-xs text-red-500">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen('challenges')} className="flex flex-col items-center">
                            <Trophy className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Challenges</span>
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className="flex flex-col items-center">
                            <Users className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Social</span>
                        </button>
                        <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center">
                            <Target className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Challenges Screen
    if (currentScreen === 'challenges') {
        return (
            <div className="min-h-screen bg-black text-white pb-24">
                <div className="px-4 pt-4 pb-4">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-400 text-sm">← Back</button>
                    <h1 className="text-2xl font-bold mb-1">Challenges</h1>
                    <p className="text-gray-500 text-sm">Compete, win rewards, level up!</p>
                </div>

                <div className="px-4 space-y-3">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-zinc-900 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{challenge.name}</h3>
                                    <div className="text-xs text-gray-500">{challenge.participants.toLocaleString()} participants</div>
                                </div>
                                <div className="bg-zinc-800 px-3 py-1 rounded-full">
                                    <span className="text-red-500 font-bold text-sm">{challenge.prize}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="font-bold">{challenge.progress} / {challenge.total} days</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button className="w-full bg-zinc-800 py-3 rounded-xl font-medium text-white hover:bg-zinc-700 transition-colors">
                                Continue Challenge
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-3">
                    <div className="flex justify-around">
                        <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center">
                            <Activity className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen('challenges')} className="flex flex-col items-center">
                            <Trophy className="w-6 h-6 mb-1 text-red-500" />
                            <span className="text-xs text-red-500">Challenges</span>
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className="flex flex-col items-center">
                            <Users className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Social</span>
                        </button>
                        <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center">
                            <Target className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Social Screen
    if (currentScreen === 'social') {
        return (
            <div className="min-h-screen bg-black text-white pb-24">
                <div className="px-4 pt-4 pb-4">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-400 text-sm">← Back</button>
                    <h1 className="text-2xl font-bold mb-1">Community</h1>
                    <p className="text-gray-500 text-sm">Connect, compete, celebrate!</p>
                </div>

                <div className="px-4">
                    <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <Camera className="w-8 h-8 text-red-500" />
                            <div className="flex-1">
                                <p className="font-semibold">Share your workout</p>
                                <p className="text-sm text-gray-500">Post progress, inspire others!</p>
                            </div>
                            <button className="bg-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
                                Post
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {socialFeed.map(post => (
                            <div key={post.id} className="bg-zinc-900 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{post.user}</div>
                                        <div className="text-xs text-gray-500">{post.time}</div>
                                    </div>
                                    <button className="text-gray-500">•••</button>
                                </div>
                                <p className="mb-4 text-gray-300">{post.action}</p>
                                <div className="flex gap-6 text-gray-500">
                                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                        <Heart className="w-5 h-5" />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Comment</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-3">
                    <div className="flex justify-around">
                        <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center">
                            <Activity className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen('challenges')} className="flex flex-col items-center">
                            <Trophy className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Challenges</span>
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className="flex flex-col items-center">
                            <Users className="w-6 h-6 mb-1 text-red-500" />
                            <span className="text-xs text-red-500">Social</span>
                        </button>
                        <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center">
                            <Target className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Profile/Stats Screen
    if (currentScreen === 'profile') {
        return (
            <div className="min-h-screen bg-black text-white pb-24">
                <div className="px-4 pt-4 pb-4">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-400 text-sm">← Back</button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center text-2xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{user.name}</h1>
                            <p className="text-gray-500 text-sm">Level {user.level}</p>
                            <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-400">{user.streak} day streak</span>
                                <span className="text-xs text-gray-400">{user.coins} coins</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 space-y-4">
                    <div>
                        <h2 className="text-lg font-bold mb-3">Character Stats</h2>
                        <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
                            {Object.entries(user.stats).map(([stat, value]) => (
                                <div key={stat}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-400">{stat}</span>
                                        <span className="font-bold">{value}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-3">Recent Achievements</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bg-zinc-900 rounded-xl p-4 text-center">
                                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                                    <p className="text-xs text-gray-500">Badge {i}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-3">Weekly Summary</h2>
                        <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Workouts Completed</span>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Calories Burned</span>
                                <span className="font-bold">1,247</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Active Minutes</span>
                                <span className="font-bold">142 min</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">XP Earned</span>
                                <span className="font-bold text-red-500">+350</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-red-500 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors">
                        View Full Analytics
                    </button>

                    <button className="w-full bg-zinc-900 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                        Settings
                    </button>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-3">
                    <div className="flex justify-around">
                        <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center">
                            <Activity className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen('challenges')} className="flex flex-col items-center">
                            <Trophy className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Challenges</span>
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className="flex flex-col items-center">
                            <Users className="w-6 h-6 mb-1 text-gray-500" />
                            <span className="text-xs text-gray-500">Social</span>
                        </button>
                        <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center">
                            <Target className="w-6 h-6 mb-1 text-red-500" />
                            <span className="text-xs text-red-500">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Workout Screen
    if (currentScreen === 'workout') {
        return (
            <div className="min-h-screen bg-black text-white">
                <div className="px-4 pt-4 pb-4">
                    <button
                        onClick={() => {
                            setCurrentScreen('home');
                            setWorkoutInProgress(false);
                            if (recognitionRef.current) {
                                recognitionRef.current.stop();
                            }
                            window.speechSynthesis.cancel();
                        }}
                        className="mb-4 text-gray-400 text-sm"
                    >
                        ← Exit Workout
                    </button>
                    <h1 className="text-2xl font-bold mb-1">
                        {selectedMood ? `${selectedMood.name} Workout` : 'Active Workout'}
                    </h1>
                    <div className="flex items-center gap-2">
                        {isVoiceActive ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-green-500 text-sm">Voice Control Active</p>
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm">Activating voice recognition...</p>
                        )}
                    </div>
                </div>

                <div className="px-4 space-y-4">
                    {/* Live Camera Feed with Form Analysis */}
                    <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-zinc-700 animate-pulse" />
                        </div>
                        <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            {isRecording ? 'RECORDING' : 'LIVE'}
                        </div>
                        <div className="absolute top-4 right-4 bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium">
                            AI Form Check: ON
                        </div>
                        {coachSpeaking && (
                            <div className="absolute top-14 right-4 bg-red-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                                Coach Speaking
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 p-3 rounded-xl">
                            <p className="text-sm text-green-500 font-medium">
                                {isRecording
                                    ? "Recording your set! Keep that form perfect!"
                                    : "Ready to record. Say 'start set' to begin!"}
                            </p>
                        </div>
                    </div>

                    {/* Voice Command Indicator */}
                    {lastVoiceCommand && (
                        <div className="bg-zinc-900 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <Mic className="w-5 h-5 text-red-500" />
                                <p className="text-sm text-gray-400">You said: <span className="text-white font-bold">&#34;{lastVoiceCommand}&#34;</span></p>
                            </div>
                        </div>
                    )}

                    {/* Current Exercise Info */}
                    <div className="bg-zinc-900 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Push-ups</h3>
                                <p className="text-sm text-gray-500">Chest, Triceps, Shoulders</p>
                            </div>
                            <button
                                onClick={givePreSetCoaching}
                                className="bg-zinc-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Coaching Tips
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center bg-zinc-800 rounded-xl p-3">
                                <p className="text-2xl font-bold text-red-500">{repCount}</p>
                                <p className="text-xs text-gray-500">Reps</p>
                            </div>
                            <div className="text-center bg-zinc-800 rounded-xl p-3">
                                <p className="text-2xl font-bold">{currentSet}/{totalSets}</p>
                                <p className="text-xs text-gray-500">Set</p>
                            </div>
                            <div className="text-center bg-zinc-800 rounded-xl p-3">
                                <p className="text-2xl font-bold text-green-500">
                                    {isRecording ? '●' : '○'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {isRecording ? 'Recording' : 'Ready'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setIsRecording(true);
                                    setRepCount(0);
                                    givePreSetCoaching();
                                }}
                                disabled={isRecording}
                                className={`w-full py-4 rounded-xl font-bold text-lg ${
                                    isRecording
                                        ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 transition-colors'
                                }`}
                            >
                                {isRecording ? 'Recording Set...' : 'Start Set'}
                            </button>

                            <button
                                onClick={() => {
                                    if (currentSet < totalSets) {
                                        setCurrentSet(prev => prev + 1);
                                        setIsRecording(false);
                                        setRepCount(0);
                                        speakCoachFeedback(`Moving to set ${currentSet + 1}. Take a moment to breathe and reset your form.`);
                                    }
                                }}
                                className="w-full bg-red-500 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors"
                            >
                                Next Set
                            </button>
                        </div>
                    </div>

                    {/* Voice Commands Help */}
                    <div className="bg-zinc-900 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Mic className="w-5 h-5 text-red-500" />
                            <p className="font-bold">Voice Commands</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-zinc-800 rounded-lg p-2">
                                <p className="text-red-500 font-bold">&#34;Start set&#34;</p>
                                <p className="text-gray-500 text-xs">Begin recording</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-2">
                                <p className="text-white font-bold">&#34;Next set&#34;</p>
                                <p className="text-gray-500 text-xs">Move forward</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-2">
                                <p className="text-green-500 font-bold">&#34;Form check&#34;</p>
                                <p className="text-gray-500 text-xs">Get coaching</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-2">
                                <p className="text-yellow-500 font-bold">&#34;How many&#34;</p>
                                <p className="text-gray-500 text-xs">Rep count</p>
                            </div>
                        </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-900 rounded-xl p-4 text-center">
                            <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                            <p className="text-2xl font-bold">142</p>
                            <p className="text-xs text-gray-500">BPM</p>
                        </div>
                        <div className="bg-zinc-900 rounded-xl p-4 text-center">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                            <p className="text-2xl font-bold">187</p>
                            <p className="text-xs text-gray-500">Calories</p>
                        </div>
                        <div className="bg-zinc-900 rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                            <p className="text-2xl font-bold">+{repCount * 5}</p>
                            <p className="text-xs text-gray-500">XP</p>
                        </div>
                    </div>

                    <div className="pb-8"></div>
                </div>
            </div>
        );
    }

    return null;
};

export default ProtonicFitnessApp