import React from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const ProjectsBlock: React.FC = () => {
  return (
    <section className="bg-school-primary text-white py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-1/2">
          <div className="flex items-center gap-3 mb-4 text-school-accent">
            <Globe size={24} />
            <span className="font-bold tracking-wider uppercase text-sm">
              Okno na świat
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4">
            Projekty Międzynarodowe
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Realizujemy projekty unijne Erasmus+, dzięki którym nasi uczniowie
            odbywają bezpłatne staże zagraniczne w Hiszpanii, Grecji i we
            Włoszech. Rozwijamy kompetencje językowe i zawodowe w
            międzynarodowym środowisku.
          </p>
        </div>
        <div className="md:w-1/2 bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80 mb-6">
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="bg-blue-900 px-2 py-1">Erasmus+</span>
            </div>
            <div className="text-xl font-bold text-white border-2 border-white px-3 py-1 rounded">
              POWER
            </div>
            <div className="text-lg text-white font-serif italic">
              Powiat Kielecki
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/p/projekty"
              className="text-sm font-semibold hover:text-school-accent transition-colors underline decoration-school-accent/50 underline-offset-4"
            >
              Dowiedz się więcej o naszych projektach
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsBlock;
