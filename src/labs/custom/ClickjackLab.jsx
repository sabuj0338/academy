import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle, useCompletion } from '../../components/ui.jsx';

export default function ClickjackLab({ onComplete }) {
  const [opacity, setOpacity] = useState(0);
  const [xfo, setXfo] = useState(false);
  const [result, setResult] = useState(null);
  const [got, setGot] = useState({ pwn: false, block: false });
  useCompletion(2, (got.pwn ? 1 : 0) + (got.block ? 1 : 0), onComplete);

  const click = () => {
    if (xfo) { setResult('block'); setGot((g) => ({ ...g, block: true })); }
    else { setResult('pwn'); setGot((g) => ({ ...g, pwn: true })); }
  };

  return (
    <div className="stack">
      <div className="row">
        <Toggle on={xfo} onChange={(v) => { setXfo(v); setResult(null); }} label="bank.example পাঠায়: frame-ancestors 'none'" />
        <label className="row" style={{ gap: 8 }}>
          <span className="muted">লুকানো iframe-এর opacity:</span>
          <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
          <span className="mono">{opacity.toFixed(2)}</span>
        </label>
      </div>
      <div className="browser-mock">
        <div className="browser-bar"><span className="mono">https://free-gift-bd.example</span></div>
        <div className="cj-stage">
          <div className="cj-evil">
            <div style={{ fontSize: 34 }}>🎁</div>
            <h3 style={{ margin: '4px 0' }}>অভিনন্দন! আপনি iPhone 16 জিতেছেন!</h3>
            <p className="muted">পুরস্কার নিতে নিচের বাটনে ক্লিক করুন</p>
            <div className="cj-fake-btn">🎉 পুরস্কার নাও</div>
          </div>
          <motion.div className="cj-frame" animate={{ opacity: Math.max(opacity, xfo ? 0.0 : 0) }} style={{ pointerEvents: 'none' }}>
            {xfo ? (
              <div className="cj-refused">🚫 bank.example refused to connect.<br /><span className="mono" style={{ fontSize: 12 }}>frame-ancestors 'none'</span></div>
            ) : (
              <div className="cj-bank">
                <div className="row" style={{ justifyContent: 'space-between' }}><b>🏦 bank.example</b><span>Rahim (logged in)</span></div>
                <div className="muted" style={{ margin: '16px 0 8px' }}>Account settings</div>
                <div className="muted" style={{ marginBottom: 46 }}>ব্যালেন্স: ৳১,২৫,০০০</div>
                <div className="cj-real-btn">🗑 Transfer all to: attacker</div>
              </div>
            )}
          </motion.div>
          <button className="cj-hit" onClick={click} aria-label="prize" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result} className={'note ' + (result === 'pwn' ? 'bad' : 'good')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {result === 'pwn' ? '💥 তুমি "পুরস্কার" ক্লিক করেছ — কিন্তু আসলে ক্লিক পড়েছে অদৃশ্য bank iframe-এর "Transfer all" বাটনে। তুমি logged in, তাই transfer হয়ে গেল! Opacity slider বাড়িয়ে দেখো।' : '✅ Browser bank.example-কে অন্য site-এর iframe-এ লোড করতে দেয়নি। ক্লিক কোথাও পৌঁছায়নি।'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
