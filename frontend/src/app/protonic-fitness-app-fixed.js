import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Activity,
    Award,
    Camera,
    Heart,
    MessageCircle,
    Mic,
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
            coins: baseData.coins || 0,
            achievements: baseData.achievements || 0,
            workoutsCompleted: baseData.workoutsCompleted || 0,
            // Initialize wearables with defaults
            wearables: baseData.wearables || {
                connected: [],
                heartRate: 0,
                steps: 0,
                activeMinutes: 0
            },
            // Initialize weeklyProgress with zeros
            weeklyProgress: baseData.weeklyProgress || {
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            },
            // Initialize personalBests with defaults
            personalBests: baseData.personalBests || {
                longestStreak: 0,
                mostCaloriesDay: 0,
                totalWorkouts: 0,
                totalMinutes: 0
            },
            // Initialize recentBadges as empty array
            recentBadges: baseData.recentBadges || []
        };
    };

    const handleSignup = async () => {
        // Clear any previous errors
        setSignupError('');

        // Validate form fields
        if (!signupForm.name || !signupForm.email || !signupForm.password) {
            setSignupError('Please fill in all fields');
            return;
        }

        // Validate password length
        if (signupForm.password.length < 8) {
            setSignupError('Password must be at least 8 characters');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupForm.email)) {
            setSignupError('Please enter a valid email address');
            return;
        }

        setIsSigningUp(true);

        try {
            // Call backend registration API
            const response = await registerUser({
                email: signupForm.email,
                password: signupForm.password,
                name: signupForm.name
            });

            // Create user object with backend data using helper function
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

            // Clear form
            setSignupForm({ name: '', email: '', password: '' });
        } catch (error) {
            console.error('Signup error:', error);
            setSignupError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSigningUp(false);
        }
    };

    const handleLogin = async () => {
        // Clear any previous errors
        setLoginError('');

        // Validate form fields
        if (!loginForm.email || !loginForm.password) {
            setLoginError('Please fill in all fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginForm.email)) {
            setLoginError('Please enter a valid email address');
            return;
        }

        setIsLoggingIn(true);

        try {
            // Call backend login API
            const response = await loginUser({
                email: loginForm.email,
                password: loginForm.password
            });

            // Create user object with backend data using helper function
            const loggedInUser = createCompleteUser({
                id: response.user.id,
                name: response.profile?.name || 'User',
                email: response.user.email,
                email_verified: response.user.email_verified,
                subscriptionTier: 'free', // Default, would come from backend in production
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

            // Clear form
            setLoginForm({ email: '', password: '' });
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleDemoMode = () => {
        // Create a demo/guest user using helper function
        const demoUser = createCompleteUser({
            id: 'demo',
            name: 'Demo User',
            email: 'demo@protonic.fitness',
            email_verified: false,
            subscriptionTier: 'free',
            level: 5,
            xp: 1250,
            nextLevelXp: 2000,
            streak: 3,
            coins: 250,
            achievements: 5,
            workoutsCompleted: 12,
            stats: {
                strength: 35,
                endurance: 40,
                flexibility: 25,
                speed: 30
            },
            weeklyProgress: {
                monday: 150,
                tuesday: 200,
                wednesday: 0,
                thursday: 180,
                friday: 0,
                saturday: 0,
                sunday: 0
            },
            personalBests: {
                longestStreak: 7,
                mostCaloriesDay: 350,
                totalWorkouts: 12,
                totalMinutes: 480
            },
            recentBadges: [
                { id: 1, name: 'First Week', icon: '🎯', earned: '3 days ago' },
                { id: 2, name: 'Early Adopter', icon: '⭐', earned: '5 days ago' }
            ],
            wearables: {
                connected: ['Apple Watch'],
                heartRate: 72,
                steps: 5420,
                activeMinutes: 45
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
                                <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
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
                        <button
                            onClick={() => setCurrentScreen('login')}
                            className="w-full bg-transparent py-3 rounded-full font-semibold text-cyan-400 hover:text-cyan-300 transition-all"
                        >
                            Already have an account? Sign In
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-400 relative z-20">
                        <p>Join 500,000+ users worldwide</p>
                    </div>
                </div>
            </div>
        );
    }

    // Home Dashboard
    if (currentScreen === 'home') {
        return (
            <div className="min-h-screen bg-slate-900 text-white">
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
                <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-6 rounded-b-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Hey, {user.name}! 👋</h2>
                            <p className="text-sm text-gray-300">Level {user.level} Warrior</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-300">Streak</p>
                                <p className="text-xl font-bold">🔥 {user.streak}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-300">Coins</p>
                                <p className="text-xl font-bold">💰 {user.coins}</p>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span>XP Progress</span>
                            <span>{user.xp} / {user.nextLevelXp}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all"
                                style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Voice Control */}
                <div className="p-6">
                    <button
                        onClick={handleWelcomeVoiceCommand}
                        disabled={isListening}
                        className={`w-full ${
                            isListening
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : 'bg-gradient-to-r from-cyan-500 to-purple-600'
                        } py-6 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all`}
                    >
                        <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
                        {isListening ? 'Listening...' : 'Tap to Speak'}
                    </button>

                    {transcript && (
                        <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-sm text-gray-300 italic">&#34;{transcript}&#34;</p>
                        </div>
                    )}
                </div>

                {/* Mood-Based Workouts */}
                <div className="px-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">How are you feeling?</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {moods.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => startMoodBasedWorkout(mood)}
                                className={`bg-gradient-to-r ${mood.color} p-4 rounded-xl text-center hover:scale-105 transition-all`}
                            >
                                <div className="text-3xl mb-2">{mood.icon}</div>
                                <div className="font-bold">{mood.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="px-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Your Stats</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                            <p className="text-2xl font-bold">{user.achievements}</p>
                            <p className="text-xs text-gray-400">Badges</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <Target className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                            <p className="text-2xl font-bold">{user.workoutsCompleted}</p>
                            <p className="text-xs text-gray-400">Workouts</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <Heart className="w-6 h-6 mx-auto mb-2 text-red-400" />
                            <p className="text-2xl font-bold">{user.wearables.heartRate}</p>
                            <p className="text-xs text-gray-400">Avg BPM</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                            <p className="text-2xl font-bold">{user.wearables.steps}</p>
                            <p className="text-xs text-gray-400">Steps</p>
                        </div>
                    </div>
                </div>

                {/* Weekly Progress Chart */}
                <div className="px-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Weekly Activity</h3>
                        <button className="text-cyan-400 text-sm">View All</button>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-end justify-between h-32 gap-2">
                            {Object.entries(user.weeklyProgress).map(([day, calories]) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                                         style={{ height: `${(calories / 600) * 100}%`, minHeight: calories > 0 ? '8px' : '2px' }}>
                                    </div>
                                    <span className="text-xs text-gray-400">{day.slice(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-400">Total calories this week</p>
                            <p className="text-2xl font-bold text-cyan-400">
                                {Object.values(user.weeklyProgress).reduce((a, b) => a + b, 0).toLocaleString()} cal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personal Bests */}
                <div className="px-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Personal Bests 🏆</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                            <p className="text-sm text-gray-300 mb-1">Longest Streak</p>
                            <p className="text-3xl font-bold">{user.personalBests.longestStreak} days</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-4 border border-red-500/30">
                            <p className="text-sm text-gray-300 mb-1">Most Calories</p>
                            <p className="text-3xl font-bold">{user.personalBests.mostCaloriesDay}</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                            <p className="text-sm text-gray-300 mb-1">Total Minutes</p>
                            <p className="text-3xl font-bold">{user.personalBests.totalMinutes.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                            <p className="text-sm text-gray-300 mb-1">Workouts</p>
                            <p className="text-3xl font-bold">{user.personalBests.totalWorkouts}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Badges */}
                <div className="px-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Recent Achievements</h3>
                        <button className="text-cyan-400 text-sm">View All</button>
                    </div>
                    <div className="space-y-3">
                        {user.recentBadges.map(badge => (
                            <div key={badge.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-3xl">
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">{badge.name}</p>
                                    <p className="text-sm text-gray-400">Earned {badge.earned}</p>
                                </div>
                                <button className="bg-white/10 p-2 rounded-lg">
                                    <Share2 className="w-5 h-5 text-cyan-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wearable Integration */}
                <div className="px-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Connected Devices</h3>
                    <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-4 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="font-bold">{user.wearables.connected[0]}</p>
                                    <p className="text-sm text-green-400">● Connected</p>
                                </div>
                            </div>
                            <button className="text-cyan-400 text-sm">Settings</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                            <div>
                                <p className="text-xs text-gray-400">Heart Rate</p>
                                <p className="text-lg font-bold">{user.wearables.heartRate} BPM</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Steps Today</p>
                                <p className="text-lg font-bold">{user.wearables.steps.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Active Min</p>
                                <p className="text-lg font-bold">{user.wearables.activeMinutes}</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-3 bg-white/5 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all">
                        + Connect Another Device
                    </button>
                </div>

                {/* Live Trainers */}
                <div className="px-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Live Trainers</h3>
                        <button className="text-cyan-400 text-sm">View All</button>
                    </div>
                    <div className="space-y-3">
                        {liveTrainers.slice(0, 2).map(trainer => (
                            <div key={trainer.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
                                        {trainer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {trainer.name}
                                            {trainer.available && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
                                        </div>
                                        <div className="text-sm text-gray-400">{trainer.specialty} • ⭐ {trainer.rating}</div>
                                    </div>
                                </div>
                                <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 rounded-full text-sm font-bold">
                                    {trainer.price}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Challenges */}
                <div className="px-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Active Challenges</h3>
                        <button className="text-cyan-400 text-sm" onClick={() => setCurrentScreen('challenges')}>View All</button>
                    </div>
                    <div className="space-y-3">
                        {challenges.slice(0, 2).map(challenge => (
                            <div key={challenge.id} className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-4 border border-purple-500/30">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold">{challenge.name}</div>
                                        <div className="text-sm text-gray-400">{challenge.participants} participants</div>
                                    </div>
                                    <div className="text-yellow-400 font-bold text-sm">{challenge.prize}</div>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full"
                                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400">{challenge.progress} / {challenge.total} days</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Feed */}
                <div className="px-6 mb-24">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Community Feed</h3>
                        <button className="text-cyan-400 text-sm" onClick={() => setCurrentScreen('social')}>See More</button>
                    </div>
                    <div className="space-y-3">
                        {socialFeed.map(post => (
                            <div key={post.id} className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="font-bold">{post.user}</div>
                                        <div className="text-sm text-gray-400">{post.action}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">{post.time}</div>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-400">
                                    <button className="flex items-center gap-1 hover:text-red-400">
                                        <Heart className="w-4 h-4" /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-cyan-400">
                                        <MessageCircle className="w-4 h-4" /> Comment
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-purple-400">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 px-6 py-4">
                    <div className="flex justify-around">
                        <button onClick={() => setCurrentScreen('home')} className="flex flex-col items-center text-cyan-400">
                            <Activity className="w-6 h-6 mb-1" />
                            <span className="text-xs">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen('challenges')} className="flex flex-col items-center text-gray-400">
                            <Trophy className="w-6 h-6 mb-1" />
                            <span className="text-xs">Challenges</span>
                        </button>
                        <button onClick={handleWelcomeVoiceCommand} className="flex flex-col items-center -mt-8">
                            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl">
                                <Mic className="w-8 h-8" />
                            </div>
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className="flex flex-col items-center text-gray-400">
                            <Users className="w-6 h-6 mb-1" />
                            <span className="text-xs">Social</span>
                        </button>
                        <button onClick={() => setCurrentScreen('profile')} className="flex flex-col items-center text-gray-400">
                            <Target className="w-6 h-6 mb-1" />
                            <span className="text-xs">Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Challenges Screen
    if (currentScreen === 'challenges') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-24">
                <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-6 rounded-b-3xl mb-6">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-300">← Back</button>
                    <h1 className="text-3xl font-bold mb-2">Challenges</h1>
                    <p className="text-gray-300">Compete, win rewards, level up!</p>
                </div>

                <div className="px-6 space-y-4">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-5 border border-purple-500/30">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{challenge.name}</h3>
                                    <div className="text-sm text-gray-400">{challenge.participants.toLocaleString()} participants</div>
                                </div>
                                <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
                                    <span className="text-yellow-400 font-bold text-sm">{challenge.prize}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress</span>
                                    <span className="font-bold">{challenge.progress} / {challenge.total} days</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-3 rounded-xl font-bold">
                                Continue Challenge
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Social Screen
    if (currentScreen === 'social') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-24">
                <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-6 rounded-b-3xl mb-6">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-300">← Back</button>
                    <h1 className="text-3xl font-bold mb-2">Community</h1>
                    <p className="text-gray-300">Connect, compete, celebrate!</p>
                </div>

                <div className="px-6">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-cyan-500/30">
                        <div className="flex items-center gap-3">
                            <Camera className="w-8 h-8 text-cyan-400" />
                            <div className="flex-1">
                                <p className="font-bold">Share your workout</p>
                                <p className="text-sm text-gray-400">Post progress, inspire others!</p>
                            </div>
                            <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 rounded-full text-sm font-bold">
                                Post
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {socialFeed.map(post => (
                            <div key={post.id} className="bg-white/5 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="font-bold">{post.user}</div>
                                        <div className="text-sm text-gray-400">{post.time}</div>
                                    </div>
                                    <button className="text-gray-400">•••</button>
                                </div>
                                <p className="mb-4">{post.action}</p>
                                <div className="flex gap-6 text-gray-400">
                                    <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                                        <Heart className="w-5 h-5" />
                                        <span>{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Comment</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Profile/Stats Screen
    if (currentScreen === 'profile') {
        return (
            <div className="min-h-screen bg-slate-900 text-white pb-24">
                <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-6 rounded-b-3xl mb-6">
                    <button onClick={() => setCurrentScreen('home')} className="mb-4 text-gray-300">← Back</button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-gray-300">Level {user.level} Warrior</p>
                            <div className="flex gap-4 mt-2">
                                <span className="text-sm">🔥 {user.streak} day streak</span>
                                <span className="text-sm">💰 {user.coins} coins</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Character Stats</h2>
                        <div className="space-y-3">
                            {Object.entries(user.stats).map(([stat, value]) => (
                                <div key={stat}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{stat}</span>
                                        <span className="font-bold">{value}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full"
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                                    <p className="text-xs text-gray-400">Badge {i}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Weekly Summary</h2>
                        <div className="bg-white/5 rounded-xl p-5 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Workouts Completed</span>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Calories Burned</span>
                                <span className="font-bold">1,247</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Active Minutes</span>
                                <span className="font-bold">142 min</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">XP Earned</span>
                                <span className="font-bold">+350</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-xl font-bold text-lg">
                        View Full Analytics
                    </button>

                    <button className="w-full bg-white/5 py-4 rounded-xl font-bold border border-white/10">
                        Settings
                    </button>
                </div>
            </div>
        );
    }

    // Workout Screen
    if (currentScreen === 'workout') {
        return (
            <div className="min-h-screen bg-slate-900 text-white">
                <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-6 rounded-b-3xl mb-6">
                    <button
                        onClick={() => {
                            setCurrentScreen('home');
                            setWorkoutInProgress(false);
                            if (recognitionRef.current) {
                                recognitionRef.current.stop();
                            }
                            window.speechSynthesis.cancel();
                        }}
                        className="mb-4 text-gray-300"
                    >
                        ← Exit Workout
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                        {selectedMood ? `${selectedMood.name} Workout` : 'Active Workout'}
                    </h1>
                    <div className="flex items-center gap-2">
                        {isVoiceActive ? (
                            <>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-green-400 text-sm font-bold">Voice Control Active - Just speak naturally!</p>
                            </>
                        ) : (
                            <p className="text-gray-300">Activating voice recognition...</p>
                        )}
                    </div>
                </div>

                <div className="px-6 space-y-6">
                    {/* Live Camera Feed with Form Analysis */}
                    <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-2xl overflow-hidden border-2 border-cyan-500/50">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-cyan-400 animate-pulse" />
                        </div>
                        <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            {isRecording ? 'RECORDING' : 'LIVE'}
                        </div>
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                            AI Form Check: ON
                        </div>
                        {coachSpeaking && (
                            <div className="absolute top-14 right-4 bg-purple-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                <Volume2 className="w-4 h-4 animate-pulse" />
                                Coach Speaking
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl">
                            <p className="text-sm text-green-400 font-bold">
                                {isRecording
                                    ? "✓ Recording your set! Keep that form perfect!"
                                    : "Ready to record. Say 'start set' to begin!"}
                            </p>
                        </div>
                    </div>

                    {/* Voice Command Indicator */}
                    {lastVoiceCommand && (
                        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-4 border border-cyan-500/50">
                            <div className="flex items-center gap-2">
                                <Mic className="w-5 h-5 text-cyan-400" />
                                <p className="text-sm text-gray-300">You said: <span className="text-white font-bold">&#34;{lastVoiceCommand}&#34;</span></p>
                            </div>
                        </div>
                    )}

                    {/* Current Exercise Info */}
                    <div className="bg-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Push-ups</h3>
                                <p className="text-sm text-gray-400">Chest, Triceps, Shoulders</p>
                            </div>
                            <button
                                onClick={givePreSetCoaching}
                                className="bg-purple-500/20 px-4 py-2 rounded-full text-sm font-bold border border-purple-500/50 hover:bg-purple-500/30"
                            >
                                Coaching Tips
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/30">
                                <p className="text-3xl font-bold text-cyan-400">{repCount}</p>
                                <p className="text-sm text-gray-400">Reps</p>
                            </div>
                            <div className="text-center bg-purple-500/10 rounded-xl p-3 border border-purple-500/30">
                                <p className="text-3xl font-bold text-purple-400">{currentSet}/{totalSets}</p>
                                <p className="text-sm text-gray-400">Set</p>
                            </div>
                            <div className="text-center bg-green-500/10 rounded-xl p-3 border border-green-500/30">
                                <p className="text-3xl font-bold text-green-400">
                                    {isRecording ? '●' : '○'}
                                </p>
                                <p className="text-sm text-gray-400">
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
                                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
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
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-xl font-bold text-lg"
                            >
                                Next Set
                            </button>
                        </div>
                    </div>

                    {/* Voice Commands Help */}
                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-5 border border-cyan-500/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Mic className="w-6 h-6 text-cyan-400" />
                            <p className="font-bold text-lg">Voice Commands</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-cyan-400 font-bold">&#34;Start set&#34;</p>
                                <p className="text-gray-400 text-xs">Begin recording</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-purple-400 font-bold">&#34;Next set&#34;</p>
                                <p className="text-gray-400 text-xs">Move forward</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-green-400 font-bold">&#34;Form check&#34;</p>
                                <p className="text-gray-400 text-xs">Get coaching</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-yellow-400 font-bold">&#34;How many&#34;</p>
                                <p className="text-gray-400 text-xs">Rep count</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-red-400 font-bold">&#34;Stop&#34;</p>
                                <p className="text-gray-400 text-xs">Pause set</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-orange-400 font-bold">&#34;Take a break&#34;</p>
                                <p className="text-gray-400 text-xs">Rest time</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                            💡 Just speak naturally - the AI coach is always listening
                        </p>
                    </div>

                    {/* Live Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Heart className="w-6 h-6 mx-auto mb-2 text-red-400" />
                            <p className="text-2xl font-bold">142</p>
                            <p className="text-xs text-gray-400">BPM</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                            <p className="text-2xl font-bold">187</p>
                            <p className="text-xs text-gray-400">Calories</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
                            <p className="text-2xl font-bold">+{repCount * 5}</p>
                            <p className="text-xs text-gray-400">XP</p>
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