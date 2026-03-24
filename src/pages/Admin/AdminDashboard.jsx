import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, db, serverTimestamp, query, getDocs } from '../../firebase/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AdminDashboard({ adminType, setAdminType, user, config, setConfig, setView, appId }) {
    const [leads, setLeads] = useState([]);
    const [allMerchants, setAllMerchants] = useState([]); 
    const [activeTab, setActiveTab] = useState("list");
    const [isMarketerLocked, setIsMarketerLocked] = useState(false);
    
    // AI Chat States
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef(null);

    const showAlert = (msg) => window.alert(msg);

    const [filters, setFilters] = useState({
        merchantId: "", tier: "", isConsulted: "all", isFake: "all", isRewardPaid: "all", isCustomerPaid: "all", isMerchantPaid: "all", marketerName: "", customerName: "", yearMonth: ""
    });

    useEffect(() => {
        if (adminType && user) {
            // 1. Leads Listener
            const qLeads = collection(db, 'artifacts', appId, 'public', 'data', 'leads');
            const unsubLeads = onSnapshot(qLeads, (snapshot) => {
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (adminType === 'merchant') data = data.filter(l => l.merchantId === config.merchantId);
                setLeads(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            }, (err) => console.error(err));

            // 2. Chat Listener (New)
            const qChat = collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages');
            const unsubChat = onSnapshot(query(qChat), (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAiMessages(msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
            });

            if (adminType === 'master') {
                const qMerchants = collection(db, 'artifacts', appId, 'public', 'data', 'merchants');
                const unsubMerchants = onSnapshot(qMerchants, (snapshot) => {
                    const data = snapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(m => m.id !== 'master_admin');
                    setAllMerchants(data);
                }, (err) => console.error(err));
                return () => { unsubLeads(); unsubMerchants(); unsubChat(); };
            }
            return () => { unsubLeads(); unsubChat(); };
        }
    }, [adminType, user, config.merchantId, appId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiMessages]);

    // Gemini Logic
    const handleAiSend = async () => {
        if (!aiInput.trim()) return;
        if (!config.geminiApiKey) return showAlert("Settings 탭에서 제미나이 API 키를 먼저 입력해 주세요.");

        const userMsg = { role: 'user', content: aiInput, createdAt: new Date() };
        setAiInput("");
        setIsAiLoading(true);

        try {
            // 1. Save User Message to Firestore
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'), {
                role: 'user',
                content: aiInput,
                createdAt: serverTimestamp()
            });

            // 2. Call Gemini
            const genAI = new GoogleGenerativeAI(config.geminiApiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: config.aiSystemPrompt || "당신은 금융, 보험, 대출 전문가인 '제이어스 AI 어시스턴트'입니다. 상급 금융 전문가들이 고객 상담을 위해 정책이나 정보를 검색할 때 도움을 주는 비설 역할을 하며, 금융 관련 정책자금, 보험 약관 분석, 재무 설계 전략을 핵심 위주로 명료하고 전문적으로 답변하세요. 친절하되 신뢰감 있는 전문가의 톤앤매너를 유지하십시오."
            });

            const chat = model.startChat({
                history: aiMessages.slice(-10).map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            });

            const result = await chat.sendMessage(aiInput);
            const response = await result.response;
            const text = response.text();

            // 3. Save AI Answer to Firestore
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'), {
                role: 'assistant',
                content: text,
                createdAt: serverTimestamp()
            });

        } catch (e) {
            console.error(e);
            showAlert("AI 답변 생성 중 오류가 발생했습니다.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const clearChatHistory = async () => {
        if (!window.confirm("이전 채팅 기록을 모두 삭제하시겠습니까?")) return;
        try {
            const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'));
            await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages', d.id))));
            showAlert("채팅 기록이 삭제되었습니다.");
        } catch (e) { showAlert("삭제 실패"); }
    };

    const getCalculatedReward = (lead) => {
        if (lead.isFake) return { owner: 0, platform: 0, marketer: 0 };
        const base = (Number(lead.sellingPrice) || 0) - (Number(lead.customerReward) || 0);
        return { 
            owner: Math.floor(base * 0.35), 
            platform: Math.floor(base * 0.50), 
            marketer: Math.floor(base * 0.15) 
        };
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const midMatch = (l.merchantId || "").toLowerCase().includes(filters.merchantId.toLowerCase());
            const tierMatch = filters.tier === "" || l.tier === filters.tier;
            const consultedMatch = filters.isConsulted === "all" || String(l.isConsulted) === filters.isConsulted;
            const fakeMatch = filters.isFake === "all" || String(l.isFake) === filters.isFake;
            const hqPaidMatch = filters.isRewardPaid === "all" || String(l.isRewardPaid) === filters.isRewardPaid;
            const customerPaidMatch = filters.isCustomerPaid === "all" || String(l.isCustomerPaid || false) === filters.isCustomerPaid;
            const merchantPaidMatch = filters.isMerchantPaid === "all" || String(l.isMerchantPaid || false) === filters.isMerchantPaid;
            const marketerMatch = (l.marketerName || "").toLowerCase().includes(filters.marketerName.toLowerCase());
            const customerMatch = (l.name || "").toLowerCase().includes(filters.customerName.toLowerCase());
            
            let ymMatch = true;
            if (filters.yearMonth && l.createdAt?.toDate) {
                const dateKST = l.createdAt.toDate();
                const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Seoul' }).format(dateKST);
                const month = new Intl.DateTimeFormat('en-US', { month: '2-digit', timeZone: 'Asia/Seoul' }).format(dateKST);
                ymMatch = `${year}-${month}` === filters.yearMonth;
            }
            return midMatch && tierMatch && consultedMatch && fakeMatch && hqPaidMatch && customerPaidMatch && merchantPaidMatch && marketerMatch && customerMatch && ymMatch;
        });
    }, [leads, filters]);

    const totals = useMemo(() => {
        return filteredLeads.reduce((acc, l) => {
            const rewards = getCalculatedReward(l);
            acc.owner += rewards.owner; 
            acc.platform += rewards.platform; 
            acc.marketer += rewards.marketer;
            acc.customerReward += (Number(l.customerReward) || 0);
            acc.totalSales += (Number(l.sellingPrice) || 0);
            return acc;
        }, { owner: 0, platform: 0, marketer: 0, customerReward: 0, totalSales: 0 });
    }, [filteredLeads]);

    const handleStatusUpdate = async (leadId, field, value) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', leadId), { [field]: value });
    };

    const handleDeleteLead = async (leadId) => {
        if (!window.confirm("이 고객 데이터를 영구적으로 삭제하시겠습니까? 삭제 후에는 복구가 불가능합니다.")) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', leadId));
            showAlert("데이터가 정상적으로 삭제되었습니다.");
        } catch (e) {
            showAlert("삭제 실패");
        }
    };

    const handleSaveConfig = async () => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchants', config.merchantId), config);
            if (config.marketerName && config.marketerName.trim() !== "") {
                setIsMarketerLocked(true);
            }
            showAlert("설정이 저장되었습니다.");
        } catch (e) { showAlert("저장 실패"); }
    };

    const handleExportExcel = () => {
        if (leads.length === 0) return showAlert("내보낼 데이터가 없습니다.");
        const filteredLeadsForExport = leads.filter(l => {
            if (adminType === 'merchant' && l.merchantId !== config.merchantId) return false;
            return true;
        });
        const headers = ["No.", "접수일", "고객명", "생년월일", "연락처", "소개자", "등급", "카테고리", "지키고 싶은 자산", "느끼는 위협", "매장명", "영업자", "판매가", "고객리워드", "상담완료", "허위여부", "본사지급상태", "고객지급상태", "매장용(할인)"];
        const rows = filteredLeadsForExport.map((l, i) => {
            const date = l.createdAt?.toDate() ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(l.createdAt.toDate()) : "-";
            const excelInterest = `[${l.category}] ${l.interest}`;

            return [
                filteredLeadsForExport.length - i, date, l.name, l.birth, l.phone, l.region, l.tier, l.category, excelInterest, l.threat || "-",
                l.merchantName, l.marketerName, l.sellingPrice, l.customerReward, l.isConsulted ? "완료" : "대기", l.isFake ? "허위" : "정상", l.isRewardPaid ? "지급완료" : "지급대기", l.isCustomerPaid ? "지급완료" : "지급대기", l.isMerchantPaid ? "지급완료" : "지급대기"
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
        });
        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `로컬링크_정산데이터_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.click();
    };

    const theme = { primary: "indigo", bg: "bg-indigo-600", border: "border-indigo-600" };

    return (
        <div className="w-full max-w-7xl bg-slate-50 min-h-screen p-6 flex flex-col items-center mx-auto">
            <div className="w-full animate-fade-in">
                <header className="flex justify-between items-center mb-6 w-full">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black italic underline decoration-indigo-500 decoration-[6px]">Control Center</h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{adminType === 'master' ? 'Master Admin' : `Merchant: ${config.merchantId}`}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-1.5 ${activeTab === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}><Icon name="clipboard-check" size={12}/> Leads ({filteredLeads.length})</button>
                        <button onClick={() => setActiveTab("ai")} className={`px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-1.5 ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}><Icon name="brain" size={12}/> Financial AI Search</button>
                        <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-1.5 ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}><Icon name="settings" size={12}/> Settings</button>
                        <button onClick={() => { setAdminType(null); setView('survey'); }} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase">Logout</button>
                    </div>
                </header>

                {activeTab === 'list' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-wrap gap-6 items-end justify-between">
                            <div className="flex flex-wrap gap-4 items-end">
                                {adminType === 'master' && (
                                    <>
                                        <div className="w-32">
                                            <label className="text-[9px] font-black text-slate-400 block mb-1">매장 ID</label>
                                            <input className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.merchantId} onChange={e => setFilters({...filters, merchantId: e.target.value})} placeholder="ID 입력" />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-[9px] font-black text-emerald-600 block mb-1">영업자 필터</label>
                                            <input className="w-full p-2 bg-emerald-50 rounded-lg text-[11px] font-bold border border-emerald-100" value={filters.marketerName} onChange={e => setFilters({...filters, marketerName: e.target.value})} placeholder="영업자명" />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-[9px] font-black text-blue-600 block mb-1">고객 필터</label>
                                            <input className="w-full p-2 bg-blue-50 rounded-lg text-[11px] font-bold border border-blue-100" value={filters.customerName} onChange={e => setFilters({...filters, customerName: e.target.value})} placeholder="고객명 입력" />
                                        </div>
                                    </>
                                )}
                                <div className="w-40">
                                    <label className="text-[9px] font-black text-indigo-600 block mb-1 uppercase flex items-center gap-1"><Icon name="calendar" size={10} /> 접수년월 필터</label>
                                    <input type="month" className="w-full p-2 bg-indigo-50/50 rounded-lg text-[11px] font-black border border-indigo-100" value={filters.yearMonth} onChange={e => setFilters({...filters, yearMonth: e.target.value})} />
                                </div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">등급</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.tier} onChange={e => setFilters({...filters, tier: e.target.value})}><option value="">전체</option><option value="standard">Standard</option><option value="premium">Premium</option></select></div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">상담여부</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.isConsulted} onChange={e => setFilters({...filters, isConsulted: e.target.value})}><option value="all">전체</option><option value="true">완료</option><option value="false">대기</option></select></div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">허위여부</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.isFake} onChange={e => setFilters({...filters, isFake: e.target.value})}><option value="all">전체</option><option value="true">허위</option><option value="false">정상</option></select></div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">본사지급상태</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.isRewardPaid} onChange={e => setFilters({...filters, isRewardPaid: e.target.value})}><option value="all">전체</option><option value="true">지급완료</option><option value="false">지급대기</option></select></div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">고객지급상태</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.isCustomerPaid} onChange={e => setFilters({...filters, isCustomerPaid: e.target.value})}><option value="all">전체</option><option value="true">지급완료</option><option value="false">지급대기</option></select></div>
                                <div className="w-24"><label className="text-[9px] font-black text-slate-400 block mb-1">매장용(할인)</label><select className="w-full p-2 bg-slate-50 rounded-lg text-[11px] font-bold border border-slate-100" value={filters.isMerchantPaid} onChange={e => setFilters({...filters, isMerchantPaid: e.target.value})}><option value="all">전체</option><option value="true">지급완료</option><option value="false">지급대기</option></select></div>
                            </div>
                            <button onClick={handleExportExcel} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg h-[35px] hover:bg-black transition-all"><Icon name="share" size={14}/> Excel Export</button>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 w-full overflow-hidden">
                            <div className="admin-table-container">
                                <table className="w-full text-left text-[11px] font-bold">
                                    <thead className="bg-slate-900 text-white text-[9px] font-black uppercase italic">
                                        <tr>
                                            <th className="p-4 w-12">No.</th>
                                            <th className="p-4">접수일</th>
                                            <th className="p-4">고객/연락처/생년월일</th>
                                            <th className="p-4">등급/소개자</th>
                                            {adminType === 'master' && <th className="p-4">선택자산</th>}
                                            <th className="p-4">매장 ID</th>
                                            <th className="p-4">영업자</th>
                                            <th className="p-4">상담/허위</th>
                                            <th className="p-4">판매금액</th>
                                            <th className="p-4">고객대금</th>
                                            <th className="p-4">리워드 정산</th>
                                            <th className="p-4">본사지급상태</th>
                                            <th className="p-4 text-center">고객지급상태</th>
                                            <th className="p-4">매장용(할인)</th>
                                            {adminType === 'master' && <th className="p-4 text-center">관리</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.map((l, i) => { 
                                            const rewards = getCalculatedReward(l); 
                                            const dateOnly = l.createdAt?.toDate() ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(l.createdAt.toDate()) : "-"; 
                                            return (
                                                <tr key={l.id} className={`border-b border-slate-50 ${l.isFake ? 'bg-rose-50 opacity-60' : ''}`}>
                                                    <td className="p-4 text-slate-400 italic">{filteredLeads.length - i}</td>
                                                    <td className="p-4 text-slate-500 font-medium">{dateOnly}</td>
                                                    <td className="p-4">
                                                        {l.name}<br/>
                                                        <span className="text-slate-400 font-medium">{l.phone}</span><br/>
                                                        <span className="text-slate-400 font-medium">{l.birth}</span>
                                                    </td>
                                                    <td className="p-4 uppercase">{l.tier}<br/><span className="text-slate-400 font-medium">{l.region}</span></td>
                                                    {adminType === 'master' && (
                                                        <td className="p-4 text-slate-500 font-medium break-keep">
                                                            <span className="text-[10px] text-indigo-400 font-bold block mb-0.5">[{l.category || "기능분류"}]</span>
                                                            {l.interest}
                                                        </td>
                                                    )}
                                                    <td className="p-4 font-black text-indigo-600 italic">{l.merchantId}</td>
                                                    <td className="p-4 text-emerald-600 font-black italic">{l.marketerName}</td>
                                                    <td className="p-4 space-y-1">
                                                        {adminType === 'master' ? (
                                                            <>
                                                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={l.isConsulted} onChange={(e) => handleStatusUpdate(l.id, 'isConsulted', e.target.checked)} /> 상담완료</label>
                                                                <label className="flex items-center gap-1 cursor-pointer text-rose-500"><input type="checkbox" checked={l.isFake} onChange={(e) => handleStatusUpdate(l.id, 'isFake', e.target.checked)} /> 허위정보</label>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-1"><Icon name={l.isConsulted ? "check" : "loader"} size={12} className={l.isConsulted ? "text-indigo-600" : "text-slate-300"} /> <span className={l.isConsulted ? "text-indigo-600" : "text-slate-400"}>상담{l.isConsulted ? '완료' : '대기'}</span></div>
                                                                {l.isFake && <div className="flex items-center gap-1 text-rose-500"><Icon name="alert-circle" size={12} /> 허위정보</div>}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {adminType === 'master' ? (
                                                            <div className="flex items-center gap-1">
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 p-1.5 border rounded-lg bg-slate-50 font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                                                                    defaultValue={l.sellingPrice} 
                                                                    onBlur={(e) => handleStatusUpdate(l.id, 'sellingPrice', Number(e.target.value))}
                                                                />
                                                                <span className="text-[9px] text-slate-400 font-black uppercase">won</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-black text-slate-700">{Number(l.sellingPrice).toLocaleString()}원</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {adminType === 'master' ? (
                                                            <div className="flex items-center gap-1">
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 p-1.5 border rounded-lg bg-slate-50 font-black text-rose-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                                                                    defaultValue={l.customerReward} 
                                                                    onBlur={(e) => handleStatusUpdate(l.id, 'customerReward', Number(e.target.value))}
                                                                />
                                                                <span className="text-[9px] text-slate-400 font-black uppercase">won</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-black text-slate-700">{Number(l.customerReward).toLocaleString()}원</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-indigo-600 font-black">매장: {rewards.owner.toLocaleString()}원</span>
                                                            <span className="text-slate-500 text-[10px]">플랫폼: {rewards.platform.toLocaleString()}원</span>
                                                            <span className="text-emerald-600 text-[10px]">영업: {rewards.marketer.toLocaleString()}원</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {adminType === 'master' ? (
                                                            <button onClick={() => handleStatusUpdate(l.id, 'isRewardPaid', !l.isRewardPaid)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${l.isRewardPaid ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{l.isRewardPaid ? '지급완료' : '지급대기'}</button>
                                                        ) : (
                                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${l.isRewardPaid ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{l.isRewardPaid ? '지급완료' : '지급대기'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col items-center gap-2">
                                                            {adminType === 'master' ? (
                                                                <button onClick={() => handleStatusUpdate(l.id, 'isCustomerPaid', !l.isCustomerPaid)} className={`w-full px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${l.isCustomerPaid ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{l.isCustomerPaid ? '지급완료' : '지급대기'}</button>
                                                            ) : (
                                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${l.isCustomerPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{l.isCustomerPaid ? '지급완료' : '지급대기'}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={() => handleStatusUpdate(l.id, 'isMerchantPaid', !l.isMerchantPaid)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${l.isMerchantPaid ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{l.isMerchantPaid ? '지급완료' : '지급대기'}</button>
                                                    </td>
                                                    {adminType === 'master' && (
                                                        <td className="p-4 text-center">
                                                            <button 
                                                                onClick={() => handleDeleteLead(l.id)} 
                                                                className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-all shadow-sm"
                                                                title="데이터 삭제"
                                                            >
                                                                <Icon name="trash" size={14} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 p-6 bg-slate-900 rounded-2xl flex flex-wrap justify-between items-center text-white gap-6">
                                <div className="flex wrap gap-8">
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Count</p><p className="text-xl font-black italic">{filteredLeads.length} 건</p></div>
                                    <div className="border-l border-white/10 pl-8"><p className="text-[10px] font-black text-rose-400 uppercase mb-1">Total Customer Reward</p><p className="text-xl font-black text-rose-400">{totals.customerReward.toLocaleString()} 원</p></div>
                                    <div className="border-l border-white/10 pl-8"><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Total Merchant</p><p className="text-xl font-black text-indigo-400">{totals.owner.toLocaleString()} 원</p></div>
                                    <div className="border-l border-white/10 pl-8"><p className="text-[10px] font-black text-slate-300 uppercase mb-1">Total Platform</p><p className="text-xl font-black text-white">{totals.platform.toLocaleString()} 원</p></div>
                                    <div className="border-l border-white/10 pl-8"><p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Total Marketer</p><p className="text-xl font-black text-emerald-400">{totals.marketer.toLocaleString()} 원</p></div>
                                    <div className="border-l border-white/10 pl-8"><p className="text-[10px] font-black text-yellow-400 uppercase mb-1">Total Sales Revenue</p><p className="text-2xl font-black text-yellow-400">{totals.totalSales.toLocaleString()} 원</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in h-[700px]">
                        {/* Sidebar / History List */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black italic uppercase tracking-tighter text-indigo-600">AI Search History</h3>
                                <button onClick={clearChatHistory} className="text-slate-300 hover:text-rose-500 transition-colors"><Icon name="trash" size={14}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {aiMessages.filter(m => m.role === 'user').reverse().map((msg, i) => (
                                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50 transition-all cursor-pointer group">
                                        <p className="text-[11px] font-bold text-slate-600 line-clamp-2">{msg.content}</p>
                                        <p className="text-[9px] text-slate-300 mt-1 uppercase font-bold">{msg.createdAt?.toDate ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).format(msg.createdAt.toDate()) : "Just now"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden relative">
                            {/* Chat Header */}
                            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-indigo-600/5">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                    <Icon name="brain" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black tracking-tight">Financial Expert AI Assistant</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Powered by Gemini 2.0 Flash</p>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {aiMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <Icon name="sparkles" size={48} className="text-indigo-400 mb-4" />
                                        <p className="font-bold text-slate-400">질문을 입력하여 금융 전문가 AI의 도움을 받아보세요.</p>
                                        <p className="text-[11px] mt-2">보험, 대출, 정책자금 등 무엇이든 물어보실 수 있습니다.</p>
                                    </div>
                                ) : (
                                    aiMessages.map((msg, i) => (
                                        <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-[1.5rem] p-5 text-[14px] leading-relaxed shadow-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-slate-900 text-white rounded-tr-none' 
                                                    : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none font-medium'
                                            }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isAiLoading && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none italic text-slate-400 text-xs font-bold">
                                            AI가 분석 중입니다...
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat input */}
                            <div className="p-5 border-t border-slate-100">
                                <div className="flex items-center gap-2 bg-slate-50 rounded-[1.5rem] p-2 border border-slate-200">
                                    <input 
                                        type="text" 
                                        value={aiInput}
                                        onChange={e => setAiInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                                        placeholder="보험 약관 분석이나 정책자금 정보를 물어보세요..." 
                                        className="flex-1 bg-transparent px-4 py-2 text-sm font-bold focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleAiSend}
                                        disabled={isAiLoading}
                                        className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"
                                    >
                                        <Icon name="send" size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in pb-20">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                            <h3 className="font-black mb-6 italic text-indigo-600 uppercase tracking-tighter">Category & Theme Settings</h3>
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-900 rounded-3xl">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase italic mb-3 flex items-center gap-1.5"><Icon name="settings" size={12}/> 매장 카테고리 선택</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfig({...config, themeType: 'general'})} className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase transition-all ${config.themeType === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/30 border border-white/10'}`}>카테고리 1 (일반매장)</button>
                                        <button onClick={() => setConfig({...config, themeType: 'medical'})} className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase transition-all ${config.themeType === 'medical' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-white/30 border border-white/10'}`}>카테고리 2 (병원/의원)</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1.5"><Icon name="edit" size={12}/> Content Customization</h4>
                                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded italic">태그 지원: [#코드]내용[/#]</span>
                                    </div>
                                    {config.themeType === 'general' ? (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-1 block">메인 타이틀 (전문가 명언 등)</label>
                                                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs h-24 resize-none" value={config.heroTitle} onChange={e => setConfig({...config, heroTitle: e.target.value})} placeholder="[#PRIMARY]특정글자[/#] 형식으로 개별 색상 지정 가능" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-1 block">서브 텍스트 (추가 안내)</label>
                                                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs h-32 resize-none" value={config.heroSubText} onChange={e => setConfig({...config, heroSubText: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-1 block flex items-center gap-1"><Icon name="user" size={10} /> 전문가 이력 및 자기소개</label>
                                                <textarea className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-[13px] h-48 resize-none text-slate-800" value={config.expertProfile} onChange={e => setConfig({...config, expertProfile: e.target.value})} placeholder="이력 및 자기소개를 자유롭게 입력하세요. (태그 지원 가능)" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-1 block">하단 법적 안내 / 감사 멘트</label>
                                                <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs h-28 resize-none" value={config.generalThanks} onChange={e => setConfig({...config, generalThanks: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-1 block">신청 카테고리 (중복선택) 항목 설정</label>
                                                <textarea className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-[13px] h-32 resize-none text-slate-800" value={config.categoryOptions} onChange={e => setConfig({...config, categoryOptions: e.target.value})} placeholder="항목을 '|' (버티컬 바) 기호로 구분하여 입력하세요." />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 ml-1 uppercase mb-1 block">Main Title (병원/의원)</label>
                                                <textarea className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-xs h-24 resize-none" value={config.heroTitleMedical} onChange={e => setConfig({...config, heroTitleMedical: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 ml-1 uppercase mb-1 block">Sub Text (병원/의원)</label>
                                                <textarea className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-xs h-32 resize-none" value={config.heroSubTextMedical} onChange={e => setConfig({...config, heroSubTextMedical: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-700 ml-1 uppercase mb-1 block">Legal Notice (감사 멘트)</label>
                                                <textarea className="w-full p-4 bg-emerald-100/50 border border-emerald-200 rounded-xl font-bold text-xs h-28 resize-none" value={config.medicalThanks} onChange={e => setConfig({...config, medicalThanks: e.target.value})} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button onClick={handleSaveConfig} className={`w-full ${theme.bg} text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all`}><Icon name="save" size={16}/> Save All Category Settings</button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit space-y-8">
                            <div className="h-fit">
                                <h3 className="font-black mb-6 italic text-indigo-600 uppercase tracking-tighter flex items-center gap-2">
                                    <Icon name="brain" size={18} /> Financial AI Configuration
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-2 block italic">Gemini API Key</label>
                                        <input 
                                            type="password" 
                                            className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-black text-xs text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                                            value={config.geminiApiKey || ''} 
                                            onChange={e => setConfig({...config, geminiApiKey: e.target.value})} 
                                            placeholder="AIzaSy..."
                                        />
                                        <p className="text-[9px] text-slate-400 mt-2 ml-1">AI 검색 기능을 사용하기 위해 구글 제미나이 API 키가 필요합니다.</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-2 block italic">Advanced System Prompt (AI Gem)</label>
                                        <textarea 
                                            className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-xs h-40 resize-none text-slate-800" 
                                            value={config.aiSystemPrompt || ''} 
                                            onChange={e => setConfig({...config, aiSystemPrompt: e.target.value})} 
                                            placeholder="AI의 성격과 전문직 지식을 정의하세요 (Gems 역할)"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-2 ml-1">이 프롬프트가 AI의 상담 답변 품질(Gems 효과)을 결정합니다.</p>
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Save AI Config</button>
                                </div>
                                
                                <h3 className="font-black mt-12 mb-6 italic text-rose-600 uppercase tracking-tighter">Pricing & Security</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-2 block">시스템 관리 이름</label><input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" value={config.merchantName} onChange={e => setConfig({...config, merchantName: e.target.value})} /></div>
                                            <div><label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-2 block">영업자명 (DB 저장용)</label><input className={`w-full p-4 rounded-xl font-bold text-xs border ${isMarketerLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white border-slate-100'}`} value={config.marketerName} onChange={e => !isMarketerLocked && setConfig({...config, marketerName: e.target.value})} disabled={isMarketerLocked} placeholder="영업자 성함" /></div>
                                        </div>
                                        <div><label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-2 block">전문가(설계사) 배지명</label><input className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-xs text-indigo-900" value={config.expertName || ''} onChange={e => setConfig({...config, expertName: e.target.value})} placeholder="ex) 김전문 수석팀장" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-2 block italic">Std Price (판매가)</label>
                                            <input 
                                                type="number" 
                                                className={`w-full p-4 rounded-xl font-black text-xs border ${adminType === 'master' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`} 
                                                value={config.stdPrice} 
                                                onChange={e => adminType === 'master' && setConfig({...config, stdPrice: Number(e.target.value)})} 
                                                disabled={adminType !== 'master'} 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-rose-600 ml-1 uppercase mb-2 block italic">Pre Price (판매가)</label>
                                            <input 
                                                type="number" 
                                                className={`w-full p-4 rounded-xl font-black text-xs border ${adminType === 'master' ? 'bg-rose-50 border-rose-100' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`} 
                                                value={config.prePrice} 
                                                onChange={e => adminType === 'master' && setConfig({...config, prePrice: Number(e.target.value)})} 
                                                disabled={adminType !== 'master'} 
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-full bg-slate-900/5 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-dashed border-slate-200">Security Policy Active</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
