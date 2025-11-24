import React, { useState, useEffect } from 'react';
import { CelebrityMatch } from '../types';
import { Star, Trophy, Medal, User } from 'lucide-react';

interface ResultCardProps {
  match: CelebrityMatch;
}

const ResultCard: React.FC<ResultCardProps> = ({ match }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!match.name) return;
      
      try {
        // Fetch image from Korean Wikipedia
        const searchUrl = `https://ko.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(match.name)}&pithumbsize=200&origin=*`;
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
        console.error("Error fetching image for", match.name, error);
      }
    };

    fetchImage();
  }, [match.name]);

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500 text-yellow-950";
      case 2: return "bg-slate-300 text-slate-900";
      case 3: return "bg-amber-600 text-white";
      default: return "bg-slate-700 text-slate-300";
    }
  };

  const getBorderColor = (rank: number) => {
    switch (rank) {
      case 1: return "border-yellow-500/50 bg-yellow-500/5";
      case 2: return "border-slate-400/50 bg-slate-500/5";
      case 3: return "border-amber-600/50 bg-amber-600/5";
      default: return "border-slate-700 bg-slate-800/50";
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border ${getBorderColor(match.rank)} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]`}>
      
      <div className="flex gap-4">
        {/* Image Section */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-inner">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={match.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className={`absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-lg border-2 border-slate-900 ${getRankBadgeColor(match.rank)}`}>
            {match.rank}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <h3 className="font-bold text-lg text-white leading-none truncate pr-2">{match.name}</h3>
              <span className="text-xs text-indigo-300 font-medium mt-1">{match.celebrityType}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                {match.similarity}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              style={{ width: `${match.similarity}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3 bg-slate-900/40 rounded-lg p-3 text-sm text-slate-300 border border-slate-700/30">
        <p className="leading-relaxed">
          <span className="text-indigo-400 mr-2">💡</span>
          {match.description}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;