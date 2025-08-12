import React from 'react';
import { MicrophoneIcon, StopCircleIcon } from './icons';

export const Recorder: React.FC<{
    isRecording: boolean;
    isAnalyzing: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled: boolean;
}> = ({ isRecording, isAnalyzing, onStart, onStop, disabled }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-lg transition-colors duration-300">
        <button
            onClick={isRecording ? onStop : onStart}
            disabled={isAnalyzing || disabled}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
            {isRecording ? <StopCircleIcon className="w-10 h-10" /> : <MicrophoneIcon className="w-10 h-10" />}
        </button>
        <p className="mt-4 text-slate-600 dark:text-slate-300 text-center min-h-[1.5rem] transition-colors duration-300">
            {isAnalyzing ? "Đang phân tích..." : (isRecording ? "Đang ghi âm..." : (disabled ? "Vui lòng chọn hoặc nhập câu" : "Nhấn để ghi âm"))}
        </p>
    </div>
);
