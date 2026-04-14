module.exports = async function handler(req, res) {
    // 1. Mở khóa CORS để web của bạn có thể gọi được API này
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Bỏ qua bước kiểm tra an ninh ban đầu của trình duyệt
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Chỉ cho phép gửi dữ liệu lên (POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ score: 0, feedback: "Chỉ hỗ trợ phương thức POST" });
    }

    // 3. Lấy API Key từ Vercel (bạn đã cài đặt thành công ở bước trước)
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ score: 0, feedback: "Lỗi Server: Chưa cài đặt API Key trên Vercel." });
    }

    try {
        const body = req.body;
        let promptText = "";

        // 4. Tạo câu lệnh điều khiển AI (Prompt)
        if (body.type === 'essay') {
            promptText = `Bạn là giáo viên chấm thi tự luận.
            - Đề bài: ${body.deBai}
            - Barem/Đáp án: ${body.barem}
            - Tổng điểm tối đa: ${body.tongDiem}
            - Bài làm của học sinh: ${body.baiLam}
            Hãy chấm điểm (làm tròn đến 0.25) và đưa ra nhận xét.
            YÊU CẦU BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON NÀY, KHÔNG THÊM BẤT KỲ CHỮ NÀO KHÁC: {"score": <số_điểm>, "feedback": "<lời_nhận_xét>"}`;
        } else if (body.type === 'code') {
            promptText = `Bạn là giáo viên chấm thi Lập trình.
            - Đề bài: ${body.deBai}
            - Barem/Yêu cầu: ${body.barem}
            - Tổng điểm tối đa: ${body.tongDiem}
            - Code của học sinh: ${body.code}
            - Trạng thái chạy test: ${body.testStatus}
            Hãy chấm điểm (làm tròn đến 0.25) và đưa ra nhận xét.
            YÊU CẦU BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON NÀY, KHÔNG THÊM BẤT KỲ CHỮ NÀO KHÁC: {"score": <số_điểm>, "feedback": "<lời_nhận_xét>"}`;
        } else {
            return res.status(400).json({ score: 0, feedback: "Loại bài không hợp lệ" });
        }

        // 5. Gọi thẳng API Google bằng Fetch (Chuẩn Vercel thuần)
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const response = await fetch(googleUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) {
            console.error("Lỗi từ Google:", await response.text());
            return res.status(500).json({ score: 0, feedback: "Google API bị lỗi hoặc quá tải." });
        }

        const data = await response.json();
        const textResult = data.candidates[0].content.parts[0].text;
        
        // Chuyển text JSON của AI thành Object
        const parsed = JSON.parse(textResult);

        // Trả kết quả về cho web học sinh
        return res.status(200).json({
            score: parsed.score || 0,
            feedback: parsed.feedback || "Đã chấm xong."
        });

    } catch (error) {
        console.error("Lỗi:", error);
        return res.status(500).json({ score: 0, feedback: "Lỗi hệ thống Server: " + error.message });
    }
}
