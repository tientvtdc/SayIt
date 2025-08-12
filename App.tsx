
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getIpaForSentence, analyzePronunciation, getMeaningForSentence } from './services/geminiService';
import { blobToBase64 } from './utils/audioUtils';
import { getIpaFromCache, setIpaInCache } from './utils/db';
import { PronunciationAnalysis, WordIpaPair, Sentence, Topic } from './types';
import { getCustomTopics, saveCustomTopics } from './utils/topicUtils';

// Import components
import { SentenceDisplay } from './components/SentenceDisplay';
import { SentenceList } from './components/SentenceList';
import { Recorder } from './components/Recorder';
import { AnalysisFeedback } from './components/AnalysisFeedback';
import { AddTopicModal } from './components/AddTopicModal';
import { SettingsModal } from './components/SettingsModal';
import { MoonIcon, SunIcon, PlusCircleIcon, PencilIcon, GearIcon } from './components/icons';

const CUSTOM_MODE_ID = "custom-mode";

export default function App() {
    // App State
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicName, setSelectedTopicName] = useState<string>('');
    const [customSentenceInput, setCustomSentenceInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

    // Sentence and Analysis State
    const [sentenceData, setSentenceData] = useState<Sentence>({ text: '', meaning: '' });
    const [ipa, setIpa] = useState<WordIpaPair[]>([]);
    const [isIpaVisible, setIsIpaVisible] = useState<boolean>(true);
    const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
    
    // Loading and Media State
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
    const [playbackRate, setPlaybackRate] = useState(1);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    
    // Theme Management
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    // Data Fetching and Selection Handlers
    const handleSentenceSelect = useCallback(async (newSentence: Sentence) => {
        if (!newSentence || !newSentence.text) return;
        
        setIsLoading(true);
        setSentenceData(newSentence);
        setIpa([]);
        setAnalysis(null);
        setError(null);

        try {
            const cachedIpa = await getIpaFromCache(newSentence.text);
            if (cachedIpa) {
                setIpa(cachedIpa);
            } else {
                const newIpa = await getIpaForSentence(newSentence.text);
                setIpa(newIpa);
                if (newIpa.length > 0) {
                    await setIpaInCache(newSentence.text, newIpa);
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Đã xảy ra lỗi khi lấy phiên âm.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllTopics = useCallback(async () => {
        try {
            const response = await fetch('/topics.json');
            if (!response.ok) throw new Error("Could not fetch default topics.");
            const data = await response.json();
            const initialTopics: Topic[] = data.topics;
            const customTopics = getCustomTopics();
            return [...initialTopics, ...customTopics];
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách chủ đề.");
            return [];
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            const allTopics = await fetchAllTopics();
            setTopics(allTopics);
            if (allTopics.length > 0) {
                const firstTopic = allTopics[0];
                setSelectedTopicName(firstTopic.name);
                if (firstTopic.sentences && firstTopic.sentences[0]) {
                   await handleSentenceSelect(firstTopic.sentences[0]);
                }
            } else {
                // No topics, still check for API key on first load
                try {
                    // This is a check to see if the client can be initialized.
                    // It will throw if no key is present.
                    getIpaForSentence('');
                } catch(e) {
                    if (e instanceof Error) setError(e.message);
                }
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [handleSentenceSelect, fetchAllTopics]);

    const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTopicName = event.target.value;
        setSelectedTopicName(newTopicName);
        setAnalysis(null);
        setCustomSentenceInput("");
        
        if (newTopicName === CUSTOM_MODE_ID) {
            setSentenceData({ text: '', meaning: '' });
            setIpa([]);
        } else {
            const topic = topics.find(t => t.name === newTopicName);
            if (topic && topic.sentences.length > 0) {
                handleSentenceSelect(topic.sentences[0]);
            }
        }
    };

    const handleCustomSentenceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = customSentenceInput.trim();
        if (!trimmedInput) return;

        setIsLoading(true);
        setAnalysis(null);
        setError(null);
        setIpa([]);
        setSentenceData({ text: trimmedInput, meaning: 'Đang dịch...' });
        
        try {
            const newMeaning = await getMeaningForSentence(trimmedInput);
            await handleSentenceSelect({ text: trimmedInput, meaning: newMeaning });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.");
            setSentenceData({ text: trimmedInput, meaning: 'Dịch thất bại.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Modal and Topic CRUD handlers
    const handleOpenAddModal = () => {
        setEditingTopic(null);
        setIsTopicModalOpen(true);
    };

    const handleOpenEditModal = () => {
        const topicToEdit = getCustomTopics().find(t => t.name === selectedTopicName);
        if(topicToEdit) {
            setEditingTopic(topicToEdit);
            setIsTopicModalOpen(true);
        }
    };

    const handleSaveTopic = async (updatedTopic: Topic, originalName?: string) => {
        let customTopics = getCustomTopics();
        
        if (originalName) { // Editing existing topic
            customTopics = customTopics.map(t => t.name === originalName ? updatedTopic : t);
        } else { // Adding new topic
            customTopics.push(updatedTopic);
        }

        saveCustomTopics(customTopics);
        const allTopics = await fetchAllTopics();
        setTopics(allTopics);
        
        setSelectedTopicName(updatedTopic.name);
        if (updatedTopic.sentences.length > 0) {
            handleSentenceSelect(updatedTopic.sentences[0]);
        }
        setIsTopicModalOpen(false);
        setEditingTopic(null);
    };

    const handleDeleteTopic = async (topicNameToDelete: string) => {
        let customTopics = getCustomTopics();
        customTopics = customTopics.filter(t => t.name !== topicNameToDelete);
        saveCustomTopics(customTopics);

        const newTopicList = await fetchAllTopics();
        setTopics(newTopicList);
        
        if (newTopicList.length > 0) {
            const firstTopic = newTopicList[0];
            setSelectedTopicName(firstTopic.name);
            if (firstTopic.sentences && firstTopic.sentences[0]) {
                handleSentenceSelect(firstTopic.sentences[0]);
            }
        } else {
             setSelectedTopicName('');
             setSentenceData({ text: '', meaning: '' });
             setIpa([]);
        }

        setIsTopicModalOpen(false);
        setEditingTopic(null);
    };
    
    const handleApiKeySave = () => {
        setError(null);
        // Re-select current sentence to test the new key
        if (sentenceData.text) {
            handleSentenceSelect(sentenceData);
        }
    };

    // Audio Handlers
    const handlePlayAudio = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis && sentenceData.text) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(sentenceData.text);
            utterance.lang = 'en-US';
            utterance.rate = playbackRate;
            utterance.onstart = () => setIsPlayingAudio(true);
            utterance.onend = () => setIsPlayingAudio(false);
            utterance.onerror = () => {
                setIsPlayingAudio(false);
                setError("Lỗi phát âm thanh. Trình duyệt của bạn có thể không hỗ trợ giọng nói này.");
            };
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        } else {
            setError("Trình duyệt này không hỗ trợ chức năng đọc văn bản.");
        }
    };

    const handleStopAudio = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlayingAudio(false);
        }
    };
    
    const handleStartRecording = async () => {
        setError(null);
        setAnalysis(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());
                    setIsAnalyzing(true);
                    try {
                        const audioBase64 = await blobToBase64(audioBlob);
                        const result = await analyzePronunciation(sentenceData.text, audioBase64, 'audio/webm');
                        setAnalysis(result);
                    } catch (e) {
                         setError(e instanceof Error ? e.message : "Không thể phân tích âm thanh.");
                    } finally {
                        setIsAnalyzing(false);
                    }
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                setError("Quyền truy cập micro đã bị từ chối. Vui lòng cho phép truy cập và làm mới trang.");
            }
        } else {
             setError("Trình duyệt này không hỗ trợ ghi âm.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const currentTopic = topics.find(t => t.name === selectedTopicName);
    const isCustomTopicSelected = getCustomTopics().some(t => t.name === selectedTopicName);

    return (
        <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-3xl mx-auto flex justify-between items-center mb-6">
                <div className="text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Huấn Luyện Viên Phát Âm</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Luyện nói tiếng Anh với sự trợ giúp từ AI</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Cài đặt"
                    >
                       <GearIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <SunIcon className="w-6 h-6 text-amber-400" /> : <MoonIcon className="w-6 h-6 text-slate-800" />}
                    </button>
                </div>
            </header>

            {error && (
                <div className="w-full max-w-3xl mx-auto bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Lỗi: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 lg:gap-8">
                {/* Main Interaction Area */}
                <div className="w-full space-y-6">
                    <SentenceDisplay 
                        ipa={ipa}
                        meaning={sentenceData.meaning}
                        isLoading={isLoading}
                        onPlayAudio={handlePlayAudio}
                        onStopAudio={handleStopAudio}
                        isPlayingAudio={isPlayingAudio}
                        sentenceText={sentenceData.text}
                        isIpaVisible={isIpaVisible}
                        onToggleIpa={() => setIsIpaVisible(p => !p)}
                        playbackRate={playbackRate}
                        onPlaybackRateChange={setPlaybackRate}
                    />

                    <Recorder
                        isRecording={isRecording}
                        isAnalyzing={isAnalyzing}
                        onStart={handleStartRecording}
                        onStop={handleStopRecording}
                        disabled={!sentenceData.text || isLoading}
                    />
                    
                    <AnalysisFeedback analysis={analysis} isAnalyzing={isAnalyzing} />
                </div>

                 {/* Topic and Sentence Selection Area */}
                <div className="w-full space-y-6 mt-8">
                    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md dark:shadow-lg">
                        <label htmlFor="topic-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Chọn chế độ:</label>
                        <div className="flex items-center gap-2">
                            <select
                                id="topic-select"
                                value={selectedTopicName}
                                onChange={handleTopicChange}
                                className="flex-grow w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500 transition"
                            >
                                {topics.map(topic => (
                                    <option key={topic.name} value={topic.name}>{topic.name}</option>
                                ))}
                                <option value={CUSTOM_MODE_ID}>Nhập câu tùy chỉnh</option>
                            </select>
                            {isCustomTopicSelected && (
                                <button
                                    onClick={handleOpenEditModal}
                                    className="flex-shrink-0 p-2 rounded-full text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    aria-label="Chỉnh sửa chủ đề"
                                    title="Chỉnh sửa chủ đề"
                                >
                                    <PencilIcon className="w-6 h-6" />
                                </button>
                            )}
                            <button
                                onClick={handleOpenAddModal}
                                className="flex-shrink-0 p-2 rounded-full text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-slate-700 hover:bg-sky-200 dark:hover:bg-slate-600 transition-colors"
                                aria-label="Thêm chủ đề mới"
                                title="Thêm chủ đề mới"
                            >
                                <PlusCircleIcon className="w-7 h-7" />
                            </button>
                        </div>
                        {selectedTopicName === CUSTOM_MODE_ID && (
                            <form onSubmit={handleCustomSentenceSubmit} className="mt-4">
                                <textarea
                                    value={customSentenceInput}
                                    onChange={(e) => setCustomSentenceInput(e.target.value)}
                                    placeholder="Nhập câu tiếng Anh..."
                                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500 transition"
                                    rows={3}
                                />
                                <button type="submit" disabled={isLoading || isAnalyzing} className="mt-2 w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 active:bg-sky-700 transition-all duration-300 disabled:bg-slate-500 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    {isLoading ? 'Đang xử lý...' : 'Luyện tập'}
                                </button>
                            </form>
                        )}
                    </div>
                     {currentTopic && selectedTopicName !== CUSTOM_MODE_ID && (
                        <SentenceList 
                           sentences={currentTopic.sentences}
                           onSentenceSelect={handleSentenceSelect}
                           selectedSentenceText={sentenceData.text}
                        />
                    )}
                </div>
            </div>
            
            <AddTopicModal 
                isOpen={isTopicModalOpen}
                onClose={() => {
                    setIsTopicModalOpen(false);
                    setEditingTopic(null);
                }}
                onSave={handleSaveTopic}
                onDelete={handleDeleteTopic}
                existingTopicNames={topics.map(t => t.name)}
                topicToEdit={editingTopic}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={handleApiKeySave}
            />

             <footer className="text-center text-slate-500 dark:text-slate-500 mt-12">
                <p>Cung cấp bởi Google Gemini</p>
            </footer>
        </main>
    );
}
