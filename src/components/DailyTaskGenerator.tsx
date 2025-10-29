import { useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import { useDistribution } from "../hooks/useDistribution";
import { streets } from "../data/streets";
import { isWorkingDay } from "../utils/areaColors";

export default function DailyTaskGenerator() {
  const { tasks, addTask } = useTasks();
  const { todayArea } = useDistribution();

  useEffect(() => {
    const today = new Date();

    if (!isWorkingDay(today)) {
      console.log("⏸️ היום אינו יום עבודה - לא נוצרות משימות אוטומטיות");
      return;
    }

    const todayKey = today.toDateString();
    const generatedKey = `daily-tasks-generated-${todayKey}-area-${todayArea}`;

    if (localStorage.getItem(generatedKey)) {
      console.log("✅ משימות יומיות כבר נוצרו היום");
      return;
    }

    const areaStreets = streets.filter(s => s.area === todayArea);

    if (areaStreets.length === 0) {
      console.log(`⚠️ לא נמצאו רחובות באזור ${todayArea}`);
      return;
    }

    console.log(`🚀 יוצר משימות אוטומטיות לאזור ${todayArea} - ${areaStreets.length} רחובות`);

    areaStreets.forEach((street, index) => {
      const taskTitle = `חלוקה - ${street.name}`;

      const existingTask = tasks.find(t =>
        t.title === taskTitle &&
        t.dueDate === today.toISOString().split('T')[0]
      );

      if (!existingTask) {
        addTask({
          title: taskTitle,
          description: `חלוקת דואר ברחוב ${street.name}, אזור ${todayArea}`,
          type: 'delivery',
          status: 'pending',
          priority: 'medium',
          dueDate: today.toISOString().split('T')[0],
          estimatedDuration: 15,
          assignedArea: todayArea,
          streetId: street.id,
        });
      }
    });

    localStorage.setItem(generatedKey, 'true');
    console.log(`✅ נוצרו משימות אוטומטיות לאזור ${todayArea}`);
  }, [todayArea, tasks, addTask]);

  return null;
}
