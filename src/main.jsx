import React from 'react';
import {hydrateRoot, createRoot} from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import {startMotion} from './motion.js';

const root = document.getElementById('root');
const path = window.location.pathname.replace(/\/$/, '') || '/';
const app = <App path={path} />;
// Prerendered routes hydrate; anything else (a host's fallback) renders fresh as the 404 page.
if (['/', '/app', '/privacy', '/terms'].includes(path) && root.hasChildNodes()) hydrateRoot(root, app);
else { root.textContent = ''; createRoot(root).render(app); }
if (!path.startsWith('/app')) requestAnimationFrame(startMotion);
