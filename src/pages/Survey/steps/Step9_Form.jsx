import React from 'react';
import { Icon } from '../../../components/Icon';
import { collection, addDoc, serverTimestamp, getDocs, db } from '../../../firebase/config';

export default function Step9Form({ setStep, formData, setFormData, agreed, setAgreed, config, theme, q6Choice, appId, setIsLoading, tier }) {
    
    const showAlert = (msg) => { window.alert(msg); };

    const handleSubmit = async () => {
        if (!agreed.collect) return showAlert("필수 동의 항목에 체크해주세요.");
        if (!formData.name || !formData.phone) return showAlert("성함과 연락처를 입력해 주세요.");
        setIsLoading(true);
        try {
            const leadsSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'leads'));
            const userLeads = leadsSnap.docs.map(d => d.data()).filter(l => l.name === formData.name && l.phone === formData.phone);
            if (userLeads.length >= 2) { 
                setIsLoading(false); 
                return showAlert("해당 정보로 이미 2회 신청이 완료되었습니다."); 
            }
            
            const premiumCategories = ['전문직', '자산가', '법인 대표', '개인사업자'];
            const isPremium = premiumCategories.includes(formData.category);
            const tierKey = isPremium ? "premium" : "standard";
            const sellingPrice = isPremium ? config.prePrice : config.stdPrice;
            const customerReward = isPremium ? config.preReward : config.stdReward;
            
            const leadData = {
                ...formData, 
                q6Choice, 
                merchantId: config.merchantId, merchantName: config.merchantName,
                marketerName: config.marketerName, marketerRecipient: config.marketerRecipient || "정보 없음",
                tier: tierKey, sellingPrice, customerReward, 
                isConsulted: false, isFake: false, isRewardPaid: false, isCustomerPaid: false, isMerchantPaid: false, createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), leadData);
            setStep(10);
        } catch (e) { 
            console.error(e);
            showAlert("저장 중 오류가 발생했습니다."); 
        }
        setIsLoading(false);
    };

    const inputClass = "w-full p-5 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-[#2eadff] focus:bg-white/10 transition-all text-white placeholder:text-white/20";

    return (
        <div className="p-8 animate-fade-in premium-bg min-h-screen text-white">
            <button onClick={() => setStep(8)} className="mt-8 mb-6 text-white/40 flex items-center gap-2 font-bold text-xs hover:text-white transition-colors">
                <Icon name="arrow-left" size={14}/> GO BACK
            </button>
            
            <div className="mb-10">
                <div className="inline-block px-3 py-1 rounded-full bg-[#2eadff]/10 border border-[#2eadff]/20 text-[#2eadff] text-[10px] font-black tracking-widest uppercase mb-3">
                    Step 03
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                    정보입력
                </h2>
                <div className="h-1 w-12 bg-[#2eadff] mt-4 rounded-full"></div>
            </div>
            
            <div className="space-y-4 mb-8">
                <input 
                    type="text" 
                    placeholder="성함" 
                    className={inputClass}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="생년월일 (6자리)" 
                        inputMode="numeric"
                        maxLength="6"
                        className={inputClass}
                        value={formData.birth} 
                        onChange={e => {
                            const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                            setFormData({...formData, birth: filteredValue});
                        }} 
                    />
                    <input 
                        type="tel" 
                        placeholder="연락처 (-제외)" 
                        className={inputClass}
                        value={formData.phone} 
                        onChange={e => {
                            const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                            setFormData({...formData, phone: filteredValue});
                        }} 
                    />
                </div>
                <input 
                    type="text" 
                    placeholder="소개자명" 
                    className={inputClass}
                    value={formData.region} 
                    onChange={e => setFormData({...formData, region: e.target.value})} 
                />
            </div>

            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-3 bg-[#7e61ff] rounded-full"></div>
                    <p className="text-white/90 text-sm font-black italic tracking-tight uppercase">통화가능시간 선택</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        '09:00 ~ 10:00', '10:00 ~ 11:00', '11:00 ~ 12:00', '12:00 ~ 13:00',
                        '13:00 ~ 14:00', '14:00 ~ 15:00', '15:00 ~ 16:00', '17:00 ~ 18:00',
                        '19:00 ~ 20:00', '20:00 ~ 21:00', '22:00 ~ 23:00'
                    ].map(time => (
                        <div 
                            key={time}
                            onClick={() => setFormData({...formData, availableTime: time})}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center font-bold text-[13px] active:scale-95 ${
                                formData.availableTime === time 
                                    ? `bg-[#2eadff]/10 text-[#2eadff] border-[#2eadff] shadow-[0_0_20px_rgba(46,173,255,0.2)]` 
                                    : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                            }`}
                        >
                            {time}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mb-12">
                <div className="premium-glass-card p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4 mb-5 cursor-pointer group" onClick={() => setAgreed({...agreed, collect: !agreed.collect})}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${agreed.collect ? `bg-[#2eadff] border-[#2eadff] shadow-lg shadow-cyan-500/20` : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                            {agreed.collect && <Icon name="check" size={16} className="text-white font-bold"/>}
                        </div>
                        <span className="text-[12px] font-black text-white/80 uppercase tracking-tighter">[필수] 개인정보 수집 및 이용 동의</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-[10px] text-white/40 font-bold leading-[1.8]">
                        <p className="text-[#2eadff] mb-2 font-black text-[11px] uppercase tracking-widest opacity-80">Data Collection Notice</p>
                        <p>• 수집 항목: 성명, 생년월일, 연락처, 주소, 응답 데이터</p>
                        <p>• 수집 목적 : 선택 금융 관련 상담</p>
                        <p className="mt-2 text-[9px] opacity-40">Your data is secured with industry-standard encryption.</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSubmit} 
                className="gradient-btn-premium w-full py-6 rounded-[2rem] text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(46,173,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                정보 입력 완료
                <Icon name="chevron-right" size={20} />
            </button>
        </div>
    );
}
