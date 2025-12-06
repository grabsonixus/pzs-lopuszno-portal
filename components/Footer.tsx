import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  FileText,
  Lock,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const pocketBaseUrl =
    process.env.PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

  return (
    <footer className="bg-school-primary text-blue-100 text-sm">
      {/* Upper Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section 1: Address */}
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-4 border-b border-blue-800 pb-2 inline-block">
              Dane kontaktowe
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="text-school-accent mt-0.5 shrink-0"
                />
                <span>
                  Powiatowy Zespół Szkół
                  <br />
                  ul. Kasztanowa 1<br />
                  26-070 Łopuszno
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-school-accent shrink-0" />
                <a
                  href="tel:+48413914001"
                  className="hover:text-white transition-colors"
                >
                  +48 41 39 14 001
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-school-accent shrink-0" />
                <a
                  href="mailto:sekretariat@pzs-lopuszno.pl"
                  className="hover:text-white transition-colors break-all"
                >
                  sekretariat@pzs-lopuszno.pl
                </a>
              </li>
            </ul>
          </div>

          {/* Section 2: Legal Links */}
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-4 border-b border-blue-800 pb-2 inline-block">
              Informacje prawne
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <FileText
                    size={16}
                    className="group-hover:text-school-accent"
                  />
                  Biuletyn Informacji Publicznej (BIP)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <Shield
                    size={16}
                    className="group-hover:text-school-accent"
                  />
                  Klauzula informacyjna (RODO)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 hover:text-white transition-colors group"
                >
                  <div className="w-4 h-4 border border-current flex items-center justify-center rounded-full text-[10px] group-hover:text-school-accent font-bold">
                    A
                  </div>
                  Deklaracja Dostępności
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: School */}
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-4 border-b border-blue-800 pb-2 inline-block">
              Na skróty
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/plan" className="hover:text-white transition-colors">
                  Plan lekcji
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  E-Dziennik Vulcan
                </a>
              </li>
              <li>
                <a href="/kadra" className="hover:text-white transition-colors">
                  Kadra pedagogiczna
                </a>
              </li>
              <li>
                <a
                  href="/projekty"
                  className="hover:text-white transition-colors"
                >
                  Projekty unijne
                </a>
              </li>
            </ul>
          </div>

          {/* Section 4: Admin */}
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-4 border-b border-blue-800 pb-2 inline-block">
              Administracja
            </h3>
            <p className="mb-4 text-blue-200">
              Panel zarządzania treścią dla administratorów i redaktorów strony.
            </p>
            <a
              href={`${pocketBaseUrl}/_/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm transition-colors border border-blue-700"
            >
              <Lock size={14} />
              Panel Administratora
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#101e47] py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
          <p>
            &copy; {currentYear} Powiatowy Zespół Szkół w Łopusznie. Wszelkie
            prawa zastrzeżone.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span>Realizacja: Szkolne Koło Informatyczne</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
