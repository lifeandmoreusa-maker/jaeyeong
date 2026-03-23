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
        <div className="w-full max-w-md bg-[#030712] min-h-screen flex flex-col relative shadow-2xl mx-auto border-x border-white/5">
            <div className="flex-1">
                {step === 0 && <Step0Intro setStep={setStep} setTier={setTier} config={config} theme={theme} />}
                <div className="pb-10">
                    {step === 1 && <Step1Seminar setStep={setStep} setFormData={setFormData} formData={formData} config={config} theme={theme} />}
                    {step === 2 && <Step2AI setStep={setStep} config={config} theme={theme} />}
                    {step === 8 && <Step8Category setStep={setStep} formData={formData} setFormData={setFormData} config={config} theme={theme} />}
                    {step === 9 && <Step9Form setStep={setStep} formData={formData} setFormData={setFormData} agreed={agreed} setAgreed={setAgreed} config={config} theme={theme} q6Choice={q6Choice} appId={appId} setIsLoading={setIsLoading} tier={tier} />}
                    {step === 10 && <Step10Complete setStep={setStep} theme={theme} />}
                </div>
            </div>

            <div className="mt-auto relative z-10">
                <div className="bg-[#0a0f1e] border-t border-white/5 w-full py-10 px-8 flex flex-col items-center">
                    <img 
                        src="/인카로고.png" 
                        alt="인카금융 제이어스" 
                        className="h-20 sm:h-24 object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-105"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="mt-4 text-center">
                        <p className="text-[10px] font-black tracking-[0.4em] leading-none text-[#2eadff] uppercase">
                            Your Lifetime Financial Partner
                        </p>
                    </div>
                </div>
                
                <div className="pb-8 pt-4 flex flex-col items-center bg-[#0a0f1e] px-6 text-center">
                    <div className="flex justify-center">
                        <button onClick={() => setView('admin')} className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5 hover:text-[#2eadff] transition-colors">
                            <Icon name="lock" size={9} /> Management Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
