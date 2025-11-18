import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface AdaptiveDifficultyIndicatorProps {
  currentDifficulty: 'easy' | 'just-right' | 'challenging';
  userPerformance: number; // 0-100
  onDifficultyAdjust?: (newDifficulty: string) => void;
}

export const AdaptiveDifficultyIndicator = ({ 
  currentDifficulty, 
  userPerformance,
  onDifficultyAdjust 
}: AdaptiveDifficultyIndicatorProps) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    // Auto-suggest difficulty adjustments based on performance
    if (userPerformance > 85 && currentDifficulty !== 'challenging') {
      setSuggestion('increase');
      setShowSuggestion(true);
    } else if (userPerformance < 50 && currentDifficulty !== 'easy') {
      setSuggestion('decrease');
      setShowSuggestion(true);
    } else {
      setShowSuggestion(false);
    }
  }, [userPerformance, currentDifficulty]);

  const getDifficultyConfig = () => {
    switch (currentDifficulty) {
      case 'easy':
        return {
          label: 'Easy',
          color: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success',
          icon: TrendingDown,
          description: 'Content is below your skill level',
          gauge: 30
        };
      case 'just-right':
        return {
          label: 'Just Right',
          color: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary',
          icon: Minus,
          description: 'Perfect challenge for your current level',
          gauge: 60
        };
      case 'challenging':
        return {
          label: 'Challenging',
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning',
          icon: TrendingUp,
          description: 'Pushing your boundaries - good for growth',
          gauge: 90
        };
    }
  };

  const config = getDifficultyConfig();
  const DifficultyIcon = config.icon;

  return (
    <Card className={`border-2 ${config.border} ${config.bg}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
              <DifficultyIcon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Difficulty Level</p>
              <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
            </div>
          </div>
          <Badge variant="outline" className={config.color}>
            {userPerformance}% mastery
          </Badge>
        </div>

        {/* Difficulty Gauge */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Too Easy</span>
            <span>Just Right</span>
            <span>Too Hard</span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-success via-primary to-warning opacity-20" />
            
            {/* Current position indicator */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-foreground transition-all duration-500"
              style={{ left: `${config.gauge}%` }}
            />
            
            {/* Optimal range (40-70%) */}
            <div 
              className="absolute top-0 bottom-0 bg-primary/30"
              style={{ left: '40%', width: '30%' }}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {config.description}
        </p>

        {/* Adaptive Suggestions */}
        {showSuggestion && (
          <div className="p-4 bg-background border-2 border-accent rounded-lg mb-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">
                  {suggestion === 'increase' 
                    ? "You're doing great! Want more challenge?" 
                    : "Let's slow down and review"}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {suggestion === 'increase'
                    ? "You're scoring consistently high. Ready for harder exercises?"
                    : "Your scores suggest the content might be moving too fast. Want to review the basics?"}
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      onDifficultyAdjust?.(suggestion === 'increase' ? 'harder' : 'easier');
                      setShowSuggestion(false);
                    }}
                  >
                    {suggestion === 'increase' ? 'Try Harder Content' : 'Review Basics'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSuggestion(false)}
                  >
                    Keep Current
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Adjustment */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Not feeling right? Adjust manually:
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDifficultyAdjust?.('easier')}
              disabled={currentDifficulty === 'easy'}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Make Easier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDifficultyAdjust?.('harder')}
              disabled={currentDifficulty === 'challenging'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Make Harder
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
