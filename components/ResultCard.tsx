import React, { useState, useEffect } from 'react';
import { CelebrityMatch } from '../types';
import { Trophy, Star, Crown, Medal, User } from 'lucide-react';

interface ResultCardProps {
  match: CelebrityMatch;
}

const ResultCard: React.FC<ResultCardProps> = ({ match }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!match.name) return;
      try {
        const searchUrl = `https://ko.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(match.name)}&pithumbsize=300&origin=*`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            setImageUrl(pages[pageId].thumbnail.source);
          }
        }
      } catch (error) {
        console.error("Error fetching image", error);
      }
    };
    fetchImage();
  }, [match.name]);

  // Rank 1 Design (Legendary Card)
  if (match.rank === 1) {
    return (
      <div className="relative w-full transform transition-all hover:scale-105 duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur opacity-70 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 border-[3px] border-yellow-300 rounded-3xl p-6 shadow-2xl overflow-hidden">
          
          {/* Confetti Background inside card */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-200 to-transparent"></div>

          <div className="flex flex-col items-center text-center">
            <div className="absolute top-0 right-8 w-12 h-16 bg-yellow-500 rounded-b-lg flex items-center justify-center shadow-lg z-10">
                <Crown className="w-8 h-8 text-white drop-shadow-md" />
            </div>

            <div className="mb-2">
                <span className="inline-block px-4 py-1 rounded-full bg-yellow-400 text-yellow-900 font-black text-sm shadow-md uppercase tracking-wider">
                    🏆 전설의 닮은꼴 발견!
                </span>
            </div>

            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-lg">{match.name}</h2>
            <p className="text-yellow-300 font-bold mb-4 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300" /> 
                {match.celebrityType}
                <Star className="w-4 h-4 fill-yellow-300" />
            </p>

            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] overflow-hidden bg-slate-800 mb-4 group">
              {imageUrl ? (
                <img src={imageUrl} alt={match.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-slate-500" /></div>
              )}
            </div>

            <div className="w-full bg-black/30 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-bold">싱크로율 파워</span>
                <span className="text-2xl font-black text-yellow-400">{match.similarity}%</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  style={{ width: `${match.similarity}%` }}
                ></div>
              </div>
              <p className="mt-3 text-white font-medium break-keep leading-relaxed">
                "{match.description}"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rank 2-5 Design (Rare/Common Cards)
  const isRank2Or3 = match.rank <= 3;
  const borderColor = isRank2Or3 ? "border-indigo-300" : "border-slate-600";
  const iconColor = match.rank === 2 ? "text-slate-300" : match.rank === 3 ? "text-amber-600" : "text-slate-500";

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 ${borderColor} flex items-center gap-4 hover:bg-white/20 transition-colors`}>
      <div className="relative flex-shrink-0">
        <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 ${borderColor}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={match.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-slate-500" /></div>
          )}
        </div>
        <div className={`absolute -top-2 -left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center font-bold text-slate-900 border-2 border-slate-900 shadow-md`}>
          {match.rank}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white leading-tight">{match.name}</h3>
            <p className={`text-xs font-bold ${isRank2Or3 ? 'text-indigo-300' : 'text-slate-400'}`}>
              {match.celebrityType}
            </p>
          </div>
          <div className="text-right">
             <span className="text-xl font-black text-indigo-200">{match.similarity}%</span>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-1 truncate">{match.description}</p>
      </div>
    </div>
  );
};

export default ResultCard;