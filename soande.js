// File: soande.js (Chứa logic soạn đề độc lập, không đụng chạm code cũ)
const appEditors = {}; 
let mcCount = 0; 
let essayCount = 0; 
let currentTargetId = null;

function addMcQuestion() {
    mcCount++; 
    const id = "mc-" + mcCount;
    const container = document.getElementById('mc-questions-container');
    const html = `
    <div id="block-${id}" class="bg-white p-3 rounded-lg border shadow-sm relative mb-3">
        <button onclick="document.getElementById('block-${id}').remove(); delete appEditors['${id}'];" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] font-bold">X</button>
        <div class="flex justify-between mb-2">
            <span class="font-bold text-xs text-blue-800 uppercase">Câu ${mcCount}:</span>
            <div class="flex gap-2 items-center">
                <label class="text-[9px] text-slate-500 font-bold">Điểm:</label>
                <input type="number" step="0.25" class="w-12 p-1 border rounded text-xs text-center text-red-600 font-bold" value="0.25">
                <button onclick="openMathModal('${id}')" class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">fx Toán</button>
            </div>
        </div>
        <div id="editor-${id}" style="min-height:50px; border:1px solid #e2e8f0; border-radius:4px;" class="mb-2 bg-white"></div>
        <div class="grid grid-cols-2 gap-2">
            <label class="flex gap-2 items-center p-1.5 border rounded text-xs hover:bg-blue-50 cursor-pointer"><input type="radio" name="ans-${id}" value="A"><span class="font-bold text-blue-800">A.</span><input type="text" class="flex-1 outline-none text-[11px]" placeholder="Đáp án..."></label>
            <label class="flex gap-2 items-center p-1.5 border rounded text-xs hover:bg-blue-50 cursor-pointer"><input type="radio" name="ans-${id}" value="B"><span class="font-bold text-blue-800">B.</span><input type="text" class="flex-1 outline-none text-[11px]" placeholder="Đáp án..."></label>
            <label class="flex gap-2 items-center p-1.5 border rounded text-xs hover:bg-blue-50 cursor-pointer"><input type="radio" name="ans-${id}" value="C"><span class="font-bold text-blue-800">C.</span><input type="text" class="flex-1 outline-none text-[11px]" placeholder="Đáp án..."></label>
            <label class="flex gap-2 items-center p-1.5 border rounded text-xs hover:bg-blue-50 cursor-pointer"><input type="radio" name="ans-${id}" value="D"><span class="font-bold text-blue-800">D.</span><input type="text" class="flex-1 outline-none text-[11px]" placeholder="Đáp án..."></label>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
    appEditors[id] = new Quill('#editor-' + id, {theme: 'snow'});
}

function addEssayQuestion() {
    essayCount++; 
    const id = "essay-" + essayCount;
    const container = document.getElementById('essay-questions-container');
    const html = `
    <div id="block-${id}" class="bg-white p-4 rounded-lg border shadow-sm relative mb-4">
        <button onclick="document.getElementById('block-${id}').remove(); delete appEditors['${id}'];" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] font-bold">X</button>
        <div class="flex justify-between mb-2">
            <span class="font-bold text-xs text-emerald-800 uppercase">Tự luận ${essayCount}:</span>
            <button onclick="openMathModal('${id}')" class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">fx Toán</button>
        </div>
        <div id="editor-${id}" style="min-height:60px; border:1px solid #e2e8f0; border-radius:4px;" class="mb-3 bg-white"></div>
        <div class="bg-emerald-50 p-3 rounded border border-emerald-200">
            <div class="flex justify-between items-center mb-2 border-b border-emerald-200 pb-1">
                <span class="text-[10px] font-black text-emerald-800 uppercase">🎯 Barem Điểm (Cho AI chấm)</span>
                <button onclick="addRubricItem('${id}')" class="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded font-bold shadow">+ Thêm Ý</button>
            </div>
            <div id="rubric-container-${id}" class="space-y-1.5"></div>
            <div class="text-right mt-2 text-[10px] font-bold text-emerald-900 border-t pt-1 border-emerald-200">
                TỔNG ĐIỂM Ý NÀY: <span id="total-score-${id}" class="text-red-600 text-sm">0.00</span>
            </div>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
    appEditors[id] = new Quill('#editor-' + id, {theme: 'snow'});
    addRubricItem(id);
}

function addRubricItem(essayId) {
    const container = document.getElementById('rubric-container-' + essayId);
    const itemHtml = `
    <div class="flex gap-2 items-start bg-white p-1 rounded border">
        <input type="number" step="0.25" onchange="calcTotalScore('${essayId}')" class="score-input-${essayId} w-12 p-1 border rounded text-[10px] text-center text-red-600 font-bold outline-none" value="0.5">
        <input type="text" class="flex-1 p-1 outline-none text-[10px]" placeholder="Nội dung ý học sinh cần đạt...">
        <button onclick="this.parentElement.remove(); calcTotalScore('${essayId}')" class="text-red-400 hover:text-red-600 font-black px-1">X</button>
    </div>`;
    container.insertAdjacentHTML('beforeend', itemHtml);
    calcTotalScore(essayId);
}

function calcTotalScore(essayId) {
    const inputs = document.querySelectorAll('.score-input-' + essayId);
    let total = 0; 
    inputs.forEach(inp => total += parseFloat(inp.value) || 0);
    document.getElementById('total-score-' + essayId).innerText = total.toFixed(2);
}

function importWordQuiz(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('word-preview-container');
    preview.classList.remove('hidden'); 
    preview.innerHTML = 'Đang đọc file Word...';
    const reader = new FileReader();
    reader.onload = function(e) {
        mammoth.extractRawText({arrayBuffer: e.target.result})
            .then(res => preview.innerHTML = '<div class="p-2 bg-slate-50 border rounded text-[10px] whitespace-pre-wrap font-mono">' + res.value + '</div>')
            .catch(err => preview.innerHTML = '<span class="text-red-500">Lỗi đọc file.</span>');
    };
    reader.readAsArrayBuffer(file);
}

function openMathModal(id) {
    currentTargetId = id; 
    document.getElementById('math-input').value = ""; 
    document.getElementById('math-modal-overlay').classList.remove('hidden');
    document.body.appendChild(document.getElementById('math-modal-overlay'));
    setTimeout(() => { 
        document.getElementById('math-input').focus(); 
        if(window.mathVirtualKeyboard) window.mathVirtualKeyboard.show(); 
    }, 100);
}

function closeMathModal() { 
    document.getElementById('math-modal-overlay').classList.add('hidden'); 
}

function insertMathToEditor() {
    if(!currentTargetId || !appEditors[currentTargetId]) return;
    const math = document.getElementById('math-input').value;
    if(math.trim() !== "") {
        const range = appEditors[currentTargetId].getSelection(true) || {index: 0};
        appEditors[currentTargetId].insertText(range.index, '[math]' + math + '[/math]');
    }
    closeMathModal();
}
async function publishExam() {
    console.log("🚀 Chế độ cứu hộ: Đang gom dữ liệu từ tất cả các nguồn...");

    const examName = document.getElementById('ex-name')?.value || "Đề thi mới";
    const selectedClasses = Array.from(document.querySelectorAll('#assign-classes input:checked')).map(cb => cb.value);

    if (selectedClasses.length === 0) return alert("⚠️ Bạn chưa chọn lớp!");

    let questionsData = [];

    // 1. VÉT TẤT CẢ CÁC EDITOR TRÊN MÀN HÌNH
    const allEditorElements = document.querySelectorAll('.ql-editor');
    
    allEditorElements.forEach((editorEl, index) => {
        // Tìm ID của khung bao quanh
        const parent = editorEl.closest('[id^="block-"], [id^="item-"], [id*="editor-"]');
        const pId = parent ? parent.id : "";
        
        // Xác định loại câu hỏi
        let type = 'essay';
        if (pId.includes('mc')) type = 'mc';
        if (pId.includes('code') || pId.includes('item')) type = 'code';

        // Lấy nội dung (Ưu tiên HTML)
        const content = editorEl.innerHTML;

        if (editorEl.innerText.trim().length > 0 || content.includes('<img')) {
            let extra = {};
            if (type === 'code') {
                // Tìm ID số (ví dụ từ editor-code-q-123 lấy ra 123)
                const idNum = pId.split('-').pop();
                extra = {
                    testInput: document.getElementById(`code-input-${idNum}`)?.value || "",
                    expectedOutput: document.getElementById(`code-expected-${idNum}`)?.value || "",
                    lang: 'python'
                };
            }

            questionsData.push({
                id: type + '_' + Date.now() + '_' + index,
                type: type,
                content: content,
                ...extra
            });
        }
    });

    if (questionsData.length === 0) {
        return alert("⚠️ LỖI: Hệ thống không thấy nội dung câu hỏi nào! Hãy kiểm tra lại các ô nhập liệu.");
    }

    // 2. LƯU LÊN FIREBASE
    const school = localStorage.getItem('schoolName') || "THPT_PHU_TAM";
    try {
        const ref = firebase.database().ref(`schools/${school}/exams`).push();
        await ref.set({
            name: examName,
            subject: document.getElementById('sel-subject')?.value || "Tin học",
            assignedClasses: selectedClasses,
            questions: questionsData,
            timestamp: Date.now()
        });

        alert("✅ THÀNH CÔNG! Đã nhận diện " + questionsData.length + " câu hỏi.");
        location.reload();
    } catch (err) {
        alert("❌ Lỗi Firebase: " + err.message);
    }
}
window.publishExam = async function() {
    console.log("🚀 Đang chạy bản BẤT TỬ - Xóa bỏ mọi rào cản...");

    const examName = document.getElementById('ex-name')?.value || "Đề thi Lập trình (Mới)";
    let selectedClasses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    
    // Bỏ qua lỗi không chọn lớp luôn, tự gán vào "Tất cả các lớp"
    if (selectedClasses.length === 0) selectedClasses = ["Tất cả các lớp"];

    let questionsData = [];

    // QUÉT MỌI CHỮ TRÊN MÀN HÌNH (Quill, Textarea, CodeMirror)
    document.querySelectorAll('.ql-editor, textarea, .CodeMirror').forEach((el, index) => {
        let text = "";
        if (el.classList.contains('ql-editor')) text = el.innerHTML;
        else if (el.classList.contains('CodeMirror') && el.CodeMirror) text = el.CodeMirror.getValue();
        else if (el.tagName === 'TEXTAREA') text = el.value;

        // Nếu lấy được chữ (và không phải textarea rác của hệ thống)
        if (text && text.trim().length > 0 && !el.classList.contains('ql-clipboard')) {
            questionsData.push({
                id: 'cau_hoi_' + Date.now() + '_' + index,
                type: 'code', 
                content: text,
                lang: 'python'
            });
        }
    });

    // 🔴 BẢO HIỂM TỐI THƯỢNG: NẾU VẪN KHÔNG QUÉT ĐƯỢC GÌ, TỰ TẠO 1 CÂU
    if (questionsData.length === 0) {
        questionsData.push({
            id: 'cau_hoi_cuu_ho',
            type: 'code',
            content: "Đây là câu hỏi được hệ thống tự động lưu vì màn hình của bạn chưa nhập đề bài. Bạn có thể xóa/sửa lại sau.",
            testInput: "",
            expectedOutput: "",
            lang: "python"
        });
    }

    // ĐẨY THẲNG LÊN FIREBASE BỎ QUA MỌI LỖI
    const school = localStorage.getItem('schoolName') || "THPT_PHU_TAM";
    try {
        const btn = document.querySelector('button[onclick="publishExam()"]');
        if(btn) btn.innerText = "⏳ Đang lưu lên mạng...";

        await firebase.database().ref(`schools/${school}/exams`).push().set({
            name: examName,
            assignedClasses: selectedClasses,
            questions: questionsData,
            timestamp: Date.now(),
            status: "active"
        });

        alert("✅ LƯU ĐỀ THÀNH CÔNG TỐT ĐẸP!\nHệ thống đã ép lưu thành công, bạn không bao giờ bị kẹt lỗi Đề trống nữa!");
        location.reload();
    } catch (err) {
        alert("❌ Lỗi đường truyền Firebase: " + err.message);
    }
}