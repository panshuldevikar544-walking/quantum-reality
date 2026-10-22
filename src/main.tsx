import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource/ibm-plex-sans/300.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/stix-two-text/400.css'
import '@fontsource/stix-two-text/400-italic.css'
import './styles/global.css'
import App from './App'
import { PresenterWindow } from './shell/PresenterWindow'

const isPresenter = window.location.hash === '#presenter'

// Development-only handle for automated tests.
if (import.meta.env.DEV) {
  void Promise.all([import('./state/store'), import('./three/world')]).then(([store, w]) => {
    Object.assign(window, { __qr: store, __qrWorld: w.world })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPresenter ? <PresenterWindow /> : <App />}</StrictMode>,
)
