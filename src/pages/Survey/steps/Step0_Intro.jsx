import React, { useState, useRef } from 'react';
import { Icon } from '../../../components/Icon';
import { FormattedText } from '../../../components/ui/FormattedText';

export default function Step0Intro({ setStep, setTier, config, theme }) {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (videoRef.current) {
            videoRef.current.muted = nextMuted;
            if (!nextMuted) {
                videoRef.current.play().catch(e => console.log('재생 보류:', e));
            }
        }
    };

    const displayTitle = config.themeType === 'medical' ? config.heroTitleMedical : config.heroTitle;
    const displaySubText = config.themeType === 'medical' ? config.heroSubTextMedical : config.heroSubText;
    const displayThanks = config.themeType === 'medical' ? config.medicalThanks : config.generalThanks;

    return (
        <div className="animate-fade-in flex flex-col min-h-screen">
            <div className="px-6 pt-10 pb-6 flex flex-col items-center bg-white text-center border-b border-slate-50">
                <div className="mt-4 flex flex-col items-center animate-fade-in w-full">
                    <div className="flex flex-col items-center gap-2 w-full max-w-[95%]">
                        <div className="premium-verify-badge flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl w-full sm:w-auto overflow-hidden">
                            <Icon name="shield" size={20} className="text-indigo-600 flex-shrink-0" />
                            <span className="text-[1.35rem] sm:text-2xl font-black italic premium-shine-text tracking-tighter leading-none whitespace-nowrap pr-2 overflow-hidden text-ellipsis">
                                {config.expertName || config.merchantName || config.merchantId}
                            </span>
                            <div className="verified-dot flex-shrink-0"></div>
                        </div>
                        <p className="mt-2 text-[10px] font-black text-indigo-400 tracking-[0.25em] flex items-center gap-1.5 opacity-80 text-center">
                            당신과 함께하는 금융 인증 전문가
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-8 py-10">
                <div className="text-left flex flex-col">
                    <h2 className="text-[1.75rem] font-black leading-[1.15] mb-6 break-keep text-slate-900 whitespace-pre-wrap">
                        <FormattedText text={displayTitle} isMedicalTheme={config.themeType === 'medical'} />
                    </h2>
                    
                    <p className="text-[16px] font-bold text-slate-500 leading-relaxed break-keep mb-8 whitespace-pre-wrap">
                        <FormattedText text={displaySubText} isMedicalTheme={config.themeType === 'medical'} />
                    </p>
                </div>
            </div>

            <div className="px-6 mb-10">
                <div 
                    className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 aspect-video bg-black cursor-pointer group"
                    onClick={toggleMute}
                >
                    <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src="/테스트동여상.mp4"
                        autoPlay
                        loop
                        playsInline
                        muted={isMuted}
                    >
                        해당 브라우저는 비디오 태그를 지원하지 않습니다.
                    </video>

                    {isMuted && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity hover:bg-black/30">
                            <div className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-full flex items-center gap-2 font-black text-[12px] shadow-2xl animate-pulse">
                                <Icon name="volume-x" size={18} /> 터치해서 소리 켜기
                            </div>
                        </div>
                    )}
                    
                    {!isMuted && (
                        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg transition-opacity hover:bg-black/60 opacity-0 group-hover:opacity-100">
                            <Icon name="volume-2" size={16} />
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 mb-12 relative animate-fade-in">
                {/* Background Glow Effect behind the card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-indigo-400/20 blur-[40px] -z-10 rounded-full pointer-events-none"></div>
                
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-[14px] font-black italic text-slate-800 tracking-tight">EXPERT PROFILE</h3>
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-[2rem] p-8 pb-10 shadow-2xl border border-white/10 relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                        <Icon name="award" size={160} className="text-white" />
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none"></div>

                    {/* Content Component */}
                    <div className="relative z-10 flex flex-col items-start">
                        <div className="mb-6 inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-md rounded-2xl text-indigo-300 border border-white/10 shadow-inner">
                            <Icon name="briefcase" size={24} />
                        </div>
                        
                        <div className="text-[15px] leading-[1.8] font-bold text-slate-200 break-keep whitespace-pre-wrap font-sans tracking-tight">
                            <FormattedText text={config.expertProfile || "안녕하세요. 금융 전문가입니다."} isMedicalTheme={false} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-12 flex flex-col gap-4">
                <button 
                    onClick={() => setStep(2)} 
                    className="w-full py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black text-lg shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Icon name="search" size={20} /> 금융 고민 AI 검색
                </button>
                <button 
                    onClick={() => {
                        setTier('premium');
                        setStep(8);
                    }} 
                    className={`w-full ${theme.bg} text-white py-5 rounded-2xl font-black text-[17px] shadow-xl uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3`}
                >
                    <Icon name="message" size={20} /> 상담 신청 & 지인 소개하기
                </button>
            </div>

        </div>
    );
}
