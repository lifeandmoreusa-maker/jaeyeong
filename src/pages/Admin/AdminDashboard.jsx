import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { collection, addDoc, onSnapshot, doc, updateDoc, setDoc, deleteDoc, db, serverTimestamp, query, getDocs } from '../../firebase/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AdminDashboard({ adminType, setAdminType, user, config, setConfig, setView, appId }) {
    const [leads, setLeads] = useState([]);
    const [activeTab, setActiveTab] = useState("list");
    
    // AI Chat States
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef(null);

    const showAlert = (msg) => window.alert(msg);

    const [filters, setFilters] = useState({
        customerName: "", 
        referrer: "", // 소개자 필터 추가
        yearMonth: "",
        isConsulted: "all"
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

            // 2. Chat Listener
            const qChat = collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages');
            const unsubChat = onSnapshot(query(qChat), (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAiMessages(msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
            });

            return () => { unsubLeads(); unsubChat(); };
        }
    }, [adminType, user, config.merchantId, appId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiMessages]);

    // AI Logic
    const handleAiSend = async () => {
        if (!aiInput.trim()) return;
        // 환경 변수가 없을 경우 사용할 백업 서비스 키
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC38F9Pj-U8Hk3LMAesfqPP2CgwWkth-X8'; 
        
        const userMsg = { role: 'user', content: aiInput };
        setAiInput("");
        setIsAiLoading(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'), {
                role: 'user', content: aiInput, createdAt: serverTimestamp()
            });
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash-exp",
                systemInstruction: "당신은 금융 전문가의 친절하고 전문적인 AI 비서입니다. 핵심 위주로 명료하고 전문적으로 답변을 제공하세요."
            });
            const chatHistory = aiMessages.map(m => ({ 
                role: m.role === 'user' ? 'user' : 'model', 
                parts: [{ text: m.content }] 
            }));
            const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
            const validHistory = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

            // 더 안정적인 generateContent 직접 호출 방식 (v1beta 의존성 회피)
            const result = await model.generateContent({ 
                contents: [...validHistory, { role: 'user', parts: [{ text: aiInput }] }] 
            });
            const response = await result.response;
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'), {
                role: 'assistant', content: response.text(), createdAt: serverTimestamp()
            });
        } catch (e) { 
            console.error("AI Assistant Error:", e);
            showAlert("AI 시스템 오류가 발생했습니다.\n\n오류 내용: " + e.message + "\n\n(API 키 권한 혹은 네트워크 설정을 확인해 주세요)"); 
        }
        setIsAiLoading(false);
    };

    const clearChatHistory = async () => {
        if (!window.confirm("채팅 기록을 삭제하시겠습니까?")) return;
        const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages'));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_chats', config.merchantId, 'messages', d.id))));
        showAlert("기록이 삭제되었습니다.");
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const customerMatch = (l.name || "").toLowerCase().includes(filters.customerName.toLowerCase());
            const referrerMatch = (l.region || "").toLowerCase().includes(filters.referrer.toLowerCase()); // 소개자 필터링
            const consultedMatch = filters.isConsulted === "all" 
                || (filters.isConsulted === "true" && (l.status === "상담완료" || l.isConsulted === true)) 
                || (filters.isConsulted === "false" && (l.status === "대기" || (!l.status && l.isConsulted === false)));
            
            let ymMatch = true;
            if (filters.yearMonth && l.createdAt?.toDate) {
                const dateKST = l.createdAt.toDate();
                const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Seoul' }).format(dateKST);
                const month = new Intl.DateTimeFormat('en-US', { month: '2-digit', timeZone: 'Asia/Seoul' }).format(dateKST);
                ymMatch = `${year}-${month}` === filters.yearMonth;
            }
            return customerMatch && referrerMatch && consultedMatch && ymMatch;
        });
    }, [leads, filters]);

    const handleStatusUpdate = async (leadId, field, value) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', leadId), { [field]: value });
    };

    const handleDeleteLead = async (leadId) => {
        if (!window.confirm("신청 데이터를 삭제하시겠습니까?")) return;
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', leadId));
        showAlert("삭제되었습니다.");
    };

    const handleExportExcel = () => {
        if (filteredLeads.length === 0) return showAlert("내보낼 데이터가 없습니다.");
        const headers = ["No.", "접수일", "고객명", "연락처", "생년월일", "소개자명", "상담신청내용", "관리상태"];
        const rows = filteredLeads.map((l, i) => {
            const date = l.createdAt?.toDate() ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(l.createdAt.toDate()) : "-";
            const reqInfo = `[${l.category}] ${l.interest} / 가능시간: ${l.availableTime || "미지정"}`;
            const statusStr = l.status || (l.isConsulted ? "상담완료" : "대기");
            return [
                filteredLeads.length - i, date, l.name, l.phone, l.birth, l.region, reqInfo, statusStr
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
        });
        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `상담신청_리스트_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const handleSaveConfig = async () => {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'merchants', config.merchantId), config);
        showAlert("설정이 저장되었습니다.");
    };

    return (
        <div className="w-full max-w-6xl bg-slate-50 min-h-screen p-6 flex flex-col items-center mx-auto">
            <div className="w-full animate-fade-in">
                <header className="flex justify-between items-center mb-8 w-full border-b pb-6 border-slate-200">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                            <h1 className="text-xl font-black italic tracking-tighter uppercase">Expert Management Center</h1>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in: {config.expertName || "System Admin"}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab("list")} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}><Icon name="clipboard-check" size={12}/> Consultation Leads</button>
                        <button onClick={() => setActiveTab("ai")} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}><Icon name="brain" size={12}/> AI Analysis</button>
                        <button onClick={() => setActiveTab("settings")} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}><Icon name="settings" size={12}/> Profile Config</button>
                        <button onClick={() => { setAdminType(null); setView('survey'); }} className="px-5 py-2.5 bg-rose-50 text-rose-500 rounded-2xl text-[11px] font-black uppercase hover:bg-rose-100 transition-all">Logout</button>
                    </div>
                </header>

                {activeTab === 'list' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Improved Filter Bar */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-wrap gap-6 items-end justify-between">
                            <div className="flex flex-wrap gap-5 items-end">
                                <div className="w-40">
                                    <label className="text-[9px] font-black text-indigo-600 block mb-2 uppercase tracking-widest">Customer Name</label>
                                    <div className="relative">
                                        <input className="w-full p-3 pl-8 bg-slate-50 rounded-xl text-[12px] font-bold border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={filters.customerName} onChange={e => setFilters({...filters, customerName: e.target.value})} placeholder="성함 검색" />
                                        <Icon name="search" size={12} className="absolute left-3 top-3.5 text-slate-300" />
                                    </div>
                                </div>
                                <div className="w-40">
                                    <label className="text-[9px] font-black text-emerald-600 block mb-2 uppercase tracking-widest">Referrer (소개자)</label>
                                    <div className="relative">
                                        <input className="w-full p-3 pl-8 bg-emerald-50/30 rounded-xl text-[12px] font-bold border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={filters.referrer} onChange={e => setFilters({...filters, referrer: e.target.value})} placeholder="소개자명 검색" />
                                        <Icon name="user" size={12} className="absolute left-3 top-3.5 text-emerald-300" />
                                    </div>
                                </div>
                                <div className="w-44">
                                    <label className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Registration Date</label>
                                    <input type="month" className="w-full p-3 bg-slate-50 rounded-xl text-[12px] font-black border border-slate-100" value={filters.yearMonth} onChange={e => setFilters({...filters, yearMonth: e.target.value})} />
                                </div>
                                <div className="w-32">
                                    <label className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Status</label>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl text-[12px] font-bold border border-slate-100 focus:outline-none" value={filters.isConsulted} onChange={e => setFilters({...filters, isConsulted: e.target.value})}>
                                        <option value="all">전체 상태</option>
                                        <option value="true">상담완료</option>
                                        <option value="false">상담대기</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleExportExcel} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all"><Icon name="share" size={14}/> Download Excel</button>
                        </div>

                        {/* Simplified Clean Table */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 w-full overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[12px] font-bold">
                                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase italic">
                                        <tr>
                                            <th className="p-5 w-16">No.</th>
                                            <th className="p-5">접수일</th>
                                            <th className="p-5">고객명 (연락처/생년월일)</th>
                                            <th className="p-5">소개자명</th>
                                            <th className="p-5">상담 신청 정보 및 개별 요청</th>
                                            <th className="p-5 w-32">상담상태</th>
                                            <th className="p-5 w-16 text-center">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredLeads.map((l, i) => { 
                                            const dateKST = l.createdAt?.toDate ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: 'Asia/Seoul' }).format(l.createdAt.toDate()) : "-"; 
                                            return (
                                                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5 text-slate-300 italic font-medium">{filteredLeads.length - i}</td>
                                                    <td className="p-5 text-slate-500">{dateKST}</td>
                                                    <td className="p-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-800">{l.name}</span>
                                                            <span className="text-[11px] text-indigo-500 tracking-tight">{l.phone} / {l.birth}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">{l.region || "-"}</span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded italic font-black uppercase">{l.category}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1"><Icon name="clock" size={10}/> {l.availableTime || "시간 미지정"}</span>
                                                            </div>
                                                            <p className="text-slate-600 text-[13px] leading-relaxed break-keep">
                                                                <span className="text-indigo-400 font-black mr-1">관심사:</span> {l.interest}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <select 
                                                            value={l.status || (l.isConsulted ? "상담완료" : "대기")}
                                                            onChange={(e) => handleStatusUpdate(l.id, 'status', e.target.value)}
                                                            className={`w-full p-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm outline-none border-0 cursor-pointer ${
                                                                (l.status === '상담완료' || (!l.status && l.isConsulted)) 
                                                                    ? 'bg-emerald-500 text-white' 
                                                                    : l.status === '진행중' ? 'bg-indigo-600 text-white'
                                                                    : l.status === '부재중' ? 'bg-amber-500 text-white'
                                                                    : l.status === '보류' ? 'bg-slate-400 text-white'
                                                                    : 'bg-indigo-50 text-indigo-600'
                                                            }`}
                                                        >
                                                            <option value="대기">대기</option>
                                                            <option value="진행중">진행중</option>
                                                            <option value="상담완료">상담완료</option>
                                                            <option value="부재중">부재중</option>
                                                            <option value="보류">보류</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <button onClick={() => handleDeleteLead(l.id)} className="p-2.5 text-slate-200 hover:text-rose-500 transition-colors">
                                                            <Icon name="trash" size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Leads Received</span>
                                        <span className="text-2xl font-black italic text-slate-900">{filteredLeads.length} 건</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-100 mx-2"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Pending / Ongoing</span>
                                        <span className="text-2xl font-black italic text-indigo-600">{filteredLeads.filter(l => (l.status === '대기' || l.status === '진행중') || (!l.status && !l.isConsulted)).length} 건</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex items-center gap-3">
                                    <Icon name="info" size={16} className="text-indigo-400" />
                                    <p className="text-[11px] font-bold opacity-80">관리자님, 새로운 신청 건이 들어오면 실시간으로 리스트가 업데이트됩니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in h-[700px]">
                        <div className="lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black italic uppercase tracking-tighter text-indigo-600 flex items-center gap-2"><Icon name="clock" size={14}/> Previous Analysis</h3>
                                <button onClick={clearChatHistory} className="text-slate-200 hover:text-rose-500 transition-colors"><Icon name="trash" size={16}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {aiMessages.filter(m => m.role === 'user').reverse().map((msg, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 transition-all cursor-pointer group">
                                        <p className="text-[12px] font-bold text-slate-700 line-clamp-2 leading-snug">{msg.content}</p>
                                        <p className="text-[9px] text-slate-300 mt-2 uppercase font-black">{msg.createdAt?.toDate ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).format(msg.createdAt.toDate()) : "Processing..."}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden relative">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-indigo-600/5">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                    <Icon name="brain" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-md font-black tracking-tight italic uppercase">Financial AI Studio</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Consultation Intelligence • Gemini 2.0</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {aiMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                            <Icon name="sparkles" size={40} className="text-indigo-400" />
                                        </div>
                                        <p className="font-black text-slate-400 text-lg italic tracking-tight uppercase">Analyze Consultation Data</p>
                                        <p className="text-[12px] mt-2 text-slate-300 font-medium">보험설계, 대출 정책, 상담 준비 등 무엇이든 물어보세요.</p>
                                    </div>
                                ) : (
                                    aiMessages.map((msg, i) => (
                                        <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-[2rem] p-6 text-[14px] leading-relaxed shadow-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-slate-900 text-white rounded-tr-none' 
                                                    : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none font-medium'
                                            }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isAiLoading && <div className="flex justify-start animate-pulse"><div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-none italic text-slate-300 text-xs font-black">GenAI is thinking...</div></div>}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-8 border-t border-slate-100">
                                <div className="flex items-center gap-3 bg-slate-50 rounded-[2rem] p-2 border border-slate-200">
                                    <input 
                                        type="text" 
                                        value={aiInput}
                                        onChange={e => setAiInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                                        placeholder="상담 내용을 넣거나 금융 정책에 대해 물어보세요..." 
                                        className="flex-1 bg-transparent px-6 py-3 text-sm font-bold focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleAiSend}
                                        disabled={isAiLoading}
                                        className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-90 transition-all disabled:opacity-30"
                                    >
                                        <Icon name="send" size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-fade-in pb-20">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
                            <h3 className="text-sm font-black mb-8 italic text-indigo-600 uppercase tracking-tighter flex items-center gap-2"><Icon name="edit" size={16}/> Profile & Content Setup</h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-3 block">My Profile Photo Name</label>
                                    <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" value="내사진.png" disabled title="고정값입니다 (public 폴더 내 파일명)" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-3 block italic tracking-widest">Expert Badge Name</label>
                                    <input className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-sm text-indigo-900" value={config.expertName || ''} onChange={e => setConfig({...config, expertName: e.target.value})} placeholder="ex) 김전문 수석 재무설계사" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase mb-3 block">Expert Bio (Career History)</label>
                                    <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[13px] h-48 resize-none text-slate-700 leading-relaxed" value={config.expertProfile} onChange={e => setConfig({...config, expertProfile: e.target.value})} placeholder="이력 및 자기소개를 자유롭게 입력하세요." />
                                </div>
                                <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all"><Icon name="save" size={18}/> Update Profile</button>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
                            <h3 className="text-sm font-black mb-8 italic text-indigo-600 uppercase tracking-tighter flex items-center gap-2"><Icon name="brain" size={18}/> Financial AI Configuration</h3>
                            <div className="space-y-8">
                                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20"><Icon name="shield" size={40} className="text-indigo-400" /></div>
                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Service Status</p>
                                    <p className="text-sm font-black text-indigo-900 underline decoration-indigo-400">Gemini AI Premium Active</p>
                                    <p className="text-[9px] text-indigo-400 mt-2 font-bold leading-relaxed italic">통합 유료 서비스가 적용되어 있습니다. 별도의 API 키 설정 없이 즉시 사용 가능합니다.</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 ml-1 uppercase mb-3 block italic tracking-widest">Assistant Role (AI Gems)</label>
                                    <textarea 
                                        className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold text-sm h-48 resize-none text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                        value={config.aiSystemPrompt || ''} 
                                        onChange={e => setConfig({...config, aiSystemPrompt: e.target.value})} 
                                        placeholder="AI 어시스턴트의 성격(Gems)을 정의하여 상담 품질을 높이세요"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-2 ml-1 italic font-medium">※ 역할을 구체적으로 적을수록 더 정확한 상담 지원이 가능합니다.</p>
                                </div>
                                <button onClick={handleSaveConfig} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Save AI Config</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
