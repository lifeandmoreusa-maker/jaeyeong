import React from 'react';
import { Icon } from '../../../components/Icon';

export default function Step10Complete({ setStep, theme }) {
    return (
        <div className="flex-1 flex flex-col items-center pt-20 p-8 text-center animate-fade-in premium-bg min-h-screen relative pb-20 text-white">
            <button 
                onClick={() => setStep(0)} 
                className="absolute top-12 left-8 text-white/40 flex items-center gap-2 font-bold text-xs hover:text-white transition-colors uppercase tracking-widest"
            >
                <Icon name="arrow-left" size={14}/> Back to Start
            </button>

            <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                <div className="relative mb-12 w-full max-w-[280px] mx-auto group">
                    {/* Floating Glow effects */}
                    <div className="absolute -inset-4 bg-[#7e61ff]/20 blur-3xl rounded-full group-hover:bg-[#7e61ff]/30 transition-colors duration-1000"></div>
                    
                    <div className="relative shadow-2xl rounded-[3rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-3xl flex items-center justify-center min-h-[160px]">
                        <div className="absolute z-0 opacity-10">
                            <Icon name="user" size={120} className="text-white" />
                        </div>
                        <img 
                            src="/내사진.png" 
                            alt="내 사진" 
                            className="relative w-full h-auto object-cover z-10 scale-[1.02] group-hover:scale-105 transition-transform duration-700" 
                            style={{ maxHeight: '420px' }}
                            onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                    </div>

                    {/* Badge on photo */}
                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#2eadff] to-[#7e61ff] p-4 rounded-3xl shadow-2xl animate-float">
                        <Icon name="check-circle" size={24} className="text-white" />
                    </div>
                </div>
                
                <div className="flex flex-col gap-4 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit mx-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">Successful Submission</span>
                    </div>

                    <h2 className="text-3xl font-black italic tracking-tighter break-keep leading-tight px-4">
                        신청이 <span className="text-[#2eadff]">완료</span> 되었습니다
                    </h2>
                    
                    <p className="text-white/50 font-bold italic text-sm tracking-tight">
                        • 소중한 인연, 곧 연락 드리겠습니다.
                    </p>
                </div>
                
                <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer" className="w-full mb-10 hover:scale-[1.02] block relative transition-transform group">
                    <div className="py-5 px-5 bg-[#FEE500] rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden">
                        <Icon name="message-circle" size={22} className="text-[#191919]" />
                        <p className="text-lg font-black text-[#191919]">
                            카카오톡으로 문의하기
                        </p>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </div>
                </a>

                <div className="w-full mb-8 relative">
                    <div className="premium-glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                        {/* Decorative Background Icon */}
                        <div className="absolute -bottom-8 -right-8 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-1000">
                            <Icon name="heart" size={160} className="text-white" />
                        </div>
                        
                        <p className="text-[15px] font-bold leading-[2] break-keep relative z-10 text-slate-200">
                            "<span className="text-[#2eadff] font-black underline decoration-2 underline-offset-4">지금의 인연</span>을 평생의 인연으로" <br/>
                            <span className="opacity-80">당신의 성장을 끝까지 응원하겠습니다.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
