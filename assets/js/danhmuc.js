// KHỞI TẠO TRANG DANH MỤC (GỌI TỪ MAIN.JS)
window.khoiTaoTrangDanhMuc = async function() {
    const form = document.getElementById("formDanhMuc");
    if (!form) return;

    await veBangDanhMuc();

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        await luuDanhMucMoi();
    });
}

// HÀM LƯU DANH MỤC LÊN DATABASE NEON
async function luuDanhMucMoi() {
    const tenDM = document.getElementById("tenDanhMuc").value.trim();
    const loaiDM = document.getElementById("loaiDanhMuc").value;   
    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');

    if (tenDM === "") {
        window.hienThiThongBao("Tên danh mục không được để trống!", "error");
        return;
    }

    try {
        const res = await fetch('https://het-tien-chua-backend.onrender.com/api/add_category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: idNguoiDung,
                ten: tenDM,
                loai: loaiDM
            })
        });

        const data = await res.json();
        if (data.success) {
            window.hienThiThongBao("Đã thêm danh mục lên hệ thống! 🚀", "success");
            document.getElementById("formDanhMuc").reset();
            await veBangDanhMuc();
        } else {
            window.hienThiThongBao("Lỗi: " + data.message, "error");
        }
    } catch (err) {
        window.hienThiThongBao("Lỗi kết nối server Python!", "error");
    }
}

// Sửa hàm veBangDanhMuc để thêm nút Xóa
async function veBangDanhMuc() {
    const tbody = document.getElementById("bangDanhMuc");
    if (!tbody) return;

    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Đang tải...</td></tr>";

    try {
        const res = await fetch(`https://het-tien-chua-backend.onrender.com/api/get_categories?user_id=${idNguoiDung}`);
        const dataRes = await res.json();

        if (dataRes.success) {
            let danhSach = dataRes.data;
            tbody.innerHTML = "";

            if (danhSach.length === 0) {
                tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Chưa có danh mục nào.</td></tr>";
                return;
            }

            danhSach.forEach((item, index) => {
                let loaiText = item.loai === "thu" ? "Thu nhập" : "Chi tiêu";
                let classMau = item.loai === "thu" ? "text-green" : "text-red";

                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td><strong>${item.ten}</strong></td>
                    <td class="${classMau}">${loaiText}</td>
                    <td>
                        <button class="btn-delete" onclick="xoaDanhMuc(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Lỗi tải danh mục</td></tr>";
    }
}
window.xoaDanhMuc = async function(idCanXoa) {
    Swal.fire({
        title: 'Xóa danh mục này?',
        text: "Các giao dịch thuộc danh mục này sẽ không bị mất, nhưng danh mục sẽ biến mất khỏi menu!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5b5b',
        confirmButtonText: 'Xóa ngay'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch('https://het-tien-chua-backend.onrender.com/api/delete_category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idCanXoa })
                });
                const data = await res.json();
                if (data.success) {
                    window.hienThiThongBao("Đã xóa danh mục thành công!", "success");
                    await veBangDanhMuc();
                } else {
                    window.hienThiThongBao("Lỗi: " + data.message, "error");
                }
            } catch (err) {
                window.hienThiThongBao("Lỗi kết nối!", "error");
            }
        }
    });
}
