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

    return (
        <div className="animate-fade-in flex flex-col min-h-screen premium-bg text-white overflow-hidden">
            {/* Top Navigation / Branding */}
            <div className="px-6 pt-12 pb-4 flex flex-col items-center relative z-10">
                <div className="premium-verify-badge flex items-center justify-center gap-3 px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <Icon name="shield" size={18} className="text-[#2eadff]" />
                        <span className="text-sm font-black tracking-widest text-[#2eadff] uppercase">VERIFIED EXPERT</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/20"></div>
                    <span className="text-lg font-black italic tracking-tighter shimmer-text">
                        {config.expertName || "J-US WELLNESS"}
                    </span>
                    <div className="verified-dot"></div>
                </div>
                <p className="mt-4 text-[11px] font-bold text-white/50 tracking-[0.3em] uppercase">
                    Incar Financial Service • J-US
                </p>
            </div>

            {/* Hero Section */}
            <div className="px-8 py-10 relative z-10">
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2eadff]/10 border border-[#2eadff]/20 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2eadff] animate-pulse"></div>
                        <span className="text-[10px] font-black text-[#2eadff] tracking-wider uppercase">Now Online</span>
                    </div>
                    
                    <h1 className="text-[2.25rem] font-black leading-[1.1] tracking-tight break-keep">
                        <FormattedText text={displayTitle} isMedicalTheme={config.themeType === 'medical'} />
                    </h1>
                    
                    <div className="h-1 w-20 bg-gradient-to-r from-[#2eadff] to-[#7e61ff] rounded-full"></div>
                    
                    <p className="text-lg font-medium text-slate-400 leading-relaxed break-keep mt-2 max-w-[90%]">
                        <FormattedText text={displaySubText} isMedicalTheme={config.themeType === 'medical'} />
                    </p>
                </div>
            </div>

            {/* Video Showcase Section */}
            <div className="px-6 mb-12 relative group h-[240px] flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-x-0 h-full bg-gradient-to-b from-transparent via-[#2eadff]/5 to-transparent -z-10"></div>
                
                <div 
                    className="relative w-full h-full rounded-[2.5rem] overflow-hidden premium-gradient-border shadow-2xl cursor-pointer group flex items-center justify-center"
                    onClick={toggleMute}
                >
                    <video 
                        ref={videoRef}
                        className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                        src="/테스트동여상.mp4"
                        autoPlay
                        loop
                        playsInline
                        muted={isMuted}
                    />

                    {/* Overlay effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                    {isMuted && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all group-hover:scale-105">
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center neon-glow-cyan">
                                <Icon name="volume-x" size={28} className="text-white translate-x-[1px]" />
                            </div>
                            <span className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-black text-[11px] tracking-widest uppercase border border-white/10">
                                Tap to unmute
                            </span>
                        </div>
                    )}
                    
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-black tracking-widest uppercase">Cinema Presentation</span>
                        </div>
                        {!isMuted && <Icon name="volume-2" size={16} className="text-white" />}
                    </div>
                </div>
            </div>

            {/* Expert Profile Card */}
            <div className="px-6 mb-16 relative flex justify-center">
                {/* Large Background Blur */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7e61ff]/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2eadff]/10 blur-[100px] pointer-events-none"></div>

                <div className="premium-glass-card rounded-[2.5rem] w-full p-8 relative overflow-hidden group floating-expert">
                    {/* Interior decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
                    
                    <div className="flex flex-col gap-6 ">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2eadff] to-[#7e61ff] shadow-lg shadow-purple-500/20">
                                    <Icon name="award" size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black tracking-[0.2em] text-[#2eadff] uppercase">Professional</h3>
                                    <h4 className="text-lg font-black tracking-tight">EXPERTISE</h4>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 border border-white/10 rounded-full px-3 py-1">
                                Ver. 2024
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#2eadff] to-transparent rounded-full opacity-50"></div>
                            <div className="text-[15px] leading-[1.8] font-semibold text-slate-200 break-keep whitespace-pre-wrap pl-2">
                                <FormattedText text={config.expertProfile || "안녕하세요. 금융 전문가입니다."} isMedicalTheme={false} />
                            </div>
                        </div>

                        {/* Stats or Badges row */}
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {[
                                { icon: 'check-circle', label: 'Certified' },
                                { icon: 'users', label: '1k+ Happy' },
                                { icon: 'trending-up', label: 'No.1' }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <Icon name={stat.icon} size={14} className="text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTAs */}
            <div className="px-6 mb-16 flex flex-col gap-4 relative z-10">
                <button 
                    onClick={() => setStep(2)} 
                    className="w-full py-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 text-white font-black text-lg shadow-2xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-4 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="p-2 rounded-xl bg-white/10">
                        <Icon name="search" size={20} className="text-[#2eadff]" />
                    </div>
                    <span>금융 고민 AI 검색하기</span>
                    <Icon name="chevron-right" size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={() => {
                        setTier('premium');
                        setStep(8);
                    }} 
                    className="gradient-btn-premium w-full py-6 rounded-[2rem] text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(46,173,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 relative"
                >
                    <div className="p-2 rounded-xl bg-white/20">
                        <Icon name="message" size={20} />
                    </div>
                    <span>인생 상담 신청하기</span>
                    <div className="absolute right-8 animate-bounce-x">
                        <Icon name="arrow-right" size={20} />
                    </div>
                </button>
                
                <p className="text-center text-[10px] font-medium text-slate-500 tracking-widest mt-2 uppercase">
                    Your growth, our priority. Trusted Financial Partner.
                </p>
            </div>
            
            {/* Added decorative background elements */}
            <div className="fixed top-1/4 -left-20 w-80 h-80 bg-[#2eadff]/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
            <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-[#7e61ff]/10 blur-[120px] rounded-full -z-10"></div>
        </div>
    );
}
