import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import './Login.css';

function Login() {
    const { showError, showSuccess } = useUI();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setAuthState } = useContext(AuthContext);
    let navigate = useNavigate();    const login = () => {
        if (!username || !password) {
            showError("Vui lòng nhập tên đăng nhập và mật khẩu");
            return;
        }

        // Trim whitespace from inputs
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        const data = {
            username: trimmedUsername, 
            password: trimmedPassword 
        };
        // Trong hàm login, thay đổi phần xử lý response
        axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }        }).then((response) => {
                if (response.data.error) {
                    showError(response.data.error);
                    return;
                }                // Kiểm tra cấu trúc response đúng
                if (!response.data.accessToken || !response.data.user || !response.data.user.id) {
                    showError("Lỗi xác thực từ server");
                    return;
                }
                  // Lưu token và thông tin người dùng
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("username", response.data.user.username);
                localStorage.setItem("id", response.data.user.id.toString());
                
                const newAuthState = {
                    username: response.data.user.username,
                    id: response.data.user.id,
                    status: true
                };
                
                setAuthState(newAuthState);
                  // Chuyển hướng dựa trên role của user
                if (response.data.user.role === 'admin') {
                    showSuccess('Chào mừng Admin! Đang chuyển đến trang quản trị...');
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            })            .catch((error) => {
                if (error.code === "ERR_NETWORK") {
                    showError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
                } else if (error.response) {
                    showError(error.response.data.error || "Đăng nhập thất bại");
                } else {
                    showError("Có lỗi xảy ra khi đăng nhập");
                }
            });
  };    return (
        <div className="loginContainer">
            <div className="loginForm">
                <h2>Login</h2>
                <div className="formGroup">
                    <label>Username:</label>
                    <input
                        type="text"
                        placeholder="Enter username..."
                        onChange={(event) => { setUsername(event.target.value) }}
                    />
                </div>
                <div className="formGroup">
                    <label>Password:</label>
                    <input
                        type="password"
                        placeholder="Enter password..."
                        onChange={(event) => { setPassword(event.target.value) }}
                    />                </div>
                <button onClick={login}>Login</button>
                <div className="forgot-password-link">
                    <a href="#forgot">Quên mật khẩu?</a>
                </div>
                <p className="register-link">
                    Chưa có tài khoản? <Link to="/register">Đăng kí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
