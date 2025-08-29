# הגדרת Firebase לשמירת נתונים

## 🔥 שלבים להגדרת Firebase:

### 1. כניסה ל-Firebase Console
1. לך ל: https://console.firebase.google.com
2. בחר את הפרויקט שלך: `mail-5b7f9`

### 2. הגדרת Firestore Database
1. לחץ על "Firestore Database" בתפריט השמאלי
2. לחץ על הטאב "Rules" (חוקים)
3. החלף את החוקים הקיימים בקוד הבא:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // אפשר קריאה וכתיבה לכל המסמכים
    // אזהרה: חוקים אלה מיועדים לפיתוח בלבד!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. פרסום החוקים
1. לחץ על "Publish" (פרסם)
2. אשר את השינויים

### 4. בדיקה
1. רענן את האפליקציה
2. נסה להוסיף דייר חדש
3. בדוק שהוא נשמר גם אחרי רענון

## ⚠️ הערת אבטחה
החוקים הללו מאפשרים גישה מלאה ומיועדים לפיתוח בלבד.
לייצור, יש להגדיר חוקי אבטחה מתאימים.

## 🔍 בדיקת תקינות
אחרי ההגדרה, תראה בקונסול של הדפדפן:
- ✅ "Loaded X buildings from Firebase"
- ✅ "Building saved to Firebase successfully"

במקום:
- ❌ "Firebase permission denied"
- ❌ "Using local data"