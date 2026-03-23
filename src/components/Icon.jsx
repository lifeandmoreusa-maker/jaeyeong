import React from 'react';
import { 
    Loader2, Database, Target, Gem, ChevronRight, ArrowLeft, Check, Send, Shield, User,
    Lock, AlertCircle, Share2, ClipboardCheck, Save, Edit, Calendar, RefreshCw, Trash2,
    Settings, Pencil, Users, Wallet, MessageCircle, Sparkles, Brain, Heart, Home, Car,
    Building2, Coins, Receipt, Scale, Activity, FileText, TrendingDown, Music, VolumeX,
    TrendingUp, Search, Gift, Tv, Info, Clock, MapPin, ExternalLink
} from 'lucide-react';

const iconMap = {
    "loader": Loader2,
    "database": Database,
    "target": Target,
    "gem": Gem,
    "chevron-right": ChevronRight,
    "arrow-left": ArrowLeft,
    "check": Check,
    "send": Send,
    "shield": Shield,
    "user": User,
    "lock": Lock,
    "alert-circle": AlertCircle,
    "share": Share2,
    "clipboard-check": ClipboardCheck,
    "save": Save,
    "edit": Edit,
    "calendar": Calendar,
    "refresh": RefreshCw,
    "trash": Trash2,
    "settings": Settings,
    "pencil": Pencil,
    "users": Users,
    "wallet": Wallet,
    "message": MessageCircle,
    "sparkles": Sparkles,
    "brain": Brain,
    "heart": Heart,
    "home": Home,
    "car": Car,
    "building": Building2,
    "coins": Coins,
    "receipt": Receipt,
    "scale": Scale,
    "activity": Activity,
    "bandage": Heart,       // Fallback for bandage if not in lucide-react (or import specially)
    "file-tax": FileText,
    "trending-down": TrendingDown,
    "music": Music,
    "volume-x": VolumeX,
    "trending-up": TrendingUp,
    "search": Search,
    "gift": Gift,
    "tv": Tv,
    "info": Info,
    "clock": Clock,
    "map-pin": MapPin,
    "external-link": ExternalLink
};

export const Icon = ({ name, size = 24, className = "" }) => {
    const LucideIcon = iconMap[name];
    if (!LucideIcon) return null;

    let extraClass = className;
    if (name === 'loader') extraClass += ' spinner';

    return (
        <span className={`inline-block ${extraClass}`} style={{ width: size, height: size }}>
            <LucideIcon size={size} strokeWidth={2} />
        </span>
    );
};
