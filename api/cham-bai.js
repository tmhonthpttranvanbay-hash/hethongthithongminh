// File: api/cham-bai.js
export default async function handler(req, res) {
    // Cấu hình CORS để Frontend gọi được
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ score: 0, feedback: "Chỉ chấp nhận POST" });

    const { type, deBai, barem, tongDiem, baiLam, code, testStatus } = req.body;
    
    // Lấy Key từ biến môi trường của Vercel
    const API_KEY = process.env.GEMINI_API_KEY; 
    if (!API_KEY) return res.status(500).json({ score: 0, feedback: "Server thiếu API Key!" });

    let promptText = "";
    if (type === "essay") {
        promptText = `Bạn là Giám khảo. Đề: ${deBai}. Barem: ${barem}. Tổng điểm: ${tongDiem}. Bài làm: ${baiLam}. Trả về JSON: {"score": số, "feedback": "text"}`;
    } else {
        promptText = `Bạn là Giám khảo Lập trình. Đề: ${deBai}. Barem: ${barem}. Tổng điểm: ${tongDiem}. Kết quả Test: ${testStatus?.isPass?'Đúng':'Sai'}. Code: ${code}. Trả về JSON: {"score": số, "feedback": "text"}`;
    }

    // Dùng model 1.5-flash hoặc 2.0-flash tùy thời điểm
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

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
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ score: 0, feedback: "Lỗi AI: " + e.message });
    }
}
