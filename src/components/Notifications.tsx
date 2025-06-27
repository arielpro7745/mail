export default function Notifications({count}:{count:number}){
  if(!count) return null;
  return(
    <div className="bg-red-200 text-red-900 p-3 mt-4 rounded text-center">
      ⚠️ {count} רחובות עברו 10 ימי‑עסקים – לטיפול דחוף!
    </div>
  );
}
