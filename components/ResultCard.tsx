import React, { useState, useEffect } from 'react';
import { CelebrityMatch } from '../types';
import { User, Award } from 'lucide-react';

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

  const isFirst = match.rank === 1;

  if (isFirst) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 relative">
             <div className="absolute -top-3 -right-3 bg-indigo-500 text-white p-1.5 rounded-full shadow-md">
                <Award className="w-5 h-5" />
             </div>
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-sm">
                {imageUrl ? (
                  <img src={imageUrl} alt={match.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-slate-300" />
                  </div>
                )}
             </div>
          </div>
          
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-2">
            싱크로율 {match.similarity}%
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{match.name}</h2>
          <p className="text-slate-500 text-sm font-medium mb-4">{match.celebrityType}</p>
          
          <div className="w-full bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed break-keep">
            "{match.description}"
          </div>
        </div>
      </div>
    );
  }

  // List Items for Rank 2-5
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform active:scale-[0.99]">
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
          {imageUrl ? (
            <img src={imageUrl} alt={match.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-300" />
            </div>
          )}
        </div>
        <div className="absolute -top-1 -left-1 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
          {match.rank}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-800">{match.name}</h3>
          <span className="text-indigo-600 font-bold text-sm">{match.similarity}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-indigo-400 rounded-full" 
            style={{ width: `${match.similarity}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 truncate">{match.celebrityType}</p>
      </div>
    </div>
  );
};

export default ResultCard;