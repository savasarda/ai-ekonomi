import { useState, useEffect } from 'react'
import { initialData } from './data/mockData'

function App() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('ai-ekonomi-data')
    return savedData ? JSON.parse(savedData) : initialData
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const [userLimits, setUserLimits] = useState(() => {
    const savedLimits = localStorage.getItem('ai-ekonomi-limits')
    return savedLimits ? JSON.parse(savedLimits) : { u1: 75000, u2: 75000 }
  })

  const [limitModalUser, setLimitModalUser] = useState(null)

  const [showFutureDebtsModal, setShowFutureDebtsModal] = useState(false)
  const [showCardsModal, setShowCardsModal] = useState(false)

  // Card Management State
  const [newCardName, setNewCardName] = useState('')
  const [newCardUser, setNewCardUser] = useState(data.users[0].id)

  const [newUser, setNewUser] = useState(data.users[0].id)
  const [newAccount, setNewAccount] = useState(data.accounts.filter(a => a.userId === data.users[0].id)[0]?.id)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isInstallment, setIsInstallment] = useState(false)

  const [installmentCount, setInstallmentCount] = useState(3)
  const [transactionStep, setTransactionStep] = useState(1) // 1: Amount, 2: Details

  // User Management State
  const [showUserModal, setShowUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  // Edit State
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Drill-down state for Period Summaries
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedBreakdownUser, setSelectedBreakdownUser] = useState(null)
  const [selectedBreakdownAccount, setSelectedBreakdownAccount] = useState(null)

  // Account Detail Modal State (Drill-down from Account Summaries)
  const [selectedUserSummary, setSelectedUserSummary] = useState(null)

  // Notification State
  const [showNotification, setShowNotification] = useState(false)

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  // Theme Sync Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Data Sync Effect
  useEffect(() => {
    localStorage.setItem('ai-ekonomi-data', JSON.stringify(data))
  }, [data])

  // Limits Sync Effect
  useEffect(() => {
    localStorage.setItem('ai-ekonomi-limits', JSON.stringify(userLimits))
  }, [userLimits])

  // Notification & Welcome Back Logic
  useEffect(() => {
    const lastVisit = localStorage.getItem('lastVisitDate')
    const now = new Date()

    if (lastVisit) {
      const daysSince = (now - new Date(lastVisit)) / (1000 * 60 * 60 * 24)
      if (daysSince >= 5) {
        setShowNotification(true)
      }
    }

    localStorage.setItem('lastVisitDate', now.toISOString())
  }, [])


  const currentMonth = new Date().toISOString().slice(0, 7)





  const getMonthlyBreakdown = () => {
    const groups = {}
    data.transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7)
      if (!groups[monthKey]) groups[monthKey] = 0
      groups[monthKey] += t.amount
    })
    return Object.entries(groups)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const monthlyBreakdown = getMonthlyBreakdown()

  const getDebtByUser = (userId) => {
    const userAccountIds = data.accounts.filter(acc => acc.userId === userId).map(acc => acc.id)
    return data.transactions
      .filter(t => userAccountIds.includes(t.accountId))
      .reduce((acc, curr) => acc + curr.amount, 0)
  }

  const handleUserChange = (uId) => {
    setNewUser(uId)
    const userAccs = data.accounts.filter(a => a.userId === uId)
    if (userAccs.length > 0) setNewAccount(userAccs[0].id)
  }

  const handleEditTransaction = (t) => {
    setEditingTransaction(t)
    setAmount(t.amount.toString())
    setDescription(t.description.replace(/ \(\d+\/\d+\)$/, '').replace(/ \(\d+ Taksit\)$/, '')) // Strip installment info for pure edit if possible, or just strict edit
    // Date: t.date is YYYY-MM-DD
    setDate(t.date)
    setNewAccount(t.accountId)
    // Find user for this account
    const acc = data.accounts.find(a => a.id === t.accountId)
    if (acc) setNewUser(acc.userId)

    // Installment handling is tricky on edit. For MVP, let's treat it as a flat update of THAT specific transaction/installment.
    // Or block editing installment properties?
    // Let's allow editing amount/date/desc/account.
    setIsInstallment(false) // editing single item usually
    setTransactionStep(1)
    setShowAddModal(true)
  }

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !description) return

    // Turkish locale specific parsing: verify thousands separator vs decimal
    // If input has dot but no comma, and dot is used as thousands separator in TR:
    // Ideally rely on valid input, but to be safe:
    // Remove all dots (thousands) then replace comma with dot (decimal)
    // But be careful if user uses dot as decimal (foreign habit).
    // Given the issues, standardizing to: remove all dots, replace comma with dot logic MIGHT be risky if someone types 10.5 for 10.50
    // Best approach for now: replace comma with dot.
    // If result is small (e.g. 3) and string had dot (3.000), maybe multiply by 1000? No that's magic.
    // Let's stick to standard but add preview so user sees what's happening.

    // Better parsing: 
    let safeAmount = amount;
    // If it contains dots and commas:
    if (amount.includes('.') && amount.includes(',')) {
      safeAmount = amount.replace(/\./g, '').replace(',', '.');
    } else if (amount.includes(',')) {
      safeAmount = amount.replace(',', '.');
    }
    // If only dot and it looks like thousands (e.g. 3.000), browser might send '3000' if type=number, or '3.000'.
    // If browser is set to TR, type=number usually allows comma, not dot, for decimal.

    // Let's trust parseFloat(amount.replace(',', '.')) but add the preview.
    const amountVal = parseFloat(safeAmount); // Use the processed safeAmount
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Geçerli bir tutar giriniz.");
      return;
    }

    if (editingTransaction) {
      // Update existing
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === editingTransaction.id ? {
          ...t,
          amount: amountVal,
          date: date,
          description: description,
          accountId: newAccount,
          // keep type
        } : t)
      }))
      setEditingTransaction(null)
    } else {
      // Add New
      const newTransaction = {
        id: Date.now().toString(),
        accountId: newAccount,
        amount: amountVal,
        date: date,
        description: description,
        type: isInstallment ? 'installment' : 'debt'
      }

      if (isInstallment) {
        newTransaction.description += ` (${installmentCount} Taksit)`
        const transactionsToAdd = []
        const installmentAmount = amountVal / installmentCount
        const [y, m, d] = date.split('-').map(Number)

        for (let i = 0; i < installmentCount; i++) {
          // Safe manual formatting to avoid timezone offset issues (since we just want the date literal):
          const safeDate = new Date(Date.UTC(y, m - 1 + i, d))
          const dateStr = safeDate.toISOString().slice(0, 10)

          transactionsToAdd.push({
            id: Date.now().toString() + '-' + i,
            accountId: newAccount,
            amount: installmentAmount,
            date: dateStr,
            description: `${description} (${i + 1}/${installmentCount})`,
            type: 'installment'
          })
        }

        setData(prevData => ({
          ...prevData,
          transactions: [...prevData.transactions, ...transactionsToAdd]
        }));
      } else {
        setData(prevData => ({
          ...prevData,
          transactions: [...prevData.transactions, newTransaction]
        }));
      }
    }

    // Reset form
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setIsInstallment(false)
    setInstallmentCount(3)
    setTransactionStep(1)
    setShowAddModal(false)
  }

  const handleAddCard = () => {
    if (!newCardName) return
    const newCard = {
      id: 'acc' + (data.accounts.length + 1) + Math.random().toString(36).substr(2, 5),
      userId: newCardUser,
      name: newCardName,
      limit: 20000
    }
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newCard] }))
    setNewCardName('')
  }

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
      setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== cardId) }))
    }
  }

  const handleAddUser = () => {
    if (!newUserName.trim()) return
    const newUserObj = {
      id: 'u' + (data.users.length + 1) + Math.random().toString(36).substr(2, 5),
      name: newUserName.trim()
    }
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUserObj]
    }))
    setNewUserName('')
    // Also set a default limit for the new user
    setUserLimits(prev => ({ ...prev, [newUserObj.id]: 10000 }))
  }

  const handleDeleteUser = (userId) => {
    if (data.users.length <= 1) {
      alert('En az bir kullanıcı kalmalıdır.')
      return
    }
    if (window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }))
      // Cleanup associated limits? optional
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 sm:p-8 font-sans relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

      <div className="w-full max-w-[420px] bg-[#F8FAFC] dark:bg-slate-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] sm:border-white dark:sm:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">

        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar">

          <header className="px-8 pt-[calc(3rem+var(--safe-area-inset-top))] pb-6 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20 border-b border-white/40 dark:border-slate-800/50 transition-colors duration-300">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-indigo-500">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} gün kaldı</span>
              </p>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Merhaba, <span className="text-indigo-600 dark:text-indigo-400">Hoş Geldin!</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center border border-gray-100 dark:border-slate-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all active:scale-90"
                title={darkMode ? 'Aydınlık Tema' : 'Karanlık Tema'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm rounded-full flex items-center justify-center border border-gray-100 dark:border-slate-700 text-gray-400 relative transition-colors">
                🔔
                {showNotification && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
                )}
              </div>
            </div>
          </header>

          <div className="mx-6 mb-6">
            <button
              onClick={() => {
                setTransactionStep(1)
                setEditingTransaction(null)
                setAmount('')
                setShowAddModal(true)
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[28px] p-6 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-2xl font-black tracking-tight">Harcama Ekle</span>
                <span className="text-indigo-100 text-xs font-medium">Hızlı işlem başlangıcı</span>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <span className="text-2xl font-light mb-1">+</span>
              </div>
            </button>
          </div>

          <div className="mx-6 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Bütçe Durumu</h3>
            <div className="space-y-3 mb-4">
              {data.users.map(user => {
                const userAccountIds = data.accounts.filter(acc => acc.userId === user.id).map(acc => acc.id)
                const userSpending = data.transactions
                  .filter(t => t.date.startsWith(currentMonth) && userAccountIds.includes(t.accountId))
                  .reduce((acc, curr) => acc + curr.amount, 0)

                const userLimit = userLimits[user.id] || 0
                const remaining = userLimit - userSpending
                const percentage = Math.min((userSpending / userLimit) * 100, 100)
                const isLimitExceeded = userSpending > userLimit


                return (
                  <div key={user.id} className="bg-white dark:bg-slate-800 p-5 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white dark:border-slate-700 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-200 ${user.id === 'u1' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-800 dark:text-white text-lg transition-colors">{user.name}</span>
                    </div>

                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Harcanan</p>
                        <p className={`text-3xl font-black tracking-tight ${isLimitExceeded ? 'text-red-500' : 'text-gray-800 dark:text-white transition-colors'}`}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(userSpending)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Kalan</p>
                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300 transition-colors">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isLimitExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>% {percentage.toFixed(0)}</span>
                      <span>Limit: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(userLimit)}</span>
                    </div>
                  </div>
                )

              })}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 flex-1 rounded-t-[40px] px-6 pt-8 pb-[calc(1.5rem+var(--safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Hesap Özetleri</h3>
            <div className="flex gap-4 mb-4">
              {data.users.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserSummary(user.id)}
                  className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 dark:border-slate-700 flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${user.id === 'u1' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-0.5">{user.name}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white transition-colors">
                      {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(getDebtByUser(user.id))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">İşlemler</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <button
                onClick={() => document.getElementById('monthly-report').scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  📊
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Rapor</span>
              </button>

              <button
                onClick={() => {
                  setLimitModalUser(data.users[0].id)
                  setShowLimitModal(true)
                }}
                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  ⚙️
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Limit</span>
              </button>

              <button
                onClick={() => setShowFutureDebtsModal(true)}
                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  📅
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Gelecek</span>
              </button>

              <button
                onClick={() => setShowCardsModal(true)}
                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  💳
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kartlar</span>
              </button>

              <button
                onClick={() => setShowUserModal(true)}
                className="flex flex-col items-center gap-2 group active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  👥
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kişiler</span>
              </button>
            </div>

            <h3 id="monthly-report" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Dönem Özetleri</h3>

            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden mb-8 transition-colors duration-300">
              {!selectedMonth ? (
                // Level 0: List Months
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {monthlyBreakdown.map((item) => {
                    const dateObj = new Date(item.date + '-01');
                    const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                    const totalMonthlyLimit = Object.values(userLimits).reduce((a, b) => a + b, 0);
                    const isLimitExceeded = item.total > totalMonthlyLimit;

                    return (
                      <div
                        key={item.date}
                        onClick={() => setSelectedMonth(item.date)}
                        className="p-5 flex justify-between items-center bg-white dark:bg-slate-800 rounded-3xl mb-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xs shadow-inner">
                            {dateObj.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-base transition-colors">{monthName}</p>
                            <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">Toplam Harcama</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-lg tracking-tight ${isLimitExceeded ? 'text-red-500' : 'text-gray-900 dark:text-white transition-colors'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.total)}
                          </p>
                          {isLimitExceeded && <span className="inline-block bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold mt-1">Limit Aşıldı</span>}
                        </div>
                      </div>

                    )
                  })}
                </div>
              ) : !selectedBreakdownUser ? (
                // Level 1: List Users for Selected Month
                <div>
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-3xl mb-4 flex items-center gap-4 transition-colors">
                    <button
                      onClick={() => setSelectedMonth(null)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-white shadow-sm font-bold text-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      ←
                    </button>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Seçilen Ay</p>
                      <span className="font-black text-xl text-gray-800 dark:text-white tracking-tight transition-colors">
                        {new Date(selectedMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.users.map(user => {
                      const userTotal = data.transactions
                        .filter(t => {
                          const acc = data.accounts.find(a => a.id === t.accountId);
                          return t.date.startsWith(selectedMonth) && acc && acc.userId === user.id;
                        })
                        .reduce((sum, t) => sum + t.amount, 0);

                      if (userTotal === 0) return null; // Hide users with no spending

                      return (
                        <div
                          key={user.id}
                          onClick={() => setSelectedBreakdownUser(user.id)}
                          className="p-5 flex justify-between items-center bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md ${user.id === 'u1' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white text-base transition-colors">{user.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">Kişi Bazlı Toplam</p>
                            </div>
                          </div>
                          <p className="font-black text-lg text-gray-900 dark:text-white tracking-tight transition-colors">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(userTotal)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : !selectedBreakdownAccount ? (
                // Level 2: List Accounts for Selected User
                <div>
                  <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 transition-colors">
                    <button
                      onClick={() => setSelectedBreakdownUser(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold transition-colors"
                    >
                      ←
                    </button>
                    <span className="font-bold text-gray-700 dark:text-gray-200 transition-colors">
                      {data.users.find(u => u.id === selectedBreakdownUser)?.name}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.accounts
                      .filter(acc => acc.userId === selectedBreakdownUser)
                      .map(acc => {
                        const accTotal = data.transactions
                          .filter(t => t.date.startsWith(selectedMonth) && t.accountId === acc.id)
                          .reduce((sum, t) => sum + t.amount, 0);

                        if (accTotal === 0) return null;

                        return (
                          <div
                            key={acc.id}
                            onClick={() => setSelectedBreakdownAccount(acc.id)}
                            className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-gray-50 dark:text-gray-400 transition-colors">
                                {acc.name.charAt(0)}
                              </div>
                              <p className="font-bold text-gray-800 dark:text-white text-sm transition-colors">{acc.name}</p>
                            </div>
                            <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight transition-colors">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(accTotal)}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : (
                // Level 3: List Transactions for Selected Account
                <div>
                  <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 transition-colors">
                    <button
                      onClick={() => setSelectedBreakdownAccount(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold transition-colors"
                    >
                      ←
                    </button>
                    <span className="font-bold text-gray-700 dark:text-gray-200 transition-colors">
                      {data.accounts.find(a => a.id === selectedBreakdownAccount)?.name}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.transactions
                      .filter(t => t.date.startsWith(selectedMonth) && t.accountId === selectedBreakdownAccount)
                      .map(t => (
                        <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.type === 'installment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                              {t.type === 'installment' ? '📅' : '💸'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white text-sm transition-colors">{t.description}</p>
                              <p className="text-[10px] text-gray-400">{t.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 dark:text-white text-sm transition-colors">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                            </p>
                            <div className="flex gap-1 ml-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); handleEditTransaction(t); }} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs hover:bg-indigo-100 hover:text-indigo-600 transition-colors">✎</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs hover:bg-red-100 hover:text-red-500 transition-colors">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {data.transactions.filter(t => t.date.startsWith(selectedMonth) && t.accountId === selectedBreakdownAccount).length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">Bu dönemde işlem yok.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Bu Ayki Ekstre</h3>
            <div className="space-y-4">
              {data.transactions
                .filter(t => t.date.startsWith(currentMonth))
                .slice().reverse().slice(0, 5)
                .map(t => {
                  const account = data.accounts.find(a => a.id === t.accountId);
                  const user = data.users.find(u => u.id === account.userId);
                  return (

                    <div key={t.id} className="group bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white dark:border-slate-700 hover:scale-[1.02] transition-all flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${t.type === 'installment' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                        {t.type === 'installment' ? '📅' : '💸'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 dark:text-white truncate text-base transition-colors">{t.description}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 font-medium">
                          <span className={`w-2 h-2 rounded-full ${user.id === 'u1' ? 'bg-indigo-500' : 'bg-pink-500'}`}></span>
                          {user.name} • {account.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-800 dark:text-white text-base tracking-tight transition-colors">
                          -{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-bold">{t.date}</p>
                        <div className="flex gap-1 justify-end mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEditTransaction(t); }} className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-xs hover:bg-indigo-100 hover:text-indigo-600 transition-colors">✎</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }} className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded-full text-xs hover:bg-red-100 hover:text-red-500 transition-colors">🗑️</button>
                        </div>
                      </div>
                    </div>
                  )

                })}
              {data.transactions.filter(t => t.date.startsWith(currentMonth)).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Bu ay henüz bir işlem yok.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {
        showLimitModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={() => setShowLimitModal(false)}></div>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full max-w-[320px] rounded-[40px] p-8 relative z-10 animate-scale-up text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 dark:border-slate-800/50">
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-8 tracking-tight transition-colors">Limit Ayarları</h3>

              <div className="bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex mb-8 backdrop-blur-md transition-colors">
                {data.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setLimitModalUser(u.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${limitModalUser === u.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 scale-[1.02]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>

              <div className="mb-10 relative">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Aylık Harcama Limiti</p>
                <span className="text-5xl font-black text-indigo-600 dark:text-indigo-500 tracking-tighter drop-shadow-sm transition-colors">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(limitModalUser ? userLimits[limitModalUser] : 0)}
                </span>
              </div>

              <div className="relative mb-10 px-2">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                  value={limitModalUser ? userLimits[limitModalUser] : 0}
                  onChange={(e) => setUserLimits(prev => ({ ...prev, [limitModalUser]: Number(e.target.value) }))}
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-wider">
                  <span>0</span>
                  <span>Limit</span>
                  <span>100k</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowLimitModal(false)
                  setLimitModalUser(null)
                }}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-gray-200 active:scale-[0.98] transition-all hover:bg-black"
              >
                Kaydet
              </button>
            </div>
          </div>
        )
      }

      {
        showAddModal && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => { setShowAddModal(false); setTransactionStep(1); setAmount(''); }}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[420px] h-[90vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Yeni İşlem</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {transactionStep === 1 ? 'Tutarı girin' : 'Detayları belirleyin'}
                  </p>
                </div>
                <button onClick={() => { setShowAddModal(false); setTransactionStep(1); setAmount(''); }} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                {transactionStep === 1 ? (
                  <>
                    <div className="flex-1 flex flex-col justify-center mb-8">
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-4xl font-light">₺</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-14 pr-6 py-8 text-6xl font-black text-gray-800 dark:text-white bg-white dark:bg-slate-800 shadow-inner rounded-[40px] border border-gray-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-center placeholder-gray-200 dark:placeholder-slate-700"
                          placeholder="0"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (amount) setTransactionStep(2);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={() => { if (amount) setTransactionStep(2) }}
                        className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 group ${amount ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-200 dark:shadow-slate-700 hover:bg-black dark:hover:bg-gray-200 active:scale-[0.98]' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'}`}
                        disabled={!amount}
                      >
                        <span>Devam Et</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6 animate-slide-up">
                      <div className="flex items-center gap-2 mb-6" onClick={() => setTransactionStep(1)}>
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(amount || '0'))}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Düzenle</span>
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wide pl-2">Tarih</label>
                        <input
                          type="date"
                          className="w-full p-4 bg-gray-50/50 dark:bg-slate-800 text-gray-800 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                        />
                      </div>

                      <div className="bg-gray-100/50 dark:bg-slate-800 p-1.5 rounded-2xl flex mb-6 border border-gray-100 dark:border-slate-700 transition-colors">
                        {data.users.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleUserChange(u.id)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${newUser === u.id
                              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm scale-[1.02]'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wide pl-2">Hesap</label>
                          <div className="relative">
                            <select
                              className="w-full p-4 bg-gray-50/50 dark:bg-slate-800 text-gray-800 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                              value={newAccount}
                              onChange={e => setNewAccount(e.target.value)}
                            >
                              {data.accounts.filter(a => a.userId === newUser).map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wide pl-2">Açıklama</label>
                          <input
                            type="text"
                            className="w-full p-4 bg-gray-50/50 dark:bg-slate-800 text-gray-800 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 dark:placeholder-gray-600"
                            placeholder="Örn: Market alışverişi"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="mb-10">
                        <div
                          className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${isInstallment ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                          onClick={() => setIsInstallment(!isInstallment)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${isInstallment ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                              📅
                            </div>
                            <span className={`text-sm font-bold ${isInstallment ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>Taksitlendir</span>
                          </div>
                          <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isInstallment ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${isInstallment ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                        </div>

                        {isInstallment && (
                          <div className="mt-6 animate-slide-up">
                            <div className="grid grid-cols-4 gap-3 mb-6">
                              {[2, 3, 6, 12].map(count => (
                                <button
                                  key={count}
                                  type="button"
                                  onClick={() => setInstallmentCount(count)}
                                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${installmentCount === count ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm scale-105' : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                >
                                  {count}x
                                </button>
                              ))}
                            </div>

                            {amount && !isNaN(parseFloat(amount.replace(',', '.'))) && (
                              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-wide">Aylık Ödeme</span>
                                  <span className="text-indigo-600 font-black text-xl tracking-tight">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(amount.replace(',', '.')) / installmentCount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-xs font-medium">Toplam Tutar</span>
                                  <span className="text-gray-600 font-bold text-sm">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(amount.replace(',', '.')))}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setTransactionStep(1)}
                          className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-6 rounded-[24px] font-bold text-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          ←
                        </button>
                        <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-gray-200 dark:shadow-slate-800 active:scale-[0.98] transition-all hover:bg-black dark:hover:bg-gray-200 flex items-center justify-center gap-2 group">
                          <span>Kaydet</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div >
        )
      }
      {
        showFutureDebtsModal && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => setShowFutureDebtsModal(false)}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[480px] h-[85vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Gelecek Borçlar</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Önümüzdeki ayların ödeme planı</p>
                </div>
                <button onClick={() => setShowFutureDebtsModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {monthlyBreakdown
                  .filter(item => item.date > currentMonth)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(item => {
                    const dateObj = new Date(item.date + '-01');
                    const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                    const totalLimit = Object.values(userLimits).reduce((a, b) => a + b, 0);
                    const isProjectedOverLimit = item.total > totalLimit;

                    return (
                      <div key={item.date} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-900/30 transition-colors"></div>

                        <div className="flex justify-between items-center mb-4 relative z-10">
                          <span className="text-gray-900 dark:text-white font-bold text-lg transition-colors">{monthName}</span>
                          <span className={`text-lg font-black tracking-tight ${isProjectedOverLimit ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400 transition-colors'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.total)}
                          </span>
                        </div>

                        <div className="h-2.5 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden mb-5 relative z-10">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isProjectedOverLimit ? 'bg-red-400' : 'bg-gradient-to-r from-indigo-400 to-purple-400'}`}
                            style={{ width: `${Math.min((item.total / totalLimit) * 100, 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex gap-3 relative z-10">
                          {data.users.map(u => {
                            const userAccs = data.accounts.filter(a => a.userId === u.id).map(a => a.id);
                            const userMonthTotal = data.transactions
                              .filter(t => t.date.startsWith(item.date) && userAccs.includes(t.accountId))
                              .reduce((acc, curr) => acc + curr.amount, 0);

                            if (userMonthTotal === 0) return null;

                            return (
                              <div key={u.id} className="flex items-center gap-2 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${u.id === 'u1' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                                  {u.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
                                  {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(userMonthTotal)}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {isProjectedOverLimit && (
                          <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-50/50 dark:bg-red-900/20 p-2 rounded-xl backdrop-blur-sm relative z-10">
                            <span className="text-lg">⚠️</span>
                            <span className="text-xs font-bold">Limit aşımı öngörülüyor!</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                }
                {monthlyBreakdown.filter(item => item.date > currentMonth).length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4 opacity-50">🎉</div>
                    <p className="font-bold">Harika!</p>
                    <p className="text-sm mt-1">Gelecek dönem için planlanmış borç yok.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        selectedUserSummary && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => setSelectedUserSummary(null)}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[420px] h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">
                    {data.users.find(u => u.id === selectedUserSummary)?.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Harcama Dağılımı</p>
                </div>
                <button onClick={() => setSelectedUserSummary(null)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <div className="space-y-4">
                {data.accounts
                  .filter(acc => acc.userId === selectedUserSummary)
                  .map(acc => {
                    const accountDebt = data.transactions
                      .filter(t => t.accountId === acc.id)
                      .reduce((acc, curr) => acc + curr.amount, 0)

                    if (accountDebt === 0) return null

                    return (
                      <div key={acc.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-xl shadow-inner transition-colors">
                            💳
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm transition-colors">{acc.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Toplam</p>
                          </div>
                        </div>
                        <p className="font-black text-gray-900 dark:text-white text-lg tracking-tight transition-colors">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(accountDebt)}
                        </p>
                      </div>
                    )
                  })
                }
                {
                  data.accounts
                    .filter(acc => acc.userId === selectedUserSummary)
                    .every(acc => data.transactions.filter(t => t.accountId === acc.id).reduce((a, c) => a + c.amount, 0) === 0) && (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm">Bu kullanıcı için aktif borç bulunamadı.</p>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )
      }


      {
        showUserModal && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => setShowUserModal(false)}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[450px] h-[75vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Kişi Yönetimi</h3>
                  <p className="text-sm text-gray-500 font-medium">Kullanıcıları düzenleyin</p>
                </div>
                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-8 pr-2">
                <div className="space-y-4">
                  {data.users.map(user => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center group hover:scale-[1.01] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${user.id === 'u1' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-base transition-colors">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kullanıcı</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                        title="Kişiyi Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2 transition-colors">
                  <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-xs text-teal-600 dark:text-teal-400">＋</span>
                  Yeni Kişi Ekle
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="İsim Girin"
                    className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-white"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                  />
                  <button
                    onClick={handleAddUser}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }


      {
        showCardsModal && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => setShowCardsModal(false)}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[450px] h-[75vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Kart Yönetimi</h3>
                  <p className="text-sm text-gray-500 font-medium">Kayıtlı kartlarınızı düzenleyin</p>
                </div>
                <button onClick={() => setShowCardsModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-8 pr-2">
                <div className="space-y-4">
                  {data.accounts.map(acc => {
                    const user = data.users.find(u => u.id === acc.userId)
                    return (
                      <div key={acc.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center group hover:scale-[1.01] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${user?.id === 'u1' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'}`}>
                            {user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-base transition-colors">{acc.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user?.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCard(acc.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                          title="Kartı Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2 transition-colors">
                  <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs text-indigo-600 dark:text-indigo-400">＋</span>
                  Yeni Kart Ekle
                </h4>
                <div className="flex gap-2 mb-4">
                  {data.users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setNewCardUser(u.id)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border border-transparent ${newCardUser === u.id ? 'bg-white dark:bg-slate-900 shadow-md text-indigo-600 dark:text-indigo-400 border-gray-50 dark:border-slate-800' : 'bg-gray-100 dark:bg-slate-900/50 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-900'}`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Kart Adı (Örn: Bonus)"
                    className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-white"
                    value={newCardName}
                    onChange={e => setNewCardName(e.target.value)}
                  />
                  <button
                    onClick={handleAddCard}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Floating Action Button Removed */}
    </div>
  )
}

export default App
