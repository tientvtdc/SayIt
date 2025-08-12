import React from 'react';
import { PronunciationAnalysis } from '../types';
import { SparklesIcon } from './icons';

export const AnalysisFeedback: React.FC<{ analysis: PronunciationAnalysis | null; isAnalyzing: boolean }> = ({ analysis, isAnalyzing }) => {
    const shouldRender = isAnalyzing || !!analysis;

    return (
        <div className={`transition-all duration-500 ease-in-out ${shouldRender ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {isAnalyzing && (
                <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-lg flex flex-col items-center justify-center text-center transition-colors duration-300">
                     <SparklesIcon className="w-12 h-12 text-sky-500 dark:text-sky-400 animate-pulse mb-4"/>
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Gemini đang phân tích...</h3>
                     <p className="text-slate-500 dark:text-slate-400">Vui lòng chờ trong giây lát.</p>
                </div>
            )}
            
            {!isAnalyzing && analysis && (
                 <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-lg transition-colors duration-300">
                    <h3 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-sky-300">Báo Cáo Phản Hồi</h3>
                    <div className="space-y-6">
                        {analysis.goodPoints && analysis.goodPoints.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Điểm tốt
                                </h4>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                                    {analysis.goodPoints.map((point, index) => <li key={index}>{point}</li>)}
                                </ul>
                            </div>
                        )}
                        {analysis.areasForImprovement && analysis.areasForImprovement.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Cần cải thiện
                                </h4>
                                <ul className="space-y-3">
                                    {analysis.areasForImprovement.map((item, index) => (
                                        <li key={index} className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.word}</p>
                                            <p className="text-slate-600 dark:text-slate-300">{item.feedback}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
