import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, FileText, Home, Library, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/biblical-study', label: 'Biblical Study', icon: BookOpen },
  { path: '/textual-criticism', label: 'Textual Criticism', icon: Layers },
  { path: '/homiletics', label: 'Homiletics', icon: FileText },
  { path: '/curadoria', label: 'Curadoria Acadêmica', icon: Library },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-[var(--deep-navy)] text-white flex flex-col border-r border-white/10">
      {/* Logo / Title */}
      <div className="px-6 py-8 border-b border-white/10">
        <h1 className="text-2xl tracking-[0.15em] font-light mb-1">CANON</h1>
        <p className="text-[11px] text-white/60 tracking-wide leading-relaxed">
          Biblical and Theological<br />Study Environment
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-md text-[13px] tracking-wide
                    transition-all duration-200
                    ${isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Settings at bottom of nav */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            to="/settings"
            className={`
              flex items-center gap-3 px-3 py-3 rounded-md text-[13px] tracking-wide
              transition-all duration-200
              ${location.pathname === '/settings'
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/40 tracking-wide">
          © 2026 CANON Platform
        </p>
      </div>
    </div>
  );
}