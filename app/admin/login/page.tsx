'use client';

import { useState, useTransition } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../actions';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        startTransition(async () => {
            const res = await loginAdmin(username, password, mfaToken || undefined);
            if (res.success) {
                window.location.href = '/admin';
            } else {
                setError(res.error || 'Authentication failed');
            }
        });
    };

    return (
        <div className="login-container">
            {/* Ambient background glows */}
            <div className="login-glow login-glow-1"></div>
            <div className="login-glow login-glow-2"></div>

            <div className="login-card">
                {/* Back to site link */}
                <Link href="/" className="login-back-btn">
                    <ArrowLeft size={14} />
                    <span>Back to Portfolio</span>
                </Link>

                {/* Header */}
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <ShieldCheck size={28} className="login-icon" />
                    </div>
                    <h1 className="login-title">Admin Access</h1>
                    <p className="login-subtitle">Sign in to manage your portfolio OS dashboard</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="login-error-banner">
                        <ShieldAlert size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label" htmlFor="username">
                            Email Address
                        </label>
                        <div className="login-input-wrapper">
                            <Mail size={16} className="login-input-icon" />
                            <input
                                id="username"
                                type="email"
                                className="login-input"
                                placeholder="admin@example.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isPending}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label className="login-label" htmlFor="password">
                            Security Key / Password
                        </label>
                        <div className="login-input-wrapper">
                            <Lock size={16} className="login-input-icon" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isPending}
                                required
                            />
                            <button
                                type="button"
                                className="login-visibility-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label className="login-label" htmlFor="mfa-token">
                            Authenticator Code (Optional)
                        </label>
                        <div className="login-input-wrapper">
                            <KeyRound size={16} className="login-input-icon" />
                            <input
                                id="mfa-token"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                className="login-input"
                                placeholder="6-digit code"
                                value={mfaToken}
                                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="login-spinner-row">
                                <span className="login-spinner"></span>
                                <span>Authenticating...</span>
                            </div>
                        ) : (
                            <div className="login-spinner-row">
                                <Lock size={15} />
                                <span>Unlock Dashboard</span>
                            </div>
                        )}
                    </button>
                </form>

                <Link
                    href="/admin/reset-password"
                    className="login-tip"
                    style={{ display: 'block', textAlign: 'center', color: '#a78bfa', textDecoration: 'none' }}
                >
                    Forgot your password?
                </Link>

                {/* Secure Tip Info */}
                <div className="login-tip">
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} style={{ color: '#10b981' }} />
                        <span>Protected by HTTP-only encrypted session cookies.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
