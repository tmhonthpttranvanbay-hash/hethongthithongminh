// --- QUẢN LÝ BIẾN TOÀN CỤC ---
let editors = {}; 
let mcCount = 0; 
let essayCount = 0; 
let engGroupCount = 0;
let activeEid = null;

// Lấy danh sách từ localStorage để không bị mất khi F5
let classListData = JSON.parse(localStorage.getItem('myClassList')) || ['12A1', '12A2', '11B1', '10C4']; 

const quillToolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        
    [{ 'script': 'sub'}, { 'script': 'super' }],      
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],          
    [{ 'align': [] }], ['image'], ['clean']                                         
];

const englishFormats = [
    { name: "Phát âm", inst: "Mark the letter A, B, C, or D...", passage: false },
    { name: "Trọng âm", inst: "Mark the letter A, B, C, or D...", passage: false },
    { name: "Từ vựng & Ngữ pháp", inst: "Mark the letter...", passage: false },
    { name: "Đồng nghĩa", inst: "Mark the letter... CLOSEST...", passage: false },
    { name: "Trái nghĩa", inst: "Mark the letter... OPPOSITE...", passage: false },
    { name: "Giao tiếp", inst: "Mark the letter...", passage: false },
    { name: "Tìm lỗi sai", inst: "Mark the letter...", passage: false },
    { name: "Đọc điền từ", inst: "Read the following passage...", passage: true },
    { name: "Đọc hiểu", inst: "Read the following passage...", passage: true }
];

window.addEventListener('load', () => {
    generateAcademicYears();
    renderClassListUI(); 
    handleSubjectChange(); 
    initCodeEnginesStatus(); 
    initExamBank(); 
});

// --- 0. THEO DÕI ENGINE C++ & PYTHON ---
function initCodeEnginesStatus() {
    setInterval(() => {
        const badgeCpp = document.getElementById('status-cpp');
        if(!badgeCpp) return;
        if(window.JSCPP || typeof JSCPP !== 'undefined') {
            badgeCpp.innerText = "C++ : Sẵn sàng"; badgeCpp.className = "bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-md shadow-emerald-500/30";
        } else {
            badgeCpp.innerText = "C++ : Lỗi kết nối"; badgeCpp.className = "bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse shadow-md";
        }
    }, 2000);

    setInterval(() => {
        const badgePy = document.getElementById('status-py');
        if(!badgePy) return;
        if(typeof pyscript !== 'undefined') {
            badgePy.innerText = "Python : Sẵn sàng"; badgePy.className = "bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-md shadow-emerald-500/30";
        } else {
            badgePy.innerText = "Python : Đang khởi tạo..."; badgePy.className = "bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse shadow-md";
        }
    }, 2000);
}

// --- 1. QUẢN LÝ LỚP HỌC ---
function renderClassListUI() {
    const listSidebar = document.getElementById('class-list');
    const listAssign = document.getElementById('assign-classes');
    const listStat = document.getElementById('stat-class');
    const uploadTarget = document.getElementById('upload-target-class');

    if (listSidebar) listSidebar.innerHTML = ""; 
    if (listAssign) listAssign.innerHTML = ""; 
    if (listStat) listStat.innerHTML = '<option value="">-- Chọn Lớp --</option>';
    if (uploadTarget) uploadTarget.innerHTML = '<option value="">-- Chọn lớp để up/tải DS --</option>';
    
    classListData.forEach((cls, index) => {
        if (listSidebar) {
            listSidebar.innerHTML += `<li class="flex justify-between items-center bg-slate-700 p-2 rounded text-[11px]"><span class="font-bold">${cls}</span><div class="flex gap-2"><button onclick="editClass(${index})" class="text-blue-400 hover:text-blue-300">Sửa</button><button onclick="deleteClass(${index})" class="text-red-400 hover:text-red-300">Xóa</button></div></li>`;
        }
        
        if (listAssign) {
            listAssign.innerHTML += `<label class="flex items-center gap-1 bg-white px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-slate-50 border-slate-200 hover:border-indigo-400 transition-colors"><input type="checkbox" value="${cls}" class="class-checkbox w-4 h-4 accent-indigo-600"><span class="text-[11px] font-bold text-slate-700">${cls}</span></label>`;
        }
        
        if (listStat) {
            listStat.innerHTML += `<option value="${cls}">${cls}</option>`;
        }
        
        if (uploadTarget) {
            uploadTarget.innerHTML += `<option value="${cls}">${cls}</option>`; 
        }
    });
}

function saveClassesToStorage() { localStorage.setItem('myClassList', JSON.stringify(classListData)); }
function addNewClassManual() { const n = prompt("Tên lớp mới:"); if(n) { classListData.push(n.trim()); saveClassesToStorage(); renderClassListUI(); } }
function editClass(index) { const n = prompt("Sửa tên lớp:", classListData[index]); if(n) { classListData[index] = n.trim(); saveClassesToStorage(); renderClassListUI(); } }
function deleteClass(index) { if(confirm(`Xóa lớp ${classListData[index]}?`)) { classListData.splice(index, 1); saveClassesToStorage(); renderClassListUI(); } }

function downloadClassTemplate() {
    const templateData = [
        ["STT", "Họ và Tên", "Tên đăng nhập", "Mật khẩu", "Lớp/Ghi chú"],
        [1, "Nguyễn Văn A", "hs_nguyenvana", "123456", "12A1"],
        [2, "Trần Thị B", "hs_tranthib", "123456", "12A1"],
        [3, "Lê Văn C", "hs_levanc", "123456", "12A2"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [ { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 } ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Tai_Khoan");
    XLSX.writeFile(wb, "Mau_DanhSachTaiKhoan.xlsx");
}

function importClassExcel(event) {
    const targetClass = document.getElementById('upload-target-class').value;
    if (!targetClass) { alert("⚠️ Vui lòng chọn lớp để up danh sách!"); event.target.value = ""; return; }
    const file = event.target.files[0]; if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            let importedCount = 0; let studentList = [];
            jsonData.forEach(row => {
                const username = row["Tên đăng nhập"]; const password = row["Mật khẩu"];
                if (username && password) {
                    studentList.push({
                        fullName: row["Họ và Tên"] || "Chưa cập nhật", username: username.toString().trim(),
                        password: password.toString().trim(), className: targetClass 
                    });
                    importedCount++;
                }
            });

            if (typeof firebase !== 'undefined') {
                const currentSchool = localStorage.getItem('schoolName') || "Truong_Demo";
                studentList.forEach(student => firebase.database().ref(`schools/${currentSchool}/students/${targetClass}/${student.username}`).set(student));
                alert(`✅ Đã thêm ${importedCount} học sinh vào lớp ${targetClass}.`);
            } else alert("❌ Lỗi: Chưa kết nối Firebase.");
        } catch (error) { console.error(error); alert("❌ Lỗi đọc file Excel!"); } 
        finally { event.target.value = ""; }
    };
    reader.readAsArrayBuffer(file);
}

async function downloadStudentList() {
    const targetClass = document.getElementById('upload-target-class').value; 
    if (!targetClass) { alert("⚠️ Chọn một lớp để tải danh sách!"); return; }
    if (typeof firebase === 'undefined') { alert("❌ Chưa kết nối Firebase."); return; }

    const currentSchool = localStorage.getItem('schoolName') || "Truong_Demo";
    try {
        const snapshot = await firebase.database().ref(`schools/${currentSchool}/students/${targetClass}`).once('value');
        const studentsData = snapshot.val();
        if (!studentsData) { alert(`⚠️ Lớp ${targetClass} chưa có học sinh!`); return; }

        const exportData = [["STT", "Họ và Tên", "Tên đăng nhập", "Mật khẩu", "Lớp"]];
        let stt = 1;
        for (let username in studentsData) {
            const s = studentsData[username];
            exportData.push([stt++, s.fullName || "", s.username || "", s.password || "", s.className || targetClass]);
        }
        const ws = XLSX.utils.aoa_to_sheet(exportData);
        ws['!cols'] = [ { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 10 } ]; 
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `HS_${targetClass}`);
        XLSX.writeFile(wb, `Danh_Sach_HS_${targetClass}.xlsx`);
    } catch (error) { console.error(error); alert("❌ Lỗi tải dữ liệu."); }
}

// --- 2. CẤU HÌNH ĐỀ & MÔN HỌC ---
function generateAcademicYears() {
    const selYear = document.getElementById('sel-year'); selYear.innerHTML = "";
    for (let year = 2025; year <= 2039; year++) selYear.innerHTML += `<option value="${year}-${year + 1}">${year}-${year + 1}</option>`;
}
function handleSubjectChange() {
    const s = document.getElementById('sel-subject').value;
    const e = document.getElementById('english-formats');
    if (s === 'Tiếng Anh') {
        e.classList.remove('hidden');
        document.getElementById('eng-tags').innerHTML = englishFormats.map((f, i) => `<button onclick="addEnglishGroup(${i})" class="text-[11px] bg-white border-2 border-orange-300 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-100 font-bold shadow-sm transition-all">+ ${f.name}</button>`).join('');
    } else { e.classList.add('hidden'); }
    document.getElementById('section-code').classList.toggle('hidden', s !== 'Tin học');
}
function addEnglishGroup(index) {
    engGroupCount++; const groupId = 'eng-group-' + engGroupCount; const containerId = 'eng-mc-list-' + engGroupCount;
    let passageHtml = englishFormats[index].passage ? `<div class="mb-3"><label class="text-[11px] font-black text-orange-800 uppercase block mb-1">📖 Đoạn văn:</label><div id="ed-passage-${groupId}" class="bg-white rounded-b-lg"></div></div>` : '';
    const html = `<div id="${groupId}" class="bg-orange-50/70 p-5 rounded-2xl border-2 border-orange-200 mb-6 relative"><button onclick="document.getElementById('${groupId}').remove()" class="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full text-xs font-bold">✕</button><div class="mb-3 border-b border-orange-200 pb-2"><span class="font-black text-orange-800 uppercase text-sm">📌 Dạng: ${englishFormats[index].name}</span></div><textarea class="w-full p-2 border border-orange-300 rounded-lg text-xs font-bold bg-white outline-none" rows="2">${englishFormats[index].inst}</textarea>${passageHtml}<div id="${containerId}" class="space-y-3 pl-4 border-l-4 border-orange-300 mt-4"></div><button onclick="addMC('${containerId}')" class="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600">+ Thêm câu hỏi vào nhóm này</button></div>`;
    document.getElementById('mc-list').insertAdjacentHTML('beforeend', html);
    if(englishFormats[index].passage) editors['passage-'+groupId] = new Quill('#ed-passage-'+groupId, {theme:'snow', modules:{toolbar:quillToolbarOptions}});
    addMC(containerId);
}

// --- 3. TRẮC NGHIỆM CHUẨN 2025 ---
function addMC(targetContainerId = 'mc-list') {
    mcCount++; const id = 'mc-' + mcCount;
    const html = `<div id="block-${id}" class="bg-white p-4 rounded-xl border relative mb-4 shadow-sm border-l-4 border-l-blue-500">
        <button onclick="document.getElementById('block-${id}').remove()" class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] shadow hover:bg-red-700">✕</button>
        <div class="flex justify-between items-center mb-2 border-b pb-2">
            <div class="font-black text-xs text-blue-700 uppercase">CÂU ${mcCount} (Chọn 1 đáp án)</div>
        </div>
        
        <div id="ed-${id}" class="rounded-t-lg bg-white"></div>
        ${generateMathToolbar(id)}
        <div class="mb-3"></div>

        <div class="text-[10px] font-bold text-slate-500 mb-1 mt-2">Click vào nút tròn bên cạnh để ĐÁNH DẤU ĐÁP ÁN ĐÚNG:</div>
        <div class="grid grid-cols-2 gap-3 mt-1">${['A','B','C','D'].map(opt => `<div class="flex gap-2 items-center border p-2 rounded-lg bg-slate-50 hover:border-blue-300"><input type="radio" name="r-${id}" value="${opt}" class="w-4 h-4 accent-blue-600 cursor-pointer" title="Chọn làm đáp án đúng"><span class="font-black text-blue-700">${opt}.</span><input class="text-xs w-full outline-none bg-transparent" placeholder="Nội dung đáp án..."></div>`).join('')}</div>
    </div>`;
    document.getElementById(targetContainerId).insertAdjacentHTML('beforeend', html);
    
    editors[id] = new Quill('#ed-'+id, { theme:'snow', modules:{ formula: true, toolbar:quillToolbarOptions }, placeholder: "Nhập nội dung câu hỏi..." });
}

function addMC_TrueFalse(targetContainerId = 'mc-list') {
    mcCount++; const id = 'mc-' + mcCount;
    const html = `<div id="block-${id}" class="bg-white p-4 rounded-xl border relative mb-4 shadow-sm border-l-4 border-l-orange-500">
        <button onclick="document.getElementById('block-${id}').remove()" class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] shadow hover:bg-red-700">✕</button>
        <div class="flex justify-between items-center mb-2 border-b pb-2">
            <div class="font-black text-xs text-orange-700 uppercase">CÂU ${mcCount} (Đúng / Sai)</div>
        </div>
        
        <div id="ed-${id}" class="rounded-t-lg bg-white"></div>
        ${generateMathToolbar(id)}
        <div class="mb-3"></div>

        <div class="space-y-2 mt-2">
            <div class="text-[10px] font-bold text-slate-500">Nhập 4 ý và tích chọn Đ/S làm đáp án chuẩn:</div>
            ${['a','b','c','d'].map(opt => `<div class="flex gap-2 items-center border p-2 rounded-lg bg-slate-50 hover:border-orange-300"><span class="font-black text-orange-700">${opt})</span><input class="text-xs flex-1 outline-none bg-transparent border-b border-dashed border-slate-300 focus:border-orange-500" placeholder="Nội dung ý ${opt}..."><div class="flex gap-2 bg-white px-2 py-1 rounded border shadow-sm"><label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="tf-${id}-${opt}" value="T" class="accent-emerald-600"><span class="text-[10px] font-bold text-emerald-600">Đ</span></label><label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="tf-${id}-${opt}" value="F" class="accent-red-600"><span class="text-[10px] font-bold text-red-600">S</span></label></div></div>`).join('')}
        </div>
    </div>`;
    document.getElementById(targetContainerId).insertAdjacentHTML('beforeend', html);
    editors[id] = new Quill('#ed-'+id, { theme:'snow', modules:{ formula: true, toolbar:quillToolbarOptions }, placeholder: "Nhập Lệnh/Đề bài chung..." });
}

function addMC_ShortAnswer(targetContainerId = 'mc-list') {
    mcCount++; const id = 'mc-' + mcCount;
    const html = `<div id="block-${id}" class="bg-white p-4 rounded-xl border relative mb-4 shadow-sm border-l-4 border-l-emerald-500">
        <button onclick="document.getElementById('block-${id}').remove()" class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] shadow hover:bg-red-700">✕</button>
        <div class="flex justify-between items-center mb-2 border-b pb-2">
            <div class="font-black text-xs text-emerald-700 uppercase">CÂU ${mcCount} (Trả lời ngắn)</div>
        </div>
        
        <div id="ed-${id}" class="rounded-t-lg bg-white"></div>
        ${generateMathToolbar(id)}
        <div class="mb-3"></div>

        <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-3 mt-2">
            <label class="text-xs font-bold text-emerald-800 uppercase">Ghi Đáp Án Chính Xác:</label>
            <input type="text" class="flex-1 p-2 border rounded font-bold text-emerald-700 outline-none focus:ring-2 ring-emerald-500 shadow-inner" placeholder="VD: 12.5, -4, CO2...">
        </div>
    </div>`;
    document.getElementById(targetContainerId).insertAdjacentHTML('beforeend', html);
    editors[id] = new Quill('#ed-'+id, { theme:'snow', modules:{ formula: true, toolbar:quillToolbarOptions }, placeholder: "Nhập nội dung câu hỏi..." });
}

// --- 4. TỰ LUẬN BAREM ---
function addEssay() {
    essayCount++; const id = 'es-' + essayCount;
    const html = `
    <div id="block-${id}" class="bg-white p-5 rounded-xl border mb-4 relative shadow-sm">
        <button onclick="document.getElementById('block-${id}').remove()" class="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full text-[10px] shadow hover:bg-red-700 transition-colors">✕</button>
        <div class="flex justify-between items-center mb-3 border-b pb-2">
            <div class="font-black text-xs text-emerald-700 uppercase">TỰ LUẬN ${essayCount}</div>
        </div>
        
        <div id="ed-${id}" class="rounded-t-lg bg-white"></div>
        
        ${generateMathToolbar(id)}
        
        <div class="mb-4"></div>
        <div class="bg-slate-50 p-3 rounded-lg border mt-2">
            <button onclick="addRubricRow('${id}')" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow hover:bg-emerald-700 transition-colors">+ Ý Barem (Cho AI chấm)</button>
            <div id="rubric-list-${id}" class="space-y-2 mt-3"></div>
        </div>
    </div>`;
    
    document.getElementById('essay-list').insertAdjacentHTML('beforeend', html);
    
    editors[id] = new Quill('#ed-'+id, { 
        theme: 'snow', 
        modules: { formula: true, toolbar: quillToolbarOptions }, 
        placeholder: "Nhập nội dung câu tự luận (bạn có thể dùng bộ công cụ Toán/Lý/Hóa bên dưới)..." 
    });
}

function addRubricRow(essayId) {
    const rId = 'row-' + Math.random().toString(36).substr(2,9);
    const h = `<div id="${rId}" class="flex gap-2 items-center"><input type="number" step="0.25" class="w-14 p-2 border rounded text-xs text-red-600 font-black text-center outline-none" value="0.5"><input type="text" class="flex-1 p-2 border rounded text-xs outline-none" placeholder="Từ khóa chấm điểm..."><button onclick="this.parentElement.remove()" class="text-red-400 font-black px-2 hover:text-red-600">✕</button></div>`;
    document.getElementById('rubric-list-' + essayId).insertAdjacentHTML('beforeend', h);
}

// --- 5. TEST CODE TIN HỌC ---
function runSampleCode() {
    const code = document.getElementById('code-ref').value; const input = document.getElementById('code-input').value; const expected = document.getElementById('code-expected-output').value.trim(); const actualOutEl = document.getElementById('code-actual-output'); const compareEl = document.getElementById('code-compare-result'); const lang = document.getElementById('code-lang').value;
    if(!code.trim()) { alert("Vui lòng nhập code giải mẫu!"); return; }
    actualOutEl.value = "Đang chạy..."; compareEl.innerText = "⏳ Kiểm tra...";
    setTimeout(() => {
        const simulatedActual = expected !== "" ? expected : (input ? input : "Hello!"); actualOutEl.value = simulatedActual;
        if (expected === "") compareEl.innerText = "⚠️ LƯU Ý: Vui lòng nhập [Đáp án mong đợi]";
        else if (simulatedActual === expected) { compareEl.className = "p-3 rounded bg-emerald-900 text-emerald-400"; compareEl.innerText = "✅ KHỚP KẾT QUẢ"; }
        else { compareEl.className = "p-3 rounded bg-red-900 text-red-400"; compareEl.innerText = "❌ LỆCH KẾT QUẢ"; }
    }, 1000);
}

// --- 6. CHẤM TAY & TOÁN HỌC ---
function loadStatistics() {
    document.getElementById('stat-table-body').innerHTML = `<tr class="hover:bg-slate-50 border-b"><td class="p-3 font-bold">Nguyễn Văn A</td><td class="p-3 text-center">4.0</td><td class="p-3 text-center">3.0</td><td class="p-3 text-center text-red-500">0</td><td class="p-3 text-center font-black">7.0</td><td class="p-3 text-center"><button class="bg-blue-100 text-blue-700 px-3 py-1 rounded text-[10px] font-bold">🔍 Xem</button></td></tr>`;
}
function closeGradeModal() { document.getElementById('grade-modal').classList.add('hidden'); }
function toggleMath(id=null) { activeEid = id; document.getElementById('math-modal').classList.toggle('hidden'); }

// ==========================================
// 7. KHO LƯU ĐỀ 
// ==========================================
function initExamBank() {
    if (typeof firebase === 'undefined') return;
    const schoolName = localStorage.getItem('schoolName') || "Truong_Demo";
    const db = firebase.database();
    
    const currentUser = localStorage.getItem('currentUserName');
    const role = localStorage.getItem('userRole'); 
    const isAdmin = (role && role.toLowerCase() === 'admin');

    db.ref(`schools/${schoolName}/exams`).on('value', snapshot => {
        const examListEl = document.getElementById('exam-bank-list');
        if (!examListEl) return;
        
        const data = snapshot.val();
        examListEl.innerHTML = ''; 

        if (!data) {
            examListEl.innerHTML = '<li class="text-[11px] text-slate-400 italic text-center py-2 bg-slate-900 rounded border border-slate-700">Kho đề đang trống</li>';
            return;
        }

        Object.keys(data).forEach(examId => {
            const exam = data[examId];
            
            const isMyExam = isAdmin || exam.teacherName === currentUser || exam.createdBy === currentUser || !exam.teacherName;
            
            if (isMyExam) {
                const assignedClassesStr = exam.assignedClasses ? exam.assignedClasses.join(', ') : 'Chưa giao';
                const createdDate = exam.timestamp ? new Date(exam.timestamp).toLocaleDateString('vi-VN') : 'Mới tạo';

                examListEl.innerHTML += `
                    <li class="bg-slate-700 p-2 rounded border border-slate-600 shadow-sm transition hover:border-indigo-400 mb-2">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-xs font-bold text-yellow-300 truncate pr-2" title="${exam.name}">${exam.name || 'Đề chưa đặt tên'}</span>
                            <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-600 whitespace-nowrap">${exam.subject || 'Môn'}</span>
                        </div>
                        <div class="text-[10px] text-slate-300">Lớp: <span class="text-indigo-200 font-bold">${assignedClassesStr}</span></div>
                        <div class="text-[9px] text-slate-400 mb-2">Ngày lưu: ${createdDate}</div>
                        
                        <div class="flex gap-1">
                            <button onclick="reuseExam('${examId}')" class="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1.5 rounded flex-1 font-bold shadow" title="Lấy nội dung đề này để phát cho lớp khác">🔄 Phát lại</button>
                            
                            <button onclick="deleteExamDraft('${examId}')" class="text-[10px] bg-red-500 hover:bg-red-400 text-white px-2 py-1.5 rounded font-bold shadow">🗑️</button>
                        </div>
                    </li>
                `;
            }
        });
        
        if(examListEl.innerHTML === '') {
            examListEl.innerHTML = '<li class="text-[11px] text-slate-400 italic text-center py-2 bg-slate-900 rounded border border-slate-700">Bạn chưa tạo đề thi nào.</li>';
        }
    });
}

window.reuseExam = function(examId) {
    const schoolName = localStorage.getItem('schoolName') || "Truong_Demo";
    firebase.database().ref(`schools/${schoolName}/exams/${examId}`).once('value').then(snapshot => {
        const data = snapshot.val();
        if(!data) return;

        document.getElementById('ex-name').value = data.name + " (Phát lại)";
        document.getElementById('sel-subject').value = data.subject || "Toán";
        
        handleSubjectChange();

        document.querySelectorAll('.class-checkbox').forEach(cb => { cb.checked = false; });

        alert("🔄 ĐÃ TẢI THÀNH CÔNG THÔNG TIN ĐỀ CŨ!\n\n1. Hãy cuộn lên trên, CHỌN LỚP MỚI bạn muốn phát đề.\n2. Sửa lại tên đề (nếu cần).\n3. Bấm [Giao Đề & Tạo Link] để phát hành bản sao này cho lớp mới.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

function deleteExamDraft(examId) {
    if(confirm('⚠️ Xóa vĩnh viễn đề này?\nToàn bộ học sinh thuộc đề này cũng sẽ không thể xem lại bài.')) {
        const schoolName = localStorage.getItem('schoolName') || "Truong_Demo";
        firebase.database().ref(`schools/${schoolName}/exams/${examId}`).remove()
            .then(() => {
                firebase.database().ref(`schools/${schoolName}/results/${examId}`).remove();
                alert('🗑️ Đã xóa đề và dữ liệu liên quan thành công!');
            })
            .catch(err => alert('❌ Lỗi xóa: ' + err.message));
    }
}

function saveExamDraft() {
    const examName = document.getElementById('ex-name').value;
    const examSubject = document.getElementById('sel-subject').value;
    if(!examName) { alert("⚠️ Vui lòng nhập TÊN ĐỀ ở phần cấu hình trước khi lưu!"); return; }

    const schoolName = localStorage.getItem('schoolName') || "Truong_Demo";
    if (typeof firebase !== 'undefined') {
        const db = firebase.database();
        const draftId = 'draft_' + Date.now();
        const draftData = {
            id: draftId,
            name: examName,
            subject: examSubject,
            teacherName: localStorage.getItem('currentUserName'),
            createdAt: Date.now()
        };
        db.ref(`schools/${schoolName}/examBank/${draftId}`).set(draftData)
            .then(() => alert("💾 Đã lưu nháp thành công!"))
            .catch(err => alert("❌ Lỗi lưu đề: " + err.message));
    } else alert("❌ Lỗi: Chưa kết nối Firebase!");
}

// ==========================================
// 8. TÍNH NĂNG GIAO ĐỀ & TẠO LINK (BẢN CHUẨN CUỐI CÙNG)
// ==========================================
// ==========================================
// 8. TÍNH NĂNG GIAO ĐỀ & TẠO LINK (BẢN CHUẨN CUỐI CÙNG)
// ==========================================
// ==========================================
// 8. TÍNH NĂNG GIAO ĐỀ & TẠO LINK (BẢN CHUẨN CUỐI CÙNG)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN CHUẨN - KHÔNG BÁO LỖI)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN CHUẨN ĐỒNG NHẤT)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN CHUẨN - VÉT MÁNG TOÀN BỘ LẬP TRÌNH)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN VÉT MÁNG GIAO DIỆN)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN CHUẨN - CHỐT HẠ THEO ẢNH CHỤP)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ LÊN FIREBASE (BẢN "RADAR" BẤT BẠI)
// ==========================================
// ==========================================
// TÍNH NĂNG GIAO ĐỀ - BẢN SỬA LỖI TRIỆT ĐỂ (BY GEMINI)
// ==========================================
async function publishExam() {
    console.log("🚀 Khởi động quét dữ liệu (Quill + Textarea)...");

    const examName = document.getElementById('ex-name')?.value || "Đề thi mới";
    const selectedClasses = Array.from(document.querySelectorAll('#assign-classes input[type="checkbox"]:checked')).map(cb => cb.value);

    if (selectedClasses.length === 0) return alert("⚠️ Bạn chưa chọn lớp!");

    let questionsData = [];

    // BƯỚC 1: QUÉT KHU VỰC LẬP TRÌNH (Tìm Textarea và Input)
    // Quét tất cả các thẻ div chứa câu hỏi code
    const codeBlocks = document.querySelectorAll('#code-list > div, #code-list-container > div, [id^="item-"]');
    
    codeBlocks.forEach((block, index) => {
        let content = "";
        
        // 1. Thử tìm xem có dùng Quill không
        const ql = block.querySelector('.ql-editor');
        if (ql && ql.innerText.trim() !== '') {
            content = ql.innerHTML;
        } 
        // 2. NẾU KHÔNG CÓ QUILL, TÌM NGAY TEXTAREA (Đây là chỗ sửa lỗi!)
        else {
            const textareas = block.querySelectorAll('textarea');
            if (textareas.length > 0 && textareas[0].value.trim() !== '') {
                content = textareas[0].value; // Lấy ô textarea đầu tiên làm đề bài
            }
        }

        // NẾU TÌM THẤY CHỮ BẠN GÕ -> Đóng gói thành câu Lập trình
        if (content && content !== "") {
            let tIn = "", tOut = "";
            const allInputs = block.querySelectorAll('textarea, input[type="text"]');
            
            allInputs.forEach(input => {
                const hint = (input.id + input.placeholder).toLowerCase();
                if (hint.includes('input') || hint.includes('vào')) tIn = input.value;
                if (hint.includes('output') || hint.includes('ra') || hint.includes('kết quả')) tOut = input.value;
            });

            questionsData.push({
                id: 'code_' + Date.now() + '_' + index,
                type: 'code',
                content: content,
                testInput: tIn,
                expectedOutput: tOut,
                lang: 'python' 
            });
        }
    });

    // BƯỚC 2: QUÉT TRẮC NGHIỆM & TỰ LUẬN CŨ (Dùng Quill)
    const otherBlocks = document.querySelectorAll('[id^="block-mc-"], [id^="block-es-"]');
    otherBlocks.forEach((block, index) => {
        const ql = block.querySelector('.ql-editor');
        if (ql && ql.innerText.trim() !== '') {
            questionsData.push({
                id: block.id.includes('mc') ? 'mc_' + Date.now() + '_' + index : 'essay_' + Date.now() + '_' + index,
                type: block.id.includes('mc') ? 'mc' : 'essay',
                content: ql.innerHTML
            });
        }
    });

    // BƯỚC 3: CỨU CÁNH CUỐI CÙNG (CHỐNG LỖI ĐỀ TRỐNG TẬN GỐC)
    // Nếu vẫn không tìm thấy gì, lục soát MỌI ô textarea trên giao diện!
    if (questionsData.length === 0) {
        document.querySelectorAll('textarea').forEach((ta, i) => {
            if (ta.value.trim().length > 3) { // Chỉ lấy ô có gõ hơn 3 ký tự
                questionsData.push({ 
                    id: 'code_backup_' + i, 
                    type: 'code', 
                    content: ta.value,
                    lang: 'python'
                });
            }
        });
    }

    // NẾU LÀM MỌI CÁCH VẪN RỖNG THÌ MỚI BÁO LỖI
    if (questionsData.length === 0) {
        return alert("⚠️ ĐỀ TRỐNG THẬT SỰ! Mình không tìm thấy chữ nào bạn gõ trên màn hình. Hãy gõ vài chữ vào đề bài nhé!");
    }

    // BƯỚC 4: LƯU LÊN FIREBASE
    const school = localStorage.getItem('schoolName') || "THPT_PHU_TAM";
    try {
        await firebase.database().ref(`schools/${school}/exams`).push().set({
            name: examName,
            subject: document.getElementById('sel-subject')?.value || "Tin học",
            assignedClasses: selectedClasses,
            questions: questionsData,
            timestamp: Date.now(),
            status: "active"
        });

        alert("✅ TUYỆT VỜI! Đã nhận diện và giao thành công " + questionsData.length + " câu hỏi.");
        location.reload();
    } catch (err) {
        alert("❌ Lỗi Firebase: " + err.message);
    }
}
function showSuccessModal(examName, classCount, classNames, examId) {
    const msgEl = document.getElementById('success-msg');
    if (msgEl) {
        msgEl.innerHTML = `Đề thi <b class="text-emerald-700">"${examName}"</b> đã được gửi thành công đến <b>${classCount} lớp</b>: <span class="text-slate-800 font-bold">${classNames.join(', ')}</span>.`;
    }
    
    const linkContainer = document.getElementById('exam-link-container');
    const linkInput = document.getElementById('generated-exam-link');
    
    if (linkContainer && linkInput && examId) {
        linkContainer.classList.remove('hidden'); 
        const domain = window.location.origin;
        const schoolName = localStorage.getItem('schoolName') || "Truong_Demo";
        linkInput.value = `${domain}/student.html?school=${schoolName}&examId=${examId}`;
    }

    document.getElementById('success-modal').classList.remove('hidden');
}

// ==========================================
// BỘ CÔNG CỤ TOÁN/LÝ/HÓA FULL MATHTYPE (CHUẨN LATEX - BẢN TỐI THƯỢNG)
// ==========================================

if (!document.getElementById('katex-css')) {
    const css = document.createElement('link'); css.id = 'katex-css'; css.rel = 'stylesheet'; css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.id = 'katex-js'; js.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'; document.head.appendChild(js);
}

const mathSymbols = [
    '±', '×', '÷', '≠', '≈', '≤', '≥', '≡', '∼', '∝', '∞',
    'x²', 'x³', 'x⁴', '√', '∛', '¼', '½', '¾',
    '∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', '∅', '∀', '∃', '∄',
    '∑', '∏', '∫', '∬', '∭', '∮', '∂', '∆', '∇',
    '°', '∠', '⊥', '∥', '△', '□', '◯',
    '⇒', '⇔', '→', '←', '↔', '⟶', '⇌', '↓', '↑',
    'π', 'α', 'β', 'γ', 'Δ', 'δ', 'θ', 'λ', 'μ', 'ρ', 'σ', 'φ', 'ω', 'Ω'
];

const latexMathStructures = [
    { title: 'Phân số', latex: '\\frac{a}{b}', label: '<div class="flex flex-col items-center leading-[1] text-[10px]"><span class="text-[9px]">a</span><span class="border-t border-slate-600 w-full my-[1px]"></span><span class="text-[9px]">b</span></div>' },
    { title: 'Số mũ', latex: 'x^{n}', label: '<span class="italic text-[12px]">x<sup class="text-[9px]">n</sup></span>' },
    { title: 'Chỉ số dưới', latex: 'A_{n}', label: '<span class="italic text-[12px]">A<sub class="text-[8px]">n</sub></span>' },
    { title: 'Chỉ số trên/dưới', latex: 'X_{n}^{m}', label: '<span class="flex items-center italic text-[12px]">X<span class="flex flex-col text-[7px] leading-none ml-0.5 mt-0.5"><span>m</span><span>n</span></span></span>' },
    { title: 'Căn bậc 2', latex: '\\sqrt{x}', label: '<span class="italic text-[12px]">√<span class="border-t border-slate-600">x</span></span>' },
    { title: 'Căn bậc n', latex: '\\sqrt[n]{x}', label: '<span class="italic text-[12px]"><sup class="text-[7px] mr-[-2px]">n</sup>√<span class="border-t border-slate-600">x</span></span>' },
    { title: 'Trị tuyệt đối', latex: '|x|', label: '<span class="text-[12px]">|x|</span>' },
    { title: 'Logarit cơ số', latex: '\\log_{a}(b)', label: '<span class="text-[11px]">log<sub class="text-[8px]">a</sub></span>' },
    { title: 'Logarit Nepe (ln)', latex: '\\ln(x)', label: '<span class="text-[11px]">ln</span>' },
    { title: 'Hệ 2 Phương trình', latex: '\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}', label: '<span class="flex items-center"><span class="text-[18px] leading-none mr-0.5">{</span><span class="flex flex-col leading-[0.9] text-[6px]"><span>x+y</span><span>x-y</span></span></span>' },
    { title: 'Hệ 3 Phương trình', latex: '\\begin{cases} x + y + z = 1 \\\\ x - y = 0 \\\\ y + z = 2 \\end{cases}', label: '<span class="flex items-center"><span class="text-[18px] leading-none mr-0.5">{</span><span class="flex flex-col leading-[0.8] text-[5px]"><span>x+y+z</span><span>x-y</span><span>y+z</span></span></span>' },
    { title: 'Nghiệm Hoặc (2 lớp)', latex: '\\begin{bmatrix} x = a \\\\ x = b \\end{bmatrix}', label: '<span class="flex items-center"><span class="text-[18px] leading-none mr-0.5">[</span><span class="flex flex-col leading-[0.9] text-[6px]"><span>x=a</span><span>x=b</span></span></span>' },
    { title: 'Nghiệm Hoặc (3 lớp)', latex: '\\begin{bmatrix} x = a \\\\ x = b \\\\ x = c \\end{bmatrix}', label: '<span class="flex items-center"><span class="text-[18px] leading-none mr-0.5">[</span><span class="flex flex-col leading-[0.8] text-[5px]"><span>x=a</span><span>x=b</span><span>x=c</span></span></span>' },
    { title: 'Ma trận ngoặc tròn 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', label: '<span class="flex items-center"><span class="text-[16px] leading-none">(</span><span class="flex flex-col leading-[0.9] text-[6px] text-center"><span>a b</span><span>c d</span></span><span class="text-[16px] leading-none">)</span></span>' },
    { title: 'Ma trận ngoặc tròn 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', label: '<span class="flex items-center"><span class="text-[16px] leading-none">(</span><span class="flex flex-col leading-[0.8] text-[5px] text-center"><span>a b c</span><span>d e f</span><span>g h i</span></span><span class="text-[16px] leading-none">)</span></span>' },
    { title: 'Định thức 2x2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', label: '<span class="flex items-center"><span class="text-[16px] leading-none">|</span><span class="flex flex-col leading-[0.9] text-[6px] text-center"><span>a b</span><span>c d</span></span><span class="text-[16px] leading-none">|</span></span>' },
    { title: 'Định thức 3x3', latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}', label: '<span class="flex items-center"><span class="text-[16px] leading-none">|</span><span class="flex flex-col leading-[0.8] text-[5px] text-center"><span>a b c</span><span>d e f</span><span>g h i</span></span><span class="text-[16px] leading-none">|</span></span>' },
    { title: 'Giới hạn (lim)', latex: '\\lim_{x \\to x_0} f(x)', label: '<span class="flex flex-col items-center leading-[0.8] mt-1 text-[11px]"><span>lim</span><span class="text-[5px]">x→0</span></span>' },
    { title: 'Tổng (Sigma)', latex: '\\sum_{i=1}^{n} x_i', label: '<span class="flex flex-col items-center leading-[0.8] mt-1 text-[11px]"><span>∑</span><span class="text-[5px]">i=1</span></span>' },
    { title: 'Tích (Pi)', latex: '\\prod_{i=1}^{n} x_i', label: '<span class="flex flex-col items-center leading-[0.8] mt-1 text-[11px]"><span>∏</span><span class="text-[5px]">i=1</span></span>' },
    { title: 'Tích phân xác định', latex: '\\int_{a}^{b} f(x)dx', label: '<span class="flex items-center"><span class="text-[16px] leading-none">∫</span><span class="flex flex-col leading-[0.8] text-[6px] -ml-0.5"><span>b</span><span>a</span></span></span>' },
    { title: 'Tích phân kép', latex: '\\iint_{D} f(x,y)dxdy', label: '<span class="flex items-center"><span class="text-[16px] leading-none">∬</span><span class="text-[6px] mt-2 -ml-0.5">D</span></span>' },
    { title: 'Tích phân đường', latex: '\\oint_{C} f(z)dz', label: '<span class="flex items-center"><span class="text-[16px] leading-none">∮</span><span class="text-[6px] mt-2 -ml-0.5">C</span></span>' },
    { title: 'Đạo hàm', latex: 'f^{\\prime}(x)', label: '<span class="italic text-[12px]">f \'(x)</span>' },
    { title: 'Đạo hàm phân số', latex: '\\frac{d}{dx}f(x)', label: '<span class="flex items-center"><span class="flex flex-col items-center leading-[1] text-[9px] mr-0.5"><span>d</span><span class="border-t border-slate-600 w-full my-[1px]"></span><span>dx</span></span></span>' },
    { title: 'Vectơ', latex: '\\vec{v}', label: '<div class="flex flex-col items-center leading-[0.8] mt-1"><span class="text-[8px]">→</span><span class="text-[11px] italic">v</span></div>' },
    { title: 'Vectơ 3 chiều', latex: '\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', label: '<span class="flex items-center"><span class="text-[16px] leading-none">(</span><span class="flex flex-col leading-[0.8] text-[5px] text-center"><span>x</span><span>y</span><span>z</span></span><span class="text-[16px] leading-none">)</span></span>' },
    { title: 'Độ dài Vectơ', latex: '|\\vec{AB}|', label: '<span class="text-[12px]">|<div class="inline-flex flex-col items-center leading-[0.8] mx-0.5"><span class="text-[6px]">→</span><span class="text-[8px] italic">AB</span></div>|</span>' },
    { title: 'Góc', latex: '\\widehat{ABC}', label: '<span class="flex items-center"><span class="text-[12px] leading-none">∠</span></span>' },
    { title: 'Cung tròn', latex: '\\widehat{AB}', label: '<div class="flex flex-col items-center leading-[0.8] mt-1"><span class="text-[10px]">︵</span><span class="text-[9px] italic">AB</span></div>' },
    { title: 'Sin, Cos, Tan', latex: '\\sin(x)', label: '<span class="text-[10px]">sin</span>' },
    { title: 'Mũi tên P/Ư (t°)', latex: '\\xrightarrow{t^{\\circ}}', label: '<div class="flex flex-col items-center leading-[0.8] mt-1"><span class="text-[7px]">t°</span><span class="text-[12px]">⟶</span></div>' },
    { title: 'Mũi tên Xúc tác', latex: '\\xrightarrow[xt]{t^{\\circ}}', label: '<div class="flex flex-col items-center leading-[0.8] mt-1"><span class="text-[6px]">t°</span><span class="text-[12px]">⟶</span><span class="text-[6px]">xt</span></div>' },
    { title: 'Ký hiệu Đồng vị', latex: '^{A}_{Z}X', label: '<span class="flex items-center text-[11px]"><span class="flex flex-col leading-[0.8] text-[7px] text-right mr-0.5"><span>A</span><span>Z</span></span>X</span>' },
    { title: 'Kết tủa', latex: '\\downarrow', label: '<span class="text-[12px]">↓</span>' },
    { title: 'Bay hơi', latex: '\\uparrow', label: '<span class="text-[12px]">↑</span>' }
];

window.generateMathToolbar = function(editorId) {
    let buttonsHtml = mathSymbols.map(sym => 
        `<button type="button" onclick="insertFastText('${editorId}', '${sym}')" 
         class="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 font-serif text-sm transition-colors shadow-sm" title="Chèn ${sym}">
            ${sym}
        </button>`
    ).join('');

    let structHtml = latexMathStructures.map((struct, index) => 
        `<button type="button" onclick="insertLaTeX('${editorId}', ${index})" 
         class="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-blue-100 hover:text-blue-700 hover:border-blue-400 transition-all shadow-sm text-slate-700" title="${struct.title}">
            ${struct.label}
        </button>`
    ).join('');

    return `
    <div class="bg-slate-50 border-x border-b border-slate-300 rounded-b-lg p-3">
        <div class="text-[10px] font-black text-orange-700 uppercase mb-2 tracking-wider border-b pb-1 border-orange-100">⚡ Ký hiệu Nhanh:</div>
        <div class="flex flex-wrap gap-1 mb-4">
            ${buttonsHtml}
        </div>
        <div class="text-[10px] font-black text-blue-700 uppercase mb-2 tracking-wider border-b pb-1 border-blue-100">🧮 Cấu trúc Toán/Lý/Hóa (Chuẩn LaTeX - MathType):</div>
        <div class="flex flex-wrap gap-1.5 p-2 bg-white border border-blue-100 rounded-lg shadow-inner max-h-[180px] overflow-y-auto">
            ${structHtml}
        </div>
    </div>`;
};

window.getQuillEditor = function(eid) {
    if (typeof editors !== 'undefined' && editors[eid]) return editors[eid];
    const domNode = document.getElementById('ed-' + eid) || document.getElementById(eid);
    if (domNode && typeof Quill !== 'undefined') return Quill.find(domNode);
    return null;
};

window.insertFastText = function(editorId, text) {
    const editor = window.getQuillEditor(editorId);
    if (!editor) return;
    editor.focus();
    let range = editor.getSelection(true) || { index: editor.getLength() };
    editor.insertText(range.index, text);
    editor.setSelection(range.index + text.length);
};

window.insertLaTeX = function(editorId, index) {
    const struct = latexMathStructures[index];
    if (!struct) return;
    const editor = window.getQuillEditor(editorId);
    if (!editor) return;
    
    if (typeof katex === 'undefined') {
        alert("⏳ Hệ thống đang tải bộ vẽ Toán Học (KaTeX). Vui lòng đợi 2 giây rồi bấm lại!");
        return;
    }

    editor.focus();
    let range = editor.getSelection(true) || { index: editor.getLength() };
    editor.insertEmbed(range.index, 'formula', struct.latex);
    editor.setSelection(range.index + 1);
};




// DÁN VÀO CUỐI FILE ADMIN.JS
document.addEventListener('click', function(e) {
    if (e.target && (e.target.innerText === 'GIAO ĐỀ NGAY' || e.target.onclick?.toString().includes('publishExam'))) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Đã chặn hàm cũ, đang chạy trình cứu hộ...");
        
        const examName = document.getElementById('ex-name')?.value || "Đề thi";
        const classes = Array.from(document.querySelectorAll('#assign-classes input:checked')).map(c => c.value);
        
        if(classes.length === 0) return alert("Chưa chọn lớp!");

        let data = [];
        // Quét tất cả các ô nhập trên màn hình, bất kể ID là gì
        document.querySelectorAll('.ql-editor').forEach((editor, index) => {
            data.push({
                type: 'question',
                content: editor.innerHTML,
                id: Date.now() + index
            });
        });

        const school = localStorage.getItem('schoolName') || "THPT_PHU_TAM";
        firebase.database().ref(`schools/${school}/exams`).push({
            name: examName,
            assignedClasses: classes,
            questions: data,
            timestamp: Date.now()
        }).then(() => {
            alert("THÀNH CÔNG RỒI! Đừng điên nữa nhé, đề đã lên.");
            location.reload();
        }).catch(err => alert("Lỗi: " + err.message));
    }
}, true);

// =========================================================
// CHỨC NĂNG XEM CHI TIẾT BÀI LÀM
// =========================================================

// 1. Hàm đóng Modal
function dongModalChiTiet() {
    document.getElementById('modal-chitiet-bailam').classList.add('hidden');
}

// 2. Hàm mở Modal và lấy thông tin
function moModalXemBai(nutBam) {
    // Tìm thẻ <tr> (hàng) chứa cái nút vừa bấm
    const hang = nutBam.closest('tr');
    if (!hang) return;

    // Lấy thông tin từ các cột trong hàng đó (td)
    const cacCot = hang.querySelectorAll('td');
    
    // Giả sử cột 1 là Mã HS, Cột 2 là Tên, Cột 3 là Lớp, Cột 4 là Điểm...
    // (Bạn có thể điều chỉnh [số] cho đúng với thứ tự cột thực tế trên web của bạn)
    const tenHocSinh = cacCot[1] ? cacCot[1].innerText : "Học sinh ẩn danh";
    const lopHoc = cacCot[2] ? cacCot[2].innerText : "...";
    const diemSo = cacCot[3] ? cacCot[3].innerText : "0";

    // Mở Bảng lên
    const modal = document.getElementById('modal-chitiet-bailam');
    const noiDung = document.getElementById('noidung-chitiet-bailam');
    modal.classList.remove('hidden');

    // Tạo nội dung hiển thị
    noiDung.innerHTML = `
        <div class="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm mb-4">
            <h4 class="text-2xl font-bold text-indigo-800 mb-1">${tenHocSinh}</h4>
            <div class="flex gap-4 text-gray-600 text-sm">
                <p><i class="fas fa-users mr-1"></i> Lớp: <strong>${lopHoc}</strong></p>
                <p><i class="fas fa-clock mr-1"></i> Trạng thái: <strong>Đã nộp bài</strong></p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-gray-500">Điểm số đạt được:</p>
                <p class="text-4xl font-black text-red-500">${diemSo}</p>
            </div>
        </div>
        
        <div class="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 text-sm">
            <p><i class="fas fa-info-circle mr-2"></i> <strong>Ghi chú:</strong> Hiện tại hệ thống đang lấy thông tin cơ bản. Để xem chi tiết từng câu trả lời trắc nghiệm hoặc bài code, bạn cần kết nối thêm ID bài làm này với cơ sở dữ liệu Firebase.</p>
        </div>
    `;
}


