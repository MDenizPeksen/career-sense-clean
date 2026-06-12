import { Link } from 'react-router-dom';
import WaitlistSignup from '../../features/home/WaitlistSignup';

const Footer = () => (
  <footer className="border-t border-gray-100 bg-white mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="font-bold text-blue-600">CareerSense</Link>
          <p className="mt-2 text-sm text-gray-500">
            A career companion that understands you and grows with you.
          </p>
          <div className="mt-4">
            <WaitlistSignup source="footer" compact />
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
          <Link to="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-600 hover:text-blue-600">Terms of Service</Link>
          <Link to="/impressum" className="text-gray-600 hover:text-blue-600">Impressum</Link>
        </nav>
      </div>

      <p className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
        AI-powered career guidance · © {new Date().getFullYear()} CareerSense
      </p>
    </div>
  </footer>
);

export default Footer;
