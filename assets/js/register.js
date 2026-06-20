document.getElementById("formDangKy").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById("btnDangKy");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Đang xử lý...";
    
    const fullname = document.getElementById("reg_fullname").value.trim();
    const email = document.getElementById("reg_email").value.trim();
    const username = document.getElementById("reg_username").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value.trim();

    try {
        const response = await fetch('http://127.0.0.1:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                fullname: fullname, 
                email: email, 
                username: username, 
                password: password 
            })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            alert("🎉 " + data.message + " Chuyển sang trang Đăng nhập nhé!");
            document.getElementById("formDangKy").reset();
            window.location.href = "login.html"; 
        } else {
            alert("❌ Lỗi: " + data.message); 
        }
    } catch (error) {
        console.error("Lỗi mạng:", error);
        alert("Lỗi kết nối! Bạn đã bật file app.py (Python) lên chưa?");
    } finally {
       
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Hoàn Tất Đăng Ký";
    }
});