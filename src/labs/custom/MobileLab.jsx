import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

const B = (t, why, fix) => ({ t, bad: { why, fix } });
const FILES = [
  { name: 'AndroidManifest.xml', icon: '📜', lines: [
    '<manifest package="com.shopbd.app">',
    B('  <application android:allowBackup="true"', 'adb backup দিয়ে app-এর সব data (token, DB) বের করা যায়।', '  <application android:allowBackup="false"'),
    B('      android:debuggable="true"', 'Release build-এ debuggable — যে কেউ debugger attach করে memory পড়তে পারে।', '      (release build-এ debuggable সরাও)'),
    B('      android:usesCleartextTraffic="true">', 'HTTP (plain text) traffic allow — MITM সহজ।', '      android:networkSecurityConfig="@xml/network_security_config">'),
    '    <activity android:name=".MainActivity" android:exported="true">',
    '      <intent-filter><data android:scheme="shopbd" android:host="reset"/></intent-filter>',
    '    </activity>',
    '  </application>',
    '</manifest>',
  ] },
  { name: 'lib/config.dart', icon: '🎯', lines: [
    "class Config {",
    "  static const apiBase = 'https://api.shopbd.com';",
    "  static const mapsKey = 'AIzaSyB…restricted';   // public, package+SHA restricted",
    B("  static const stripeSecret = 'sk_live_51Hx9…';", 'Stripe SECRET key app-এ — APK খুললেই পাওয়া যায়, যে কেউ refund/charge করতে পারে।', '  // secret backend-এ; app শুধু publishable key (pk_live_…) রাখে'),
    "}",
  ] },
  { name: 'lib/auth/storage.dart', icon: '💾', lines: [
    "Future<void> saveTokens(String access, String refresh) async {",
    "  final prefs = await SharedPreferences.getInstance();",
    B("  prefs.setString('refresh_token', refresh);", 'SharedPreferences = plain XML ফাইল। Root/backup থেকে পড়া যায়।', "  await secureStorage.write(key: 'refresh_token', value: refresh); // Keystore"),
    B("  print('Logged in, token=$access');", 'Token logcat-এ — অন্য app বা crash report-এ যেতে পারে।', "  // কখনো token log কোরো না"),
    "}",
  ] },
  { name: 'shared_prefs/FlutterSharedPreferences.xml', icon: '🗂️', lines: [
    "<?xml version='1.0' encoding='utf-8'?>",
    '<map>',
    '  <string name="flutter.theme">dark</string>',
    '  <string name="flutter.refresh_token">rt_8d1c5b2e9a…</string>',
    '  <string name="flutter.user_phone">01711-xxxxxx</string>',
    '</map>',
  ] },
];
const TOTAL = FILES.reduce((n, f) => n + f.lines.filter((l) => l.bad).length, 0);

export default function MobileLab({ onComplete }) {
  const [fi, setFi] = useState(0);
  const [found, setFound] = useState([]);
  const [active, setActive] = useState(null);
  const [shake, setShake] = useState(null);
  useCompletion(TOTAL, found.length, onComplete);
  const f = FILES[fi];

  return (
    <div className="mobile-grid">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div style={{ fontSize: 30 }}>🛒</div>
          <b>ShopBD</b>
          <div className="muted" style={{ fontSize: 12 }}>v3.2.0 · release</div>
          <div className="phone-card">🔥 Flash sale ৫০%</div>
          <div className="phone-card">📦 আমার order</div>
          <div className="phone-card mono" style={{ fontSize: 10.5, color: '#fbbf24' }}>$ jadx-gui shopbd.apk{'\n'}decompiling… 1,284 classes ✓</div>
        </div>
      </div>
      <div className="stack">
        <div className="row" style={{ gap: 6 }}>
          {FILES.map((x, i) => (
            <button key={x.name} className={'btn sm ' + (fi === i ? 'primary' : '')} onClick={() => { setFi(i); setActive(null); }}>{x.icon} {x.name.split('/').pop()}</button>
          ))}
          <span className={'badge ' + (found.length === TOTAL ? 'ok' : 'warn')}>সমস্যা পাওয়া: {found.length}/{TOTAL}</span>
        </div>
        <div className="audit-file">
          <div className="muted mono" style={{ fontSize: 12, padding: '4px 10px' }}>{f.name}</div>
          {f.lines.map((l, i) => {
            const line = typeof l === 'string' ? { t: l } : l;
            const key = fi + ':' + i;
            const isF = found.includes(key);
            return (
              <motion.div key={key} className={'audit-line' + (isF ? ' found' : '')} animate={shake === key ? { x: [0, -5, 5, 0] } : {}}
                onClick={() => {
                  if (line.bad) { setFound((x) => (x.includes(key) ? x : [...x, key])); setActive(line); }
                  else { setShake(key); setTimeout(() => setShake(null), 400); }
                }}>
                <span className="ln">{i + 1}</span><span className="lt">{line.t}</span>{isF && <span className="flag">⚠</span>}
              </motion.div>
            );
          })}
        </div>
        {fi === 3 && <div className="note warn">এই ফাইলটা device থেকে (root/backup দিয়ে) টেনে আনা — refresh token plain text-এ! কোন code এটা লিখেছে? storage.dart দেখো।</div>}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.t} className="card" style={{ borderColor: 'var(--red)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ color: 'var(--red)', fontWeight: 600 }}>⚠ {active.bad.why}</div>
              <pre className="code" style={{ marginTop: 8 }}>{active.bad.fix}</pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
