import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export default function Step8Category({ setStep, formData, setFormData, config, theme }) {
    const categories = config.categoryOptions 
        ? config.categoryOptions.split('|').map(c => c.trim()).filter(c => c)
        : [];

    const handleToggle = (cat) => {
        const current = formData.selectedFinancialTopics || [];
        if (current.includes(cat)) {
            setFormData({ ...formData, selectedFinancialTopics: current.filter(c => c !== cat) });
        } else {
            setFormData({ ...formData, selectedFinancialTopics: [...current, cat] });
        }
    };

    const handleNext = () => {
        if (!formData.selectedFinancialTopics || formData.selectedFinancialTopics.length === 0) {
            window.alert('최소 1개 이상의 카테고리를 선택해 주세요.');
            return;
        }
        setStep(9);
    };

    return (
        <div className="p-8 animate-fade-in overflow-y-auto pb-24 min-h-[calc(100vh-160px)] bg-slate-50 relative">
            <button onClick={() => setStep(0)} className="mb-6 text-slate-400 flex items-center gap-1 font-bold text-xs hover:text-slate-600 transition-colors">
                <Icon name="arrow-left" size={14}/> 이전으로
            </button>
            
            <div className="mb-8">
                <div className="inline-flex items-center justify-center p-2.5 bg-indigo-100 rounded-xl text-indigo-600 mb-4 shadow-sm">
                    <Icon name="check-square" size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tighter">신청 카테고리 선택</h2>
                <p className="text-slate-500 text-[13px] font-bold break-keep leading-snug">
                    상담받고 싶으신 항목을 모두 선택해 주세요.<br/>(복수 선택 가능)
                </p>
            </div>

            <div className="space-y-3 mb-10">
                {categories.map((cat, idx) => {
                    const isSelected = (formData.selectedFinancialTopics || []).includes(cat);
                    return (
                        <div 
                            key={idx}
                            onClick={() => handleToggle(cat)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 shadow-sm active:scale-[0.98] ${
                                isSelected 
                                    ? `bg-white ${theme.border} shadow-md` 
                                    : 'bg-white border-transparent hover:border-slate-200'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? theme.bg + ' text-white shadow-md' : 'bg-slate-100 text-slate-300'
                            }`}>
                                <Icon name="check" size={14} />
                            </div>
                            <span className={`text-[14px] font-bold break-keep leading-snug ${
                                isSelected ? theme.text : 'text-slate-600'
                            }`}>
                                {cat}
                            </span>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleNext} 
                className={`w-full ${theme.bg} text-white py-5 rounded-2xl font-black text-[16px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl opacity-95 flex items-center justify-center gap-2`}
            >
                다음 단계로 <Icon name="arrow-right" size={18} />
            </button>
        </div>
    );
}
