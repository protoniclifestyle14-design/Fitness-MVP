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
    StopCircle,
    Plus,
    Minus,
    Check,
    AlertCircle,
    Calendar,
    Clock,
    TrendingUp,
    Users,
    Settings,
    LogOut
} from 'lucide-react';

// Initialize with localStorage data or defaults
const loadFromStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

// Real Voice Recognition Hook
function useVoiceRecognition(onCommand) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError('');
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);

            if (event.results[current].isFinal) {
                onCommand(transcriptText);
            }
        };

        recognition.onerror = (event) => {
            setError(`Error: ${event.error}`);
            setIsListening(false);

            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please enable microphone permissions.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onCommand]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                setError('Error starting speech recognition');
                console.error(error);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return { isListening, transcript, error, startListening, stopListening };
}

// Timer Hook for Workouts
function useTimer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
        }
    }, [isRunning]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setSeconds(0);
        setIsRunning(false);
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return { seconds, isRunning, start, pause, reset, formattedTime: formatTime(seconds) };
}

// Camera Hook for Body Scan
function useCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            streamRef.current = stream;
            setIsActive(true);
            setHasPermission(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasPermission(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
        setIsActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);
            return imageData;
        }
        return null;
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return {
        videoRef,
        isActive,
        hasPermission,
        capturedImage,
        startCamera,
        stopCamera,
        capturePhoto
    };
}

const WelcomeScreen = ({ isListening, transcript, startListening, error, aiResponse, onSignup, onGuest }) => {
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

                {error && (
                    <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-4 border border-red-500/20 mb-6 max-w-lg mx-auto">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {transcript && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-lg mx-auto">
                        <p className="text-sm text-gray-400 mb-2">You said:</p>
                        <p className="text-xl font-semibold text-center">&quot;{transcript}&quot;</p>
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

const WorkoutSession = ({ workout, onComplete, onCancel }) => {
    const timer = useTimer();
    const [reps, setReps] = useState(0);
    const [sets, setSets] = useState(1);
    const [totalCalories, setTotalCalories] = useState(0);

    useEffect(() => {
        if (timer.isRunning) {
            // Calculate calories based on time (simplified calculation)
            const caloriesPerSecond = workout.calories / (workout.duration * 60);
            setTotalCalories(Math.round(timer.seconds * caloriesPerSecond));
        }
    }, [timer.seconds, timer.isRunning, workout]);

    const handleComplete = () => {
        const workoutData = {
            workoutId: workout.id,
            name: workout.name,
            duration: timer.seconds,
            calories: totalCalories,
            sets,
            reps,
            completedAt: new Date().toISOString()
        };

        // Save workout to history
        const history = loadFromStorage('workoutHistory', []);
        history.push(workoutData);
        saveToStorage('workoutHistory', history);

        // Update user stats
        const stats = loadFromStorage('userStats', {
            totalWorkouts: 0,
            totalMinutes: 0,
            totalCalories: 0
        });

        stats.totalWorkouts += 1;
        stats.totalMinutes += Math.round(timer.seconds / 60);
        stats.totalCalories += totalCalories;
        saveToStorage('userStats', stats);

        onComplete(workoutData);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={onCancel} className="text-red-400 font-medium">
                    Cancel
                </button>
                <h2 className="text-2xl font-bold">{workout.name}</h2>
                <button onClick={handleComplete} className="text-green-400 font-medium">
                    Complete
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="text-center mb-8">
                    <div className="text-6xl font-bold mb-4">{timer.formattedTime}</div>
                    <div className="flex justify-center space-x-4 mb-6">
                        {!timer.isRunning ? (
                            <button
                                onClick={timer.start}
                                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-all"
                            >
                                <Play className="w-8 h-8 text-white ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={timer.pause}
                                className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-all"
                            >
                                <Pause className="w-8 h-8 text-white" />
                            </button>
                        )}
                        <button
                            onClick={timer.reset}
                            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                        >
                            <StopCircle className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{totalCalories}</div>
                        <div className="text-sm text-gray-400">Calories</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{sets}</div>
                        <div className="text-sm text-gray-400">Sets</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{reps}</div>
                        <div className="text-sm text-gray-400">Reps</div>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Sets</span>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSets(Math.max(1, sets - 1))}
                                    className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{sets}</span>
                                <button
                                    onClick={() => setSets(sets + 1)}
                                    className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center hover:bg-green-500/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Reps</span>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setReps(Math.max(0, reps - 1))}
                                    className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{reps}</span>
                                <button
                                    onClick={() => setReps(reps + 1)}
                                    className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center hover:bg-green-500/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 w-full max-w-md">
                    <div className="bg-cyan-500/10 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/20">
                        <div className="text-sm text-gray-400 mb-1">Target</div>
                        <div className="text-lg">{workout.duration} min • {workout.difficulty} • {workout.calories} cal</div>
                        {workout.equipment !== 'None' && (
                            <div className="text-sm text-gray-400 mt-2">Equipment: {workout.equipment}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BodyScanScreen = ({ setCurrentView, setAiResponse }) => {
    const [scanStage, setScanStage] = useState('setup');
    const [scanResults, setScanResults] = useState(null);
    const camera = useCamera();

    const startScan = () => {
        camera.startCamera();
        setScanStage('scanning');
    };

    const performScan = () => {
        const imageData = camera.capturePhoto();

        if (imageData) {
            setScanStage('analyzing');

            // Simulate AI analysis (in production, send to backend)
            setTimeout(() => {
                const results = {
                    overallScore: Math.floor(Math.random() * 30) + 70,
                    capturedImage: imageData,
                    timestamp: new Date().toISOString(),
                    areas: [
                        {
                            area: 'Posture',
                            score: Math.floor(Math.random() * 35) + 65,
                            issue: 'Forward head posture detected',
                            recommendation: 'Focus on neck strengthening and chest stretching',
                            exercises: ['Chin Tucks', 'Wall Angels', 'Upper Trap Stretches']
                        },
                        {
                            area: 'Core Stability',
                            score: Math.floor(Math.random() * 30) + 70,
                            issue: 'Good core engagement, slight imbalance',
                            recommendation: 'Continue core work with rotational movements',
                            exercises: ['Russian Twists', 'Dead Bug', 'Pallof Press']
                        },
                        {
                            area: 'Hip Alignment',
                            score: Math.floor(Math.random() * 25) + 75,
                            issue: 'Excellent hip mobility and alignment',
                            recommendation: 'Maintain current hip flexibility routine',
                            exercises: ['Hip Circles', 'Clamshells', 'Pigeon Pose']
                        }
                    ]
                };

                // Save scan to history
                const scanHistory = loadFromStorage('bodyScanHistory', []);
                scanHistory.push(results);
                saveToStorage('bodyScanHistory', scanHistory);

                setScanResults(results);
                setScanStage('results');
                camera.stopCamera();
                setAiResponse("Body scan complete! I've identified key areas for improvement and created a personalized movement plan for you.");
            }, 3000);
        }
    };

    const retakeScan = () => {
        setScanStage('setup');
        setScanResults(null);
        camera.stopCamera();
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

                    {camera.hasPermission === false && (
                        <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-4 border border-red-500/20 mb-6 max-w-md mx-auto">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                                <p className="text-red-400">Camera access denied. Please enable camera permissions.</p>
                            </div>
                        </div>
                    )}

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
                    <button onClick={retakeScan} className="text-cyan-400 font-medium">
                        Cancel
                    </button>
                    <h2 className="text-2xl font-bold">Scanning...</h2>
                    <div></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="relative w-80 h-96 bg-gray-800 rounded-2xl mb-6 overflow-hidden">
                        <video
                            ref={camera.videoRef}
                            autoPlay
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-4 border-2 border-green-500 rounded-xl animate-pulse"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                            <div className="text-green-400 text-sm font-medium">Camera Active</div>
                        </div>
                    </div>

                    <button
                        onClick={performScan}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
                    >
                        Capture & Analyze
                    </button>

                    <div className="text-center mt-6">
                        <h3 className="text-xl font-bold mb-2">Position Yourself</h3>
                        <p className="text-gray-400">Stand in the frame and click capture when ready</p>
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
                            <div className="text-sm text-green-400">✓ Image captured successfully</div>
                            <div className="text-sm text-green-400">✓ Posture mapping complete</div>
                            <div className="text-sm text-yellow-400 animate-pulse">⏳ Analyzing muscle imbalances...</div>
                            <div className="text-sm text-gray-500">⏳ Generating recommendations</div>
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
                        {/* Captured Image */}
                        {scanResults.capturedImage && (
                            <div className="mb-6">
                                <img
                                    src={scanResults.capturedImage}
                                    alt="Body scan capture"
                                    className="w-full max-w-sm mx-auto rounded-xl"
                                />
                            </div>
                        )}

                        {/* Overall Score */}
                        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl p-6 border border-green-500/30 mb-6">
                            <div className="text-center">
                                <h3 className="text-3xl font-bold mb-2">Overall Score</h3>
                                <div className="text-6xl font-black text-green-400 mb-2">{scanResults.overallScore}</div>
                                <div className="text-gray-400">
                                    {scanResults.overallScore >= 80 ? 'Excellent posture!' :
                                        scanResults.overallScore >= 70 ? 'Good posture with room for improvement' :
                                            'Several areas need attention'}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Areas */}
                        <div className="space-y-4">
                            {scanResults.areas.map((area, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-lg">{area.area}</h4>
                                        <div className={`text-2xl font-bold ${
                                            area.score >= 80 ? 'text-green-400' :
                                                area.score >= 65 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
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

const HabitsScreen = ({ setCurrentView }) => {
    const [habits, setHabits] = useState(() => loadFromStorage('habits', [
        {
            id: 1,
            name: 'Morning Routine',
            description: 'Wake up at 6 AM and exercise',
            streak: 0,
            completed: [],
            target: 30
        },
        {
            id: 2,
            name: 'Drink Water',
            description: '8 glasses of water daily',
            streak: 0,
            completed: [],
            target: 30
        }
    ]));

    const [newHabit, setNewHabit] = useState({ name: '', description: '', target: 30 });
    const [showAddForm, setShowAddForm] = useState(false);

    const today = new Date().toDateString();

    const toggleHabit = (habitId) => {
        const updatedHabits = habits.map(habit => {
            if (habit.id === habitId) {
                const completedToday = habit.completed.includes(today);

                if (completedToday) {
                    // Remove today from completed
                    return {
                        ...habit,
                        completed: habit.completed.filter(date => date !== today),
                        streak: Math.max(0, habit.streak - 1)
                    };
                } else {
                    // Add today to completed
                    return {
                        ...habit,
                        completed: [...habit.completed, today],
                        streak: habit.streak + 1
                    };
                }
            }
            return habit;
        });

        setHabits(updatedHabits);
        saveToStorage('habits', updatedHabits);
    };

    const addHabit = () => {
        if (newHabit.name && newHabit.description) {
            const habit = {
                id: Date.now(),
                ...newHabit,
                streak: 0,
                completed: []
            };

            const updatedHabits = [...habits, habit];
            setHabits(updatedHabits);
            saveToStorage('habits', updatedHabits);

            setNewHabit({ name: '', description: '', target: 30 });
            setShowAddForm(false);
        }
    };

    const deleteHabit = (habitId) => {
        const updatedHabits = habits.filter(h => h.id !== habitId);
        setHabits(updatedHabits);
        saveToStorage('habits', updatedHabits);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold">Habits</h2>
                <button onClick={() => setShowAddForm(true)} className="text-green-400 font-medium">
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {showAddForm && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-6 border border-white/20">
                        <h3 className="font-bold mb-4">Add New Habit</h3>
                        <input
                            type="text"
                            placeholder="Habit name"
                            value={newHabit.name}
                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 text-white placeholder-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newHabit.description}
                            onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 text-white placeholder-gray-400"
                        />
                        <input
                            type="number"
                            placeholder="Target days"
                            value={newHabit.target}
                            onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) })}
                            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={addHabit}
                                className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-medium transition-all"
                            >
                                Add Habit
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-lg font-medium transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {habits.map(habit => {
                        const isCompletedToday = habit.completed.includes(today);
                        const progress = (habit.streak / habit.target) * 100;

                        return (
                            <div key={habit.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{habit.name}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{habit.description}</p>

                                        <div className="flex items-center space-x-4 mb-3">
                                            <div className="flex items-center">
                                                <Flame className="w-4 h-4 text-orange-400 mr-1" />
                                                <span className="text-sm font-medium">{habit.streak} day streak</span>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Goal: {habit.target} days
                                            </div>
                                        </div>

                                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => toggleHabit(habit.id)}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                isCompletedToday
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                            }`}
                                        >
                                            <Check className={`w-6 h-6 ${isCompletedToday ? 'text-white' : 'text-gray-400'}`} />
                                        </button>

                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                                        >
                                            <X className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {habits.length === 0 && !showAddForm && (
                    <div className="text-center py-12">
                        <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No habits yet</h3>
                        <p className="text-gray-400 mb-6">Start building healthy habits today!</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 py-3 px-6 rounded-xl font-medium transition-all"
                        >
                            Add Your First Habit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChallengesScreen = ({ setCurrentView }) => {
    const [challenges, setChallenges] = useState(() => loadFromStorage('challenges', [
        {
            id: 1,
            title: '30-Day Morning Routine',
            description: 'Wake up at 6 AM and do 10 push-ups every day for 30 days',
            type: 'fitness',
            duration: '30 days',
            participants: 127,
            creator: 'Alex Chen',
            joined: false,
            progress: 0,
            daysRemaining: 30
        },
        {
            id: 2,
            title: 'Hydration Hero Challenge',
            description: 'Drink 8 glasses of water daily for 2 weeks',
            type: 'wellness',
            duration: '14 days',
            participants: 89,
            creator: 'Sarah K.',
            joined: false,
            progress: 0,
            daysRemaining: 14
        }
    ]));

    const joinChallenge = (challengeId) => {
        const updatedChallenges = challenges.map(challenge => {
            if (challenge.id === challengeId) {
                return {
                    ...challenge,
                    joined: !challenge.joined,
                    participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1
                };
            }
            return challenge;
        });

        setChallenges(updatedChallenges);
        saveToStorage('challenges', updatedChallenges);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold">Challenges</h2>
                <div></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                      {challenge.type}
                    </span>
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                      {challenge.duration}
                    </span>
                                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                                            {challenge.participants}
                    </span>
                                    </div>

                                    {challenge.joined && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Progress</span>
                                                <span className="text-cyan-400">{challenge.progress}%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${challenge.progress}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {challenge.daysRemaining} days remaining
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-400">
                                        Created by {challenge.creator}
                                    </div>
                                </div>

                                <button
                                    onClick={() => joinChallenge(challenge.id)}
                                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                                        challenge.joined
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                >
                                    {challenge.joined ? 'Leave' : 'Join'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AnalyticsScreen = ({ setCurrentView }) => {
    const stats = loadFromStorage('userStats', {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0
    });

    const workoutHistory = loadFromStorage('workoutHistory', []);
    const bodyScanHistory = loadFromStorage('bodyScanHistory', []);

    // Calculate weekly stats
    const weeklyStats = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentWorkouts = workoutHistory.filter(w =>
            new Date(w.completedAt) > oneWeekAgo
        );

        return {
            workouts: recentWorkouts.length,
            minutes: recentWorkouts.reduce((sum, w) => sum + Math.round(w.duration / 60), 0),
            calories: recentWorkouts.reduce((sum, w) => sum + w.calories, 0)
        };
    };

    const weekly = weeklyStats();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <div></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">All Time Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                            <div className="text-3xl font-bold">{stats.totalWorkouts}</div>
                            <div className="text-sm text-gray-400">Workouts</div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                            <div className="text-3xl font-bold">{stats.totalMinutes}</div>
                            <div className="text-sm text-gray-400">Minutes</div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                            <div className="text-3xl font-bold">{stats.totalCalories}</div>
                            <div className="text-sm text-gray-400">Calories</div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">This Week</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold">{weekly.workouts}</div>
                            <div className="text-sm text-gray-400">Workouts</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold">{weekly.minutes}</div>
                            <div className="text-sm text-gray-400">Minutes</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold">{weekly.calories}</div>
                            <div className="text-sm text-gray-400">Calories</div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">Body Scans</h3>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">{bodyScanHistory.length}</div>
                                <div className="text-sm text-gray-400">Total Scans</div>
                            </div>
                            {bodyScanHistory.length > 0 && (
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400">
                                        {bodyScanHistory[bodyScanHistory.length - 1].overallScore}
                                    </div>
                                    <div className="text-sm text-gray-400">Latest Score</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4">Recent Workouts</h3>
                    <div className="space-y-3">
                        {workoutHistory.slice(-5).reverse().map((workout, index) => (
                            <div key={index} className="bg-white/10 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{workout.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(workout.completedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-cyan-400">{Math.round(workout.duration / 60)} min</div>
                                        <div className="text-sm text-orange-400">{workout.calories} cal</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {workoutHistory.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No workouts yet. Start your first workout!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileScreen = ({ currentUser, setCurrentView, onLogout }) => {
    const stats = loadFromStorage('userStats', {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0
    });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold">Profile</h2>
                <button onClick={() => setCurrentView('settings')} className="text-gray-400">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                        {currentUser?.name?.split(' ').map((n) => n[0]).join('') || 'G'}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                        {currentUser?.isGuest ? 'Guest User' : currentUser?.name || 'User'}
                    </h3>
                    {currentUser?.email && (
                        <p className="text-gray-400">{currentUser.email}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                        <div className="text-xs text-gray-400">Workouts</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{stats.totalMinutes}</div>
                        <div className="text-xs text-gray-400">Minutes</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{stats.totalCalories}</div>
                        <div className="text-xs text-gray-400">Calories</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => setCurrentView('analytics')}
                        className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center">
                            <BarChart3 className="w-5 h-5 mr-3 text-cyan-400" />
                            <span>View Full Analytics</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('habits')}
                        className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center">
                            <Target className="w-5 h-5 mr-3 text-purple-400" />
                            <span>Manage Habits</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('challenges')}
                        className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 flex items-center justify-between transition-all"
                    >
                        <div className="flex items-center">
                            <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
                            <span>Active Challenges</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </div>

                {currentUser?.isGuest && (
                    <div className="mt-8 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <p className="text-sm text-cyan-300 mb-3">
                            Create an account to save your progress and unlock all features!
                        </p>
                        <button
                            onClick={() => setCurrentView('signup')}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 py-3 rounded-lg font-medium transition-all"
                        >
                            Sign Up Now
                        </button>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className="w-full mt-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-4 rounded-xl font-medium transition-all flex items-center justify-center"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    {currentUser?.isGuest ? 'Exit Guest Mode' : 'Log Out'}
                </button>
            </div>
        </div>
    );
};

const WorkoutsScreen = ({ setCurrentView }) => {
    const [workouts] = useState([
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
        },
        {
            id: 3,
            name: 'HIIT Blast',
            duration: 30,
            difficulty: 'Advanced',
            equipment: 'None',
            calories: 300
        },
        {
            id: 4,
            name: 'Strength Builder',
            duration: 45,
            difficulty: 'Intermediate',
            equipment: 'Dumbbells',
            calories: 250
        }
    ]);

    const [activeWorkout, setActiveWorkout] = useState(null);

    if (activeWorkout) {
        return (
            <WorkoutSession
                workout={activeWorkout}
                onComplete={(data) => {
                    console.log('Workout completed:', data);
                    setActiveWorkout(null);
                    setCurrentView('home');
                }}
                onCancel={() => setActiveWorkout(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                    ← Back
                </button>
                <h2 className="text-2xl font-bold">Workouts</h2>
                <div></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {workouts.map(workout => (
                        <button
                            key={workout.id}
                            onClick={() => setActiveWorkout(workout)}
                            className="w-full bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">{workout.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    workout.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                                        workout.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                }`}>
                  {workout.difficulty}
                </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {workout.duration} min
                                </div>
                                <div className="flex items-center">
                                    <Flame className="w-4 h-4 mr-1" />
                                    {workout.calories} cal
                                </div>
                                <div className="flex items-center">
                                    <Dumbbell className="w-4 h-4 mr-1" />
                                    {workout.equipment}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center text-cyan-400">
                                <Play className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Start Workout</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VoiceHomeScreen = ({
                             currentUser,
                             userMetrics,
                             transcript,
                             isListening,
                             startListening,
                             error,
                             aiResponse,
                             setCurrentView
                         }) => {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
            </div>

            <div className="relative z-10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setCurrentView('profile')}
                        className="flex items-center"
                    >
                        {currentUser && !currentUser.isGuest && (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-3 text-white font-bold">
                                {currentUser.name?.split(' ').map((n) => n[0]).join('')}
                            </div>
                        )}
                        <div>
                            <div className="text-gray-400 text-sm">
                                {currentUser?.isGuest ? 'Guest Mode' : `Welcome back!`}
                            </div>
                            <div className="font-bold">
                                {currentUser?.isGuest ? 'Tap to sign up' : currentUser?.name?.split(' ')[0]}
                            </div>
                        </div>
                    </button>
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
                            <span className="text-xs text-gray-400">Today</span>
                        </div>
                        <div className="text-xl font-bold">{userMetrics.workoutsToday || 0}</div>
                        <div className="text-xs text-gray-400">workouts</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-1">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-gray-400">Streak</span>
                        </div>
                        <div className="text-xl font-bold">{userMetrics.currentStreak || 0}</div>
                        <div className="text-xs text-green-400">days</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400">Score</span>
                        </div>
                        <div className="text-xl font-bold">{userMetrics.overallScore || 0}</div>
                        <div className="text-xs text-gray-400">points</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        PROTONIC
                    </h1>
                    <p className="text-sm font-light text-gray-400 tracking-wider">VOICE FITNESS AI</p>
                </div>

                <div className="flex flex-col items-center justify-center mb-6">
                    <button
                        onClick={startListening}
                        disabled={isListening}
                        className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 mb-6 ${
                            isListening
                                ? 'bg-red-500 scale-110 animate-pulse shadow-2xl shadow-red-500/50'
                                : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 shadow-2xl shadow-cyan-500/30'
                        }`}
                    >
                        {isListening ? (
                            <div className="flex flex-col items-center">
                                <Volume2 className="w-12 h-12 text-white mb-2 animate-pulse" />
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        ) : (
                            <Mic className="w-12 h-12 text-white" />
                        )}
                    </button>

                    <button
                        onClick={() => setCurrentView('bodyScan')}
                        className="w-full max-w-sm bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-green-500/30 mb-4"
                    >
                        <div className="flex items-center justify-center space-x-3">
                            <Camera className="w-6 h-6 text-white" />
                            <span>AI Body Scan</span>
                        </div>
                    </button>
                </div>

                <h2 className="text-xl font-bold mb-2">
                    {isListening ? 'Listening...' : 'Tap mic to start'}
                </h2>
                <p className="text-gray-400 text-center text-sm max-w-xs mx-auto mb-6">
                    {isListening ? "I'm listening..." : "Say 'start workout' or 'show progress'"}
                </p>

                {error && (
                    <div className="bg-red-500/10 backdrop-blur-xl rounded-xl p-4 border border-red-500/20 mb-4 max-w-sm mx-auto">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {transcript && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-4 max-w-sm mx-auto">
                        <p className="text-xs text-gray-400 mb-1">You said:</p>
                        <p className="text-sm font-semibold">&quot;{transcript}&quot;</p>
                    </div>
                )}

                <div className="bg-cyan-500/10 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/20 max-w-sm mx-auto">
                    <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-cyan-500">
                            <Zap className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium text-cyan-400 text-sm">AI Coach</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{aiResponse}</p>
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

const SignupScreen = ({ onComplete, onSkip }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = () => {
        if (formData.name && formData.email) {
            // Save user data
            const userData = {
                ...formData,
                createdAt: new Date().toISOString()
            };
            saveToStorage('currentUser', userData);
            onComplete(userData);
        }
    };

    const handleSocialLogin = (provider) => {
        // Simulate social login
        const userData = {
            name: `${provider} User`,
            email: `user@${provider.toLowerCase()}.com`,
            provider,
            createdAt: new Date().toISOString()
        };
        saveToStorage('currentUser', userData);
        onComplete(userData);
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
                        <input
                            type="text"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                        />

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 py-3 rounded-xl font-bold transition-all"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-black px-2 text-gray-400">or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleSocialLogin('Google')}
                            className="w-full bg-white hover:bg-gray-100 text-black py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center"
                        >
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleSocialLogin('Apple')}
                            className="w-full bg-black border border-white hover:bg-gray-900 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center"
                        >
                            Continue with Apple
                        </button>
                    </div>

                    <button
                        onClick={onSkip}
                        className="w-full bg-white/10 border border-white/20 hover:bg-white/20 py-3 rounded-xl font-medium transition-all"
                    >
                        Continue as Guest
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

// Main App Component
export default function ProtonicFitnessApp() {
    const [currentView, setCurrentView] = useState('welcome');
    const [currentUser, setCurrentUser] = useState(() => loadFromStorage('currentUser', null));
    const [aiResponse, setAiResponse] = useState(
        "Hi! I'm your AI fitness coach. Say 'start workout', 'body scan', or tap below to begin."
    );

    const userMetrics = {
        workoutsToday: loadFromStorage('workoutsToday', 0),
        currentStreak: loadFromStorage('currentStreak', 0),
        overallScore: loadFromStorage('overallScore', 0)
    };

    const onVoiceCommand = useCallback((command) => {
        const lower = command.toLowerCase();

        // Process voice commands
        if (lower.includes('sign up') || lower.includes('signup')) {
            setCurrentView('signup');
            setAiResponse("Let's create your account!");
        } else if (lower.includes('guest') || lower.includes('skip')) {
            setCurrentUser({ name: 'Guest User', isGuest: true });
            setCurrentView('home');
            setAiResponse("Welcome! You're in guest mode. Your progress won't be saved.");
        } else if (lower.includes('body scan') || lower.includes('posture') || lower.includes('scan')) {
            setCurrentView('bodyScan');
            setAiResponse("Let's analyze your posture and movement patterns!");
        } else if (lower.includes('workout') || lower.includes('exercise')) {
            setCurrentView('workouts');
            setAiResponse("Let's get moving! Choose a workout to start.");
        } else if (lower.includes('progress') || lower.includes('analytics') || lower.includes('stats')) {
            setCurrentView('analytics');
            setAiResponse("Here's your fitness dashboard and progress!");
        } else if (lower.includes('habit')) {
            setCurrentView('habits');
            setAiResponse("Let's track your healthy habits!");
        } else if (lower.includes('challenge')) {
            setCurrentView('challenges');
            setAiResponse("Join a challenge to stay motivated!");
        } else if (lower.includes('trainer') || lower.includes('coach')) {
            setCurrentView('trainers');
            setAiResponse("Connect with expert trainers!");
        } else if (lower.includes('home') || lower.includes('back')) {
            setCurrentView('home');
            setAiResponse("Welcome back! What would you like to do?");
        } else {
            setAiResponse(`I heard "${command}". Try saying "start workout", "body scan", or "show progress".`);
        }
    }, []);

    const { isListening, transcript, error, startListening } = useVoiceRecognition(onVoiceCommand);

    const handleSignup = () => {
        setCurrentView('signup');
    };

    const handleGuest = () => {
        setCurrentUser({ name: 'Guest User', isGuest: true });
        saveToStorage('currentUser', { name: 'Guest User', isGuest: true });
        setCurrentView('home');
    };

    const handleCompleteSignup = (userData) => {
        setCurrentUser(userData);
        setCurrentView('home');
    };

    const handleLogout = () => {
        localStorage.clear();
        setCurrentUser(null);
        setCurrentView('welcome');
        setAiResponse("Hi! I'm your AI fitness coach. Say 'start workout' or tap below to begin.");
    };

    // Auto-login if user data exists
    useEffect(() => {
        if (currentUser && currentView === 'welcome') {
            setCurrentView('home');
        }
    }, [currentUser, currentView]);

    if (currentView === 'welcome') {
        return (
            <WelcomeScreen
                isListening={isListening}
                transcript={transcript}
                startListening={startListening}
                error={error}
                aiResponse={aiResponse}
                onSignup={handleSignup}
                onGuest={handleGuest}
            />
        );
    }

    if (currentView === 'signup') {
        return (
            <SignupScreen
                onComplete={handleCompleteSignup}
                onSkip={handleGuest}
            />
        );
    }

    if (currentView === 'home') {
        return (
            <VoiceHomeScreen
                currentUser={currentUser}
                userMetrics={userMetrics}
                transcript={transcript}
                isListening={isListening}
                startListening={startListening}
                error={error}
                aiResponse={aiResponse}
                setCurrentView={setCurrentView}
            />
        );
    }

    if (currentView === 'analytics') {
        return <AnalyticsScreen setCurrentView={setCurrentView} />;
    }

    if (currentView === 'bodyScan') {
        return <BodyScanScreen setCurrentView={setCurrentView} setAiResponse={setAiResponse} />;
    }

    if (currentView === 'workouts') {
        return <WorkoutsScreen setCurrentView={setCurrentView} />;
    }

    if (currentView === 'habits') {
        return <HabitsScreen setCurrentView={setCurrentView} />;
    }

    if (currentView === 'challenges') {
        return <ChallengesScreen setCurrentView={setCurrentView} />;
    }

    if (currentView === 'profile') {
        return (
            <ProfileScreen
                currentUser={currentUser}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
            />
        );
    }

    if (currentView === 'trainers') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <button onClick={() => setCurrentView('home')} className="text-cyan-400 font-medium">
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">Trainers</h2>
                    <div></div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                        <p className="text-gray-400">Live trainer sessions will be available soon!</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
