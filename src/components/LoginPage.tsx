import React, { useState, useEffect } from 'react';
import '../assets/css/animate.min.css';
import '../assets/css/animation.css';
import '../assets/css/bootstrap.css';
import '../assets/css/bootstrap-select.min.css';
import '../assets/css/style.css';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(''); // Explicitly typing error state as string
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user);
      navigate('/home'); // Redirect to home page on successful login
    } catch (error: any) {
      setError(error.message || 'Failed to log in. Please try again.');
    }
  };

  return (
    <div id="wrapper">
      <div id="page" className="">
        <div className="wrap-login-page">
        
          <div className="flex-grow flex flex-column justify-center gap30">
            <a href="index.html" id="site-logo-inner"></a>
            <div className="login-box">
              <div>
                <h3>Log In</h3>
                <div className="body-text">Enter your email & password to log in</div>
              </div>
              <form className="form-login flex flex-column gap24" onSubmit={handleLogin}>
                <fieldset className="email">
                  <div className="body-title mb-10">
                    Email address <span className="tf-color-1">*</span>
                  </div>
                  <input
                    className="flex-grow"
                    type="email"
                    placeholder="Enter your email address"
                    name="email"
                    tabIndex={0}
                    aria-required="true"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </fieldset>
                <fieldset className="password">
                  <div className="body-title mb-10">
                    Password <span className="tf-color-1">*</span>
                  </div>
                  <input
                    className="password-input"
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    tabIndex={0}
                    aria-required="true"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="show-pass">
                    <i className="icon-eye view"></i>
                    <i className="icon-eye-off hide"></i>
                  </span>
                </fieldset>
                <button type="submit" className="tf-button w-full">
                  Log In
                </button>
                {error && <div className="error">{error}</div>}
              </form>
              <div className="text-center">
                <div className="text-tiny tf-color-2">
                  Don't have an account? <a href="/signup" className="tf-color">Sign Up</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
