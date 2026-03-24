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

    const inputClass = "w-full p-5 bg-black/40 border border-white/10 rounded-2xl font-bold outline-none focus:border-[#2eadff] focus:bg-black/60 transition-all text-white placeholder:text-white/30 text-[15px]";
    const labelClass = "text-[11px] font-black text-[#2eadff] mb-2 ml-1 uppercase tracking-widest flex items-center gap-1.5 opacity-80";

    return (
        <div className="p-8 animate-fade-in premium-bg min-h-screen text-white pb-20">
            <button onClick={() => setStep(8)} className="mt-8 mb-8 text-white/40 flex items-center gap-2 font-bold text-xs hover:text-white transition-colors">
                <Icon name="arrow-left" size={14}/> GO BACK
            </button>
            
            <div className="mb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-[#2eadff]/10 border border-[#2eadff]/20 text-[#2eadff] text-[10px] font-black tracking-widest uppercase mb-3">
                    Step 03
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                    전문가 상담 <span className="text-[#2eadff]">신청</span>
                </h2>
                <p className="mt-3 text-white/40 text-xs font-bold italic">정확한 정보를 입력해 주시면 신속히 연락드리겠습니다.</p>
                <div className="h-1 w-12 bg-[#2eadff] mt-6 rounded-full shadow-[0_0_10px_rgba(46,173,255,0.5)]"></div>
            </div>
            
            <div className="space-y-6 mb-12">
                {/* Name Input */}
                <div>
                    <label className={labelClass}><Icon name="user" size={12}/> 성함 (실명)</label>
                    <input 
                        type="text" 
                        placeholder="이름을 입력하세요" 
                        className={inputClass}
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                </div>

                {/* Birth & Phone Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}><Icon name="calendar" size={12}/> 생년월일</label>
                        <input 
                            type="text" 
                            placeholder="6자리 (예: 900101)" 
                            inputMode="numeric"
                            maxLength="6"
                            className={inputClass}
                            value={formData.birth} 
                            onChange={e => {
                                const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                                setFormData({...formData, birth: filteredValue});
                            }} 
                        />
                    </div>
                    <div>
                        <label className={labelClass}><Icon name="phone" size={12}/> 연락처</label>
                        <input 
                            type="tel" 
                            placeholder="'-' 빼고 입력" 
                            className={inputClass}
                            value={formData.phone} 
                            onChange={e => {
                                const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                                setFormData({...formData, phone: filteredValue});
                            }} 
                        />
                    </div>
                </div>

                {/* Region/Intro Name Input */}
                <div>
                    <label className={labelClass}><Icon name="map-pin" size={12}/> 소개자 혹은 지역 (선택)</label>
                    <input 
                        type="text" 
                        placeholder="소개자 성함이나 거주 지역" 
                        className={inputClass}
                        value={formData.region} 
                        onChange={e => setFormData({...formData, region: e.target.value})} 
                    />
                </div>
            </div>

            {/* Call Time Section */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-4 bg-[#7e61ff] rounded-full shadow-[0_0_10px_rgba(126,97,255,0.5)]"></div>
                    <p className="text-white/90 text-[13px] font-black italic tracking-wider uppercase">통화 가능 시간 선택</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-2">
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
                                    : 'bg-black/30 border-white/5 text-white/30 hover:border-white/10'
                            }`}
                        >
                            {time}
                        </div>
                    ))}
                </div>
            </div>

            {/* Consent Section */}
            <div className="space-y-4 mb-14">
                <div className="premium-glass-card p-7 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Icon name="shield" size={60} className="text-[#2eadff]" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => setAgreed({...agreed, collect: !agreed.collect})}>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${agreed.collect ? `bg-[#2eadff] border-[#2eadff] shadow-lg shadow-cyan-500/30` : 'bg-black/40 border-white/10'}`}>
                            {agreed.collect && <Icon name="check" size={18} className="text-white font-black"/>}
                        </div>
                        <span className="text-[13px] font-black text-white/90 uppercase tracking-tighter">개인정보 수집 및 이용 동의 (필수)</span>
                    </div>
                    
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-[11px] text-white/40 font-bold leading-[2]">
                        <p className="text-[#2eadff]/80 mb-2 font-black text-[12px] uppercase tracking-widest italic opacity-80">Security Protocol</p>
                        <p>• 수집 항목 : 성명, 생년월일, 연락처, 지역 및 응답 데이터</p>
                        <p>• 수집 목적 : 금융 서비스 상담 및 전문가 매칭</p>
                        <p className="mt-3 text-[10px] opacity-30 border-t border-white/5 pt-3">귀하의 정보는 암호화되어 안전하게 보호됩니다.</p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSubmit} 
                className="gradient-btn-premium w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-[0_20px_50px_-15px_rgba(46,173,255,0.4)] active:scale-[0.97] transition-all flex items-center justify-center gap-3 group"
            >
                상담 신청 완료
                <Icon name="chevron-right" size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
