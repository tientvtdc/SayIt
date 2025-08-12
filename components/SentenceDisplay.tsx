import React from 'react';
import { WordIpaPair } from '../types';
import { PlayCircleIcon, PauseCircleIcon, EyeIcon, EyeOffIcon } from './icons';

const Loader = () => (
    <div className="flex flex-col items-center justify-center">
        <div 
            className="w-12 h-12 rounded-full animate-spin
                       border-4 border-solid border-sky-500 border-t-transparent dark:border-sky-400 dark:border-t-transparent"
        ></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải...</p>
    </div>
);

export const SentenceDisplay: React.FC<{
  ipa: WordIpaPair[];
  meaning: string;
  isLoading: boolean;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  isPlayingAudio: boolean;
  sentenceText: string;
  isIpaVisible: boolean;
  onToggleIpa: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}> = ({ 
    ipa, 
    meaning, 
    isLoading, 
    onPlayAudio, 
    onStopAudio,
    isPlayingAudio,
    sentenceText, 
    isIpaVisible, 
    onToggleIpa,
    playbackRate,
    onPlaybackRateChange,
}) => {
    
    const speedOptions = [
        { label: '0.75x', value: 0.75 },
        { label: '1x', value: 1 },
        { label: '1.5x', value: 1.5 },
    ];

    return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md dark:shadow-lg w-full min-h-[18rem] flex flex-col justify-between transition-colors duration-300">
        <div className="flex-grow flex items-center justify-center text-center">
            {isLoading ? (
                <Loader />
            ) : ipa.length > 0 ? (
                <h2 className="flex flex-wrap justify-center items-end gap-x-3 gap-y-1">
                    {ipa.map((pair, index) => (
                         <ruby key={index} className="text-2xl md:text-3xl font-semibold text-sky-600 dark:text-sky-400 leading-tight transition-colors duration-300">
                            {pair.word}
                            {isIpaVisible && <rt className="text-base text-slate-500 dark:text-slate-400 font-mono select-none">{pair.ipa}</rt>}
                        </ruby>
                    ))}
                </h2>
            ) : (
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-300">
                    {sentenceText || 'Vui lòng chọn hoặc nhập một câu'}
                </h2>
            )}
        </div>
        
        {meaning && 
            <div className="text-center mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-lg text-amber-600 dark:text-amber-400">{meaning}</p>
            </div>
        }

        <div className="flex items-center justify-center gap-4 mt-6">
            <button 
                onClick={isPlayingAudio ? onStopAudio : onPlayAudio} 
                className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-label={isPlayingAudio ? "Dừng phát âm" : "Phát âm thanh"}
                disabled={!sentenceText || isLoading}
            >
                {isPlayingAudio ? 
                    <PauseCircleIcon className="w-12 h-12"/> : 
                    <PlayCircleIcon className="w-12 h-12"/>
                }
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1">
                {speedOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onPlaybackRateChange(opt.value)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
                            playbackRate === opt.value
                                ? 'bg-sky-500 text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        disabled={!sentenceText || isLoading}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

             <button 
                onClick={onToggleIpa}
                className="p-3 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isIpaVisible ? "Ẩn phiên âm IPA" : "Hiện phiên âm IPA"}
                disabled={!sentenceText || isLoading || ipa.length === 0}
             >
                {isIpaVisible ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
             </button>
        </div>
    </div>
)};