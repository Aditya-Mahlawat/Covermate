import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    if (!isAuthenticated) return null;

    const mainLinks = [
        { path: '/', label: 'Dashboard', icon: '🏠' },
        { path: '/policies', label: 'Policies', icon: '📋' },
    ];

    return (
        <nav
            className="glass-card"
            style={{
                margin: '1rem 1.5rem 0',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
                zIndex: 50,
            }}
        >
            {/* Left: Logo + Main Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}
                >
                    <img
                        src="/logo.png"
                        alt="CoverMate"
                        style={{ height: '2.75rem', width: 'auto' }}
                    />
                </Link>

                {/* Main Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {mainLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.625rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: isActive ? 600 : 500,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                    color: isActive ? '#a5b4fc' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(148, 163, 184, 0.06)';
                                        e.currentTarget.style.color = '#e2e8f0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '0.875rem' }}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right: Profile Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: dropdownOpen ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        border: '1px solid',
                        borderColor: dropdownOpen ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        borderRadius: '0.75rem',
                        padding: '0.375rem 0.75rem 0.375rem 0.375rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (!dropdownOpen) {
                            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!dropdownOpen) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                        }
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'white',
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            flexShrink: 0,
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* Name */}
                    <span className="hidden md:inline" style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#e2e8f0' }}>
                        {user?.name?.split(' ')[0]}
                    </span>

                    {/* Chevron */}
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{
                            transition: 'transform 0.2s ease',
                            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                            flexShrink: 0,
                        }}
                    >
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <div
                        className="animate-fade-in"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            right: 0,
                            width: '14rem',
                            background: 'rgba(30, 41, 59, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '0.875rem',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)',
                            padding: '0.5rem',
                            zIndex: 100,
                        }}
                    >
                        {/* User Info */}
                        <div
                            style={{
                                padding: '0.75rem 0.75rem 0.625rem',
                                borderBottom: '1px solid rgba(148,163,184,0.08)',
                                marginBottom: '0.375rem',
                            }}
                        >
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{user?.email}</p>
                        </div>

                        {/* Links */}
                        {[
                            { path: '/profile', label: 'My Profile', icon: '👤' },
                            { path: '/preferences', label: 'Preferences', icon: '⚙️' },
                        ].map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.625rem',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    color: location.pathname === item.path ? '#a5b4fc' : '#cbd5e1',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    background: location.pathname === item.path ? 'rgba(99,102,241,0.08)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(148,163,184,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        location.pathname === item.path ? 'rgba(99,102,241,0.08)' : 'transparent';
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid rgba(148,163,184,0.08)', margin: '0.375rem 0' }} />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                padding: '0.625rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: '#fca5a5',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <span>🚪</span>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
