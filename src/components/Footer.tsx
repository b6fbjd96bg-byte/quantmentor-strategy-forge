import { TrendingUp, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { name: 'How It Works', href: '/#how-it-works', isAnchor: true },
    { name: 'Features', href: '/#features', isAnchor: true },
    { name: 'Pricing', href: '/#pricing', isAnchor: true },
    { name: 'API Documentation', href: '/api-documentation', isAnchor: false },
  ],
  Company: [
    { name: 'About Us', href: '/about-us', isAnchor: false },
    { name: 'Careers', href: '/careers', isAnchor: false },
    { name: 'Press', href: '/press', isAnchor: false },
    { name: 'Contact', href: '/contact', isAnchor: false },
  ],
  Resources: [
    { name: 'Blog', href: '/blog', isAnchor: false },
    { name: 'Case Studies', href: '/case-studies', isAnchor: false },
    { name: 'Help Center', href: '/help-center', isAnchor: false },
    { name: 'Strategy Guide', href: '/strategy-guide', isAnchor: false },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy-policy', isAnchor: false },
    { name: 'Terms of Service', href: '/terms-of-service', isAnchor: false },
    { name: 'Risk Disclosure', href: '/risk-disclosure', isAnchor: false },
    { name: 'Compliance', href: '/compliance', isAnchor: false },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                QuantMentor
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Transform your trading strategies into AI-powered algorithms. 
              Professional automation for modern traders.
            </p>
            <div className="space-y-3">
              <a href="mailto:contact@quantmentor.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                contact@quantmentor.com
              </a>
              <a href="tel:+1-888-QUANT" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                1-888-QUANT-01
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                New York, NY
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.isAnchor ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QuantMentor. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground max-w-lg text-center md:text-right">
            Trading involves risk. Past performance does not guarantee future results. 
            Please trade responsibly and only with capital you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
