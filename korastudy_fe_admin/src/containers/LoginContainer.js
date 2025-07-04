import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');
    
    // Mô phỏng thời gian gọi API
    setTimeout(() => {
      try {
        // Mô phỏng đăng nhập thành công - không cần xác thực thực sự
        console.log('Login form data:', formData);
        
        // Lưu token giả lập vào localStorage nếu muốn
        localStorage.setItem('adminToken', 'fake-token-123');
        
        // Chuyển hướng đến dashboard
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    }, 1000); // Giảm thời gian chờ để test nhanh hơn
  };

  return (
    <LoginForm 
      onLogin={handleLogin} 
      loading={loading} 
      error={error} 
    />
  );
};

export default LoginContainer;