
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const logoTrangChu = document.getElementById("logoTrangChu");
    if (logoTrangChu) {
        logoTrangChu.addEventListener("click", () => {
            navLinks[0].click(); 
        });
    }
    const mainContent = document.getElementById("noiDungChinh");
    const tieuDeTrang = document.getElementById("tieuDeTrang");
    const tenNguoiDung = localStorage.getItem("USER_NAME");
    if (tenNguoiDung) {
        const theTen = document.querySelector(".user-name");
        if (theTen) {
            theTen.innerText = tenNguoiDung;
        }
    }
    
    let currentPage = "";

    async function loadPage(url, title, element) {
        if (currentPage === url) return; 
        
        currentPage = url;
        
        try {
            mainContent.innerHTML = `<div style="text-align:center; padding: 50px;">Đang tải...</div>`;
            const response = await fetch(url);
            if (!response.ok) throw new Error();
            
            const html = await response.text();
            mainContent.innerHTML = html;
            tieuDeTrang.textContent = title;

            if (url.includes("giaodich.html")) window.khoiTaoTrangGiaoDich();
            if (url.includes("tongquan.html")) window.veBieuDoThongKe();
            if (url.includes("ngansach.html")) window.khoiTaoTrangNganSach();
            if (url.includes("danhmuc.html") && typeof window.khoiTaoTrangDanhMuc === "function") window.khoiTaoTrangDanhMuc();
            if (url.includes("hoso.html")) window.khoiTaoTrangHoSo();
        } catch (e) {
            mainContent.innerHTML = `<h3>Lỗi: Không tìm thấy file ${url}</h3>`;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            loadPage(link.getAttribute("data-page"), link.textContent.trim(), link);
        });
    });

    navLinks[0].click();
});


// Hàm vẽ biểu đồ cho trang Tổng Quan 
window.veBieuDoThongKe = async function() {
    const canvas = document.getElementById('bieuDoChiTieu');
    if (!canvas) return;

    let dsGiaoDich = await window.layDanhSachGiaoDich();

    // 1. TÍNH TOÁN VÀ HIỂN THỊ CÁC CON SỐ

    let tongThu = 0;
    let tongChi = 0;

    dsGiaoDich.forEach(item => {
        if (item.loai === "thu") tongThu += item.soTien;
        else if (item.loai === "chi") tongChi += item.soTien;
    });

    let soDu = tongThu - tongChi;

    // Lấy các thẻ HTML để điền số
    let theSoDu = document.getElementById("tongSoDu");
    let theThu = document.getElementById("tongThuHienThi");
    let theChi = document.getElementById("tongChiHienThi");

    // Điền Số dư
    if (theSoDu) {
        theSoDu.innerHTML = soDu.toLocaleString('vi-VN') + " ₫";
        if (soDu < 0) theSoDu.style.color = "#ff5b5b";
        else theSoDu.style.color = "#2b3674"; 
    }
    
    // Điền Tổng Thu
    if (theThu) {
        theThu.innerHTML = "+" + tongThu.toLocaleString('vi-VN') + " ₫";
        theThu.style.color = "#05cd99"; 
    }
    
    // Điền Tổng Chi
    if (theChi) {
        theChi.innerHTML = "-" + tongChi.toLocaleString('vi-VN') + " ₫";
        theChi.style.color = "#ff5b5b"; 
    }
    //  VẼ BIỂU ĐỒ PHÂN TÍCH CHI TIÊU
    let dsChiTieu = dsGiaoDich.filter(item => item.loai === "chi");

    let gomNhom = {};
    dsChiTieu.forEach(item => {
        let match = item.ghiChu.match(/\[(.*?)\]/);
        let ten = match ? match[1] : "Khác";

        if (gomNhom[ten]) {
            gomNhom[ten] += item.soTien;
        } else {
            gomNhom[ten] = item.soTien;
        }
    });

    let nhanBiendo = Object.keys(gomNhom);
    let duLieuTien = Object.values(gomNhom);

    if (window.myChart instanceof Chart) window.myChart.destroy();

    const ctx = canvas.getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: nhanBiendo.length > 0 ? nhanBiendo : ["Chưa có dữ liệu"],
            datasets: [{
                data: duLieuTien.length > 0 ? duLieuTien : [1],
                backgroundColor: duLieuTien.length > 0 ? ['#ff5b5b', '#ffce20', '#05cd99', '#4318ff', '#a3aed1'] : ['#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}
// Hàm hiển thị thông báo Toast
window.hienThiThongBao = function(thongDiep, loai = 'success') {
    let toastBox = document.getElementById('toastBox');
    let toast = document.createElement('div');
    toast.classList.add('toast', loai);

    let icon = loai === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
    
    toast.innerHTML = icon + thongDiep;
    toastBox.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
const nutDangXuat = document.getElementById("btnDangXuat");

function thucHienDangXuat(e) {
    e.preventDefault(); 

    Swal.fire({
        title: 'Đăng xuất?',
        text: "Bạn có chắc chắn muốn thoát khỏi hệ thống không?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5b5b',
        cancelButtonColor: '#a3aed1', 
        confirmButtonText: 'Đồng ý, thoát!',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}
const nutButton = document.getElementById("btnDangXuat");
if (nutButton) nutButton.addEventListener("click", thucHienDangXuat);

const theA = document.querySelector(".logout");
if (theA) theA.addEventListener("click", thucHienDangXuat);
// CHỨC NĂNG CÀI ĐẶT (ĐỔI TÊN & DARK MODE)
const btnCaiDat = document.getElementById("btnCaiDat");

if (btnCaiDat) {
    btnCaiDat.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Mở bảng Cài đặt 
        Swal.fire({
            title: 'Cài Đặt Hệ Thống',
            html: `
                <div style="text-align: left; margin-top: 15px;">
                    <label style="font-weight: bold; font-size: 14px; color: #707eae;">Tên hiển thị của bạn:</label>
                    <input id="swal-input-name" class="swal2-input" style="width: 80%; margin-top: 5px;" value="${localStorage.getItem('USER_NAME') || ''}" placeholder="Nhập tên mới...">

                    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                        <label style="font-weight: bold; font-size: 15px;">🌙 Giao diện Tối (Dark Mode)</label>
                        <input type="checkbox" id="swal-input-theme" ${localStorage.getItem('DARK_MODE') === 'true' ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Lưu Thay Đổi',
            cancelButtonText: 'Đóng',
            confirmButtonColor: '#05cd99',
            preConfirm: () => {
                return {
                    newName: document.getElementById('swal-input-name').value.trim(),
                    isDark: document.getElementById('swal-input-theme').checked
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const data = result.value;
                let capNhatThanhCong = false;

                // 1. XỬ LÝ DARK MODE
                if (data.isDark) {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('DARK_MODE', 'true');
                } else {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('DARK_MODE', 'false');
                }

                // 2. GỬI LÊN PYTHON ĐỂ LƯU DATABASE 
                if (data.newName && data.newName !== localStorage.getItem('USER_NAME')) {
                    try {
                        const res = await fetch('https://het-tien-chua-backend.onrender.com/api/update_profile', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: localStorage.getItem('CURRENT_USER_ID'),
                                full_name: data.newName
                            })
                        });
                        
                        const resData = await res.json();
                        if (res.ok && resData.success) {
                            localStorage.setItem('USER_NAME', data.newName);
                            const theTen = document.querySelector(".user-name");
                            if(theTen) theTen.innerText = data.newName;
                            capNhatThanhCong = true;
                        } else {
                            Swal.fire('Lỗi!', resData.message, 'error');
                            return;
                        }
                    } catch (err) {
                        Swal.fire('Lỗi mạng!', 'Không thể kết nối với server Python.', 'error');
                        return;
                    }
                } else {
                    capNhatThanhCong = true;
                }

                if (capNhatThanhCong) {
                    Swal.fire('Thành công!', 'Cài đặt của bạn đã được lưu.', 'success');
                }
            }
        });
    });
}

if (localStorage.getItem('DARK_MODE') === 'true') {
    document.body.classList.add('dark-mode');
}
// CHỨC NĂNG : NÚT GẠT DARK MODE (TOGGLE)
const toggleDarkMode = document.getElementById('checkboxDarkMode');

if (localStorage.getItem('DARK_MODE') === 'true') {
    document.body.classList.add('dark-mode');
    if(toggleDarkMode) toggleDarkMode.checked = true; // Gạt nút sang phải
}

if (toggleDarkMode) {
    toggleDarkMode.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('DARK_MODE', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('DARK_MODE', 'false');
        }
    });
}
// CHỨC NĂNG : XỬ LÝ TRANG HỒ SƠ (hoso.html)
window.khoiTaoTrangHoSo = function() {
    const inputTen = document.getElementById("inputDoiTen");
    const btnLuu = document.getElementById("btnLuuHoSo");

    if (inputTen) {
        inputTen.value = localStorage.getItem('USER_NAME') || '';
    }

    if (btnLuu) {
        btnLuu.addEventListener("click", async function() {
            const tenMoi = inputTen.value.trim();
            const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');

            if (tenMoi === "") {
                Swal.fire('Cảnh báo', 'Tên không được để trống!', 'warning');
                return;
            }

            btnLuu.innerText = "Đang lưu...";
            btnLuu.disabled = true;

            try {
                // Gọi sang Python để cập nhật Neon.tech
                const res = await fetch('https://het-tien-chua-backend.onrender.com/api/update_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: idNguoiDung,
                        full_name: tenMoi
                    })
                });
                
                const resData = await res.json();
                if (res.ok && resData.success) {
                    localStorage.setItem('USER_NAME', tenMoi);
                    const theTenGocPhai = document.querySelector(".user-name");
                    if(theTenGocPhai) theTenGocPhai.innerText = tenMoi;

                    Swal.fire('Thành công!', 'Hồ sơ đã được lưu lên máy chủ.', 'success');
                } else {
                    Swal.fire('Lỗi!', resData.message, 'error');
                }
            } catch (err) {
                Swal.fire('Lỗi mạng!', 'Không thể kết nối với server Python.', 'error');
            } finally {
                btnLuu.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Cập Nhật Lên Hệ Thống`;
                btnLuu.disabled = false;
            }
        });
    }
}
// HÀM DÙNG CHUNG: LẤY GIAO DỊCH TỪ DATABASE (MÂY)
window.layDanhSachGiaoDich = async function() {
    const idNguoiDung = localStorage.getItem('CURRENT_USER_ID');
    if (!idNguoiDung) return [];

    try {
        const res = await fetch(`https://het-tien-chua-backend.onrender.com/api/get_transactions?user_id=${idNguoiDung}`);
        const data = await res.json();
        
        if (data.success) {
            return data.data;
        } else {
            console.error("Lỗi từ server:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Lỗi kết nối server", error);
        return [];
    }
}
