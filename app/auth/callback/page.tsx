"use client";
import { useEffect } from "react";
export default function Page() { useEffect(() => { window.location.replace(`/api/auth/callback${window.location.search}`); }, []); return <main className="auth-main"><div className="auth-card"><span className="card-label">ACCOUNT / CALLBACK</span><h1>Finishing sign-in…</h1><p>We are securely completing your session.</p></div></main>; }
