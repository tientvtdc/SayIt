import React, { useState, useEffect } from 'react';
import { Topic } from '../types';
import { XMarkIcon, TrashIcon } from './icons';

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (topic: Topic, originalName?: string) => void;
    onDelete: (topicName: string) => void;
    existingTopicNames: string[];
    topicToEdit: Topic | null;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete,
    existingTopicNames,
    topicToEdit 
}) => {
    const [topicName, setTopicName] = useState('');
    const [sentencesText, setSentencesText] = useState('');
    const [error, setError] = useState('');

    const isEditMode = !!topicToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && topicToEdit) {
                setTopicName(topicToEdit.name);
                setSentencesText(topicToEdit.sentences.map(s => s.text).join('\n'));
            } else {
                // Reset form for "add new"
                setTopicName('');
                setSentencesText('');
            }
            setError('');
        }
    }, [isOpen, topicToEdit, isEditMode]);

    const handleSave = () => {
        const trimmedName = topicName.trim();
        const sentences = sentencesText.split('\n').map(text => text.trim()).filter(text => text.length > 0);

        if (!trimmedName) {
            setError('Vui lòng nhập tên chủ đề.');
            return;
        }
        
        const filteredExistingNames = isEditMode && topicToEdit
            ? existingTopicNames.filter(name => name.toLowerCase() !== topicToEdit.name.toLowerCase())
            : existingTopicNames;

        if (filteredExistingNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
            setError('Tên chủ đề này đã tồn tại. Vui lòng chọn một tên khác.');
            return;
        }
        if (sentences.length === 0) {
            setError('Vui lòng nhập ít nhất một câu.');
            return;
        }

        const newTopic: Topic = {
            name: trimmedName,
            sentences: sentences.map(text => ({ text, meaning: '' }))
        };

        onSave(newTopic, isEditMode && topicToEdit ? topicToEdit.name : undefined);
    };

    const handleDelete = () => {
        if (!topicToEdit) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa chủ đề "${topicToEdit.name}" không? Hành động này không thể hoàn tác.`)) {
             onDelete(topicToEdit.name);
        }
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

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all"
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
                    {isEditMode ? 'Chỉnh sửa Chủ đề' : 'Thêm chủ đề mới'}
                </h2>

                {error && <p className="text-red-500 dark:text-red-400 mb-4 text-sm">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="topic-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Tên chủ đề
                        </label>
                        <input 
                            type="text" 
                            id="topic-name"
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="Ví dụ: Cụm từ thông dụng"
                        />
                    </div>
                    <div>
                        <label htmlFor="sentences-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Danh sách câu (mỗi câu một dòng)
                        </label>
                        <textarea
                            id="sentences-text"
                            value={sentencesText}
                            onChange={(e) => setSentencesText(e.target.value)}
                            className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            rows={8}
                            placeholder="Where is the library?&#10;What time is it?"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center gap-3">
                    <div>
                        {isEditMode && (
                             <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-800/70 transition-colors flex items-center gap-2"
                                aria-label={`Xóa chủ đề ${topicToEdit?.name}`}
                            >
                                <TrashIcon className="w-5 h-5"/>
                                Xóa
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
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
                            {isEditMode ? 'Lưu thay đổi' : 'Lưu chủ đề'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
