import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../components/Icon';

export default function Step2AI({ setStep, config, theme }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '안녕하세요! 저는 금융 AI 도우미입니다. 재무 설계, 자산 관리, 세무 등 어떤 점이 궁금하신가요?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef(null);

    const expertName = config.expertName || config.merchantName || config.merchantId || "전문가";

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: inputValue }];
        setMessages(newMessages);
        
        // Clear input
        setInputValue('');

        // Placeholder for Gemini API response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: '입력하신 내용에 대한 AI 답변을 준비 중입니다. (이곳에 제미나이 API 결과가 연결될 예정입니다)' }]);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)] bg-slate-50 relative">
            {/* Header */}
            <div className="px-6 pt-10 pb-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => setStep(0)} className="text-slate-400 p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1">
                    <Icon name="arrow-left" size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="cpu" size={20} className={theme.text} />
                    <span className="font-black italic text-slate-800 tracking-tighter uppercase">AI Search</span>
                </div>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            {/* Intro Text */}
            <div className="px-6 py-8 bg-gradient-to-br from-indigo-50 to-white text-center border-b border-indigo-100">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 text-indigo-500">
                    <Icon name="sparkles" size={24} />
                </div>
                <h2 className="text-[19px] font-black text-slate-900 leading-[1.35] break-keep mb-2">
                    <span className="premium-shine-text">당신의 금융 고민과 관심사,</span><br/> 무엇이든 질문해 주세요!
                </h2>
                <p className="text-[13px] font-bold text-slate-500 break-keep">
                    고도화된 AI를 통해 정확하고<br/>명쾌하게 도와드립니다.
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
                                <Icon name="bot" size={16} />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm block break-keep ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white font-medium rounded-tr-sm' 
                                : 'bg-white border border-slate-100 text-slate-800 font-bold rounded-tl-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2 mb-4">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="이곳에 질문을 입력해 주세요..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform flex-shrink-0"
                    >
                        <Icon name="send" size={20} className="ml-1" />
                    </button>
                </div>

                {/* Direct Contact Extention Area */}
                <div className="flex mt-2">
                    <button 
                        onClick={() => {
                            // TODO: Replace with actual Kakao Channel Link
                            window.open('https://pf.kakao.com/', '_blank');
                        }}
                        className="w-full bg-[#FEE500] text-[#191919] border border-[#FEE500]/50 rounded-xl py-3.5 font-black text-[14px] shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-[#FEE500]/90"
                    >
                        <Icon name="message-circle" size={18} /> {expertName} 님에게 직접 카톡 질문하기
                    </button>
                </div>
            </div>
        </div>
    );
}
