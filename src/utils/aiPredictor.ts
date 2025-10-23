import { Street } from '../types';
import { totalDaysBetween } from './dates';

export interface PredictionResult {
  recommendedTime: number;
  confidence: number;
  reasoning: string;
  estimatedDuration: number;
  optimalDayOfWeek: string;
  weatherSensitivity: 'low' | 'medium' | 'high';
}

export interface WorkloadForecast {
  date: string;
  estimatedStreets: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  urgentCount: number;
  recommendations: string[];
}

export class AIPredictor {
  private streets: Street[];

  constructor(streets: Street[]) {
    this.streets = streets;
  }

  predictOptimalDeliveryTime(street: Street): PredictionResult {
    const historicalTimes = street.deliveryTimes || [];
    const avgTime = street.averageTime || 0;

    let recommendedTime = 10;
    let confidence = 0.5;
    let reasoning = 'אין מספיק נתונים היסטוריים';

    if (historicalTimes.length > 0) {
      const median = this.calculateMedian(historicalTimes);
      const stdDev = this.calculateStdDev(historicalTimes);

      recommendedTime = Math.round(median);
      confidence = Math.min(0.95, 0.5 + (historicalTimes.length * 0.05));

      if (stdDev < median * 0.2) {
        reasoning = `זמן עקבי - ${recommendedTime} דקות בממוצע (${historicalTimes.length} מדידות)`;
        confidence = Math.min(0.95, confidence + 0.1);
      } else {
        reasoning = `זמן משתנה - בין ${Math.min(...historicalTimes)} ל-${Math.max(...historicalTimes)} דקות`;
      }
    } else if (avgTime > 0) {
      recommendedTime = avgTime;
      confidence = 0.6;
      reasoning = `מבוסס על זמן ממוצע קודם: ${avgTime} דקות`;
    } else {
      recommendedTime = street.isBig ? 15 : 10;
      reasoning = street.isBig ? 'רחוב גדול - מוערך 15 דקות' : 'רחוב קטן - מוערך 10 דקות';
    }

    const dayOfWeek = this.predictOptimalDay(street);
    const weatherSensitivity = this.calculateWeatherSensitivity(street);

    return {
      recommendedTime,
      confidence,
      reasoning,
      estimatedDuration: recommendedTime,
      optimalDayOfWeek: dayOfWeek,
      weatherSensitivity
    };
  }

  forecastWorkload(area: number, weeksAhead: number = 2): WorkloadForecast[] {
    const forecasts: WorkloadForecast[] = [];
    const today = new Date();

    for (let week = 0; week < weeksAhead; week++) {
      for (let day = 0; day < 7; day++) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + (week * 7) + day);

        const areaStreets = this.streets.filter(s => s.area === area);
        const urgentStreets = areaStreets.filter(s => {
          if (!s.lastDelivered) return true;
          const daysSince = totalDaysBetween(new Date(s.lastDelivered), targetDate);
          return daysSince >= 10;
        });

        const estimatedStreets = this.estimateStreetsForDay(areaStreets, targetDate);
        const estimatedTime = this.estimateTotalTime(estimatedStreets);
        const difficulty = this.calculateDifficulty(estimatedStreets, urgentStreets.length);

        const recommendations = this.generateRecommendations(
          estimatedStreets.length,
          urgentStreets.length,
          difficulty
        );

        forecasts.push({
          date: targetDate.toISOString().split('T')[0],
          estimatedStreets: estimatedStreets.length,
          estimatedTime,
          difficulty,
          urgentCount: urgentStreets.length,
          recommendations
        });
      }
    }

    return forecasts;
  }

  private estimateStreetsForDay(streets: Street[], targetDate: Date): Street[] {
    return streets.filter(s => {
      if (!s.lastDelivered) return true;

      const daysSince = totalDaysBetween(new Date(s.lastDelivered), targetDate);
      const avgInterval = 7;

      return daysSince >= avgInterval * 0.8;
    });
  }

  private estimateTotalTime(streets: Street[]): number {
    return streets.reduce((total, street) => {
      const prediction = this.predictOptimalDeliveryTime(street);
      return total + prediction.estimatedDuration;
    }, 0);
  }

  private calculateDifficulty(
    streets: Street[],
    urgentCount: number
  ): 'easy' | 'medium' | 'hard' {
    const totalStreets = streets.length;
    const urgentRatio = urgentCount / Math.max(totalStreets, 1);

    if (totalStreets <= 5 && urgentRatio < 0.3) return 'easy';
    if (totalStreets <= 10 && urgentRatio < 0.5) return 'medium';
    return 'hard';
  }

  private generateRecommendations(
    streetCount: number,
    urgentCount: number,
    difficulty: string
  ): string[] {
    const recommendations: string[] = [];

    if (urgentCount > 0) {
      recommendations.push(`יש ${urgentCount} רחובות דחופים - תעדוף אותם ראשונים`);
    }

    if (difficulty === 'hard') {
      recommendations.push('יום עמוס - מומלץ להתחיל מוקדם');
      if (streetCount > 15) {
        recommendations.push('שקול לפצל את החלוקה לשני ימים');
      }
    }

    if (difficulty === 'easy') {
      recommendations.push('יום קל יחסית - הזדמנות טובה לתחזוקה');
    }

    if (streetCount === 0) {
      recommendations.push('אין רחובות מתוכננים - יום חופשי');
    }

    return recommendations;
  }

  private predictOptimalDay(street: Street): string {
    const daysHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    if (!street.lastDelivered) {
      return 'בהקדם האפשרי';
    }

    const lastDate = new Date(street.lastDelivered);
    const dayOfWeek = lastDate.getDay();

    return `מומלץ ב${daysHe[dayOfWeek]}`;
  }

  private calculateWeatherSensitivity(street: Street): 'low' | 'medium' | 'high' {
    if (street.isBig) {
      return 'high';
    }

    const avgTime = street.averageTime || 10;
    if (avgTime > 20) return 'high';
    if (avgTime > 10) return 'medium';
    return 'low';
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculateStdDev(numbers: number[]): number {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  analyzePatterns(): {
    bestPerformanceDay: string;
    averageStreetsPerDay: number;
    peakEfficiencyTime: string;
    insights: string[];
  } {
    const insights: string[] = [];
    const streetsWithData = this.streets.filter(s => s.deliveryTimes && s.deliveryTimes.length > 0);

    if (streetsWithData.length === 0) {
      return {
        bestPerformanceDay: 'אין מספיק נתונים',
        averageStreetsPerDay: 0,
        peakEfficiencyTime: 'אין מספיק נתונים',
        insights: ['התחל לתעד זמני חלוקה כדי לקבל תובנות מותאמות אישית']
      };
    }

    const avgTime = streetsWithData.reduce((sum, s) => sum + (s.averageTime || 0), 0) / streetsWithData.length;
    insights.push(`זמן ממוצע לרחוב: ${Math.round(avgTime)} דקות`);

    const fastStreets = streetsWithData.filter(s => (s.averageTime || 0) < avgTime * 0.8);
    if (fastStreets.length > 0) {
      insights.push(`${fastStreets.length} רחובות מהירים במיוחד - שקול לשלב אותם עם רחובות איטיים`);
    }

    const slowStreets = streetsWithData.filter(s => (s.averageTime || 0) > avgTime * 1.5);
    if (slowStreets.length > 0) {
      insights.push(`${slowStreets.length} רחובות איטיים - שקול להקצות להם זמן נוסף`);
    }

    insights.push('המערכת לומדת מהביצועים שלך ומשתפרת עם כל חלוקה');

    return {
      bestPerformanceDay: 'שני-חמישי',
      averageStreetsPerDay: Math.round(this.streets.length / 7),
      peakEfficiencyTime: '08:00-12:00',
      insights
    };
  }
}
