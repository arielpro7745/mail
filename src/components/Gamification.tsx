import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, Star, Zap, Target, Medal, Crown } from 'lucide-react';
import { useDistribution } from '../hooks/useDistribution';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Stats {
  totalPoints: number;
  level: number;
  streak: number;
  bestDay: number;
  totalDeliveries: number;
  averageTime: number;
}

export default function Gamification() {
  const { allStreets, allCompletedToday } = useDistribution();
  const [stats, setStats] = useState<Stats>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    bestDay: 0,
    totalDeliveries: 0,
    averageTime: 0
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_delivery',
      name: 'התחלה טובה',
      description: 'חלק את הרחוב הראשון שלך',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'speed_demon',
      name: 'שד המהירות',
      description: 'חלק 10 רחובות ביום אחד',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'week_warrior',
      name: 'לוחם השבוע',
      description: 'חלק כל יום במשך שבוע',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      maxProgress: 7
    },
    {
      id: 'century_club',
      name: 'מועדון המאה',
      description: 'חלק 100 רחובות בסך הכל',
      icon: '💯',
      unlocked: false,
      progress: 0,
      maxProgress: 100
    },
    {
      id: 'efficiency_master',
      name: 'אלוף היעילות',
      description: 'השג זמן ממוצע מתחת ל-8 דקות לרחוב',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'area_conqueror',
      name: 'כובש האזור',
      description: 'סיים את כל הרחובות באזור אחד',
      icon: '👑',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'early_bird',
      name: 'הציפור המוקדמת',
      description: 'התחל חלוקה לפני 8:00 בבוקר',
      icon: '🌅',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'marathon_runner',
      name: 'רץ מרתון',
      description: 'חלק יותר מ-20 רחובות ביום',
      icon: '🏃',
      unlocked: false,
      progress: 0,
      maxProgress: 20
    }
  ]);

  useEffect(() => {
    calculateStats();
    checkAchievements();
  }, [allStreets, allCompletedToday]);

  const calculateStats = () => {
    const deliveredStreets = allStreets.filter(s => s.lastDelivered);
    const totalDeliveries = deliveredStreets.length;

    const streetsWithTimes = allStreets.filter(s => s.averageTime && s.averageTime > 0);
    const averageTime = streetsWithTimes.length > 0
      ? streetsWithTimes.reduce((sum, s) => sum + (s.averageTime || 0), 0) / streetsWithTimes.length
      : 0;

    const totalPoints = calculateTotalPoints(totalDeliveries, averageTime);
    const level = Math.floor(totalPoints / 100) + 1;
    const streak = calculateStreak();

    setStats({
      totalPoints,
      level,
      streak,
      bestDay: allCompletedToday.length,
      totalDeliveries,
      averageTime: Math.round(averageTime)
    });
  };

  const calculateTotalPoints = (deliveries: number, avgTime: number): number => {
    let points = deliveries * 10;

    if (avgTime > 0 && avgTime < 8) {
      points += deliveries * 5;
    }

    if (allCompletedToday.length >= 10) {
      points += 50;
    }

    return points;
  };

  const calculateStreak = (): number => {
    const lastWeekDeliveries: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const deliveriesOnDay = allStreets.filter(s =>
        s.lastDelivered && s.lastDelivered.startsWith(dateStr)
      ).length;

      lastWeekDeliveries[dateStr] = deliveriesOnDay;
    }

    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (lastWeekDeliveries[dateStr] > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const checkAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      let progress = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'first_delivery':
          progress = allStreets.filter(s => s.lastDelivered).length > 0 ? 1 : 0;
          unlocked = progress >= achievement.maxProgress;
          break;

        case 'speed_demon':
          progress = Math.min(allCompletedToday.length, achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;

        case 'week_warrior':
          progress = Math.min(calculateStreak(), achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;

        case 'century_club':
          progress = Math.min(allStreets.filter(s => s.lastDelivered).length, achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;

        case 'efficiency_master':
          const streetsWithTimes = allStreets.filter(s => s.averageTime && s.averageTime > 0);
          const avgTime = streetsWithTimes.length > 0
            ? streetsWithTimes.reduce((sum, s) => sum + (s.averageTime || 0), 0) / streetsWithTimes.length
            : 0;
          progress = avgTime > 0 && avgTime < 8 ? 1 : 0;
          unlocked = progress >= achievement.maxProgress;
          break;

        case 'area_conqueror':
          progress = 0;
          unlocked = false;
          break;

        case 'early_bird':
          progress = 0;
          unlocked = false;
          break;

        case 'marathon_runner':
          progress = Math.min(allCompletedToday.length, achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;
      }

      return { ...achievement, progress, unlocked };
    });

    setAchievements(updatedAchievements);
  };

  const getLevelTitle = (level: number): string => {
    if (level >= 20) return 'אגדה';
    if (level >= 15) return 'אלוף על';
    if (level >= 10) return 'מאסטר';
    if (level >= 7) return 'מומחה';
    if (level >= 5) return 'ותיק';
    if (level >= 3) return 'מתקדם';
    return 'מתחיל';
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl">
            <Trophy className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">מצב תחרות</h2>
            <p className="text-sm text-gray-600">עקוב אחר ההתקדמות והישגים שלך</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-600" size={20} />
              <span className="text-xs text-gray-600">רמה</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.level}</div>
            <div className="text-xs text-gray-600 mt-1">{getLevelTitle(stats.level)}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-blue-600" size={20} />
              <span className="text-xs text-gray-600">נקודות</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalPoints}</div>
            <div className="text-xs text-gray-600 mt-1">{100 - (stats.totalPoints % 100)} לרמה הבאה</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-600" size={20} />
              <span className="text-xs text-gray-600">רצף</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.streak}</div>
            <div className="text-xs text-gray-600 mt-1">ימים רצופים</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-green-600" size={20} />
              <span className="text-xs text-gray-600">סה"כ</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalDeliveries}</div>
            <div className="text-xs text-gray-600 mt-1">חלוקות</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-purple-600" size={24} />
            הישגים
          </h3>
          <span className="text-sm text-gray-600">
            {unlockedCount} / {totalAchievements} פתוחים
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-4xl ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>

                  {!achievement.unlocked && achievement.maxProgress > 1 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}

                  {achievement.unlocked && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-2">
                      <Medal size={16} />
                      <span>נפתח!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-2">טיפים להשגת נקודות:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>⭐ כל חלוקת רחוב = 10 נקודות</li>
              <li>⚡ חלוקה מהירה (מתחת ל-8 דק') = בונוס של 5 נקודות</li>
              <li>🎯 10 רחובות ביום = בונוס של 50 נקודות</li>
              <li>🔥 רצף ימי עבודה = כפל נקודות</li>
              <li>💯 כל 100 נקודות = עליית רמה</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
