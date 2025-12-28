import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  PlusCircle, 
  List, 
  Settings, 
  TrendingUp, 
  AlertCircle, 
  Home, 
  ShoppingBag, 
  Zap, 
  Coffee, 
  Car, 
  Shield, 
  HeartPulse, 
  Smartphone,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Repeat,
  Calendar,
  Landmark,
  PiggyBank,
  Wallet,
  Briefcase,
  Gift,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

// --- חיבור ל-Firebase ---
// ודא שהתקנת את החבילה: npm install firebase
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

// ---------------------------------------------------------
//  הגדרות FIREBASE - מעודכן עבור פרויקט cashu-307a4
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB5OP18ZQGdOqEMSCWIyploiGQycKcbntI",
  authDomain: "cashu-307a4.firebaseapp.com",
  projectId: "cashu-307a4",
  storageBucket: "cashu-307a4.firebasestorage.app",
  messagingSenderId: "1039939110816",
  appId: "1:1039939110816:web:0546f3d32e76b75e0c06c5",
  measurementId: "G-KHYJ7Z3XK1"
};

// אתחול המסד נתונים
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// ---------------------------------------------------------

const EXPENSE_CATEGORIES = [
  { id: 'housing', name: 'דיור ושכ"ד', icon: <Home size={20} />, color: 'bg-blue-500' },
  { id: 'groceries', name: 'קניות לבית (סופר)', icon: <ShoppingBag size={20} />, color: 'bg-green-500' },
  { id: 'bills', name: 'חשבונות (חשמל/מים)', icon: <Zap size={20} />, color: 'bg-yellow-500' },
  { id: 'loans', name: 'הלוואות', icon: <Landmark size={20} />, color: 'bg-teal-500' },
  { id: 'investments', name: 'השקעות וחיסכון', icon: <PiggyBank size={20} />, color: 'bg-emerald-500' },
  { id: 'leisure', name: 'פנאי ובילויים', icon: <Coffee size={20} />, color: 'bg-purple-500' },
  { id: 'transport', name: 'רכב ותחבורה', icon: <Car size={20} />, color: 'bg-red-500' },
  { id: 'insurance', name: 'ביטוחים ופיננסים', icon: <Shield size={20} />, color: 'bg-indigo-500' },
  { id: 'health', name: 'בריאות ופארם', icon: <HeartPulse size={20} />, color: 'bg-pink-500' },
  { id: 'communication', name: 'תקשורת ואינטרנט', icon: <Smartphone size={20} />, color: 'bg-cyan-500' },
  { id: 'education', name: 'חינוך וילדים', icon: <GraduationCap size={20} />, color: 'bg-orange-500' },
  { id: 'misc', name: 'שונות / אחר', icon: <List size={20} />, color: 'bg-gray-500' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'משכורת', icon: <Wallet size={20} />, color: 'bg-emerald-600' },
  { id: 'business', name: 'הכנסה מעסק', icon: <Briefcase size={20} />, color: 'bg-blue-600' },
  { id: 'gifts', name: 'מתנות / ביט', icon: <Gift size={20} />, color: 'bg-pink-500' },
  { id: 'gov', name: 'קצבאות ומענקים', icon: <Landmark size={20} />, color: 'bg-purple-600' },
  { id: 'passive', name: 'הכנסה פסיבית', icon: <TrendingUp size={20} />, color: 'bg-orange-500' },
  { id: 'other_inc', name: 'הכנסה אחרת', icon: <List size={20} />, color: 'bg-gray-500' },
];

const MOCK_PASSWORD = "1234";

// --- רכיבי UI בסיסיים ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", type = "button" }) => {
  const baseStyle = "w-full py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    success: "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
  };
  
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- מסך התחברות ---

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === MOCK_PASSWORD) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
        <TrendingUp className="text-white" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Cashu</h1>
      <p className="text-slate-500 mb-8">ניהול תזרים משפחתי חכם</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="סיסמא..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm">סיסמא שגויה, נסו שוב</p>}
        <Button type="submit">כניסה</Button>
      </form>
    </div>
  );
};

// --- מסך הוספת תנועה (הוצאה/הכנסה) ---

const AddTransactionScreen = ({ onAddTransaction, onCancel }) => {
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  
  // שדות לפעולה חוזרת
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    setCategory(activeCategories[0].id);
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    setIsSubmitting(true);

    const selectedCat = activeCategories.find(c => c.id === category);

    const baseData = {
      amount: parseFloat(amount),
      description: description || selectedCat.name,
      category,
      type,
      date: new Date().toISOString()
    };

    try {
      if (isRecurring) {
        // יצירת סדרה
        const transactions = [];
        const startDate = new Date();
        const groupId = Date.now().toString();

        for (let i = 0; i < recurringMonths; i++) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + i);

          transactions.push({
            ...baseData,
            date: d.toISOString(),
            isRecurring: true,
            recurringGroup: groupId,
            recurrenceIndex: i + 1,
            totalRecurrence: recurringMonths
          });
        }
        await onAddTransaction(transactions);
      } else {
        // פעולה בודדת
        await onAddTransaction({ ...baseData, isRecurring: false });
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("שגיאה בשמירת הנתונים");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-bold text-slate-800">הוספת תנועה</h2>
         
         <div className="bg-slate-200 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setType('expense')}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
            >
              הוצאה
            </button>
            <button 
              onClick={() => setType('income')}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              הכנסה
            </button>
         </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">סכום (בש"ח)</label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-4 pr-4 py-4 text-3xl font-bold bg-white border rounded-2xl focus:outline-none focus:ring-2 text-center transition-colors ${
                type === 'expense' 
                  ? 'text-red-600 border-red-100 focus:ring-red-500 placeholder-red-200' 
                  : 'text-emerald-600 border-emerald-100 focus:ring-emerald-500 placeholder-emerald-200'
              }`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-3">קטגוריה</label>
          <div className="grid grid-cols-3 gap-3">
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  category === cat.id 
                    ? type === 'expense' 
                        ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`${cat.color} bg-opacity-10 p-2 rounded-full mb-1 text-current`}>
                  {React.cloneElement(cat.icon, { size: 18 })}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">תיאור (אופציונלי)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={type === 'income' ? "לדוגמה: משכורת אוגוסט..." : "לדוגמה: קניות לשבת..."}
          />
        </div>

        {/* Recurring Toggle */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Repeat size={18} />
              </div>
              <span className="font-medium text-slate-700">פעולה קבועה חודשית</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-7 rounded-full transition-colors relative ${isRecurring ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-1 translate-x-0' : 'left-1 translate-x-5'}`} />
            </button>
          </div>
          
          {isRecurring && (
            <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-slate-500 mb-2">למשך כמה חודשים?</label>
              <div className="flex items-center gap-3">
                 <Calendar className="text-slate-400" size={20} />
                 <input
                   type="range"
                   min="2"
                   max="36"
                   value={recurringMonths}
                   onChange={(e) => setRecurringMonths(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <span className="font-bold text-blue-600 w-12 text-center">{recurringMonths}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                הפעולה תתווסף אוטומטית החל מהחודש הנוכחי למשך {recurringMonths} חודשים.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <Button type="submit" variant={type === 'income' ? 'success' : 'primary'}>
            {isSubmitting ? 'שומר...' : (isRecurring ? `שמור ${recurringMonths} תנועות` : type === 'income' ? 'שמור הכנסה' : 'שמור הוצאה')}
          </Button>
          <Button variant="ghost" onClick={onCancel}>ביטול</Button>
        </div>
      </form>
    </div>
  );
};

// --- מסך דשבורד ---

const DashboardScreen = ({ transactions, currentMonth, currentYear }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const financialData = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const isExpense = t.type === 'expense' || !t.type;
      if (isExpense) {
        expense += t.amount;
      } else {
        income += t.amount;
      }
    });

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense' || !t.type);
    const totalExp = financialData.expense || 1; 

    const breakdown = {};
    expenseTransactions.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    
    return Object.entries(breakdown)
      .map(([catId, amount]) => ({
        id: catId,
        amount,
        percentage: (amount / totalExp) * 100,
        ...EXPENSE_CATEGORIES.find(c => c.id === catId)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, financialData.expense]);

  const getInsight = () => {
    const { income, expense, balance } = financialData;
    
    if (income === 0 && expense === 0) return { type: 'info', text: 'החודש עוד צעיר! טרם הוזנו נתונים.' };
    
    if (balance < 0) return { type: 'warning', text: 'זהירות: ההוצאות עולות על ההכנסות החודש!' };
    
    if (expense > 0 && expense > income * 0.9) return { type: 'tip', text: 'שימו לב: ניצלתם מעל 90% מההכנסות.' };

    return { type: 'good', text: 'מצוין! התזרים חיובי והתקציב בשליטה.' };
  };

  const insight = getInsight();

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <div className="space-y-6 p-6 pb-24 animate-in fade-in duration-500">
      
      <Card className={`text-white border-none shadow-lg transition-colors ${
        financialData.balance >= 0 
          ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-200' 
          : 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-200'
      }`}>
        <p className="text-white/80 text-sm mb-1">יתרה לחודש {currentMonth + 1}/{currentYear}</p>
        <h2 className="text-4xl font-bold tracking-tight" dir="ltr">
          {financialData.balance >= 0 ? '+' : ''}₪{financialData.balance.toLocaleString()}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-white/90 text-xs bg-white/10 w-fit px-3 py-1 rounded-full">
          <TrendingUp size={14} />
          <span>תזרים חי</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
         <Card className="flex flex-col items-center justify-center py-4 bg-green-50 border-green-100">
            <span className="text-green-600 text-xs font-bold mb-1 flex items-center gap-1">
              <ArrowUpCircle size={12} /> הכנסות
            </span>
            <span className="text-xl font-bold text-slate-800">₪{financialData.income.toLocaleString()}</span>
         </Card>
         <Card className="flex flex-col items-center justify-center py-4 bg-red-50 border-red-100">
            <span className="text-red-600 text-xs font-bold mb-1 flex items-center gap-1">
              <ArrowDownCircle size={12} /> הוצאות
            </span>
            <span className="text-xl font-bold text-slate-800">₪{financialData.expense.toLocaleString()}</span>
         </Card>
      </div>

      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        insight.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
        insight.type === 'good' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
        'bg-blue-50 border-blue-100 text-blue-800'
      }`}>
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">התפלגות הוצאות</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((item) => {
            const isExpanded = expandedCategory === item.id;
            const categoryTransactions = transactions.filter(t => 
              (t.category === item.id) && (t.type === 'expense' || !t.type)
            ).sort((a, b) => new Date(b.date) - new Date(a.date));

            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden transition-all duration-200">
                <div 
                  onClick={() => toggleCategory(item.id)}
                  className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color?.replace('bg-', 'text-') || 'text-gray-400'}`} />
                        <span className="font-medium text-slate-700">{item.name || 'אחר'}</span>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                      <div className="text-slate-900 font-bold">₪{item.amount.toLocaleString()}</div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color || 'bg-gray-400'} transition-all duration-1000 ease-out`} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-left mt-0.5">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>

                {isExpanded && (
                   <div className="bg-slate-50 border-t border-slate-100 px-3 py-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                     {categoryTransactions.length > 0 ? categoryTransactions.map(t => (
                       <div key={t.id} className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                         <span className="truncate max-w-[70%]">{t.description} <span className="text-slate-400 text-[10px]">({new Date(t.date).getDate()}/{currentMonth + 1})</span></span>
                         <span className="font-medium">₪{t.amount.toLocaleString()}</span>
                       </div>
                     )) : <p className="text-center text-xs text-slate-400">אין פירוט זמין</p>}
                   </div>
                )}
              </div>
            );
          })}
          {categoryBreakdown.length === 0 && (
            <p className="text-slate-400 text-center py-8 text-sm">אין הוצאות להצגה החודש</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- מסך היסטוריה ---

const HistoryScreen = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <List size={48} className="mb-4 opacity-20" />
        <p>אין היסטוריית תנועות</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">היסטוריית פעולות</h2>
      <div className="space-y-3">
        {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => {
          const isExpense = t.type === 'expense' || !t.type;
          const categoryList = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
          const category = categoryList.find(c => c.id === t.category);
          const date = new Date(t.date);
          
          return (
            <Card key={t.id} className="flex items-center justify-between py-3 px-4 border-l-4" style={{ borderLeftColor: isExpense ? '#ef4444' : '#10b981' }}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${category?.color} bg-opacity-10 text-${category?.color.split('-')[1]}-600`}>
                  {category?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800">{category?.name}</p>
                    {t.isRecurring && (
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Repeat size={10} />
                        {t.recurrenceIndex && `${t.recurrenceIndex}/${t.totalRecurrence}`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t.description} • {date.toLocaleDateString('he-IL')}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                   {isExpense ? '-' : '+'}₪{t.amount.toLocaleString()}
                 </span>
                 <button 
                   onClick={() => onDelete(t.id)}
                   className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// --- קומפוננטה ראשית (App) ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  // --- Real-time Firestore Listener ---
  useEffect(() => {
    if (!db) {
      // Fallback to localStorage if no Firebase config
      const saved = localStorage.getItem('cashu_data');
      if (saved) setTransactions(JSON.parse(saved));
      return;
    }

    // הקשבה בזמן אמת לשינויים בשרת
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(loadedTransactions);
    }, (error) => {
      console.error("Error connecting to DB: ", error);
    });

    return () => unsubscribe();
  }, []);

  // --- הוספת תנועה ל-Firebase ---
  const addTransaction = async (newData) => {
    if (!db) {
      // Fallback ללא שרת
      const newItems = Array.isArray(newData) ? newData : [newData];
      const itemsWithIds = newItems.map(item => ({ ...item, id: Math.random().toString(36) }));
      setTransactions(prev => {
        const updated = [...prev, ...itemsWithIds];
        localStorage.setItem('cashu_data', JSON.stringify(updated));
        return updated;
      });
      setActiveTab('dashboard');
      return;
    }

    const newItems = Array.isArray(newData) ? newData : [newData];
    
    // שמירה בשרת
    // אנחנו משתמשים ב-Batch אם יש הרבה, אבל לבינתיים Loop פשוט
    for (const item of newItems) {
      await addDoc(collection(db, 'transactions'), {
        ...item,
        createdAt: serverTimestamp()
      });
    }
    setActiveTab('dashboard'); 
  };

  // --- מחיקה מ-Firebase ---
  const deleteTransaction = async (id) => {
    if(confirm('האם למחוק פעולה זו?')) {
      if (!db) {
        setTransactions(prev => {
           const updated = prev.filter(e => e.id !== id);
           localStorage.setItem('cashu_data', JSON.stringify(updated));
           return updated;
        });
      } else {
        await deleteDoc(doc(db, 'transactions', id));
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === viewDate.getMonth() && 
             d.getFullYear() === viewDate.getFullYear();
    });
  }, [transactions, viewDate]);

  const changeMonth = (delta) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 max-w-md mx-auto relative shadow-2xl overflow-hidden" dir="rtl">
      
      {/* Header Top */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg">
             <TrendingUp size={16} className="text-white" />
           </div>
           <span className="font-bold text-lg">Cashu</span>
        </div>
        
        {activeTab !== 'add' && (
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white rounded-full"><ChevronRight size={16} /></button>
            <span className="text-xs font-bold w-16 text-center">
              {viewDate.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white rounded-full"><ChevronLeft size={16} /></button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-140px)]">
        {activeTab === 'dashboard' && (
          <DashboardScreen 
            transactions={filteredTransactions} 
            currentMonth={viewDate.getMonth()}
            currentYear={viewDate.getFullYear()}
          />
        )}
        {activeTab === 'add' && (
          <AddTransactionScreen 
            onAddTransaction={addTransaction} 
            onCancel={() => setActiveTab('dashboard')} 
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen transactions={filteredTransactions} onDelete={deleteTransaction} />
        )}
        {activeTab === 'settings' && (
           <div className="p-6">
             <h2 className="text-xl font-bold mb-4">הגדרות</h2>
             <Card className="mb-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">מ</div>
                 <div>
                   <p className="font-bold">משפחת ישראלי</p>
                   <p className="text-xs text-slate-500">משתמש ראשי</p>
                   {db ? <span className="text-[10px] text-emerald-600 font-bold">● מחובר לענן</span> : 
                         <span className="text-[10px] text-orange-500 font-bold">● מצב מקומי (לא מסונכרן)</span>}
                 </div>
               </div>
               <Button variant="danger" onClick={handleLogout} className="mt-4">
                 <LogOut size={16} /> התנתק
               </Button>
             </Card>
             <p className="text-xs text-slate-400 text-center">Cashu v1.3 • מותאם למובייל</p>
           </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20 pb-safe">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <PieChart size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">דשבורד</span>
        </button>

        <button 
          onClick={() => setActiveTab('add')}
          className="bg-blue-600 text-white rounded-full p-4 -mt-8 shadow-lg shadow-blue-200 hover:scale-105 transition-transform active:scale-95"
        >
          <PlusCircle size={32} />
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <List size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">היסטוריה</span>
        </button>

         <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">הגדרות</span>
        </button>
      </nav>
      
      <div className="h-6 w-full bg-white fixed bottom-0 z-10 max-w-md"></div>
    </div>
  );
}