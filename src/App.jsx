import React, { useState, useEffect } from 'react';
import SurveyIndex from './pages/Survey/SurveyIndex';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { auth, signInAnonymously, onAuthStateChanged, db, doc, getDoc } from './firebase/config';
import { Icon } from './components/Icon';

const THEMES = {
    general: { primary: "indigo", bg: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-600", light: "bg-indigo-50", isMedical: false },
    medical: { primary: "emerald", bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600", light: "bg-emerald-50", isMedical: true }
};

const LATEST_DEFAULTS = {
    stdOptions: "사회초년생(직장인), 신혼부부, 자녀양육, 은퇴준비, 전문직, 자산가",
    contractIntro: "•고객님이 보유하신 정보의 가치를 인정해 현금으로 정산해 드리는 데이터 상거래 프로그램입니다.",
    commonSubText: "내용 확인 인터뷰 (약 20분 내외)\n[#PRIMARY]참여인정![/#]  |  [#RED_U]데이터정산![/#]  |  [#PRIMARY]가치증명![/#]",
    commonLegalNotice: "[#RED_U]실제 참여자 대상 정산 프로그램[/#]\n\n본 캠페인은 참여형 광고 정산 시스템으로,\n세미나 참여 시 마케팅 예산을 정당하게 환원해 드립니다."
};

const defaultInitialConfig = {
    merchantId: "default", merchantName: "로컬링크 파트너", themeType: "general", marketerName: "",
    marketerRecipient: "", password: "1234",
    deliveryType: "owner",
    stdPrice: 120000, prePrice: 200000, stdReward: 40000, preReward: 50000,
    stdOptions: LATEST_DEFAULTS.stdOptions,
    preOptions: "법인 대표, 개인사업자, 전문직, 자산가",
    stdQuestions: "월 고정비 지출|생활 단계별 자금(주택/교육/노후) 등|예상치 못한 상황에 대한 대비|세무 비용 및 건보료 가계 부담|사업 운전자금/시설자금|사업 구조 전환에 따른 자산 가치|미정산 재무계정의 리스크 및 정산 효율성|사내 유보 자본의 유동화 및 자본구조 최적화|기업 승계 및 세대 간 자산 이동 효율성",
    heroTitle: "당신의 삶을 지원하며\n함께 하겠습니다.!",
    heroTitleColor: "#0f172a",
    heroSubText: "금융, 자산 성장을 지원 합니다.\n당신의 금융 주치의!",
    heroSubTextColor: "#64748b",
    expertName: "김전문 재무설계사",
    expertProfile: "[#PRIMARY]인카금융 서비스 수석 팀장[/#]\n\n• MDRT (Million Dollar Round Table) 연속 달성\n• 종합 자산관리 및 절세법 전문 컨설턴트\n• 법인 경영 지원 및 가업 승계 플래닝\n\n'당신의 든든한 평생 금융 파트너가 되겠습니다.'",
    categoryOptions: "보험 청구 문의|내(가족) 보험 확인 및 점검|보험상품(TV, 유투브) 궁금증 문의|배상책임 관련 보험 문의|내 개인 연금 문의|저축 및 투자 문의|주택 자금 대출 관련 문의|법인 솔루션 문의|차량 렌트/리스 문의",
    heroTitleMedical: "광고를 보는 시대에서\n[#PRIMARY]광고비 를 받는[/#] 시대로.",
    heroTitleMedicalColor: "#0f172a",
    heroSubTextMedical: "대기업 광고 예산을 직접 정산 받으세요!\n소비자에게 광고비를 정당하게 환원! '플랫폼'",
    heroSubTextMedicalColor: "#64748b",
    medicalThanks: LATEST_DEFAULTS.commonLegalNotice,
    generalThanks: LATEST_DEFAULTS.commonLegalNotice,
    generalThanksColor: "#334155",
    thirdPartyRecipient: "로컬링크 제휴 분석 전문가",
    thirdPartyPurpose: "약 20분 내외 심층 인터뷰 진행 ",
    thirdPartyItems: "수집된 개인정보 및 응답 데이터 일체",
    contractIntro: LATEST_DEFAULTS.contractIntro,
};

function App() {
    const [view, setView] = useState('survey'); 
    const [user, setUser] = useState(null);
    const [adminType, setAdminType] = useState(null); 
    const [loginId, setLoginId] = useState("");
    const [pw, setPw] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(defaultInitialConfig);
    const [isMarketerLocked, setIsMarketerLocked] = useState(false);

    const appId = 'locallink-final-v2';
    const theme = THEMES[config.themeType] || THEMES.general;

    useEffect(() => {
        const initAuth = async () => {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Auth init failed", error);
            }
            onAuthStateChanged(auth, setUser);

            const params = new URLSearchParams(window.location.search);
            let mid = params.get('id');
            
            if (!mid && window.location.search.length > 1) {
                const search = decodeURIComponent(window.location.search.substring(1));
                if (search.startsWith('id=')) mid = search.substring(3);
                else mid = search;
            }
            
            if (mid) {
                mid = decodeURIComponent(mid);
                setConfig(prev => ({ ...prev, merchantId: mid }));

                try {
                    const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchants', mid));
                    if (snap.exists()) {
                        const data = snap.data();
                        const mergedConfig = { ...data };
                        if (!data.stdOptions || data.stdOptions.includes("사회 초년생")) {
                            mergedConfig.stdOptions = LATEST_DEFAULTS.stdOptions;
                        }
                        if (!data.contractIntro || data.contractIntro.includes("상업적으로 활용하는 대가") || data.contractIntro.includes("경제 지표의 소중한 가치")) {
                            mergedConfig.contractIntro = LATEST_DEFAULTS.contractIntro;
                        }
                        
                        setConfig(prev => ({ ...prev, ...mergedConfig }));
                        if (data.marketerName && data.marketerName.trim() !== "") {
                            setIsMarketerLocked(true);
                        }
                    }
                } catch (e) {
                    console.error("Config fetch failed", e);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const handleLogin = async () => {
        if (!db) return window.alert("파이어베이스 연결을 확인 중입니다. 잠시만 기다려 주세요.");
        
        try {
            if (loginId === 'locallink') {
                const masterSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchants', 'master_admin'));
                const masterPass = masterSnap.exists() ? masterSnap.data().password : "1234";
                if (pw === masterPass) setAdminType('master');
                else window.alert("비밀번호가 틀렸습니다.");
                return;
            }
            if (loginId === config.merchantId) {
                const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchants', loginId));
                const storedPass = snap.exists() ? snap.data().password : "1234";
                if (pw === storedPass) setAdminType('merchant');
                else window.alert("비밀번호가 틀렸습니다.");
            } else window.alert("ID가 일치하지 않습니다.");
        } catch (e) {
            console.error(e);
            window.alert("로그인 처리 중 오류가 발생했습니다.");
        }
    };

    const renderLoader = () => (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white space-y-8 px-8">
            <div className="relative">
                <Icon name="loader" size={80} className="text-indigo-600" />
            </div>
            <div className="text-center">
                <p className="text-indigo-600 font-black text-2xl tracking-tighter italic">처리 중입니다...</p>
            </div>
        </div>
    );

    if (view === 'admin' && !adminType) {
        return (
            <>
                {isLoading && renderLoader()}
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">
                        <h2 className="text-2xl font-black mb-6 text-slate-900 text-center italic tracking-tighter">ADMIN LOGIN</h2>
                        <div className="space-y-4">
                            <input className="w-full p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all" placeholder="관리자 ID" value={loginId} onChange={e => setLoginId(e.target.value)} />
                            <input className="w-full p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all" type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }} />
                            <button onClick={handleLogin} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">Login</button>
                        </div>
                        <button onClick={() => setView('survey')} className="w-full mt-4 text-slate-400 text-xs font-bold hover:text-slate-600">돌아가기</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {isLoading && renderLoader()}
            {view === 'survey' ? (
                <SurveyIndex 
                    config={config} setConfig={setConfig} setView={setView} theme={theme}
                    appId={appId} isLoading={isLoading} setIsLoading={setIsLoading} isMarketerLocked={isMarketerLocked}
                />
            ) : (
                <AdminDashboard 
                    adminType={adminType} setAdminType={setAdminType} user={user}
                    config={config} setConfig={setConfig} setView={setView} appId={appId}
                />
            )}
        </>
    );
}

export default App;
