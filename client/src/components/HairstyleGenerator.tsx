import React, { useState } from 'react';
import { Sparkles, Scissors, ShoppingBag, X } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-hot-toast';

interface IRecommendation {
  name: string;
  description: string;
  maintenance: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  products: string[];
  confidence: number;
}

export const HairstyleGenerator: React.FC = () => {
  const { setActiveWidget } = useChat();
  const [faceShape, setFaceShape] = useState('oval');
  const [texture, setTexture] = useState('straight');
  const [length, setLength] = useState('short');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<IRecommendation[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRecommendations([]);

    try {
      const res = await axios.get(`${config.apiUrl}/hairstyles/recommend`, {
        params: {
          faceShape,
          hairTexture: texture,
          hairLength: length,
        },
      });

      const suggestions: IRecommendation[] = (res.data.data || []).map((item: any) => ({
        name: item.hairstyle.name,
        description: item.reason ? `${item.hairstyle.description}\n\n${item.reason}` : item.hairstyle.description,
        maintenance: item.hairstyle.maintenanceLevel,
        difficulty: item.hairstyle.difficulty,
        products: item.hairstyle.stylingProducts || [],
        confidence: item.confidenceScore,
      }));

      setRecommendations(suggestions);
      if (suggestions.length === 0) {
        toast.error('No styles matching all filters found. Try relaxing your selections.');
      } else {
        toast.success(`Found ${suggestions.length} custom recommendations!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to get style recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center p-4 border-b border-white/5 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-zinc-100">AI Hairstyle Analyzer</h3>
        </div>
        <button
          onClick={() => setActiveWidget('none')}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {recommendations.length === 0 && !isLoading ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Select your characteristics below to get custom styling recommendations matching your face structure.
            </p>

            {/* Face Shape */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Face Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {['oval', 'round', 'square', 'heart', 'diamond', 'oblong'].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setFaceShape(shape)}
                    className={`py-2 px-1 text-xs border rounded-lg capitalize transition-all duration-200 ${
                      faceShape === shape
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-white/5 bg-black/20 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Texture */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Hair Texture</label>
              <div className="grid grid-cols-2 gap-2">
                {['straight', 'wavy', 'curly', 'coily'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTexture(t)}
                    className={`py-2 px-2 text-xs border rounded-lg capitalize transition-all duration-200 ${
                      texture === t
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-white/5 bg-black/20 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Length */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Desired Length</label>
              <div className="grid grid-cols-3 gap-2">
                {['short', 'medium', 'long'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`py-2 px-1 text-xs border rounded-lg capitalize transition-all duration-200 ${
                      length === l
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-white/5 bg-black/20 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950" />
              Generate Recommendation
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 py-8 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-2" />
            <p className="text-sm text-zinc-400 animate-pulse">Analyzing face features & textures...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recommended Matches</h4>
              <button
                onClick={() => setRecommendations([])}
                className="text-xs text-amber-500 hover:underline"
              >
                Back to settings
              </button>
            </div>

            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-xl border border-white/5 bg-black/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5">
                      <Scissors className="w-4 h-4 text-amber-500" />
                      {rec.name}
                    </h5>
                    <span className="text-[10px] text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10 inline-block mt-1 font-semibold">
                      Match Score: {rec.confidence}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Maintenance</span>
                    <span className="text-xs text-zinc-300 font-semibold capitalize">{rec.maintenance}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Difficulty</span>
                    <span className="text-xs text-zinc-300 font-semibold capitalize">{rec.difficulty}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Recommended Styling Products</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.products.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-zinc-300 bg-zinc-800 px-2 py-1 rounded border border-white/5 flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3 text-amber-500/70" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HairstyleGenerator;
