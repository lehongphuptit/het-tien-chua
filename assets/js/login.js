if (localStorage.getItem("IS_LOGGED_IN") === "true") {
    window.location.href = "index.html";
}
document.getElementById("formDangNhap").addEventListener("submit", async function(e) {
    e.preventDefault(); 
    
    const btnSubmit = document.getElementById("btnDangNhap");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Đang kiểm tra...";
    
    const u = document.getElementById("log_username").value.trim().toLowerCase();
    const p = document.getElementById("log_password").value.trim();

    try {
        const response = await fetch('https://het-tien-chua-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Đăng nhập đúng -> Cấp vé vào LocalStorage
            localStorage.setItem("IS_LOGGED_IN", "true");
            localStorage.setItem("USER_NAME", data.full_name);
            localStorage.setItem("CURRENT_USER_ID", data.user_id); 
            
            // THÔNG BÁO ĐĂNG NHẬP THÀNH CÔNG
            Swal.fire({
                title: 'Tuyệt vời!',
                text: 'Bạn đã đăng nhập thành công',
                icon: 'success',
                timer: 1500, //
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
            });

        } else {
            // báo lỗi
            Swal.fire({
                title: 'Úi chà!',
                text: data.message,
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    } catch (error) {
        console.error("Lỗi:", error);
        Swal.fire({
            title: 'Lỗi kết nối!',
            text: 'Không thể kết nối với server. Bạn đã bật app.py lên chưa?',
            icon: 'warning',
            confirmButtonColor: '#2563eb'
        });
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Đăng Nhập Ngay";
    }
});
