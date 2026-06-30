import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} setUser={setUser} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;
