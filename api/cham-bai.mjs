export default async function handler(req, res) {
    // Mở khóa CORS cho Frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ score: 0, feedback: "Chỉ chấp nhận POST" });

    const { type, deBai, barem, tongDiem, baiLam, code, testStatus } = req.body;
    
    // Lấy API Key từ Vercel
    const API_KEY = process.env.GEMINI_API_KEY; 
    if (!API_KEY) return res.status(500).json({ score: 0, feedback: "Server thiếu API Key!" });

    let promptText = "";
    if (type === "essay") {
        promptText = `Bạn là Giám khảo. Đề: ${deBai}. Barem: ${barem}. Tổng điểm: ${tongDiem}. Bài làm: ${baiLam}. Bắt buộc trả về JSON: {"score": số, "feedback": "nhận xét"}`;
    } else {
        promptText = `Bạn là Giám khảo Lập trình. Đề: ${deBai}. Barem: ${barem}. Tổng điểm: ${tongDiem}. Test: ${testStatus?.isPass?'Đúng':'Sai'}. Code: ${code}. Bắt buộc trả về JSON: {"score": số, "feedback": "nhận xét"}`;
    }

    // Sử dụng model mới nhất
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });
        const data = await response.json();

        // Xử lý kết quả trả về
        let rawText = data.candidates[0].content.parts[0].text;
        let cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        let resultObj = JSON.parse(cleanText);

        return res.status(200).json({
            score: Number(resultObj.score) || 0,
            feedback: String(resultObj.feedback) || ""
        });
    } catch (e) {
        return res.status(500).json({ score: 0, feedback: "Lỗi AI: " + e.message });
    }
}
