import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Wrench, Briefcase, ArrowRight } from "lucide-react";

const OfferBlock: React.FC = () => {
  return (
    <section className="bg-neutral-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl font-bold text-school-primary mb-4">
            Wybierz swoją ścieżkę
          </h2>
          <p className="text-gray-600">
            Oferujemy różnorodne profile kształcenia dopasowane do potrzeb rynku
            pracy. Znajdź kierunek, który pozwoli Ci rozwinąć skrzydła.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blok 1: Liceum */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 text-school-primary rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
              Liceum Ogólnokształcące
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Przygotowanie do studiów wyższych. Profile humanistyczne, ścisłe i
              językowe. Rozwijaj pasje w kołach zainteresowań.
            </p>
            <Link
              to="/p/oferta"
              className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
            >
              Zobacz profile <ArrowRight size={16} />
            </Link>
          </div>

          {/* Blok 2: Technikum (Wyróżniony) */}
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-school-accent relative hover:-translate-y-2 transition-transform duration-300 transform scale-105 md:scale-110 z-10">
            <div className="absolute top-0 right-0 bg-school-accent text-school-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
              Najpopularniejsze
            </div>
            <div className="w-16 h-16 bg-yellow-100 text-yellow-700 rounded-2xl flex items-center justify-center mb-6">
              <Wrench size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
              Technikum
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Zdobycie zawodu i matura w 5 lat. Praktyki u lokalnych
              przedsiębiorców i staże zagraniczne Erasmus+.
            </p>
            <Link
              to="/p/oferta"
              className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
            >
              Wszystkie zawody <ArrowRight size={16} />
            </Link>
          </div>

          {/* Blok 3: Szkoła Branżowa */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 text-school-primary rounded-2xl flex items-center justify-center mb-6">
              <Briefcase size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
              Szkoła Branżowa
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Szybkie zdobycie konkretnych kwalifikacji zawodowych. Nauka w
              systemie dualnym - szkoła i pracodawca.
            </p>
            <Link
              to="/p/oferta"
              className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
            >
              Lista zawodów <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferBlock;
