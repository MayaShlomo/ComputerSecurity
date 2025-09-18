# Communication_LTD (Node.js + MySQL)

## איך מריצים 
1) **תלויות**
   - Node.js 16+ (נבדק על 22)
   - MySQL 8+

2) **התקנה**
```bash
npm install
```

3) **מסד נתונים**
```bash
# יצירת בסיס נתונים (אם לא קיים)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS comunicationltd;"
# טעינת האתחול/סכמה
mysql -u root -p comunicationltd < seed.sql
```

4) **קובץ `.env`** — משתמשים בתבנית הקיימת (`.env.example`)
הפרויקט מגיע עם תבנית מוכנה. פשוט צרו ממנה קובץ עבודה והשלימו ערכים:

**Bash / Mac / WSL:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

פתחו את `.env` ועדכנו רק מה שנחוץ:
- **DB_PASS** — סיסמת MySQL שלכם (חובה)
- **SESSION_SECRET** — מחרוזת אקראית חזקה (חובה)
- **MODE** — `secure` (ברירת מחדל) או `vuln` להדגמות (אופציונלי)
- **EMAIL_USER / EMAIL_PASS** — נדרש רק אם בודקים Forgot/Reset 
- **PORT / DB_NAME / DB_USER** — לשנות רק אם שונים מברירת המחדל

> אין צורך לשנות `DATA_BACKEND` — הוא נשאר `mysql`.

5) **הרצה**
```bash
node app.js
# http://localhost:3000
```

להחלפת מצב בזמן ריצה (ללא עריכה של הקובץ):
- Bash/Mac/WSL: `MODE=vuln node app.js`
- Windows PowerShell: `$env:MODE='vuln'; node app.js`

6) **מסכים עיקריים**
- `/register` — רישום  
- `/login` — התחברות  
- `/system` — הוספת/רשימת לקוחות (דורש התחברות)  
- `/change-password` — שינוי סיסמה  
- `/forgot-password` → `/reset` — איפוס סיסמה באמצעות טוקן (דורש EMAIL_* תקינים)

---

## התאמה לדרישות המטלה 
- **שמירת סיסמה**: HMAC-SHA1 עם **salt** פר־משתמש.
- **מדיניות סיסמה**: אורך/מורכבות + בדיקת מילון.
- **היסטוריית סיסמאות**: חסימת שימוש חוזר ב־3 האחרונות.
- **נעילה זמנית**: אחרי 3 ניסיונות כושלים.
- **Forgot/Reset**: `reset_token` באורך 40 hex (SHA-1), תוקף ~15 דק’, `used=TRUE` לאחר שימוש.
- **SQL Injection**: secure עם Prepared Statements; vuln עם חיבור מחרוזות.
- **Stored XSS**: secure עם קידוד פלט; vuln עם הדפסה raw.
