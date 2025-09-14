import React, { useState } from 'react';
import apiService from '../services/ApiService';

interface AuthModalProps {
    onLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (isLogin) {
                response = await apiService.login(email, password);
            } else {
                response = await apiService.register({ 
                    firstName: name.split(' ')[0] || '',
                    lastName: name.split(' ')[1] || '',
                    email, 
                    password,
                    companyName: ''
                });
            }

            localStorage.setItem('auth_token', response.token);
            onLogin();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <div className="auth-header">
                    <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
                    <p>Access your CRM dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            minLength={6}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="auth-footer">
                    <button
                        type="button"
                        className="switch-mode-button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>

                {/* Demo credentials */}
                <div className="demo-section">
                    <p className="demo-title">Demo Access:</p>
                    <p className="demo-info">Email: demo@example.com</p>
                    <p className="demo-info">Password: demo123</p>
                </div>
            </div>

            <style>{`
                .auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .auth-modal {
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    margin: 20px;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .auth-header h2 {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 1.8rem;
                }

                .auth-header p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .auth-form {
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }

                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                    border: 1px solid #f5c6cb;
                }

                .auth-button {
                    width: 100%;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .auth-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .auth-button:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .auth-footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .switch-mode-button {
                    background: none;
                    border: none;
                    color: #007bff;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: underline;
                }

                .switch-mode-button:hover {
                    color: #0056b3;
                }

                .demo-section {
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }

                .demo-title {
                    margin: 0 0 8px 0;
                    font-weight: 600;
                    color: #495057;
                    font-size: 0.9rem;
                }

                .demo-info {
                    margin: 0;
                    font-family: monospace;
                    font-size: 0.8rem;
                    color: #6c757d;
                }

                @media (max-width: 480px) {
                    .auth-modal {
                        padding: 30px 20px;
                        margin: 10px;
                    }

                    .auth-header h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthModal;