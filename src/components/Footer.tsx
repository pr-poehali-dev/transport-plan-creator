import Icon from './ui/icon';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '#' },
    { label: 'Advantages', href: '#' },
    { label: 'Testimonials', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' }
  ];

  const resources = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' }
  ];

  return (
    <footer className="bg-[#1a2332] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Icon name="Gem" size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">Zyverium</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Zyverium - Advanced AI-driven trading ecosystem trusted by investors worldwide
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">RESOURCES</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">CONTACT</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon name="Headphones" size={20} className="text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">SUPPORT</p>
                  <p className="text-sm font-semibold">24/7 Available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Globe" size={20} className="text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">COVERAGE</p>
                  <p className="text-sm font-semibold">150+ Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
