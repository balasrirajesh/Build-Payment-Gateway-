// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('test@example.com');
//   const [password, setPassword] = useState('password');
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     // For Deliverable 1, we just simulate login and go to dashboard
//     navigate('/dashboard');
//   };

//   const theme = {
//     bg: '#f3f4f6',
//     primary: '#1e293b',
//     accent: '#3b82f6',
//     white: '#ffffff',
//     text: '#1f2937'
//   };

//   const styles = {
//     container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, fontFamily: "'Inter', sans-serif" },
//     card: { width: '100%', maxWidth: '400px', backgroundColor: theme.white, padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
//     brand: { textAlign: 'center', fontSize: '24px', fontWeight: '800', color: theme.primary, marginBottom: '8px', letterSpacing: '1px' },
//     subTitle: { textAlign: 'center', color: '#6b7280', marginBottom: '30px', fontSize: '14px' },
//     label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.text, fontSize: '14px' },
//     input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box', outline: 'none', transition: '0.2s' },
//     button: { width: '100%', padding: '12px', backgroundColor: theme.primary, color: theme.white, border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <div style={styles.brand}>PAYMENT<span style={{color: theme.accent}}>GATEWAY</span></div>
//         <p style={styles.subTitle}>Sign in to your merchant dashboard</p>
        
//         <form onSubmit={handleLogin} data-test-id="login-form">
//           <div>
//             <label style={styles.label}>Email Address</label>
//             <input 
//               type="email" 
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               style={styles.input}
//               data-test-id="email-input"
//             />
//           </div>
//           <div>
//             <label style={styles.label}>Password</label>
//             <input 
//               type="password" 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               style={styles.input}
//               data-test-id="password-input"
//             />
//           </div>
//           <button type="submit" style={styles.button} data-test-id="login-button">
//             Sign In
//           </button>
//         </form>
        
//         <div style={{textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af'}}>
//           Use <b>test@example.com</b> to login
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [isHover, setIsHover] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center'
    },
    brand: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#0f172a',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '14px',
      marginBottom: '32px'
    },
    inputGroup: {
      textAlign: 'left',
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#334155',
      marginBottom: '6px',
      textTransform: 'uppercase'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '16px',
      color: '#1e293b',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    btn: {
      width: '100%',
      padding: '14px',
      background: isHover ? '#2563eb' : '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background 0.2s, transform 0.1s'
    },
    hint: {
      marginTop: '20px',
      fontSize: '12px',
      color: '#94a3b8',
      background: '#f8fafc',
      padding: '10px',
      borderRadius: '6px',
      border: '1px dashed #cbd5e1'
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleLogin} data-test-id="login-form">
        <div style={styles.brand}>PAYMENT GATEWAY</div>
        <div style={styles.subtitle}>Secure Merchant Dashboard Login</div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            data-test-id="email-input"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            data-test-id="password-input"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>

        <button 
          type="submit" 
          style={styles.btn} 
          data-test-id="login-button"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          Sign In to Dashboard
        </button>

        <div style={styles.hint}>
          Demo Credentials Auto-filled<br/>(Click Login to proceed)
        </div>
      </form>
    </div>
  );
};

export default Login;