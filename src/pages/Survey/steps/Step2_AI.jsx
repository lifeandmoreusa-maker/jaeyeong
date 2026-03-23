import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../components/Icon';

export default function Step2AI({ setStep, config, theme }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '안녕하세요! 저는 금융 AI 도우미입니다. 재무 설계, 자산 관리, 세무 등 어떤 점이 궁금하신가요?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef(null);

    const expertName = config.expertName || config.expertProfile || "전문가";

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMessages = [...messages, { role: 'user', content: inputValue }];
        setMessages(newMessages);
        setInputValue('');
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: '입력하신 내용에 대한 AI 답변을 준비 중입니다. (이곳에 제미나이 API 결과가 연결될 예정입니다)' }]);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col min-h-screen premium-bg text-white overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-4 bg-transparent flex items-center justify-between sticky top-0 z-20 backdrop-blur-md border-b border-white/5">
                <button onClick={() => setStep(0)} className="text-slate-400 p-2 -ml-2 hover:text-white transition-colors">
                    <Icon name="arrow-left" size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#2eadff]/20">
                        <Icon name="cpu" size={18} className="text-[#2eadff]" />
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase">FINANCIAL AI</span>
                </div>
                <div className="w-10"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col relative">
                {/* Intro Section */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 shadow-2xl mb-6 neon-glow-cyan transform rotate-3">
                        <Icon name="sparkles" size={28} className="text-[#2eadff]" />
                    </div>
                    <h2 className="text-2xl font-black mb-4 tracking-tight leading-tight">
                        무엇이든 <span className="text-[#2eadff]">질문</span>해 보세요
                    </h2>
                    <p className="text-sm font-medium text-slate-400 max-w-[80%] mx-auto leading-relaxed">
                        궁금하신 금융 정보를 AI가 즉시 분석하여 답변해 드립니다.
                    </p>
                </div>

                {/* Messages */}
                <div className="flex flex-col gap-6 pb-24">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mr-3 mt-1 neon-glow-purple">
                                    <Icon name="bot" size={20} className="text-[#7e61ff]" />
                                </div>
                            )}
                            <div className={`max-w-[85%] rounded-[1.5rem] p-5 text-[15px] leading-relaxed shadow-2xl ${
                                msg.role === 'user' 
                                    ? 'gradient-btn-premium text-white font-bold rounded-tr-none' 
                                    : 'premium-glass-card text-slate-200 font-semibold rounded-tl-none border-white/5'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Floating Input area */}
            <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-4 z-30">
                <div className="premium-glass-card rounded-[2rem] p-2 flex flex-col gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="궁금한 내용을 입력하세요..." 
                            className="flex-1 bg-transparent px-6 py-4 text-sm font-bold focus:outline-none placeholder:text-slate-600 text-white"
                        />
                        <button 
                            onClick={handleSend}
                            className="gradient-btn-premium w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all flex-shrink-0"
                        >
                            <Icon name="send" size={18} className="translate-x-[1px]" />
                        </button>
                    </div>

                    <button 
                        onClick={() => window.open('https://pf.kakao.com/', '_blank')}
                        className="w-full bg-[#FEE500] text-[#191919] rounded-[1.25rem] py-3 font-black text-[13px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Icon name="message-circle" size={16} /> 신속한 맞춤상담은 카카오톡으로
                    </button>
                </div>
            </div>
        </div>
    );
}
