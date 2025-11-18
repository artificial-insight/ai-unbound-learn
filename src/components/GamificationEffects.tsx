import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Star, Zap, Award, Target } from "lucide-react";

interface BadgeUnlocked {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationEffectsProps {
  onBadgeUnlock?: (badge: BadgeUnlocked) => void;
}

export const GamificationEffects = ({ onBadgeUnlock }: GamificationEffectsProps) => {
  const [showBadge, setShowBadge] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<BadgeUnlocked | null>(null);
  const [streak, setStreak] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  const triggerConfetti = (type: 'standard' | 'fireworks' | 'stars' = 'standard') => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    if (type === 'fireworks') {
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 150,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          },
          colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']
        });
      }, 400);
    } else if (type === 'stars') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
    } else {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });
    }
  };

  const unlockBadge = (badge: BadgeUnlocked) => {
    setCurrentBadge(badge);
    setShowBadge(true);
    
    // Different confetti based on rarity
    switch (badge.rarity) {
      case 'legendary':
        triggerConfetti('fireworks');
        break;
      case 'epic':
        triggerConfetti('stars');
        break;
      default:
        triggerConfetti('standard');
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowBadge(false);
    }, 5000);

    if (onBadgeUnlock) {
      onBadgeUnlock(badge);
    }
  };

  const incrementStreak = () => {
    setStreak(prev => prev + 1);
    setStreakAnimation(true);
    setTimeout(() => setStreakAnimation(false), 1000);

    // Award streak badges
    if (streak + 1 === 7) {
      unlockBadge({
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7-day learning streak!',
        icon: '🔥',
        rarity: 'rare'
      });
    } else if (streak + 1 === 30) {
      unlockBadge({
        id: 'streak_30',
        title: 'Month Master',
        description: '30-day learning streak!',
        icon: '🏆',
        rarity: 'epic'
      });
    } else if (streak + 1 === 100) {
      unlockBadge({
        id: 'streak_100',
        title: 'Century Scholar',
        description: '100-day learning streak!',
        icon: '⭐',
        rarity: 'legendary'
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic': return 'from-purple-400 via-pink-500 to-red-500';
      case 'rare': return 'from-blue-400 to-purple-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <>
      {/* Badge Unlock Popup */}
      {showBadge && currentBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className={`p-8 max-w-md w-full bg-gradient-to-br ${getRarityColor(currentBadge.rarity)} border-4 border-white shadow-2xl animate-scale-in`}>
            <div className="text-center text-white">
              <div className="text-6xl mb-4 animate-bounce">{currentBadge.icon}</div>
              <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
                {currentBadge.rarity.toUpperCase()} BADGE UNLOCKED!
              </h2>
              <h3 className="text-2xl font-semibold mb-3">
                {currentBadge.title}
              </h3>
              <p className="text-lg opacity-90">
                {currentBadge.description}
              </p>
              <Badge 
                className="mt-4 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1"
              >
                {currentBadge.rarity} Achievement
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Streak Counter (can be placed in dashboard) */}
      <Card className="p-4 border-2 border-warning/20 bg-gradient-to-br from-warning/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative ${streakAnimation ? 'animate-bounce' : ''}`}>
              <Flame className="w-8 h-8 text-warning" />
              {streak > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-xs font-bold text-white">
                  {streak}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-lg">{streak} Day Streak</p>
              <p className="text-sm text-muted-foreground">
                Keep learning daily!
              </p>
            </div>
          </div>
          <button
            onClick={incrementStreak}
            className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors"
          >
            Log Today
          </button>
        </div>
      </Card>

      {/* Sample badges to showcase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { icon: Trophy, title: 'First Course', color: 'text-yellow-500', rarity: 'common' },
          { icon: Star, title: 'Perfect Quiz', color: 'text-blue-500', rarity: 'rare' },
          { icon: Zap, title: 'Speed Learner', color: 'text-purple-500', rarity: 'epic' },
          { icon: Award, title: 'Master', color: 'text-orange-500', rarity: 'legendary' }
        ].map((badge, idx) => (
          <button
            key={idx}
            onClick={() => unlockBadge({
              id: `badge_${idx}`,
              title: badge.title,
              description: `You've earned the ${badge.title} badge!`,
              icon: '🎉',
              rarity: badge.rarity as any
            })}
            className="p-4 border-2 rounded-lg hover:border-primary transition-colors bg-card"
          >
            <badge.icon className={`w-8 h-8 mx-auto mb-2 ${badge.color}`} />
            <p className="text-xs font-medium text-center">{badge.title}</p>
            <Badge variant="outline" className="mt-1 text-xs w-full">
              {badge.rarity}
            </Badge>
          </button>
        ))}
      </div>
    </>
  );
};

// Export helper function to trigger confetti from anywhere
export const celebrateSuccess = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
};
