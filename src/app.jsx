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
  ArrowDownCircle,
  Plus,
  Edit2,
  Target
} from 'lucide-react';

// --- חיבור ל-Firebase ---
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
  serverTimestamp,
  updateDoc,
  setDoc
} from 'firebase/firestore';

// ---------------------------------------------------------
// הגדרות FIREBASE
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

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// ---------------------------------------------------------
// קטגוריות סטטיות ונתונים קבועים
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

const DYNAMIC_COLORS = [
  'bg-amber-500', 'bg-lime-500', 'bg-fuchsia-500', 'bg-violet-500', 
  'bg-rose-500', 'bg-orange-600', 'bg-emerald-400', 'bg-sky-500'
];

const MOCK_PASSWORD = "1234";

// --- רכיבי UI בסיסיים ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className} ${onClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
  >
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", type = "button", disabled = false }) => {
  const baseStyle = "w-full py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    success: "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
  };
  
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
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
    if (password === MOCK_PASSWORD) onLogin();
    else setError(true);
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

// --- מסך הוספה / עריכה של תנועה ---

const AddTransactionScreen = ({ onAddTransaction, onUpdateTransaction, onCancel, allCategories, onAddCategory, editData }) => {
  const [type, setType] = useState(editData?.type || 'expense'); 
  const [amount, setAmount] = useState(editData?.amount || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [category, setCategory] = useState(editData?.category || '');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const activeCategories = type === 'expense' ? allCategories.expense : allCategories.income;

  useEffect(() => {
    if (!editData && activeCategories.length > 0) {
      if (!activeCategories.find(c => c.id === category)) {
        setCategory(activeCategories[0].id);
      }
    }
  }, [type, activeCategories, editData, category]);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    await onAddCategory(newCatName, type);
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    setIsSubmitting(true);

    const selectedCat = activeCategories.find(c => c.id === category) || activeCategories[0];

    const baseData = {
      amount: parseFloat(amount),
      description: description || selectedCat.name,
      category,
      type,
      date: editData?.date || new Date().toISOString()
    };

    try {
      if (editData) {
        await onUpdateTransaction(editData.id, baseData);
      } else if (isRecurring) {
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
        await onAddTransaction({ ...baseData, isRecurring: false });
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300 text-right" dir="rtl">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {editData ? 'עריכת תנועה' : 'הוספת תנועה'}
          </h2>
          
          <div className="bg-slate-200 p-1 rounded-lg flex items-center">
             <button 
               type="button"
               disabled={!!editData}
               onClick={() => setType('expense')}
               className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'} ${editData ? 'opacity-50' : ''}`}
             >
               הוצאה
             </button>
             <button 
               type="button"
               disabled={!!editData}
               onClick={() => setType('income')}
               className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'} ${editData ? 'opacity-50' : ''}`}
             >
               הכנסה
             </button>
          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">סכום (בש"ח)</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full px-4 py-4 text-3xl font-bold bg-white border rounded-2xl focus:outline-none focus:ring-2 text-center transition-colors ${
              type === 'expense' ? 'text-red-600 border-red-100 focus:ring-red-500' : 'text-emerald-600 border-emerald-100 focus:ring-emerald-500'
            }`}
            placeholder="0.00"
            required
          />
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
                  category === cat.id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`${cat.color} bg-opacity-10 p-2 rounded-full mb-1 text-current`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold text-center leading-tight">{cat.name}</span>
              </button>
            ))}
            {!editData && (
              <button
                type="button"
                onClick={() => setShowAddCat(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50"
              >
                <Plus size={20} className="mb-1" />
                <span className="text-[10px] font-bold">חדש</span>
              </button>
            )}
          </div>
        </div>

        {showAddCat && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3 animate-in zoom-in-95">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="שם הקטגוריה..."
              className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateCategory} variant="success" className="py-2 text-sm text-white">הוסף</Button>
              <Button onClick={() => setShowAddCat(false)} variant="ghost" className="py-2 text-sm">ביטול</Button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">תיאור</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            placeholder={type === 'income' ? "לדוגמה: משכורת..." : "לדוגמה: קניות..."}
          />
        </div>

        {!editData && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Repeat size={18} /></div>
                <span className="font-medium text-slate-700">פעולה חודשית</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-7 rounded-full transition-colors relative ${isRecurring ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-6' : 'left-1'}`} />
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
              </div>
            )}
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Button type="submit" variant={type === 'income' ? 'success' : 'primary'}>
            {isSubmitting ? 'שומר...' : editData ? 'עדכן תנועה' : 'שמור פעולה'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>ביטול</Button>
        </div>
      </form>
    </div>
  );
};

// --- מסך דשבורד ---

const DashboardScreen = ({ transactions, allCategories, currentMonth, currentYear, budgets }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const financialData = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
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
    
    const combinedExpenseCats = [...EXPENSE_CATEGORIES, ...allCategories.expense];

    return Object.entries(breakdown)
      .map(([catId, amount]) => {
        const cat = combinedExpenseCats.find(c => c.id === catId) || { name: 'אחר', color: 'bg-gray-400', icon: <List size={18}/> };
        const budgetKey = `${currentYear}-${currentMonth}-${catId}`;
        const budget = budgets[budgetKey] || 0;

        return {
          id: catId,
          amount,
          percentageOfTotal: (amount / totalExp) * 100,
          budget,
          percentageOfBudget: budget > 0 ? (amount / budget) * 100 : null,
          ...cat
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, allCategories, financialData.expense, budgets, currentMonth, currentYear]);

  const insight = useMemo(() => {
    const { income, expense, balance } = financialData;
    if (income === 0 && expense === 0) return { type: 'info', text: 'החודש עוד צעיר! טרם הוזנו נתונים.' };
    if (balance < 0) return { type: 'warning', text: 'זהירות: ההוצאות עולות על ההכנסות!' };
    return { type: 'good', text: 'מצוין! התזרים חיובי והתקציב בשליטה.' };
  }, [financialData]);

  return (
    <div className="space-y-6 p-6 pb-24 animate-in fade-in duration-500 text-right" dir="rtl">
      
      <Card className={`text-white border-none shadow-lg transition-colors ${
        financialData.balance >= 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-red-600 to-red-800'
      }`}>
        <p className="text-white/80 text-sm mb-1">יתרה לחודש {currentMonth + 1}/{currentYear}</p>
        <h2 className="text-4xl font-bold tracking-tight" dir="ltr">
          {financialData.balance >= 0 ? '+' : ''}₪{financialData.balance.toLocaleString()}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-white/90 text-xs bg-white/10 w-fit px-3 py-1 rounded-full mr-auto ml-0">
          <TrendingUp size={14} />
          <span>תזרים חי</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 text-right">
          <Card className="flex flex-col items-center justify-center py-4 bg-green-50 border-green-100">
            <span className="text-green-600 text-xs font-bold mb-1 flex items-center gap-1"><ArrowUpCircle size={12} /> הכנסות</span>
            <span className="text-xl font-bold text-slate-800">₪{financialData.income.toLocaleString()}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-4 bg-red-50 border-red-100">
            <span className="text-red-600 text-xs font-bold mb-1 flex items-center gap-1"><ArrowDownCircle size={12} /> הוצאות</span>
            <span className="text-xl font-bold text-slate-800">₪{financialData.expense.toLocaleString()}</span>
          </Card>
      </div>

      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        insight.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-emerald-50 text-emerald-800'
      }`}>
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">התפלגות הוצאות ומדד תקציב</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((item) => {
            const isExpanded = expandedCategory === item.id;
            const categoryTransactions = transactions.filter(t => (t.category === item.id) && (t.type === 'expense' || !t.type));
            const isOverBudget = item.percentageOfBudget > 100;
            const isNearBudget = item.percentageOfBudget > 80;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div onClick={() => setExpandedCategory(isExpanded ? null : item.id)} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color?.replace('bg-', 'text-') || 'text-gray-400'}`} />
                        <span className="text-slate-700 font-bold">{item.name}</span>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                      <div className="text-left">
                        <div className="text-slate-900 font-bold">₪{item.amount.toLocaleString()}</div>
                        {item.budget > 0 && (
                          <div className={`text-[10px] text-left ${isOverBudget ? 'text-red-500 font-bold' : 'text-slate-400'}`}>מתוך ₪{item.budget}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          item.budget > 0 
                            ? isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-orange-500' : 'bg-emerald-500'
                            : item.color || 'bg-gray-400'
                        }`} 
                        style={{ width: `${Math.min(item.percentageOfBudget || item.percentageOfTotal, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                       <p className="text-[10px] text-slate-400">{item.percentageOfTotal.toFixed(0)}% מההוצאות</p>
                       {item.budget > 0 && <p className={`text-[10px] font-bold ${isOverBudget ? 'text-red-500' : 'text-slate-400'}`}>{item.percentageOfBudget.toFixed(0)}% מהיעד</p>}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                   <div className="bg-slate-50 border-t border-slate-100 px-3 py-2 space-y-2 animate-in slide-in-from-top-2">
                     {categoryTransactions.length > 0 ? categoryTransactions.map(t => (
                       <div key={t.id} className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 last:border-0 pb-1">
                         <span className="font-medium">₪{t.amount.toLocaleString()}</span>
                         <span className="truncate max-w-[70%] text-right">{t.description} <span className="text-[10px] text-slate-400">({new Date(t.date).getDate()}/{currentMonth + 1})</span></span>
                       </div>
                     )) : <p className="text-center text-xs text-slate-400 py-1">אין פירוט זמין</p>}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- מסך היסטוריה ---

const HistoryScreen = ({ transactions, allCategories, onDelete, onEdit }) => {
  if (transactions.length === 0) {
    return <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400"><List size={48} className="mb-4 opacity-20" /><p>אין היסטוריית תנועות</p></div>;
  }

  const combinedAllCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...allCategories.expense, ...allCategories.income];

  return (
    <div className="p-6 pb-24 text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-right">היסטוריית פעולות</h2>
      <div className="space-y-3">
        {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => {
          const isExpense = t.type === 'expense' || !t.type;
          const category = combinedAllCategories.find(c => c.id === t.category) || { name: 'אחר', icon: <List size={18}/>, color: 'bg-gray-500' };
          const date = new Date(t.date);
          
          return (
            <Card key={t.id} className="flex items-center justify-between py-3 px-4 border-l-4" style={{ borderLeftColor: isExpense ? '#ef4444' : '#10b981' }} onClick={() => onEdit(t)}>
               <div className="flex items-center gap-3 shrink-0 pointer-events-none">
                 <div className={`p-2 rounded-full ${category.color} bg-opacity-10 text-current`}>{category.icon}</div>
                 <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-800 text-sm leading-none">{category.name}</p>
                      {t.isRecurring && <span className="bg-indigo-50 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"><Repeat size={10} />{t.recurrenceIndex}/{t.totalRecurrence}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{date.toLocaleDateString('he-IL')}</p>
                 </div>
               </div>

               <div className="flex-1 px-4 text-right overflow-hidden pointer-events-none">
                 <p className="text-[10px] text-slate-500 truncate">{t.description}</p>
               </div>

               {/* הסכום והעריכה מיושרים לשמאל ומושכים את הלחיצה */}
               <div className="flex items-center gap-2 shrink-0 text-left">
                 <div className="flex flex-col items-end pointer-events-none">
                    <span className={`font-bold text-sm ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isExpense ? '-' : '+'}₪{t.amount.toLocaleString()}
                    </span>
                    <div className="text-[9px] text-slate-300 flex items-center gap-1">עריכה <Edit2 size={8}/></div>
                 </div>
                 {/* המחיקה עוצרת את הדילוע לכיוון הכרטיס כדי שלא יפתח עריכה */}
                 <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="text-slate-300 hover:text-red-500 p-1 transition-colors">
                   <Trash2 size={16} />
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
  const [customCategories, setCustomCategories] = useState([]);
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState([]); 
  const [budgets, setBudgets] = useState({}); 
  const [viewDate, setViewDate] = useState(new Date());
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (!db) return;

    const unsubTrans = onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc')), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      setCustomCategories(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubHidden = onSnapshot(collection(db, 'hidden_categories'), (snapshot) => {
      setHiddenCategoryIds(snapshot.docs.map(doc => doc.data().catId));
    });

    const unsubBudgets = onSnapshot(collection(db, 'budgets'), (snap) => {
      const budgetMap = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        budgetMap[`${data.year}-${data.month}-${data.categoryId}`] = data.amount;
      });
      setBudgets(budgetMap);
    });

    return () => {
      unsubTrans(); unsubCats(); unsubHidden(); unsubBudgets();
    };
  }, []);

  const allCategories = useMemo(() => {
    const mapCustom = (c, index) => ({ ...c, icon: <List size={20} />, color: DYNAMIC_COLORS[index % DYNAMIC_COLORS.length] });
    return {
      expense: [...EXPENSE_CATEGORIES.filter(c => !hiddenCategoryIds.includes(c.id)), ...customCategories.filter(c => c.type === 'expense').map(mapCustom)],
      income: [...INCOME_CATEGORIES.filter(c => !hiddenCategoryIds.includes(c.id)), ...customCategories.filter(c => c.type === 'income').map(mapCustom)]
    };
  }, [customCategories, hiddenCategoryIds]);

  const addTransaction = async (newData) => {
    const items = Array.isArray(newData) ? newData : [newData];
    for (const item of items) await addDoc(collection(db, 'transactions'), { ...item, createdAt: serverTimestamp() });
    setActiveTab('dashboard'); 
  };

  const updateTransaction = async (id, updatedData) => {
    await updateDoc(doc(db, 'transactions', id), updatedData);
    setEditingTransaction(null);
    setActiveTab('dashboard');
  };

  const handleSetBudget = async (categoryId, amount) => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const docId = `${year}-${month}-${categoryId}`;
    await setDoc(doc(db, 'budgets', docId), { categoryId, month, year, amount: parseFloat(amount) || 0 });
  };

  const addCategory = async (name, type) => {
    await addDoc(collection(db, 'categories'), { name, type, createdAt: serverTimestamp() });
  };

  const deleteCategory = async (cat) => {
    const isTemplate = EXPENSE_CATEGORIES.find(c => c.id === cat.id) || INCOME_CATEGORIES.find(c => c.id === cat.id);
    if (isTemplate) await addDoc(collection(db, 'hidden_categories'), { catId: cat.id });
    else await deleteDoc(doc(db, 'categories', cat.id));
  };

  const deleteTransaction = async (id) => {
    if(window.confirm('האם למחוק פעולה זו?')) await deleteDoc(doc(db, 'transactions', id));
  };

  const startEditing = (transaction) => {
    setEditingTransaction(transaction);
    setActiveTab('add');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });
  }, [transactions, viewDate]);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 max-w-md mx-auto relative shadow-2xl overflow-hidden text-right" dir="rtl">
      
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2"><div className="bg-blue-600 p-1.5 rounded-lg"><TrendingUp size={16} className="text-white" /></div><span className="font-bold text-lg text-slate-800">Cashu</span></div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-white rounded-full transition-colors"><ChevronRight size={16} /></button>
          <span className="text-xs font-bold w-16 text-center text-slate-600">{viewDate.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}</span>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-white rounded-full transition-colors"><ChevronLeft size={16} /></button>
        </div>
      </header>

      <main className="min-h-[calc(100vh-140px)]">
        {activeTab === 'dashboard' && <DashboardScreen transactions={filteredTransactions} allCategories={allCategories} currentMonth={viewDate.getMonth()} currentYear={viewDate.getFullYear()} budgets={budgets} />}
        {activeTab === 'add' && <AddTransactionScreen onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onCancel={() => {setActiveTab('dashboard'); setEditingTransaction(null);}} allCategories={allCategories} onAddCategory={addCategory} editData={editingTransaction} />}
        {activeTab === 'history' && <HistoryScreen transactions={filteredTransactions} allCategories={allCategories} onDelete={deleteTransaction} onEdit={startEditing} />}
        {activeTab === 'settings' && (
           <div className="p-6 text-right animate-in fade-in duration-300">
             <h2 className="text-xl font-bold mb-2 text-slate-800">הגדרות וניהול תקציב</h2>
             <p className="text-xs text-slate-400 mb-6">הגדר תקציב לחודש {viewDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
             
             <div className="mb-6">
               <h3 className="text-sm font-bold text-slate-500 mb-3">קטגוריות הוצאה ויעדים</h3>
               <Card className="space-y-4">
                 {allCategories.expense.map((cat) => {
                   const budgetKey = `${viewDate.getFullYear()}-${viewDate.getMonth()}-${cat.id}`;
                   return (
                     <div key={cat.id} className="flex flex-col gap-2 border-b last:border-0 border-slate-50 pb-3">
                       <div className="flex items-center justify-between">
                         {/* ימין: אייקון ושם */}
                         <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${cat.color || 'bg-blue-500'} shadow-sm`} />
                           <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                           <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">
                             {EXPENSE_CATEGORIES.find(c => c.id === cat.id) ? 'דיפולט' : 'מותאם'}
                           </span>
                         </div>
                         {/* שמאל: מחיקה */}
                         <button onClick={() => deleteCategory(cat)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                       </div>

                       <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                          <Target size={14} className="text-slate-400" />
                          <input 
                            type="number" 
                            placeholder="הגדר יעד תקציבי..." 
                            className="bg-transparent text-xs w-full focus:outline-none text-right"
                            value={budgets[budgetKey] || ''}
                            onChange={(e) => handleSetBudget(cat.id, e.target.value)}
                          />
                       </div>
                     </div>
                   );
                 })}
               </Card>
             </div>

             <Card className="mb-8">
               <div className="flex items-center justify-end gap-3 mb-6">
                 <div><p className="font-bold text-slate-800">משפחת ישראלי</p><p className="text-xs text-emerald-600 font-medium text-right">סנכרון ענן פעיל</p></div>
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">מ</div>
               </div>
               <Button variant="danger" onClick={() => setIsLoggedIn(false)} className="bg-red-50 text-red-600 border border-red-100 font-bold"><LogOut size={16} /> התנתק</Button>
             </Card>
           </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]" dir="rtl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}><PieChart size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} /><span className="text-[10px] font-bold">דשבורד</span></button>
        <button onClick={() => {setEditingTransaction(null); setActiveTab('add');}} className="bg-blue-600 text-white rounded-full p-4 -mt-8 shadow-lg shadow-blue-200 active:scale-90 transition-all hover:scale-105"><PlusCircle size={32} /></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}><List size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} /><span className="text-[10px] font-bold">היסטוריה</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}><Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} /><span className="text-[10px] font-bold">הגדרות</span></button>
      </nav>
      <div className="h-6 w-full bg-white fixed bottom-0 z-10 max-w-md"></div>
    </div>
  );
}