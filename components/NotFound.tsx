import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, GraduationCap } from 'lucide-react';

interface Grade {
  id: number;
  x: number;
  y: number;
  value: string;
  color: string;
  speed: number;
  fontSize: number;
}

const NotFound: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [grades, setGrades] = useState<Grade[]>([]);
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTitleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      startGradeRain();
      setClickCount(0); // Reset after triggering
    }
  };

  const startGradeRain = () => {
    const newGrades: Grade[] = [];
    const colors = ['#facc15', '#1e3a8a', '#22c55e', '#ef4444']; // yellow, blue, green, red
    const values = ['6', '5', '5+', '6!'];

    for (let i = 0; i < 100; i++) {
        newGrades.push({
            id: i,
            x: Math.random() * 100, // percentage
            y: -20 - Math.random() * 100, // start above screen
            value: values[Math.floor(Math.random() * values.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.5 + Math.random() * 1.5,
            fontSize: 24 + Math.random() * 32
        });
    }
    setGrades(newGrades);
  };

  const animate = () => {
    setGrades(prevGrades => {
        if (prevGrades.length === 0) return [];

        // Check if all grades are out of view (y > 110)
        const activeGrades = prevGrades.filter(g => g.y < 120);
        if (activeGrades.length === 0) return [];

        return activeGrades.map(g => ({
            ...g,
            y: g.y + g.speed
        }));
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (grades.length > 0) {
        requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [grades.length === 0]); // Restart loop when grades are added

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden text-center" ref={containerRef}>
      
      {/* Easter Egg Layer */}
      {grades.map(grade => (
        <div 
            key={grade.id}
            className="absolute font-serif font-bold pointer-events-none select-none z-50"
            style={{
                left: `${grade.x}%`,
                top: `${grade.y}%`,
                color: grade.color,
                fontSize: `${grade.fontSize}px`,
                textShadow: '2px 2px 0 rgba(255,255,255,0.5)'
            }}
        >
            {grade.value}
        </div>
      ))}

      {/* Content */}
      <div className="max-w-md w-full relative z-10">
        <div className="mb-8 relative inline-block group">
            <h1 
                className="font-serif text-[150px] leading-none font-black text-school-primary/10 select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-100"
                onClick={handleTitleClick}
                title="Kliknij mnie 5 razy..."
            >
                404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <GraduationCap size={80} className="text-school-primary/20 -rotate-12 transform translate-y-4" />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-school-primary mb-4">
          Ups! Wygląda na to, że jesteś na wagarach.
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Strona, której szukasz, prawdopodobnie uciekła z lekcji. 
          Nie martw się, nie wpiszemy Ci nieobecności, jeśli szybko wrócisz do szkoły.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
                to="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-school-primary text-white rounded-lg font-semibold shadow-lg hover:bg-blue-800 hover:-translate-y-1 transition-all duration-300 group"
            >
                <Home size={20} className="mr-2 group-hover:animate-pulse" />
                Wróć do szkoły
            </Link>
            
            <button 
                onClick={() => window.history.back()} 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-school-primary border-2 border-school-primary/10 rounded-lg font-semibold hover:bg-gray-50 hover:border-school-primary/30 transition-all duration-300"
            >
                <ArrowLeft size={20} className="mr-2" />
                Wróć tam, gdzie byłeś
            </button>
        </div>
      </div>

      {/* Decorative footer line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-school-primary via-school-accent to-school-primary opacity-50"></div>
    </div>
  );
};

export default NotFound;
