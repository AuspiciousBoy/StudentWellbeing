import React, { useEffect, useState } from 'react';

/**
 * Portfolio-style opening splash: SW letters + gold underline bar.
 * Shown only on the login page, once per mount.
 */
export default function LoginSplash({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="login-splash" aria-hidden="true">
      <div className="login-splash__inner">
        <span className="login-splash__letter">S</span>
        <span className="login-splash__letter login-splash__letter--second">W</span>
      </div>
      <p className="login-splash__tagline">StudentWell</p>
      <div className="login-splash__bar">
        <div className="login-splash__bar-fill" />
      </div>
    </div>
  );
}
