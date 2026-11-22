/**
 * Hub Music - PWA Registration
 * Registers service worker and handles updates
 */

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateNotification(registration);
          }
        });
      });
    }).catch((error) => {
      console.error('SW registration failed:', error);
    });
  });

  // Handle controller change (new SW activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// Show update notification
function showUpdateNotification(registration) {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 z-50 bg-background-secondary border border-primary rounded-xl p-4 shadow-lg animate-slide-in-right max-w-sm';
  notification.innerHTML = `
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">Nova versão disponível</p>
        <p className="text-sm text-text-secondary mt-1">Atualize para acessar as novidades</p>
      </div>
      <button id="sw-update-btn" className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors flex-shrink-0">
        Atualizar
      </button>
      <button id="sw-dismiss-btn" className="text-text-muted hover:text-text-primary transition-colors p-1 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  document.getElementById('sw-update-btn')?.addEventListener('click', () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    notification.remove();
  });

  document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
    notification.remove();
  });

  // Auto dismiss after 30 seconds
  setTimeout(() => notification.remove(), 30000);
}

// Install prompt handling
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  showInstallButton();
});

function showInstallButton() {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  // Check if user dismissed recently
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

  const button = document.createElement('button');
  button.id = 'pwa-install-btn';
  button.className = 'fixed bottom-4 right-4 z-40 bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up';
  button.innerHTML = `
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
    <span>Instalar App</span>
    <button id="pwa-dismiss-btn" className="ml-2 p-1 hover:bg-white/20 rounded">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;

  document.body.appendChild(button);

  button.querySelector('#pwa-install-btn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      button.remove();
      deferredPrompt = null;
    }
  });

  button.querySelector('#pwa-dismiss-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    button.remove();
  });
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Offline indicator
function setupOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'fixed top-0 left-0 right-0 h-2 bg-warning transform -translate-y-full transition-transform duration-300 z-50';
  indicator.innerHTML = '<div className="w-full h-full bg-gradient-to-r from-warning to-orange-500"></div>';
  document.body.appendChild(indicator);

  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      indicator.style.transform = 'translateY(-100%)';
    } else {
      indicator.style.transform = 'translateY(0)';
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupOfflineIndicator);
} else {
  setupOfflineIndicator();
}

// Export for use in React components
export function registerSW() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register('/sw.js');
  }
  return Promise.reject(new Error('Service Worker not supported'));
}

export function requestInstall() {
  if (deferredPrompt) {
    return deferredPrompt.prompt();
  }
  return Promise.reject(new Error('Install prompt not available'));
}

export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function isOnline() {
  return navigator.onLine;
}