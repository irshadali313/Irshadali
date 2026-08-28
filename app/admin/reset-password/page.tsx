'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setToken(new URLSearchParams(window.location.search).get('token') || '');
    }, []);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setLoading(true);
        const endpoint = token ? '/api/admin/password-reset' : '/api/admin/password-reset';
        const body = token ? { token, newPassword: password } : { email };
        const response = await fetch(endpoint, { method: token ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        setMessage(data.message || data.error || 'Request completed.');
        setLoading(false);
    }

    return <div className="login-container"><div className="login-card"><Link href="/admin/login" className="login-back-btn">← Back to login</Link><div className="login-header"><h1 className="login-title">{token ? 'Set a new password' : 'Reset your password'}</h1><p className="login-subtitle">{token ? 'Choose a strong password of at least 12 characters.' : 'Enter your admin email and we will send reset instructions.'}</p></div><form onSubmit={submit} className="login-form">{token ? <div className="login-form-group"><label className="login-label" htmlFor="password">New password</label><input required minLength={12} id="password" type="password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} /></div> : <div className="login-form-group"><label className="login-label" htmlFor="email">Admin email</label><input required type="email" id="email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>}<button disabled={loading} className="login-submit-btn">{loading ? 'Processing...' : token ? 'Update password' : 'Send reset instructions'}</button></form>{message && <p className="login-tip">{message}</p>}</div></div>;
}