from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import errors
import os
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app) 
DATABASE_URL = os.environ.get("DATABASE_URL")
# 1. API ĐĂNG KÝ (REGISTER)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    fullname = data.get('fullname')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO users (full_name, email, username, password_hash) VALUES (%s, %s, %s, %s)",
            (fullname, email, username, password)
        )
        
        conn.commit()
        cur.close()

        return jsonify({"success": True, "message": "Đăng ký thành công!"}), 200

    except errors.UniqueViolation:
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": "Email hoặc Tên đăng nhập đã tồn tại!"}), 400
        
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 400
        
    finally:
        if conn:
            conn.close()

# 2. API ĐĂNG NHẬP (LOGIN) - PHẦN BRO BỊ THIẾU
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT id, full_name FROM users WHERE username = %s AND password_hash = %s", (username, password))
        user = cur.fetchone() 

        if user:
            return jsonify({
                "success": True, 
                "message": "Đăng nhập thành công!", 
                "user_id": user[0], 
                "full_name": user[1]
            }), 200
        else:
            return jsonify({"success": False, "message": "Sai tên đăng nhập hoặc mật khẩu!"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500
        
    finally:
        if conn:
            cur.close()
            conn.close()
# 3. API CẬP NHẬT HỒ SƠ (CÀI ĐẶT)
@app.route('/api/update_profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    user_id = data.get('user_id')
    new_name = data.get('full_name')
    if not user_id or not new_name:
        return jsonify({"success": False, "message": "Thiếu thông tin!"}), 400
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("UPDATE users SET full_name = %s WHERE id = %s", (new_name, user_id))
        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật hồ sơ thành công!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500
    finally:
        if conn:
            cur.close()
            conn.close() 
# 5. API LẤY DANH SÁCH GIAO DỊCH
@app.route('/api/get_transactions', methods=['GET'])
def get_transactions():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Chưa đăng nhập!"}), 400

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            SELECT id, amount, type, note, transaction_date 
            FROM transactions 
            WHERE user_id = %s 
            ORDER BY transaction_date DESC
        """, (user_id,))
        rows = cur.fetchall()

        danh_sach = []
        for row in rows:
            danh_sach.append({
                "id": row[0],
                "soTien": float(row[1]),
                "loai": row[2], # 'thu' hoặc 'chi'
                "ghiChu": row[3],
                "ngay": row[4].strftime("%Y-%m-%d")
            })

        return jsonify({"success": True, "data": danh_sach}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()


# 6. API LƯU GIAO DỊCH MỚI
@app.route('/api/add_transaction', methods=['POST'])
def add_transaction():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('soTien')
    loai = data.get('loai') 
    ghi_chu = data.get('ghiChu')
    ngay = data.get('ngay')

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO transactions (user_id, amount, type, note, transaction_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, amount, loai, ghi_chu, ngay))
        
        conn.commit()
        return jsonify({"success": True, "message": "Đã lưu giao dịch!"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# 7. API LẤY DANH SÁCH DANH MỤC
@app.route('/api/get_categories', methods=['GET'])
def get_categories():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Chưa đăng nhập!"}), 400

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("SELECT id, name, type FROM categories WHERE user_id = %s ORDER BY id DESC", (user_id,))
        rows = cur.fetchall()

        danh_sach = []
        for row in rows:
            danh_sach.append({
                "id": row[0],
                "ten": row[1],
                "loai": row[2]
            })

        return jsonify({"success": True, "data": danh_sach}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# 8. API THÊM DANH MỤC MỚI
@app.route('/api/add_category', methods=['POST'])
def add_category():
    data = request.get_json()
    user_id = data.get('user_id')
    ten_dm = data.get('ten')
    loai_dm = data.get('loai')

    if not user_id or not ten_dm or not loai_dm:
        return jsonify({"success": False, "message": "Thiếu thông tin danh mục!"}), 400

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO categories (user_id, name, type)
            VALUES (%s, %s, %s)
        """, (user_id, ten_dm, loai_dm))
        
        conn.commit()
        return jsonify({"success": True, "message": "Đã thêm danh mục mới!"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# 9. API XÓA GIAO DỊCH (Đã fix lỗi CORS OPTIONS)
@app.route('/api/delete_transaction', methods=['POST', 'OPTIONS'])
def delete_transaction():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    transaction_id = data.get('id')

    if not transaction_id:
        return jsonify({"success": False, "message": "Thiếu ID giao dịch!"}), 400

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM transactions WHERE id = %s", (transaction_id,))
        conn.commit()
        
        return jsonify({"success": True, "message": "Đã xóa giao dịch!"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# 10. API XÓA DANH MỤC
@app.route('/api/delete_category', methods=['POST', 'OPTIONS'])
def delete_category():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    cat_id = data.get('id')

    if not cat_id:
        return jsonify({"success": False, "message": "Thiếu ID danh mục!"}), 400

    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM categories WHERE id = %s", (cat_id,))
        conn.commit()
        
        return jsonify({"success": True, "message": "Đã xóa danh mục!"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi: {str(e)}"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# KHỞI ĐỘNG SERVER
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Backend đã sẵn sàng chạy tại cổng: {port}")
    app.run(host='0.0.0.0', port=port, debug=False)