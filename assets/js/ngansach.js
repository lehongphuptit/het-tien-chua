window.khoiTaoTrangNganSach = function() {
    const form = document.getElementById("formNganSach");
    if (!form) return;

    capNhatDropdownNganSach();
    
    veTienDoNganSach();

    form.onsubmit = function(e) {
        e.preventDefault();
        luuNganSach();
    };
}

async function capNhatDropdownNganSach() {
    const select = document.getElementById("danhMucNganSachSelect"); 
    if(!select) return;

    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');
    select.innerHTML = '<option value="">-- Đang tải danh mục... --</option>';
    
    try {
        const res = await fetch(`https://het-tien-chua-backend.onrender.com/api/get_categories?user_id=${idNguoiDung}`);
        const dataRes = await res.json();
        
        select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        
        if (dataRes.success && dataRes.data.length > 0) {
            const danhMucChi = dataRes.data.filter(item => item.loai === "chi");

            if (danhMucChi.length > 0) {
                danhMucChi.forEach(item => {
                    let option = document.createElement("option");
                    option.value = item.ten;
                    option.textContent = item.ten;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">-- Chưa có danh mục chi tiêu  --</option>';
            }
        } else {
            select.innerHTML = '<option value="">-- Chưa có danh mục, hãy tạo trước --</option>';
        }
    } catch (error) {
        select.innerHTML = '<option value="">-- Lỗi tải danh mục --</option>';
    }
}
// KHỞI TẠO TRANG NGÂN SÁCH
window.khoiTaoTrangNganSach = async function() {
    await capNhatDropdownNganSach();

    const formNganSach = document.getElementById("formNganSach");
    if (formNganSach) {
        formNganSach.addEventListener("submit", function(e) {
            e.preventDefault();
            luuNganSach();
        });
    }

    if (typeof veTienDoNganSach === "function") {
        veTienDoNganSach();
    }
}

// HÀM LƯU NGÂn SÁCH (TẠM LƯU DƯỚI BỘ NHỚ TRÌNH DUYỆT)
function luuNganSach() {
    const danhMuc = document.getElementById("danhMucNganSachSelect").value;
    const hanMucInput = document.getElementById("hanMuc").value;
    const hanMuc = parseFloat(hanMucInput);

    if (!danhMuc) {
        window.hienThiThongBao("Vui lòng chọn một danh mục!", "error");
        return;
    }
    if (!hanMucInput || hanMuc <= 0) {
        window.hienThiThongBao("Hạn mức phải lớn hơn 0!", "error");
        return;
    }

    const nganSachMoi = { id: Date.now(), danhMuc: danhMuc, hanMuc: hanMuc };
    let dsNganSach = JSON.parse(localStorage.getItem("DATA_NGAN_SACH")) || [];
    
    dsNganSach = dsNganSach.filter(item => item.danhMuc.toLowerCase() !== danhMuc.toLowerCase());
    dsNganSach.push(nganSachMoi);
    
    localStorage.setItem("DATA_NGAN_SACH", JSON.stringify(dsNganSach));
    
    document.getElementById("formNganSach").reset();
    
    if (typeof veTienDoNganSach === "function") {
        veTienDoNganSach();
    }
    
    window.hienThiThongBao("Đã thiết lập ngân sách thành công! 🎯", "success");
}

function veTienDoNganSach() {
    const container = document.getElementById("danhSachNganSach");
    if(!container) return;
    
    let dsNganSach = JSON.parse(localStorage.getItem("DATA_NGAN_SACH")) || [];
    let dsGiaoDich = JSON.parse(localStorage.getItem("DATA_GIAO_DICH")) || []; 
    
    container.innerHTML = "";
    
    if(dsNganSach.length === 0) {
        container.innerHTML = "<p style='color: #a3aed1; text-align: center; margin-top: 20px;'>Chưa có ngân sách nào được thiết lập.</p>";
        return;
    }

    dsNganSach.forEach(ns => {
        let tongChi = 0;
        
        dsGiaoDich.forEach(gd => {
            if(gd.loai === "chi" && gd.danhMuc.toLowerCase() === ns.danhMuc.toLowerCase()) {
                tongChi += gd.soTien;
            }
        });

        let phanTram = (tongChi / ns.hanMuc) * 100;
        let phanTramHienThi = phanTram > 100 ? 100 : phanTram;

        let classMau = "";
        if(phanTram >= 90) classMau = "danger";
        else if(phanTram >= 70) classMau = "warning";

        let tongChiFormat = tongChi.toLocaleString('vi-VN') + " ₫";
        let hanMucFormat = ns.hanMuc.toLocaleString('vi-VN') + " ₫";

        let div = document.createElement("div");
        div.className = "budget-item";
        div.innerHTML = `
            <div class="budget-header">
                <span><i class="fa-solid fa-tag"></i> ${ns.danhMuc}</span>
                <span class="${classMau}">${phanTram.toFixed(1)}%</span>
            </div>
            <div class="budget-stats">
                Đã tiêu: <b>${tongChiFormat}</b> / ${hanMucFormat}
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill ${classMau}" style="width: ${phanTramHienThi}%"></div>
            </div>
        `;
        container.appendChild(div);
    });
}
