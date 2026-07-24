import React, { useState } from 'react';
import useStore from '../store';

const css = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes breathe { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }';

export default function AboutUs() {
  const visible = useStore((s) => s.aboutUsVisible);
  const close = () => useStore.getState().setAboutUsVisible(false);
  const [lang, setLang] = useState('zh');
  const [isWide, setIsWide] = useState(typeof window !== 'undefined' && window.innerWidth / window.innerHeight >= 1.2);
  React.useEffect(() => { const h = () => setIsWide(window.innerWidth / window.innerHeight >= 1.2); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  if (!visible) return null;

  const pStyle = { color: 'rgba(255,252,248,0.55)', fontWeight: 300, fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)', lineHeight: 2, letterSpacing: '0.05em', margin: '0 0 1.5rem 0', userSelect: 'none' };
  const title = lang === 'zh' ? '关于我们' : 'ABOUT US';

  const toggle = (<div onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', pointerEvents: 'auto', userSelect: 'none', background: 'rgba(255,252,248,0.06)', borderRadius: '999px', padding: '0.3rem 0.8rem' }}><span style={{ color: lang === 'zh' ? 'rgba(255,252,248,0.8)' : 'rgba(255,252,248,0.3)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em', transition: 'color 0.3s' }}>中</span><span style={{ color: 'rgba(255,252,248,0.2)', fontWeight: 300, fontSize: '0.75rem' }}>/</span><span style={{ color: lang === 'en' ? 'rgba(255,252,248,0.8)' : 'rgba(255,252,248,0.3)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em', transition: 'color 0.3s' }}>EN</span></div>);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '90%', padding: '3rem clamp(1rem, 3vw, 3rem) 8rem', textAlign: 'center', animation: 'slideUp 1.5s ease', overflowY: 'auto', maxHeight: '85vh' }}>
        <h2 style={{ color: 'rgba(255,252,248,0.85)', fontWeight: 300, fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', letterSpacing: '0.2em', margin: '0 0 1rem 0', userSelect: 'none' }}>{title}</h2>

        {lang === 'zh' ? (<><p style={pStyle}>零想是一家以 AI 驱动的 XR 沉浸式体验开发与应用的技术创新公司。</p><p style={pStyle}>我们围绕空间计算新生态，融合前沿的AI世界模型技术，重新定义人与虚拟世界的交互方式。公司成立于2022年，汇聚了来自艺术、建筑、角色、动画、场景、视觉、音效、交互、程序开发等多领域的专业团队，具备从内容创意、技术研发到场景落地、运营管理的全流程能力。我们不仅开发内容，更懂得如何创造令人难忘的沉浸体验。</p><p style={pStyle}>我们专注于社交、文娱体验开发，将技术与艺术和空间计算深度融合，为用户带来身临其境的非凡体验。</p></>) : (<><p style={pStyle}>LINGX Tech is an innovative company focused on developing XR immersive art IP, combining both development and operation.</p><p style={pStyle}>By merging spatial computing with advanced AI, we redefine how people interact with virtual worlds. Founded in 2022, our team brings together experts from art, architecture, interaction design, and software development. We cover the entire process-from creative content and technical R and D to implementation and operation-crafting truly memorable immersive experiences.</p><p style={pStyle}>With practical experience in urban venues, we blend technology, art, and space to deliver remarkable experiences and help advance the immersive industry toward standardization, platform and scale.</p></>)}
      </div>
      {/* Fixed bottom area: QR + toggle + return */}
      <div style={{ position: 'fixed', bottom: '7rem', left: '50%', transform: 'translateX(-50%)', zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', pointerEvents: 'auto' }}>
        <div style={{ marginBottom: '0.5rem' }}>{toggle}</div>
        <img src='/assets/QR.png' alt='QR Code' style={{ width: 'clamp(60px, 11vw, 96px)', opacity: 0.7 }} />
      </div>
      <div onClick={close} style={{ position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 45, pointerEvents: 'auto', cursor: 'pointer', textAlign: 'center', animation: 'breathe 3s ease-in-out infinite', userSelect: 'none' }}>
        <p style={{ color: 'rgba(245, 240, 232, 0.4)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.2em', margin: 0 }}>返回源点</p>
        <p style={{ color: 'rgba(245, 240, 232, 0.2)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', margin: '0.3rem 0 0 0' }}>RETURN TO SOURCE</p>
      </div>
      <style>{css}</style>
    </div>
  );
}




