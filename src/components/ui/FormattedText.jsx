export const FormattedText = ({ text, isMedicalTheme = false }) => {
    if (!text) return null;
    const regex = /\[(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|#BLUE_GRAD|#RED_U|#PRIMARY)\](.*?)\[\/#\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        
        const colorCode = match[1];
        const content = match[2];
        
        if (colorCode === "#BLUE_GRAD") {
            parts.push(
                <span key={match.index} className={`${isMedicalTheme ? 'medical-gradient-text' : 'blue-gradient-text'} font-black`}>
                    {content}
                </span>
            );
        } else if (colorCode === "#RED_U") {
            parts.push(
                <span key={match.index} className="text-rose-600 font-black text-[1.1em] underline decoration-2 underline-offset-4">
                    {content}
                </span>
            );
        } else if (colorCode === "#PRIMARY") {
            parts.push(
                <span key={match.index} className={`${isMedicalTheme ? 'text-emerald-600' : 'text-indigo-600'} font-black`}>
                    {content}
                </span>
            );
        } else {
            parts.push(
                <span key={match.index} style={{ color: colorCode }}>
                    {content}
                </span>
            );
        }
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
};
