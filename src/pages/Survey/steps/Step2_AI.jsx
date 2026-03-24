import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../components/Icon';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Step2AI({ setStep, config, theme }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '안녕하세요! 저는 금융 AI 도우미입니다. 재무 설계, 자산 관리, 세무 등 어떤 점이 궁금하신가요?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;
        
        // 환경 변수가 없을 경우 사용할 백업 서비스 키
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAAa-3bs8huc4d49GwMYW94hvI1anO99xc';

        const userMsg = inputValue;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: "당신은 금융 전문가의 친절하고 전문적인 AI 비서입니다. 고객의 질문에 대해 정확하고 신뢰감 있는 답변을 제공하며, 전문적인 상담이 필요할 경우 '전문가와 직접 상담하기'를 권유하세요. 답변은 핵심 위주로 이해하기 쉽게 작성해주세요."
            });

            // 히스토리는 반드시 'user'로 시작해야 함 (첫 번째 모델 환영 메시지 등 제외)
            const chatHistory = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));
            const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
            const validHistory = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

            const chat = model.startChat({ history: validHistory });

            const result = await chat.sendMessage(userMsg);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = "AI 답변 생성 중 오류가 발생했습니다.\n\n상세 오류: " + error.message;
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
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
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mr-3 mt-1"></div>
                            <div className="max-w-[85%] rounded-[1.5rem] p-5 bg-white/5 text-slate-400 text-xs italic font-bold rounded-tl-none border border-white/5">
                                AI가 정보를 분석하고 있습니다...
                            </div>
                        </div>
                    )}
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
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading}
                            className="gradient-btn-premium w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all flex-shrink-0 disabled:opacity-50"
                        >
                            <Icon name="send" size={18} className="translate-x-[1px]" />
                        </button>
                    </div>

                    <button 
                        onClick={() => window.open((config.kakaoUrl || 'https://pf.kakao.com/'), '_blank')}
                        className="w-full bg-[#FEE500] text-[#191919] rounded-[1.25rem] py-3 font-black text-[13px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Icon name="message-circle" size={16} /> 신속한 맞춤상담은 카카오톡으로
                    </button>
                </div>
            </div>
        </div>
    );
}
