import { useState, useEffect } from 'react';

const sections = [
  { id: 'home', label: 'Home', link: '/dashboard#home' },
  { id: 'taktplan', label: 'Takt Plan', link: '/dashboard#taktplan' },
  { id: 'handover', label: 'Handover', link: '/dashboard#handover' },
  { id: 'scurve', label: 'S-Curve', link: '/dashboard#scurve' },
  { id: 'portfolio', label: 'Portfolio', link: '/dashboard#portfolio' }
];

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach(section => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <aside className="w-64 bg-white shadow flex flex-col fixed h-full">
      <div className="p-4 border-b">
        <img 
          src="/logo.png" 
          alt="TaktR Logo" 
          className="w-12 h-auto mx-auto"
        />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sections.map(({ id, label, link }) => (
          <a
            key={id}
            href={link}
            className={`block p-2 rounded font-semibold transition ${
              activeSection === id 
                ? 'bg-brandLight text-brand' 
                : 'text-brand hover:bg-brandLight'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}