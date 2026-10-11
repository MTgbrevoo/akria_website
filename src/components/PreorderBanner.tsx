import { useLocation } from 'react-router-dom';
import './PreorderBanner.css';

const message = 'Vorbestellungen jetzt geöffnet!';

export default function PreorderBanner() {
  const { pathname } = useLocation();

  if (pathname !== '/' && pathname !== '/bestellen') return null;

  return (
    <aside className={`preorder-banner${pathname === '/' ? ' preorder-banner--fixed' : ''}`} aria-label="Vorbestellungen">
      <span className="sr-only">{message}</span>
      <div className="preorder-banner__viewport" aria-hidden="true">
        <div className="preorder-banner__track">
          {[0, 1].map(group => (
            <div className="preorder-banner__group" key={group}>
              {[0, 1, 2].map(copy => <span key={copy}>{message}</span>)}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
