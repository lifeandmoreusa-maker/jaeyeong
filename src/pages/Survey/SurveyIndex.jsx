import React, { useState } from 'react';
import Step0Intro from './steps/Step0_Intro';
import Step1Seminar from './steps/Step1_Seminar';
import Step2AI from './steps/Step2_AI';
import Step8Category from './steps/Step8_Category';
import Step9Form from './steps/Step9_Form';
import Step10Complete from './steps/Step10_Complete';
import { Icon } from '../../components/Icon';

export default function SurveyIndex({ config, setConfig, setView, theme, appId, isLoading, setIsLoading }) {
    const [step, setStep] = useState(0);
    const [tier, setTier] = useState(null);
    const [formData, setFormData] = useState({ 
        name: "", birth: "", phone: "", region: "", category: "", 
        interest: "", threat: "", interestTopic: "", extraDetail: "",
        selectedFinancialTopics: [], 
        userSituation: "" 
    });
    const [agreed, setAgreed] = useState({ collect: false, thirdParty: false, contract: false });
    const [q6Choice, setQ6Choice] = useState("자동 수락됨");

    return (
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl mx-auto">
            <div className="flex-1 pb-10">
                {step === 0 && <Step0Intro setStep={setStep} setTier={setTier} config={config} theme={theme} />}
                {step === 1 && <Step1Seminar setStep={setStep} setFormData={setFormData} formData={formData} config={config} theme={theme} />}
                {step === 2 && <Step2AI setStep={setStep} config={config} theme={theme} />}
                {step === 8 && <Step8Category setStep={setStep} formData={formData} setFormData={setFormData} config={config} theme={theme} />}
                {step === 9 && <Step9Form setStep={setStep} formData={formData} setFormData={setFormData} agreed={agreed} setAgreed={setAgreed} config={config} theme={theme} q6Choice={q6Choice} appId={appId} setIsLoading={setIsLoading} tier={tier} />}
                {step === 10 && <Step10Complete setStep={setStep} theme={theme} />}
            </div>

            <div className="mt-auto">
                <div className="bg-slate-50 border-t border-slate-100 w-full py-6 pt-8 px-8 flex flex-col items-center shadow-inner">
                    <img 
                        src="/인카로고.png" 
                        alt="인카금융 제이어스" 
                        className="h-20 sm:h-24 object-contain opacity-95 hover:scale-[1.02] transition-transform duration-500"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="mt-3 text-center">
                        <p className="text-[11px] font-black tracking-[0.25em] leading-none break-keep">
                            <span className="premium-shine-text opacity-90 inline-block pr-1">당신의 평생 금융 파트너</span>
                        </p>
                    </div>
                </div>
                
                <div className="pb-8 pt-5 flex flex-col items-center bg-white px-6 text-center">
                    <div className="flex justify-center">
                        <button onClick={() => setView('admin')} className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                            <Icon name="lock" size={9} /> Administrator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
