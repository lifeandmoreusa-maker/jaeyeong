import React from 'react';
import { Icon } from '../../../components/Icon';

export default function Step1Seminar({ setStep, setFormData, formData, config, theme }) {
    return (
        <div className="animate-fade-in flex flex-col min-h-screen">
            <div className="p-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white z-10">
                <button onClick={() => setStep(0)} className="text-slate-400 flex items-center gap-1 font-bold text-xs hover:text-slate-600 transition-colors">
                    <Icon name="arrow-left" size={16}/> 이전으로
                </button>
                <h2 className="text-[14px] font-black text-slate-900 tracking-tight">인카금융 서포터즈 세미나</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32">
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xl font-black text-slate-900">보험 N잡러의 새로운 기준</h3>
                    </div>
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed break-keep">
                            <span className="text-rose-600 font-black text-[15px]">N잡 시대, 보험N잡러 부업 선택은 필수시대!</span><br /><br />
                            메리츠화재 - "메리츠 파트너스" <br />
                            롯데손해보험 - 'Wonder'<br />
                            삼성화재보험 - 'N잡크루' <br /><br />
                            <span className="text-slate-800">제대로 알고 선택해야 합니다!</span><br /><br />
                            'N잡러 선택'의 기준을 알려드립니다.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                        <h4 className="text-[13px] font-black text-indigo-600 uppercase italic tracking-wider">01. 인카금융</h4>
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[13px] font-bold text-slate-600 leading-relaxed break-keep">
                                코스닥 상장 기업이자 국내 최대 규모의 독립보험대리점<br />
                                (GA)으로, 투명하고 전문적인 금융 인프라를 제공하는 <br />
                                금융 혁신 리더입니다.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[13px] font-black text-emerald-600 uppercase italic tracking-wider">02. 인카 서포터즈란?</h4>
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[13px] font-bold text-slate-600 leading-relaxed break-keep">
                                현명한 금융 선택을 위한 정보 전달자 입니다.<br /><br />
                                현명한 선택을 위해 검증된 금융전문가와 <br />
                                함께 금융지식을 배워 나가며, <br /><br />
                                금융지식으로 주변에 선한 영향력을 펼칩니다.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <h4 className="text-[13px] font-black text-indigo-600 uppercase italic tracking-wider">03. 인카 서포터즈 대표님 인터뷰</h4>
                        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100 aspect-video">
                            <iframe 
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/jdfu7NRKtbY?si=sZRiA8wgi5ND_nLp" 
                                title="보험 N잡러 시스템 소개 영상"
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[13px] font-black text-emerald-600 uppercase italic tracking-wider">04. 인카 서포터즈 홈페이지</h4>
                        <a 
                            href="https://locallink-nyui6ieyu-jaeyeong-muns-projects.vercel.app/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="block p-6 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 click-pulse hover:bg-black transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Icon name="home" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg">서포터즈 홈페이지</p>
                                        <p className="text-slate-400 text-[11px] font-bold">지금 바로 시스템을 확인해보세요</p>
                                    </div>
                                </div>
                                <Icon name="external-link" size={20} className="text-slate-500 group-hover:text-white" />
                            </div>
                        </a>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <Icon name="calendar" size={24} className="text-indigo-400 mt-1" />
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                                <p className="text-[15px] font-bold">2026년 3월 중순 (개별 안내)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Icon name="clock" size={24} className="text-indigo-400 mt-1" />
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                <p className="text-[15px] font-bold">오후 2:00 - 3:00 (약 50분)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Icon name="map-pin" size={24} className="text-indigo-400 mt-1" />
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                <p className="text-[15px] font-bold">서울 및 주요 수도권 거점 (확정 후 문자 발송)</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900">무엇을 배우나요?</h3>
                    <ul className="space-y-3">
                        {[
                            "금융 시대변화 및 보험 수수료 투명한 공개",
                            "인공지능(AI) 기반 맞춤형 자산 방어 전략",
                            "직장인을 위한 리스크 없는 부업 수익화 사례",
                            "보험 N잡러를 위한 실전 마케팅 및 SYSTEM 소개"
                        ].map((text, idx) => (
                            <li key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm border border-slate-100">{idx+1}</div>
                                <span className="text-[13px] font-bold text-slate-700">{text}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="p-6 bg-white border-t border-slate-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20">
                <button 
                    onClick={() => {
                        setFormData({...formData, category: "인카금융 서포터즈 세미나", interest: "금융 보상 체계"});
                        setStep(9);
                    }} 
                    className={`w-full ${theme.bg} text-white py-5 rounded-2xl font-black text-lg shadow-xl uppercase tracking-widest active:scale-95 transition-all`}
                >
                    참여 및 4만원 정산받기 &gt;
                </button>
            </div>
        </div>
    );
}
