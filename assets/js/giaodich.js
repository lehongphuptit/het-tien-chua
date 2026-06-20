window.khoiTaoTrangGiaoDich = async function() {
    const form = document.getElementById("formGiaoDich");
    if (!form) return;

    capNhatDropdownDanhMuc();

    await veBangGiaoDich();

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        await luuGiaoDichMoi();
    });
}

// Hàm đổ dữ liệu từ ĐÁM MÂY vào thẻ Select ở trang Giao dịch
async function capNhatDropdownDanhMuc() {
    const select = document.getElementById("danhMucSelect");
    if(!select) return;

    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');
    select.innerHTML = '<option value="">-- Đang tải danh mục... --</option>';
    
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/get_categories?user_id=${idNguoiDung}`);
        const dataRes = await res.json();
        
        select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        
        if (dataRes.success && dataRes.data.length > 0) {
            dataRes.data.forEach(item => {
                let option = document.createElement("option");
                option.value = item.ten;
                option.textContent = `[${item.loai.toUpperCase()}] ${item.ten}`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">-- Chưa có danh mục, hãy tạo trước --</option>';
        }
    } catch (error) {
        select.innerHTML = '<option value="">-- Lỗi tải danh mục --</option>';
    }
}

// Hàm lưu giao dịch phi thẳng lên mây
async function luuGiaoDichMoi() {
    const loai = document.getElementById("loaiGiaoDich").value;
    const danhMuc = document.getElementById("danhMucSelect").value; 
    const soTien = parseFloat(document.getElementById("soTien").value);
    const ngay = document.getElementById("ngayGiaoDich").value;
    const ghiChu = document.getElementById("ghiChu").value;
    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');

    if (!danhMuc) {
        window.hienThiThongBao("Vui lòng chọn danh mục nhé!", "error");
        return;
    }
    if (soTien <= 0) {
        window.hienThiThongBao("Số tiền phải lớn hơn 0 ₫!", "error");
        return;
    }

    try {
        // Gửi thẳng sang API của Python
        const res = await fetch('http://127.0.0.1:5000/api/add_transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: idNguoiDung,
                soTien: soTien,
                loai: loai,
                // Gộp tên danh mục vào ghi chú luôn để database dễ lưu tạm thời
                ghiChu: `[${danhMuc}] ` + ghiChu, 
                ngay: ngay
            })
        });
        
        const data = await res.json();
        if (data.success) {
            document.getElementById("formGiaoDich").reset();
            
            if (loai === "thu") {
                window.hienThiThongBao("Ting ting! Đã cất tiền vào hũ thành công 🐷", "success");
            } else {
                window.hienThiThongBao("Đã ghi nhận khoản chi tiêu! 💸", "success");
            }
            
            // Vẽ lại bảng bằng dữ liệu mới nhất trên mây
            await veBangGiaoDich(); 
        } else {
            window.hienThiThongBao("Lỗi: " + data.message, "error");
        }
    } catch (error) {
        window.hienThiThongBao("Lỗi kết nối với server!", "error");
    }
}

// Hàm vẽ bảng bốc dữ liệu từ API thay vì LocalStorage
async function veBangGiaoDich() {
    const tbody = document.getElementById("bangGiaoDich");
    if(!tbody) return;
    
    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Đang tải dữ liệu...</td></tr>";

    try {
        // Gọi API lấy dữ liệu
        const res = await fetch(`http://127.0.0.1:5000/api/get_transactions?user_id=${idNguoiDung}`);
        const dataRes = await res.json();
        
        if (dataRes.success) {
            let danhSach = dataRes.data; // Mảng dữ liệu từ Python trả về
            tbody.innerHTML = "";

            if (danhSach.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Chưa có giao dịch nào</td></tr>";
                return;
            }

            danhSach.forEach(item => {
                let tienFormat = item.soTien.toLocaleString('vi-VN') + " ₫";
                let classMau = (item.loai === "thu") ? "text-green" : "text-red";
                let dau = (item.loai === "thu") ? "+" : "-";

                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.ngay}</td>
                    <td colspan="2">${item.ghiChu}</td>
                    <td class="${classMau}">${dau}${tienFormat}</td>
                    <td>
                        <button class="btn-delete" onclick="xoaGiaoDich(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;color:red;'>Lỗi tải dữ liệu</td></tr>";
    }
}
// HÀM XÓA GIAO DỊCH TRÊN MÂY
window.xoaGiaoDich = async function(idCanXoa) {
    // Gọi popup SweetAlert2 hỏi cho chắc chắn trước khi xóa
    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Khoản tiền này sẽ bốc hơi khỏi hệ thống và không thể khôi phục!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5b5b', // Màu đỏ cảnh báo
        cancelButtonColor: '#a3aed1',  // Màu xám
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Xóa luôn!',
        cancelButtonText: 'Quay xe'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch('http://127.0.0.1:5000/api/delete_transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idCanXoa })
                });

                const data = await res.json();
                if (data.success) {
                    window.hienThiThongBao("Đã xóa giao dịch thành công! 🗑️", "success");
                    await veBangGiaoDich(); 
                } else {
                    window.hienThiThongBao("Lỗi: " + data.message, "error");
                }
            } catch (error) {
                window.hienThiThongBao("Lỗi kết nối với server!", "error");
            }
        }
    });
}