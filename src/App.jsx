import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabaseClient'
import { toCamelCase, toSnakeCase } from './lib/dataTransformers'
import { useGoldPrices } from './hooks/useGoldPrices'
import PortfolioModal from './components/Modals/PortfolioModal'
import MoneyTipModal from './components/Modals/MoneyTipModal'
import FeedbackModal from './components/Modals/FeedbackModal'
import ReminderModal from './components/Modals/ReminderModal'

import { moneyTips } from './data/moneyTips'
import { Sun, Moon, Bell, BarChart3, Gauge, Calendar, CreditCard, Users, Trash2, Edit2, Receipt, Coins, Briefcase, Wallet, Lightbulb, MessageSquare, Plus, ArrowLeft, ArrowRight, Lock, AlertTriangle, CheckCircle, Loader2, Share2, Printer } from 'lucide-react'

import WelcomeScreen from './components/WelcomeScreen'
import NeedsList from './components/NeedsList'
import EventsCalendar from './components/EventsCalendar'

function App() {
  const [currentView, setCurrentView] = useState('welcome')
  const [data, setData] = useState({ users: [], accounts: [], transactions: [] })

  // Events State
  const [events, setEvents] = useState([])

  // Active Data Helpers (Soft Delete Logic: status !== 0)
  const activeUsers = data.users ? data.users.filter(u => u.status != 0) : []
  const activeAccounts = data.accounts ? data.accounts.filter(a => a.status != 0) : []
  const activeTransactions = data.transactions ? data.transactions.filter(t => t.status != 0) : []

  const [showAddModal, setShowAddModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const [userLimits, setUserLimits] = useState({})

  const [limitModalUser, setLimitModalUser] = useState(null)

  const [showFutureDebtsModal, setShowFutureDebtsModal] = useState(false)
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null) // { monthKey, selectedUserId }
  const [showCardsModal, setShowCardsModal] = useState(false)

  // Card Management State
  const [newCardName, setNewCardName] = useState('')
  const [newCardUser, setNewCardUser] = useState(activeUsers[0]?.id)

  const [newUser, setNewUser] = useState(activeUsers[0]?.id)
  const [newAccount, setNewAccount] = useState(activeAccounts.filter(a => a.userId === activeUsers[0]?.id)[0]?.id)
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

  // Account Detail Modal State (Drill-down from Account Summaries)
  const [selectedUserSummary, setSelectedUserSummary] = useState(null)

  // Notification State
  const [showNotification, setShowNotification] = useState(false)

  // Transaction Delete Confirmation State
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)

  // Toggled Section States
  const [showExtractModal, setShowExtractModal] = useState(false)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)

  // Portfolio State
  const [portfolio, setPortfolio] = useState({
    lastTotal: 0,
    lastUpdated: null,
    items: {
      gram: 0,
      gram22: 0,
      ceyrek: 0,
      yarim: 0,
      tam: 0,
      cumhuriyet: 0,
      ethereum: 0
    }
  })
  const { goldPrices, goldFetchError, fetchGoldPrices, lastUpdateTime } = useGoldPrices()

  // Menu Reordering State
  const defaultMenuOrder = ['portfolio', 'limit', 'future', 'cards', 'users', 'extract', 'feedback', 'reset']
  const [menuOrder, setMenuOrder] = useState(() => {
    const saved = localStorage.getItem('menuOrder')
    if (saved) {
      const parsed = JSON.parse(saved)
      let finalOrder = [...parsed]
      if (!finalOrder.includes('portfolio')) {
        finalOrder = ['portfolio', ...finalOrder]
      }
      if (!finalOrder.includes('feedback')) {
        const resetIndex = finalOrder.indexOf('reset')
        if (resetIndex !== -1) {
          finalOrder.splice(resetIndex, 0, 'feedback')
        } else {
          finalOrder.push('feedback')
        }
      }
      return finalOrder
    }
    return defaultMenuOrder
  })
  const [reorderMode, setReorderMode] = useState(false)
  const [swapSource, setSwapSource] = useState(null)

  // Save menu order to localStorage
  useEffect(() => {
    localStorage.setItem('menuOrder', JSON.stringify(menuOrder))
  }, [menuOrder])

  /* Feedback Logic */
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  /* Reset Password Modal */
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)

  /* Success Modal */
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  /* Money Tip Logic */
  const [showTipModal, setShowTipModal] = useState(false)
  const [currentTip, setCurrentTip] = useState(null)

  const handleShowTip = () => {
    const randomTip = moneyTips[Math.floor(Math.random() * moneyTips.length)]
    setCurrentTip(randomTip)
    setShowTipModal(true)
    // Auto close after 8 seconds
    setTimeout(() => {
      setShowTipModal(false)
    }, 8000)
  }



  // Extract Filter
  const [extractFilterUser, setExtractFilterUser] = useState(null)


  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const toggleTheme = () => setDarkMode(prev => !prev)

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


  // Supabase Sync Logic
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  // Pull to Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullStartY, setPullStartY] = useState(0)
  const [pullMoveY, setPullMoveY] = useState(0)

  const scrollContainerRef = useRef(null)
  const futureDebtsListRef = useRef(null)
  const currentMonthRef = useRef(null)
  const futureDebtsScrollTimeoutRef = useRef(null)

  // Auto-scroll to current month in Future Debts Modal
  useEffect(() => {
    if (showFutureDebtsModal && !selectedMonthDetail) {
      if (futureDebtsScrollTimeoutRef.current) {
        clearTimeout(futureDebtsScrollTimeoutRef.current)
      }

      futureDebtsScrollTimeoutRef.current = setTimeout(() => {
        if (showFutureDebtsModal && !selectedMonthDetail && currentMonthRef.current) {
          currentMonthRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
    return () => {
      if (futureDebtsScrollTimeoutRef.current) {
        clearTimeout(futureDebtsScrollTimeoutRef.current)
      }
    }
  }, [showFutureDebtsModal, selectedMonthDetail])

  // Reminder State
  // Reminder State
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])

  const fetchInitialData = useCallback(async () => {
    if (!isSupabaseConfigured) return

    try {
      const { data: users } = await supabase.from('users').select('*')
      const { data: accounts } = await supabase.from('accounts').select('*')
      const { data: transactions } = await supabase.from('transactions').select('*')
      const { data: userLimitsData } = await supabase.from('user_limits').select('*')
      const { data: portfolioData } = await supabase.from('portfolios').select('*')

      if (users && accounts && transactions) {
        // Transform snake_case from DB to camelCase for App
        setData({
          users: toCamelCase(users),
          accounts: toCamelCase(accounts),
          transactions: toCamelCase(transactions)
        })
      }

      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*')
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          id: e.id,
          date: e.date,
          title: e.title,
          description: e.description,
          time: e.time
        })))


      }

      if (userLimitsData) {
        const limitsObj = {}
        userLimitsData.forEach(l => {
          limitsObj[l.user_id] = l.limit_amount
        })
        setUserLimits(limitsObj)
      }

      if (portfolioData && portfolioData.length > 0) {
        try {
          const p = portfolioData[0];
          if (p) {
            setPortfolio({
              lastTotal: p.last_total,
              lastUpdated: p.last_updated,
              items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items
            });
          }
        } catch (e) { console.error("Portfolio parse error", e) }
      }
    } catch (error) {
      console.error('Error fetching from Supabase:', error)
    }
  }, [isSupabaseConfigured])

  useEffect(() => {
    fetchInitialData()

    if (!isSupabaseConfigured) return

    // Real-time subscriptions
    const transactionSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchInitialData)
      .subscribe()

    return () => {
      supabase.removeChannel(transactionSubscription)
    }
  }, [isSupabaseConfigured, fetchInitialData])


  const handleTouchStart = (e) => {
    // Only enable pull to refresh if we are at the top of the scroll container
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY)
    } else {
      setPullStartY(0)
    }
  }

  const handleTouchMove = (e) => {
    if (!pullStartY) return

    const currentY = e.touches[0].clientY
    const diff = currentY - pullStartY

    // Only allow pulling down and limit the visual pull distance
    if (diff > 0 && diff < 200) {
      // Check if we are still at top (user might have scrolled down then up without lifting finger, simplified check)
      if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
        setPullMoveY(diff)
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullMoveY > 100) { // Threshold to trigger refresh
      setIsRefreshing(true)
      setPullMoveY(100) // Snap to loading position
      await fetchInitialData()
      setTimeout(() => {
        setIsRefreshing(false)
        setPullMoveY(0)
      }, 500)
    } else {
      setPullMoveY(0) // Snap back if threshold not met
    }
    setPullStartY(0)
  }

  // Function to save to Supabase
  const syncToSupabase = async (newData, newLimits) => {
    if (!isSupabaseConfigured) return

    try {
      // Transform camelCase from App to snake_case for DB
      if (newData.users) await supabase.from('users').upsert(toSnakeCase(newData.users))
      if (newData.accounts) await supabase.from('accounts').upsert(toSnakeCase(newData.accounts))
      if (newData.transactions) await supabase.from('transactions').upsert(toSnakeCase(newData.transactions))

      const limitsArray = Object.entries(newLimits).map(([user_id, limit_amount]) => ({
        user_id,
        limit_amount
      }))
      if (limitsArray.length > 0) await supabase.from('user_limits').upsert(limitsArray)
    } catch (error) {
      console.error('Error syncing to Supabase:', error)
    }
  }

  const syncPortfolioToSupabase = async (newPortfolio) => {
    if (!isSupabaseConfigured) return
    try {
      // Upsert based on a fixed ID or user ID. Let's assume a single global portfolio for this app instance 'p1'
      await supabase.from('portfolios').upsert({
        id: 'p1',
        last_total: newPortfolio.lastTotal,
        last_updated: new Date().toISOString(),
        items: newPortfolio.items // Supabase handles JSONB transparently usually
      })
    } catch (error) {
      console.error('Error syncing portfolio:', error)
    }
  }

  // Sync Events handled via direct actions
  /*
  useEffect(() => {
    // Logic moved to direct handlers
  }, [events])
  */

  const handleAddEvent = async (newEvent) => {
    setEvents(prev => [...prev, newEvent])

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').insert({
          id: newEvent.id,
          date: newEvent.date,
          title: newEvent.title,
          description: newEvent.description,
          time: newEvent.time
        })
      } catch (e) {
        console.error("Event add error", e)
        alert("Etkinlik kaydedilirken hata oluştu: " + e.message + "\n\nDetay: " + JSON.stringify(e))
      }
    }
  }

  const handleDeleteEvent = async (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').delete().eq('id', eventId)
      } catch (e) { console.error("Event delete error", e) }
    }
  }

  const handleUpdateEvent = async (updatedEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))

    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').update({
          date: updatedEvent.date,
          title: updatedEvent.title,
          description: updatedEvent.description,
          time: updatedEvent.time
        }).eq('id', updatedEvent.id)
      } catch (e) { console.error("Event update error", e) }
    }
  }


  // Update data sync effect - Supabase only
  useEffect(() => {
    syncToSupabase(data, userLimits)
  }, [data])

  // Update limits sync effect - Supabase only
  useEffect(() => {
    syncToSupabase(data, userLimits)
  }, [userLimits])

  // Portfolio Sync - Supabase only
  useEffect(() => {
    syncPortfolioToSupabase(portfolio)
  }, [portfolio])

  // Last Visit Tracking (localStorage)
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
    activeTransactions.forEach(t => {
      if (t.status === 1) {
        const monthKey = t.date.slice(0, 7)
        if (!groups[monthKey]) groups[monthKey] = 0
        groups[monthKey] += t.amount
      }
    })
    return Object.entries(groups)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const monthlyBreakdown = getMonthlyBreakdown()

  const getDebtByUser = (userId) => {
    const userAccountIds = activeAccounts.filter(acc => acc.userId === userId).map(acc => acc.id)
    return activeTransactions
      .filter(t => userAccountIds.includes(t.accountId))
      .reduce((acc, curr) => acc + curr.amount, 0)
  }

  const handleUserChange = (uId) => {
    setNewUser(uId)
    const userAccs = activeAccounts.filter(a => a.userId === uId)
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
    const acc = activeAccounts.find(a => a.id === t.accountId)
    if (acc) setNewUser(acc.userId)

    // Installment handling is tricky on edit. For MVP, let's treat it as a flat update of THAT specific transaction/installment.
    // Or block editing installment properties?
    // Let's allow editing amount/date/desc/account.
    setIsInstallment(false) // editing single item usually
    setTransactionStep(1)
    setShowAddModal(true)
  }

  const handleDeleteTransaction = (id) => {
    setTransactionToDelete(id)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === transactionToDelete ? { ...t, status: 0 } : t)
      }))
      setTransactionToDelete(null)
      setShowDeleteConfirmModal(false)
    }
  }

  const handleShareWhatsApp = () => {
    const filteredTransactions = activeTransactions
      .filter(t => {
        const matchesUser = extractFilterUser === null || activeAccounts.find(a => a.id === t.accountId)?.userId === extractFilterUser;
        const isMevcutAy = t.date.startsWith(currentMonth);
        const isStatus1 = t.status === 1;
        return matchesUser && isMevcutAy && isStatus1;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredTransactions.length === 0) {
      alert("Paylaşılacak işlem bulunamadı.");
      return;
    }

    const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    const userLabel = extractFilterUser ? activeUsers.find(u => u.id === extractFilterUser)?.name : 'Tümü';
    const totalAmount = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    let message = `*AIEkonomi - İşlem Ekstresi*\n`;
    message += `📅 Dönem: ${monthLabel}\n`;
    message += `👤 Kişi: ${userLabel}\n`;
    message += `--------------------------------\n\n`;

    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      const amount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount);
      const acc = activeAccounts.find(a => a.id === t.accountId)?.name || 'Bilinmiyor';
      message += `▫️ *${date}* | ${amount}\n`;
      message += `   ${t.description} (${acc})\n\n`;
    });

    message += `--------------------------------\n`;
    message += `💰 *TOPLAM: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount)}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!amount) {
      alert("Lütfen bir tutar giriniz.")
      setTransactionStep(1)
      return
    }

    if (!description) {
      alert("Lütfen bir açıklama giriniz.")
      return
    }

    if (!newAccount) {
      alert("Lütfen bir hesap/kart seçiniz.")
      return
    }

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
        type: isInstallment ? 'taksitli' : 'tek cekim',
        status: 1
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
            type: 'taksitli',
            status: 1
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
      status: 1
    }
    setData(prev => ({ ...prev, accounts: [...prev.accounts, newCard] }))
    setNewCardName('')
  }

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
      setData(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === cardId ? { ...a, status: 0 } : a) }))
    }
  }

  const handleAddUser = () => {
    if (!newUserName.trim()) return
    const newUserObj = {
      id: 'u' + (data.users.length + 1) + Math.random().toString(36).substr(2, 5),
      name: newUserName.trim(),
      status: 1
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
    if (activeUsers.length <= 1) {
      alert('En az bir kullanıcı kalmalıdır.')
      return
    }
    if (window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      setData(prev => ({ ...prev, users: prev.users.map(u => u.id === userId ? { ...u, status: 0 } : u) }))
      // Cleanup associated limits? optional
    }
  }

  const handleResetAllData = async () => {
    // Show password modal
    setPasswordInput('')
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = () => {
    if (passwordInput !== '5898') {
      alert('Yanlış şifre! İşlem iptal edildi.')
      setPasswordInput('')
      return
    }

    setShowPasswordModal(false)
    setShowResetConfirmModal(true)
  }

  const handleConfirmReset = async () => {
    setShowResetConfirmModal(false)

    if (isSupabaseConfigured) {
      try {
        // Clear Supabase tables
        await supabase.from('transactions').delete().neq('id', 'temp')
        await supabase.from('accounts').delete().neq('id', 'temp')
        await supabase.from('users').delete().neq('id', 'temp')
        await supabase.from('user_limits').delete().neq('user_id', 'temp')
      } catch (error) {
        console.error('Error resetting Supabase:', error)
      }
    }

    setData({ users: [], accounts: [], transactions: [] })
    setUserLimits({})
    setShowLimitModal(false)
    alert('Bütün veriler başarıyla sıfırlandı.')
    window.location.reload()
  }

  const handleOpenPortfolio = async () => {
    console.log("handleOpenPortfolio called");
    try {
      // 1. Reset input values
      setPortfolio(prev => ({
        ...prev,
        items: { gram: 0, gram22: 0, ceyrek: 0, yarim: 0, tam: 0, cumhuriyet: 0, ethereum: 0, custom: [] }
      }))

      // 2. Fetch last log for comparison
      if (isSupabaseConfigured) {
        console.log("Fetching last portfolio log...");
        const { data: logs, error } = await supabase
          .from('portfolio_logs')
          .select('total_value, items')
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error("Supabase error fetching logs:", error);
          // Don't block UI on error, just warn
        }

        if (logs && logs.length > 0) {
          console.log("Found log:", logs[0]);
          setPortfolio(prev => ({
            ...prev,
            lastTotal: logs[0].total_value,
            lastItems: logs[0].items
          }))
        } else {
          console.log("No logs found.");
          setPortfolio(prev => ({ ...prev, lastTotal: 0, lastItems: null }))
        }
      } else {
        console.log("Supabase not configured, skipping log fetch.");
      }
    } catch (e) {
      console.error("CRITICAL Error in handleOpenPortfolio:", e);
      alert("Portföy açılırken bir hata oluştu: " + e.message);
    } finally {
      console.log("Opening portfolio modal...");
      setShowPortfolioModal(true)
    }
  }

  const handleCheckReminders = async () => {
    try {
      console.log("Kontrol başlatılıyor...");

      let currentEvents = events || [];

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('events').select('*');
          if (error) throw error;
          if (data) {
            currentEvents = data.map(e => ({ ...e }));
          }
        } catch (err) {
          console.error("Manual fetch error:", err);
          alert("Veri çekme hatası (Supabase): " + err.message);
        }
      }

      // Helper for YYYY-MM-DD
      const getYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = new Date();
      const datesToCheck = [];

      // Collect next 30 days
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        datesToCheck.push(getYYYYMMDD(d));
      }

      if (!Array.isArray(currentEvents)) {
        throw new Error("Etkinlik listesi hatalı.");
      }

      const upcoming = currentEvents.filter(e => {
        // Robust matching: slice first 10 chars (YYYY-MM-DD)
        const cleanDate = e.date ? e.date.slice(0, 10) : '';
        return datesToCheck.includes(cleanDate);
      });

      if (upcoming.length > 0) {
        setUpcomingEvents(upcoming.sort((a, b) => a.date.localeCompare(b.date)));
        setShowReminderModal(true);
      } else {
        alert(`Önümüzdeki 30 gün için etkinlik bulunamadı.\n(Toplam Kayıt: ${currentEvents.length})`);
      }
    } catch (criticalError) {
      alert("KRİTİK HATA: " + criticalError.message);
      console.error(criticalError);
    }
  }


  // Render Welcome Screen
  if (currentView === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onNavigate={setCurrentView}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onCheckReminders={handleCheckReminders}
        />
        {showReminderModal && (
          <ReminderModal
            events={upcomingEvents}
            onClose={() => setShowReminderModal(false)}
          />
        )}
      </>
    );
  }

  // Render Needs List
  if (currentView === 'needs') {
    return (
      <>
        <NeedsList
          onBack={() => setCurrentView('welcome')}
          isSupabaseConfigured={isSupabaseConfigured}
        />
        {showReminderModal && (
          <ReminderModal
            events={upcomingEvents}
            onClose={() => setShowReminderModal(false)}
          />
        )}
      </>
    )
  }

  // Render Events Calendar
  if (currentView === 'events') {
    return (
      <>
        <EventsCalendar
          onBack={() => setCurrentView('welcome')}
          events={events}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onUpdateEvent={handleUpdateEvent}
        />
        {showReminderModal && (
          <ReminderModal
            events={upcomingEvents}
            onClose={() => setShowReminderModal(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 sm:p-8 font-sans relative overflow-hidden">


      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

      <div className="w-full max-w-[480px] bg-[#F8FAFC] dark:bg-slate-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] sm:border-white dark:sm:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">

        {/* Pull to Refresh Indicator */}
        <div
          className="absolute w-full flex items-center justify-center pointer-events-none z-50 transition-all duration-300 ease-out"
          style={{
            height: isRefreshing ? '60px' : `${Math.min(pullMoveY, 100)}px`,
            opacity: pullMoveY > 0 || isRefreshing ? 1 : 0,
            top: isRefreshing ? '20px' : '0px'
          }}
        >
          {isRefreshing ? (
            <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-gray-100 dark:border-slate-700 animate-spin">
              <Loader2 size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-gray-100 dark:border-slate-700" style={{ transform: `rotate(${pullMoveY * 2}deg)` }}>
              <ArrowRight size={24} className="text-indigo-600 dark:text-indigo-400 rotate-90" />
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar"
          style={{
            transform: isRefreshing ? 'translateY(60px)' : (pullMoveY > 0 ? `translateY(${Math.min(pullMoveY * 0.4, 80)}px)` : 'translateY(0)'),
            transition: isRefreshing ? 'transform 0.3s ease-out' : 'transform 0.1s linear',
            overscrollBehaviorY: 'none'
          }}
        >

          <header className="px-8 pt-[calc(3rem+var(--safe-area-inset-top))] pb-6 transition-colors duration-300">
            {/* Back Button - Top Left */}
            <div className="flex items-center justify-start mb-4">
              <button
                onClick={() => setCurrentView('welcome')}
                className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm rounded-xl flex items-center justify-center border border-gray-100 dark:border-slate-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all active:scale-95"
                title="Giriş Ekranına Dön"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-indigo-500">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} gün kaldı</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`inline-flex items-center gap-1 ${isSupabaseConfigured ? 'text-green-500' : 'text-orange-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></span>
                  {isSupabaseConfigured ? 'Bulut Senk.' : 'Yerel Kayıt'}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`inline-flex items-center gap-1 ${goldFetchError ? 'text-red-500' : (goldPrices ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-400')}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${goldFetchError ? 'bg-red-500' : (goldPrices ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400')} `}></span>
                  {goldFetchError ? 'Altın: Hata' : (goldPrices ? 'Altın: Aktif' : 'Altın: Bekleniyor')}
                </span>
              </p>
            </div>




            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors text-center">Merhaba, <span className="text-indigo-600 dark:text-indigo-400">Hoş Geldin!</span></h1>
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
                <Plus size={24} strokeWidth={2.5} />
              </div>
            </button>
          </div>

          <div className="mx-6 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Kişi Bütçeleri</h3>
            <div className="space-y-3 mb-4">
              {activeUsers.map(user => {
                const userAccountIds = activeAccounts.filter(acc => acc.userId === user.id).map(acc => acc.id)
                const userSpending = activeTransactions
                  .filter(t => t.date.startsWith(currentMonth) && userAccountIds.includes(t.accountId))
                  .reduce((acc, curr) => acc + curr.amount, 0)

                const userLimit = userLimits[user.id] || 0
                const remaining = userLimit - userSpending
                const percentage = Math.min((userSpending / userLimit) * 100, 100)
                const isLimitExceeded = userSpending > userLimit


                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setShowFutureDebtsModal(true)
                      setSelectedMonthDetail({ monthKey: currentMonth, selectedUserId: user.id })
                    }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white dark:border-slate-700 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >

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



            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">İşlemler</h3>
              <button
                onClick={() => {
                  setReorderMode(!reorderMode)
                  setSwapSource(null)
                }}
                className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${reorderMode ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {reorderMode ? 'Bitti' : 'Düzenle'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {menuOrder.map(itemId => {
                const isSelected = swapSource === itemId;
                const isShake = reorderMode && !swapSource;

                // Handlers
                const handleMenuClick = () => {
                  if (reorderMode) {
                    if (!swapSource) {
                      setSwapSource(itemId)
                    } else {
                      if (swapSource === itemId) {
                        setSwapSource(null) // Deselect
                      } else {
                        // Swap
                        const newOrder = [...menuOrder]
                        const idx1 = newOrder.indexOf(swapSource)
                        const idx2 = newOrder.indexOf(itemId)
                        newOrder[idx1] = itemId
                        newOrder[idx2] = swapSource
                        setMenuOrder(newOrder)
                        setSwapSource(null)
                      }
                    }
                  } else {
                    // Normal Action
                    switch (itemId) {
                      case 'limit':
                        setLimitModalUser(activeUsers[0]?.id)
                        setShowLimitModal(true)
                        break;
                      case 'future':
                        setShowFutureDebtsModal(true)
                        break;
                      case 'cards':
                        setShowCardsModal(true)
                        break;
                      case 'users':
                        setShowUserModal(true)
                        break;
                      case 'reset':
                        handleResetAllData()
                        break;
                      case 'extract':
                        setExtractFilterUser(null)
                        setShowExtractModal(true)
                        break;
                      case 'portfolio':
                        handleOpenPortfolio()
                        break;
                      case 'feedback':
                        setShowFeedbackModal(true)
                        break;
                    }
                  }
                }

                // Config
                let label, IconComponent, colorClass, borderColorClass;
                switch (itemId) {
                  case 'limit': label = 'Limit'; IconComponent = Gauge; break;
                  case 'future': label = 'Dönemler'; IconComponent = Calendar; break;
                  case 'cards': label = 'Kartlar'; IconComponent = CreditCard; break;
                  case 'users': label = 'Kişiler'; IconComponent = Users; break;
                  case 'feedback': label = 'İstekler'; IconComponent = MessageSquare; break;
                  case 'reset': label = 'Sıfırla'; IconComponent = Trash2; colorClass = 'bg-red-50 dark:bg-red-900/20 text-red-500/80 dark:text-red-400'; borderColorClass = 'border-red-100 dark:border-red-900/30'; break;
                  case 'extract': label = 'Ekstre'; IconComponent = Receipt; break;
                  case 'portfolio': label = 'Portföyüm'; IconComponent = Wallet; colorClass = 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'; borderColorClass = 'border-yellow-100 dark:border-yellow-900/30'; break;
                  default: return null;
                }

                return (
                  <button
                    key={itemId}
                    onClick={handleMenuClick}
                    className={`flex flex-col items-center gap-2 group active:scale-95 transition-all duration-200 outline-none ${isShake ? 'animate-pulse' : ''} ${isSelected ? 'scale-110 z-10' : ''}`}
                  >
                    <div className={`
                      w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border flex items-center justify-center transition-all relative overflow-hidden
                      ${colorClass || 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'} 
                      ${borderColorClass || ''}
                      ${reorderMode ? 'ring-2 ring-offset-2 ring-indigo-500/50 cursor-grab' : 'group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] group-hover:-translate-y-1 cursor-pointer'}
                      ${isSelected ? 'ring-4 ring-indigo-600 shadow-xl' : ''}
                    `}>
                      <div className="relative z-10 flex items-center justify-center w-full h-full">
                        <IconComponent
                          size={28}
                          strokeWidth={1.5}
                          className={`transition-colors duration-300 ${itemId === 'reset' ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}
                          {...(itemId === 'portfolio' ? { className: "text-yellow-600 dark:text-yellow-400" } : {})}
                          {...(itemId === 'reset' ? { className: "text-red-500 dark:text-red-400" } : {})}
                        />
                      </div>

                      {/* Subtle gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
                    </div>

                    <span className={`text-[11px] font-bold tracking-tight text-center whitespace-nowrap ${itemId === 'reset' ? 'text-red-500/80 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors`}>
                      {label}
                      {reorderMode && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white w-5 h-5 text-[10px] flex items-center justify-center rounded-full shadow-md border-2 border-white dark:border-slate-900">↕</span>}
                    </span>
                  </button>
                )
              })}
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
                {activeUsers.map(u => (
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
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-500 mt-1">{'\u20BA'}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={limitModalUser ? userLimits[limitModalUser] : 0}
                    onChange={(e) => setUserLimits(prev => ({ ...prev, [limitModalUser]: Number(e.target.value) }))}
                    className="w-48 text-5xl font-black text-indigo-600 dark:text-indigo-500 bg-transparent border-none outline-none text-center tracking-tighter transition-all focus:scale-105 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                </div>
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
                  setSuccessMessage('Limit ayarları başarıyla kaydedildi. ' + (isSupabaseConfigured ? 'Bulut ile senkronize ediliyor.' : 'Şu an yerel olarak kaydedildi, API anahtarlarınızı girdiğinizde bulut ile senkronize olacaktır.'))
                  setShowSuccessModal(true)
                }}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all hover:bg-black dark:hover:bg-gray-100"
              >
                Kaydet
              </button>
            </div>
          </div>
        )
      }

      {
        showAddModal && (
          <div className="absolute inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => { setShowAddModal(false); setTransactionStep(1); setAmount(''); setEditingTransaction(null); }}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[420px] h-[90vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">{editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem'}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {transactionStep === 1 ? 'Tutarı girin' : 'Detayları belirleyin'}
                  </p>
                </div>
                <button onClick={() => { setShowAddModal(false); setTransactionStep(1); setAmount(''); setEditingTransaction(null); }} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                {transactionStep === 1 ? (
                  <>
                    <div className="flex-1 flex flex-col justify-center mb-8">
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-4xl font-light">{'\u20BA'}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          className="w-full pl-14 pr-6 py-8 text-6xl font-black text-gray-800 dark:text-white bg-white dark:bg-slate-800 shadow-inner rounded-[40px] border border-gray-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-center placeholder-gray-200 dark:placeholder-slate-700"
                          placeholder="0"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (amount) {
                                e.target.blur();
                                setTransactionStep(2);
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (amount) {
                            document.activeElement?.blur();
                            setTransactionStep(2);
                          }
                        }}
                        className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 group ${amount ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-200 dark:shadow-slate-700 hover:bg-black dark:hover:bg-gray-200 active:scale-[0.98]' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'}`}
                        disabled={!amount}
                      >
                        <span>Devam Et</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                        {activeUsers.map(u => (
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
                              {activeAccounts.filter(a => a.userId === newUser).map(acc => (
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
                              <Calendar size={20} />
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
                          <ArrowLeft size={20} />
                        </button>
                        <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-gray-200 dark:shadow-slate-800 active:scale-[0.98] transition-all hover:bg-black dark:hover:bg-gray-200 flex items-center justify-center gap-2 group">
                          <span>Kaydet</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => { setShowFutureDebtsModal(false); setSelectedMonthDetail(null); }}></div>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[480px] h-[85svh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">{selectedMonthDetail ? 'İşlem Detayları' : 'Dönem Özetleri'}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">{selectedMonthDetail ? 'Kişi bazlı harcamalar' : 'Aylık harcama geçmişi'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMonthDetail && (
                    <button onClick={() => setSelectedMonthDetail(null)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title="Geri">←</button>
                  )}
                  <button onClick={() => { setShowFutureDebtsModal(false); setSelectedMonthDetail(null); }} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
                </div>
              </div>

              <div ref={futureDebtsListRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {!selectedMonthDetail ? (
                  // Month List View
                  <>
                    {monthlyBreakdown
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(item => {
                        const dateObj = new Date(item.date + '-01');
                        const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                        const totalLimit = Object.values(userLimits).reduce((a, b) => a + b, 0);
                        const isOverLimit = item.total > totalLimit;
                        const isFuture = item.date > currentMonth;
                        const isCurrent = item.date === currentMonth;

                        return (
                          <div
                            key={item.date}
                            ref={isCurrent ? currentMonthRef : null}
                            onClick={() => setSelectedMonthDetail({ monthKey: item.date, selectedUserId: activeUsers[0]?.id })}
                            className={`p-6 rounded-[32px] border relative overflow-hidden group transition-all duration-300 cursor-pointer ${isCurrent
                              ? 'bg-indigo-600 text-white border-transparent shadow-2xl z-10'
                              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:scale-[1.01]'
                              }`}
                          >
                            {isCurrent && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            )}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl transition-colors ${isCurrent ? 'bg-white/10' : 'bg-indigo-50/50 dark:bg-indigo-900/20 group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-900/30'}`}></div>

                            <div className="flex flex-col items-center gap-2 mb-4 relative z-10 text-center">
                              <div className="flex flex-wrap shadow-sm justify-center items-center gap-2">
                                <span className={`font-bold text-xl transition-colors ${isCurrent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{monthName}</span>
                                {isCurrent && <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 text-white rounded-full backdrop-blur-md">BU AY</span>}
                                {isFuture && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCurrent ? 'bg-white/10 text-white' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>GELECEK</span>}
                              </div>
                              <span className={`text-2xl font-black tracking-tight ${isOverLimit ? 'text-red-400' : (isCurrent ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400')}`}>
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.total)}
                              </span>
                            </div>

                            <div className={`h-2.5 rounded-full overflow-hidden mb-5 relative z-10 ${isCurrent ? 'bg-white/10' : 'bg-gray-100 dark:bg-slate-900'}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-400' : (isCurrent ? 'bg-white' : 'bg-gradient-to-r from-indigo-400 to-purple-400')}`}
                                style={{ width: `${Math.min((item.total / totalLimit) * 100, 100)}%` }}
                              ></div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center relative z-10">
                              {activeUsers.map(u => {
                                const userAccs = activeAccounts.filter(a => a.userId === u.id).map(a => a.id);
                                const userMonthTotal = activeTransactions
                                  .filter(t => t.status === 1 && t.date.startsWith(item.date) && userAccs.includes(t.accountId))
                                  .reduce((acc, curr) => acc + curr.amount, 0);

                                if (userMonthTotal === 0) return null;

                                return (
                                  <div key={u.id} className={`flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-xl border transition-colors ${isCurrent ? 'bg-white/10 border-white/10' : 'bg-gray-50/80 dark:bg-slate-900/80 border-gray-100 dark:border-slate-700'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${u.id === 'u1' ? (isCurrent ? 'bg-white/20' : 'bg-indigo-500') : (isCurrent ? 'bg-white/20' : 'bg-pink-500')}`}>
                                      {u.name.charAt(0)}
                                    </div>
                                    <span className={`text-xs font-bold transition-colors ${isCurrent ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                      {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(userMonthTotal)}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {isOverLimit && (
                              <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-50/50 dark:bg-red-900/20 p-2 rounded-xl backdrop-blur-sm relative z-10">
                                <span className="text-lg">⚠️</span>
                                <span className="text-xs font-bold">{isFuture ? 'Limit aşımı öngörülüyor!' : 'Limit aşıldı!'}</span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    }
                    {monthlyBreakdown.length === 0 && (
                      <div className="text-center py-20 text-gray-400">
                        <div className="text-6xl mb-4 opacity-50">📊</div>
                        <p className="font-bold">Henüz işlem yok</p>
                        <p className="text-sm mt-1">İşlem ekledikçe dönem özetleri burada görünecek</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Transaction Detail View
                  <>
                    {/* Person Filter Tabs */}
                    <div className="flex gap-2 mb-6 sticky top-0 z-10 pt-2 pb-2">
                      {activeUsers.map(u => {
                        const userAccs = activeAccounts.filter(a => a.userId === u.id).map(a => a.id);
                        const userMonthTotal = activeTransactions
                          .filter(t => t.status === 1 && t.date.startsWith(selectedMonthDetail.monthKey) && userAccs.includes(t.accountId))
                          .reduce((acc, curr) => acc + curr.amount, 0);

                        const isSelected = selectedMonthDetail.selectedUserId === u.id;

                        return (
                          <button
                            key={u.id}
                            onClick={() => setSelectedMonthDetail({ ...selectedMonthDetail, selectedUserId: u.id })}
                            className={`flex-1 py-3 px-4 rounded-[24px] text-sm font-bold transition-all duration-300 border ${isSelected
                              ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
                              : 'bg-white/50 dark:bg-slate-800/50 text-gray-500 border-gray-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                              }`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[11px] uppercase tracking-wider opacity-80">{u.name}</span>
                              <span className={`text-sm ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(userMonthTotal)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Quick Add Button */}
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          const userId = selectedMonthDetail.selectedUserId
                          setNewUser(userId)
                          handleUserChange(userId)

                          // Set date: if current month, today; else 1st of that month
                          const now = new Date()
                          const currentMonthStr = now.toISOString().slice(0, 7)
                          if (selectedMonthDetail.monthKey === currentMonthStr) {
                            setDate(now.toISOString().split('T')[0])
                          } else {
                            setDate(selectedMonthDetail.monthKey + '-01')
                          }

                          setTransactionStep(1)
                          setAmount('')
                          setEditingTransaction(null)
                          setShowAddModal(true)
                        }}
                        className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                      >
                        <Plus size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-bold">Harcama Yap</span>
                      </button>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-3">
                      {(() => {
                        const userAccs = activeAccounts.filter(a => a.userId === selectedMonthDetail.selectedUserId).map(a => a.id);
                        const transactions = activeTransactions
                          .filter(t => t.status === 1 && t.date.startsWith(selectedMonthDetail.monthKey) && userAccs.includes(t.accountId))
                          .sort((a, b) => b.date.localeCompare(a.date));

                        if (transactions.length === 0) {
                          return (
                            <div className="text-center py-10 text-gray-400">
                              <p className="text-sm">Bu kişi için bu ayda işlem bulunamadı.</p>
                            </div>
                          )
                        }

                        return transactions.map(t => {
                          const account = activeAccounts.find(a => a.id === t.accountId);
                          return (
                            <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 dark:text-white text-sm">{t.description}</p>
                                  <p className="text-xs text-gray-400 mt-1">{account?.name}</p>
                                </div>
                                <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg ml-3">
                                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(t.amount)}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>{new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  {t.type === 'taksitli' && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold">Taksitli</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditTransaction(t)}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(t.id)}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </>
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
                {activeAccounts
                  .filter(acc => acc.userId === selectedUserSummary)
                  .map(acc => {
                    const accountDebt = activeTransactions
                      .filter(t => t.accountId === acc.id)
                      .reduce((acc, curr) => acc + curr.amount, 0)

                    if (accountDebt === 0) return null

                    return (
                      <div key={acc.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-xl shadow-inner transition-colors">
                            <CreditCard size={20} />
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
                  activeAccounts
                    .filter(acc => acc.userId === selectedUserSummary)
                    .every(acc => activeTransactions.filter(t => t.accountId === acc.id).reduce((a, c) => a + c.amount, 0) === 0) && (
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
                  {activeUsers.map(user => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center group hover:scale-[1.01] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${user.id === 'u1' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'}`}>
                          <Users size={20} strokeWidth={2} />
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
                        <Trash2 size={16} strokeWidth={2} />
                      </button>


                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2 transition-colors">
                  <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-xs text-teal-600 dark:text-teal-400"><Plus size={14} /></span>
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
                  {activeAccounts.map(acc => {
                    const user = activeUsers.find(u => u.id === acc.userId)
                    return (
                      <div key={acc.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 flex justify-between items-center group hover:scale-[1.01] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${user?.id === 'u1' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'}`}>
                            <CreditCard size={20} strokeWidth={2} />
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
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[32px] p-6 border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2 transition-colors">
                  <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs text-indigo-600 dark:text-indigo-400"><Plus size={14} /></span>
                  Yeni Kart Ekle
                </h4>
                <div className="flex gap-2 mb-4">
                  {activeUsers.map(u => (
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


      {/* Extract Modal */}
      {
        showExtractModal && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity" onClick={() => setShowExtractModal(false)}></div>
            <div id="print-area" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[480px] h-[85vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
              <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden no-print"></div>

              {/* Print Only Header */}
              <div className="print-header hidden mb-10 border-b-2 border-indigo-900 pb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-black text-indigo-900">AIEkonomi</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Finansal İşlem Ekstresi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 capitalize">{new Date(currentMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} Dönemi</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 no-print">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight transition-colors">Ekstre</h3>
                  <p className="text-sm text-gray-500 font-medium">Tüm işlemleriniz</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    title="WhatsApp ile Paylaş"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    title="Yazdır"
                  >
                    <Printer size={18} />
                  </button>
                  <button onClick={() => setShowExtractModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
                </div>
              </div>

              {/* Filter by User */}
              <div className="bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex mb-6 backdrop-blur-md transition-colors no-print">
                <button
                  onClick={() => setExtractFilterUser(null)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${extractFilterUser === null ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 scale-[1.02]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  <div className="flex flex-col items-center">
                    <span>Tümü</span>
                    <span className={`text-[10px] mt-0.5 ${extractFilterUser === null ? 'text-indigo-500' : 'text-gray-400'}`}>
                      {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(
                        activeTransactions
                          .filter(t => t.status === 1 && t.date.startsWith(currentMonth))
                          .reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </span>
                  </div>
                </button>
                {activeUsers.map(u => {
                  const userAccs = activeAccounts.filter(a => a.userId === u.id).map(a => a.id);
                  const userTotal = activeTransactions
                    .filter(t => t.status === 1 && t.date.startsWith(currentMonth) && userAccs.includes(t.accountId))
                    .reduce((acc, curr) => acc + curr.amount, 0);

                  return (
                    <button
                      key={u.id}
                      onClick={() => setExtractFilterUser(u.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${extractFilterUser === u.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 scale-[1.02]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{u.name}</span>
                        <span className={`text-[10px] mt-0.5 ${extractFilterUser === u.id ? 'text-indigo-500' : 'text-gray-400'}`}>
                          {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(userTotal)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Transactions List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {activeTransactions
                  .filter(t => {
                    const matchesUser = extractFilterUser === null || activeAccounts.find(a => a.id === t.accountId)?.userId === extractFilterUser;
                    const isMevcutAy = t.date.startsWith(currentMonth);
                    const isStatus1 = t.status === 1;
                    return matchesUser && isMevcutAy && isStatus1;
                  })
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(t => {
                    const account = activeAccounts.find(a => a.id === t.accountId)
                    const user = activeUsers.find(u => u.id === account?.userId)
                    return (
                      <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:scale-[1.01] transition-transform print-transaction">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{t.description || 'İşlem'}</p>
                            <p className="text-xs text-gray-400">{account?.name} • {user?.name}</p>
                          </div>
                          <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    )
                  })}
                {activeTransactions.filter(t => {
                  const matchesUser = extractFilterUser === null || activeAccounts.find(a => a.id === t.accountId)?.userId === extractFilterUser;
                  const isMevcutAy = t.date.startsWith(currentMonth);
                  const isStatus1 = t.status === 1;
                  return matchesUser && isMevcutAy && isStatus1;
                }).length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      <div className="text-6xl mb-4 opacity-50">📄</div>
                      <p className="font-bold">Henüz işlem yok</p>
                      <p className="text-sm mt-1">Yeni işlem eklemek için + butonunu kullanın</p>
                    </div>
                  )}

                {activeTransactions.filter(t => {
                  const matchesUser = extractFilterUser === null || activeAccounts.find(a => a.id === t.accountId)?.userId === extractFilterUser;
                  const isMevcutAy = t.date.startsWith(currentMonth);
                  const isStatus1 = t.status === 1;
                  return matchesUser && isMevcutAy && isStatus1;
                }).length > 0 && (
                    <div className="print-total hidden mt-6 pt-6 border-t font-black text-xl text-indigo-900 text-right">
                      TOPLAM: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                        activeTransactions
                          .filter(t => {
                            const matchesUser = extractFilterUser === null || activeAccounts.find(a => a.id === t.accountId)?.userId === extractFilterUser;
                            const isMevcutAy = t.date.startsWith(currentMonth);
                            const isStatus1 = t.status === 1;
                            return matchesUser && isMevcutAy && isStatus1;
                          })
                          .reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )
      }


      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        goldPrices={goldPrices}
        goldFetchError={goldFetchError}
        fetchGoldPrices={fetchGoldPrices}
        lastUpdateTime={lastUpdateTime}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* Floating Action Button Removed */}
      <MoneyTipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        tip={currentTip}
      />

      {/* Password Modal for Reset */}
      {showPasswordModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-all" onClick={() => setShowPasswordModal(false)}></div>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-[340px] rounded-[40px] p-8 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Şifre Gerekli</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sıfırlama işlemi için şifre giriniz</p>
            </div>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Şifre"
              className="w-full px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-center text-2xl font-bold tracking-widest transition-all mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Devam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetConfirmModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-all" onClick={() => setShowResetConfirmModal(false)}></div>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-[360px] rounded-[40px] p-8 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">Dikkat!</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Bütün <span className="font-bold text-red-500">harcamalar</span>, <span className="font-bold text-red-500">kişiler</span> ve <span className="font-bold text-red-500">kartlar</span> kalıcı olarak silinecek.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
                Bu işlem geri alınamaz!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Transaction Delete */}
      {showDeleteConfirmModal && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-all" onClick={() => setShowDeleteConfirmModal(false)}></div>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-[360px] rounded-[40px] p-8 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">İşlemi Sil?</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Bu işlemi silmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmDeleteTransaction}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-all" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-[360px] rounded-[40px] p-8 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={48} className="text-green-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">Başarılı!</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {successMessage}
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Tamam
            </button>
          </div>
        </div>
      )}


      {showReminderModal && (
        <ReminderModal
          events={upcomingEvents}
          onClose={() => setShowReminderModal(false)}
        />
      )}
    </div >
  )
}

export default App
