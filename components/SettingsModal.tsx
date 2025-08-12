
import React, { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeOffIcon } from './icons';
import { getApiKey, saveApiKey } from '../utils/apiKey';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKeyInput(getApiKey() || '');
            setSaveMessage('');
        }
    }, [isOpen]);

    const handleSave = () => {
        saveApiKey(apiKeyInput.trim());
        setSaveMessage('API Key đã được lưu thành công!');
        onSave();
        setTimeout(() => {
            onClose();
        }, 1500);
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
             if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Đóng"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Cài đặt
                </h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input 
                                type={showKey ? 'text' : 'password'}
                                id="api-key-input"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="w-full p-2 pr-10 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                placeholder="Nhập API Key của bạn"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(prev => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                aria-label={showKey ? "Ẩn key" : "Hiện key"}
                            >
                                {showKey ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            API key của bạn được lưu trữ an toàn trong trình duyệt của bạn và không được chia sẻ với bất kỳ ai.
                        </p>
                    </div>
                </div>
                
                {saveMessage && <p className="text-green-600 dark:text-green-400 mt-4 text-sm text-center">{saveMessage}</p>}


                <div className="mt-6 flex justify-end gap-3">
                     <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Hủy
                    </button>
                     <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 active:bg-sky-700 transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};
