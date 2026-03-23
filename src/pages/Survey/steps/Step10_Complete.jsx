import React from 'react';
import { Icon } from '../../../components/Icon';

export default function Step10Complete({ setStep, theme }) {
    return (
        <div className="flex-1 flex flex-col items-center pt-10 p-8 text-center animate-fade-in overflow-y-auto min-h-screen relative pb-20">
            <button 
                onClick={() => setStep(0)} 
                className="absolute top-8 left-8 text-slate-400 flex items-center gap-1 font-bold text-[13px] hover:text-slate-600 transition-colors"
            >
                <Icon name="arrow-left" size={16}/> 처음으로 돌아가기
            </button>

            <div className="mt-20 w-full max-w-sm mx-auto flex flex-col items-center">
                <div className="relative mb-10 w-full max-w-[280px] mx-auto group">
                    <div className="absolute inset-0 bg-indigo-400/30 blur-2xl rounded-[2.5rem] group-hover:bg-indigo-500/40 transition-colors duration-500"></div>
                    <div className="relative shadow-2xl rounded-[2.5rem] overflow-hidden border-[6px] border-white/90 bg-slate-50 flex items-center justify-center min-h-[160px]">
                        <div className="absolute z-0">
                            <Icon name="user" size={64} className="text-slate-200" />
                        </div>
                        <img 
                            src="/내사진.png" 
                            alt="내 사진" 
                            className="relative w-full h-auto object-cover md:object-contain z-10" 
                            style={{ maxHeight: '420px' }}
                            onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                    </div>
                </div>
                
                <h2 className="text-[26px] font-black mb-6 italic tracking-tighter underline decoration-indigo-500 decoration-8 break-keep text-center leading-tight">신청이 완료 되었습니다.</h2>
                
                <div className="text-slate-600 font-bold mb-8 break-keep italic text-center">
                    <p className="text-[15px]">• 곧 연락 드리겠습니다.</p>
                </div>
                
                <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer" className="w-full mb-8 hover:scale-[1.02] block relative transition-transform">
                    <div className="py-5 px-5 bg-[#FEE500] rounded-2xl shadow-md border border-[#FEE500]/50 flex items-center justify-center gap-2 relative overflow-hidden">
                        <Icon name="message-circle" size={20} className="text-[#191919]" />
                        <p className="text-[16px] font-black text-[#191919] text-center">
                            카카오톡 친구 연결하기
                        </p>
                    </div>
                </a>

                <div className="w-full mb-8 text-center pt-2">
                    <div className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-bold shadow-2xl text-[14px] leading-[2.2] break-keep relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Icon name="star" size={80} className="text-white" />
                        </div>
                        <p className="relative z-10">
                            "<span className="font-black text-indigo-400 text-[16px]">지금의 인연</span>을 평생의 인연으로" <br/>
                            당신의 성장과 함께 하겠습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
