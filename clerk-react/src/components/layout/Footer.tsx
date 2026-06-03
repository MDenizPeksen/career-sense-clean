import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-gray-100 bg-white mt-auto">
    <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <Link to="/" className="font-bold text-blue-600">CareerSense</Link>
      <p className="text-sm text-gray-500">
        AI-powered career guidance · © {new Date().getFullYear()} CareerSense
      </p>
    </div>
  </footer>
);

export default Footer;
