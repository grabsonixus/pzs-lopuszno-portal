import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Wrench, Briefcase, ArrowRight } from "lucide-react";

const OfferBlock: React.FC = () => {
  return (
    <section className="bg-neutral-100 py-16 relative">
      {/* Separator - Wave from white to gray */}
      {/* Tło sekcji: Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-100"></div>


      <div className="container mx-auto px-4 relative z-10">
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-school-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
               <GraduationCap size={120} />
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-school-primary transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110 transform">
              <GraduationCap size={32} className="text-school-primary group-hover:!text-white transition-colors duration-300" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-school-primary transition-colors">
              Liceum Ogólnokształcące
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
              Przygotowanie do studiów wyższych. Profile humanistyczne, ścisłe i
              językowe. Rozwijaj pasje w kołach zainteresowań.
            </p>
            <Link
              to="/p/oferta"
              className="inline-flex items-center text-school-primary font-bold hover:text-blue-700 transition-all gap-2 group-hover:translate-x-2"
            >
              Zobacz profile <ArrowRight size={16} />
            </Link>
          </div>

          {/* Blok 2: Technikum (Wyróżniony) */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-school-accent/50 relative hover:border-school-accent hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform md:-mt-4 md:mb-4 z-10 group overflow-hidden">
            <div className="absolute top-0 right-0 bg-school-accent text-school-primary text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm z-20">
              Najpopularniejsze
            </div>
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
               <Wrench size={120} />
            </div>
            <div className="w-16 h-16 bg-yellow-50 text-school-accent-dark rounded-2xl flex items-center justify-center mb-6 group-hover:bg-school-accent group-hover:text-school-primary transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110 transform">
              <Wrench size={32} className="text-yellow-600 group-hover:text-school-primary" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-school-primary transition-colors">
              Technikum
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
              Zdobycie zawodu i matura w 5 lat. Praktyki u lokalnych
              przedsiębiorców i staże zagraniczne Erasmus+.
            </p>
            <Link
              to="/p/oferta"
              className="inline-flex items-center text-school-primary font-bold hover:text-blue-700 transition-all gap-2 group-hover:translate-x-2"
            >
              Wszystkie zawody <ArrowRight size={16} />
            </Link>
          </div>

          {/* Blok 3: Szkoła Branżowa */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-school-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
               <Briefcase size={120} />
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-school-primary transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110 transform">
              <Briefcase size={32} className="text-school-primary group-hover:!text-white transition-colors duration-300" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-school-primary transition-colors">
              Szkoła Branżowa
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
              Szybkie zdobycie konkretnych kwalifikacji zawodowych. Nauka w
              systemie dualnym - szkoła i pracodawca.
            </p>
            <Link
              to="/p/oferta"
              className="inline-flex items-center text-school-primary font-bold hover:text-blue-700 transition-all gap-2 group-hover:translate-x-2"
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
