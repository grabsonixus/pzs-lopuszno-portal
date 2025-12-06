import React, { useEffect, useState } from 'react';
import { pb } from '../services/pocketbase';
import { Major, MajorType } from '../lib/types';
import * as Icons from 'lucide-react';

const Offer: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const result = await pb.collection('majors').getFullList<Major>({
          sort: 'type,name',
        });
        setMajors(result);
      } catch (error) {
        console.error("Error fetching majors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  const groupByType = (items: Major[]) => {
    return items.reduce((groups, item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {} as Record<MajorType, Major[]>);
  };

  const groupedMajors = groupByType(majors);
  const typeOrder: MajorType[] = ['Technikum', 'Liceum Ogólnokształcące' as MajorType, 'Branżowa', 'Dorośli'];

  // Helper to dynamically render Lucide icon by name string
  const DynamicIcon = ({ name }: { name: string }) => {
    // @ts-ignore
    const IconComponent = Icons[name] || Icons.BookOpen;
    return <IconComponent size={32} />;
  };

  const getTypeDescription = (type: string) => {
    switch(type) {
      case 'Technikum': return '5-letnia szkoła kończąca się maturą i egzaminem zawodowym.';
      case 'LO': case 'Liceum Ogólnokształcące': return '4-letnia szkoła przygotowująca do studiów wyższych.';
      case 'Branżowa': return '3-letnia szkoła zawodowa I stopnia z dużą ilością praktyk.';
      default: return 'Oferta edukacyjna dla osób dorosłych.';
    }
  };

  const getTypeColor = (type: string) => {
      switch(type) {
        case 'Technikum': return 'bg-blue-50 border-blue-100 text-blue-900';
        case 'LO': case 'Liceum Ogólnokształcące': return 'bg-yellow-50 border-yellow-100 text-yellow-900';
        case 'Branżowa': return 'bg-green-50 border-green-100 text-green-900';
        default: return 'bg-gray-50 border-gray-100';
      }
  };

  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-school-primary mb-6">Oferta Edukacyjna</h1>
          <p className="text-lg text-gray-600">
            Poznaj kierunki kształcenia na rok szkolny 2025/2026. 
            Wybierz szkołę, która najlepiej odpowiada Twoim zainteresowaniom i planom na przyszłość.
          </p>
       </div>

       {loading ? (
         <div className="space-y-12 animate-pulse">
           {[1, 2].map(i => (
             <div key={i} className="space-y-4">
               <div className="h-8 bg-gray-200 w-48 rounded"></div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3].map(j => (
                    <div key={j} className="h-48 bg-gray-200 rounded-xl"></div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="space-y-20">
            {Object.entries(groupedMajors).map(([type, items]) => (
              <section key={type} id={type.toLowerCase()}>
                <div className="flex items-end gap-4 mb-8 border-b border-gray-200 pb-4">
                  <h2 className="font-serif text-3xl font-bold text-gray-900">{type === 'LO' ? 'Liceum Ogólnokształcące' : type}</h2>
                  <p className="text-gray-500 pb-1 hidden md:block text-sm">{getTypeDescription(type)}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((major) => (
                    <div key={major.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1">
                      <div className={`p-6 ${getTypeColor(type)}`}>
                         <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-school-primary shadow-sm mb-4">
                           <DynamicIcon name={major.icon || 'Book'} />
                         </div>
                         <h3 className="font-bold text-xl mb-2">{major.name}</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {major.description}
                        </p>
                        <div className="flex items-center text-school-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                           Więcej informacji <Icons.ArrowRight size={16} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
         </div>
       )}
       
       <div className="mt-20 bg-school-primary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
             <h2 className="font-serif text-3xl font-bold mb-4">Masz pytania dotyczące rekrutacji?</h2>
             <p className="text-blue-100 mb-8 max-w-xl mx-auto">
               Skontaktuj się z sekretariatem szkoły lub komisją rekrutacyjną. Jesteśmy tu, aby Ci pomóc.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <a href="tel:+48413914001" className="bg-white text-school-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                 <Icons.Phone size={20} /> Zadzwoń
               </a>
               <a href="mailto:sekretariat@pzs-lopuszno.pl" className="bg-school-accent text-school-primary px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                 <Icons.Mail size={20} /> Napisz wiadomość
               </a>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Offer;