export default async function handler(req, res) {
    // 1. Mở khóa CORS (Cho phép web học sinh gửi dữ liệu qua)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Trình duyệt tự động kiểm tra bảo mật (Preflight OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. DÀNH RIÊNG CHO BẠN: Nếu bạn bấm mở link trực tiếp trên trình duyệt để test
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: "Thành công tuyệt đối", 
            message: "🚀 API Server ĐÃ LÊN MẠNG THÀNH CÔNG 100%! Vui lòng quay lại web học sinh, nhập câu trả lời và bấm nộp bài để gọi API này chấm điểm nhé." 
        });
    }

    // 4. Nếu không phải POST thì chặn lỗi
    if (req.method !== 'POST') {
        return res.status(405).json({ score: 0, feedback: "Chỉ hỗ trợ phương thức POST để chấm bài." });
    }

    // 5. Lấy API Key Google từ biến môi trường Vercel của bạn
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ score: 0, feedback: "Lỗi Server: Chưa có API Key trên Vercel." });
    }

    // 6. Xử lý chấm điểm
    try {
        const body = req.body || {};
        let promptText = "";

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
            return res.status(400).json({ score: 0, feedback: "Loại bài không hợp lệ." });
        }

        // Gọi API Google
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
            return res.status(500).json({ score: 0, feedback: "Google API bị lỗi hoặc quá tải." });
        }

        const data = await response.json();
        const textResult = data.candidates[0].content.parts[0].text;
        
        // Chuyển kết quả thành dạng số điểm và text
        const parsed = JSON.parse(textResult);

        return res.status(200).json({
            score: parsed.score || 0,
            feedback: parsed.feedback || "Đã chấm xong."
        });

    } catch (error) {
        console.error("Lỗi:", error);
        return res.status(500).json({ score: 0, feedback: "Lỗi hệ thống Server: " + error.message });
    }
}
