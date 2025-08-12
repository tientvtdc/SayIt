import React from 'react';
import { Sentence } from '../types';

export const SentenceList: React.FC<{
    sentences: Sentence[];
    onSentenceSelect: (sentence: Sentence) => void;
    selectedSentenceText: string;
}> = ({ sentences, onSentenceSelect, selectedSentenceText }) => (
    <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md dark:shadow-lg transition-colors duration-300">
        <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-3">Chọn một câu để luyện tập:</h3>
        <ul className="space-y-2">
            {sentences.map((sentence, index) => (
                <li key={index}>
                    <button
                        onClick={() => onSentenceSelect(sentence)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            selectedSentenceText === sentence.text
                                ? 'bg-sky-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600/70'
                        }`}
                    >
                        <span className={`block text-sm md:text-base ${selectedSentenceText === sentence.text ? 'font-semibold' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                            {sentence.text}
                        </span>
                        <span className={`block text-xs md:text-sm mt-1 ${selectedSentenceText === sentence.text ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {sentence.meaning}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    </div>
);