import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PendingPage from './pages/PendingPage';
import CompletePage from './pages/CompletePage';
import ManageUser from './pages/ManageUser';
import Profile from './components/Profile';


const SplashScreen = ({ onNext }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [startRide, setStartRide] = useState(false);
  const [motorPosition, setMotorPosition] = useState('-20%');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMotorPosition(windowSize.width < 768 ? '15%' : '25%');
    }, 300);
    return () => clearTimeout(timer);
  }, [windowSize.width]);

  const handleClick = () => {
    setStartRide(true);
    setIsExiting(true);
    setMotorPosition('120%');
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  const isMobile = windowSize.width < 768;
  const titleSize = isMobile ? '2.5rem' : '4rem';
  const subtitleSize = isMobile ? '1.1rem' : '1.4rem';
  const buttonPadding = isMobile ? '12px 24px' : '14px 32px';
  const buttonFontSize = isMobile ? '1rem' : '1.1rem';
  const motorScale = isMobile ? '0.6' : '0.8';
  const motorBottom = isMobile ? '25%' : '30%';
  const roadBottom = isMobile ? '23%' : '28%';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#333333',
      opacity: isExiting ? 0 : 1,
      transition: 'opacity 1s ease-out',
      pointerEvents: isExiting ? 'none' : 'auto',
      overflow: 'hidden',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '90%',
        padding: '20px',
        transform: isExiting ? 'translateY(20px)' : 'translateY(0)',
        transition: 'transform 0.8s ease-out',
        zIndex: 2,
        marginBottom: isMobile ? '120px' : '180px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '8px' : '12px',
          fontSize: titleSize,
          fontWeight: 'bold',
          marginBottom: isMobile ? '12px' : '16px',
          background: 'linear-gradient(90deg, #a100ff, #ec00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient 3s ease infinite',
        }}>
          <Zap size={isMobile ? 32 : 48} fill="#ec00ff" color="#ec00ff" />
          <span>Welcome 👋</span>
        </div>
        <p style={{
          fontSize: subtitleSize,
          marginBottom: isMobile ? '30px' : '40px',
          color: '#a100ff',
          fontWeight: '500',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.5s ease-out 0.3s',
          lineHeight: '1.5',
        }}>
          Manage your tasks more efficiently with <strong>TaskOrganizer</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleClick}
            style={{
              padding: buttonPadding,
              fontSize: buttonFontSize,
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(90deg, #a100ff, #ec00ff)',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(236, 0, 255, 0.4)',
              transition: 'all 0.4s ease',
              opacity: isExiting ? 0 : 1,
              transform: isExiting ? 'scale(0.9)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(236, 0, 255, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = isExiting ? 'scale(0.9)' : 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(236, 0, 255, 0.4)';
            }}
          >
            <Zap size={isMobile ? 16 : 20} fill="white" color="white" />
            Get Started
          </button>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: roadBottom,
        width: '100%',
        height: '2px',
        background: 'repeating-linear-gradient(to right, #ec00ff, #ec00ff 20px, transparent 20px, transparent 40px)',
        zIndex: 1,
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: motorBottom,
        left: motorPosition,
        transition: startRide 
          ? 'left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)'
          : 'left 2s ease-out',
        transform: `scale(${motorScale})`,
        zIndex: 1,
      }}>
        <svg width="200" height="120" viewBox="0 0 200 120">
          <rect x="30" y="60" width="80" height="15" rx="5" fill="#ec00ff" />
          <circle cx="50" cy="90" r="15" fill="#a100ff" />
          <circle cx="130" cy="90" r="15" fill="#a100ff" />
          <circle cx="70" cy="40" r="15" fill="#f59e0b" />
          <rect x="65" y="55" width="10" height="30" fill="#a100ff" />
          <path d="M60 85 L80 85 L85 65 L75 65 Z" fill="#a100ff" />
          <path d="M40 55 L60 65 L65 60 L45 50 Z" fill="#ec00ff" />
          {startRide && (
            <g>
              <circle cx="20" cy="70" r="5" fill="#f59e0b">
                <animate attributeName="r" values="5;8;5" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="15" cy="75" r="4" fill="#f59e0b">
                <animate attributeName="r" values="4;6;4" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>
      </div>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

const App = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [currentUser, setCurrentUser] = useState(() => {
  const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setShowSplash(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const heandleAuthSubmit = data => {
    const user = {
      email: data.email,
      name: data.name || 'User',
      role: data.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
    };
    setCurrentUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const handleSplashNext = () => {
    setShowSplash(false);
    navigate('/login', { replace: true });
  };

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );

  return (
    <>
      {showSplash && !currentUser && <SplashScreen onNext={handleSplashNext} />}
      
      <div style={{
        opacity: showSplash ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}>
        <Routes>
          <Route path='/login' element={<div>
            <Login onSubmit={heandleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
          </div>} />

          <Route path='/signup' element={<div>
            <SignUp onSubmit={heandleAuthSubmit} onSwitchMode={() => navigate('/login')} />
          </div>} />

          <Route element={currentUser ? <ProtectedLayout /> :
            <Navigate to='/login' replace />}>

            <Route path='/' element={<Dashboard />} />
            <Route path='/pending' element={<PendingPage />} />
            <Route path='/complete' element={<CompletePage />} />
            {role === 'admin' && (
              <Route path="/admin/manage-users" element={<ManageUser />} />
            )}
            <Route path='/profile' element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout} />} />
          </Route>

          <Route path='*' element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;