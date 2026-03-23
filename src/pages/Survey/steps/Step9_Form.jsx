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

    return (
        <div className="p-8 animate-fade-in overflow-y-auto pb-20">
            <button onClick={() => setStep(8)} className="mb-6 text-slate-400 flex items-center gap-1 font-bold text-xs"><Icon name="arrow-left" size={14}/> 이전으로</button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter underline border-indigo-500 decoration-indigo-500 decoration-4">정보입력</h2>
            
            <div className="space-y-4 mb-6">
                <input 
                    type="text" 
                    placeholder="성함" 
                    className={`w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:${theme.border}`}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-3">
                    <input 
                        type="text" 
                        placeholder="생년월일 (6자리)" 
                        inputMode="numeric"
                        maxLength="6"
                        className={`w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:${theme.border}`}
                        value={formData.birth} 
                        onChange={e => {
                            const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                            setFormData({...formData, birth: filteredValue});
                        }} 
                    />
                    <input 
                        type="tel" 
                        placeholder="연락처 (-제외)" 
                        className={`w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:${theme.border}`}
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
                    className={`w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:${theme.border}`}
                    value={formData.region} 
                    onChange={e => setFormData({...formData, region: e.target.value})} 
                />
            </div>

            <div className="mb-8">
                <p className="text-slate-800 text-[13px] font-black mb-3 ml-1 italic tracking-tight">통화가능시간 선택</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        '09:00 ~ 10:00', '10:00 ~ 11:00', '11:00 ~ 12:00', '12:00 ~ 13:00',
                        '13:00 ~ 14:00', '14:00 ~ 15:00', '15:00 ~ 16:00', '17:00 ~ 18:00',
                        '19:00 ~ 20:00', '20:00 ~ 21:00', '22:00 ~ 23:00'
                    ].map(time => (
                        <div 
                            key={time}
                            onClick={() => setFormData({...formData, availableTime: time})}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center font-bold text-[12px] active:scale-95 ${
                                formData.availableTime === time 
                                    ? `bg-indigo-50 text-indigo-600 ${theme.border} shadow-sm` 
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                            }`}
                        >
                            {time}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mb-10">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => setAgreed({...agreed, collect: !agreed.collect})}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${agreed.collect ? `${theme.bg} ${theme.border} shadow-md shadow-indigo-200` : 'bg-white border-slate-200'}`}>
                            {agreed.collect && <Icon name="check" size={14} className="text-white"/>}
                        </div>
                        <span className="text-[11px] font-black text-slate-700 uppercase italic">[필수] 개인정보 수집 및 이용 동의</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-[9px] text-slate-500 font-bold leading-relaxed">
                        <p className={`text-[10px] ${theme.text} mb-1 font-black`}>개인정보 수집 및 이용 안내</p>
                        <p>• 수집 항목: 성명, 생년월일, 연락처, 주소, 응답 데이터</p>
                        <p>• 수집 목적 : 선택 금융 관련 상담</p>
                    </div>
                </div>
            </div>
            <button onClick={handleSubmit} className={`w-full ${theme.bg} text-white py-5 rounded-2xl font-black text-lg shadow-xl uppercase tracking-widest`}>신청하기</button>
        </div>
    );
}
