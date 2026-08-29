export const supportedLanguages = ['tr', 'en'];
export const supportedCurrencies = ['TRY', 'USD', 'EUR', 'GBP'];

export const normalizeLanguage = (value) => {
  return supportedLanguages.includes(value) ? value : 'tr';
};

export const normalizeCurrency = (value) => {
  return supportedCurrencies.includes(value) ? value : 'TRY';
};

export const detectInitialLanguage = () => {
  if (typeof window === 'undefined') return 'tr';

  const saved = window.localStorage.getItem('language');
  if (supportedLanguages.includes(saved)) return saved;

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const detected = browserLanguages
    .map(item => String(item || '').toLowerCase())
    .find(item => item.startsWith('tr') || item.startsWith('en'));

  return detected?.startsWith('en') ? 'en' : 'tr';
};

export const translations = {
  app: {
    tr: {
      back: 'Geri',
      menu: 'Menü',
      addExpense: 'Harcama Ekle',
      daysToNewPeriod: 'Yeni Döneme',
      tomorrow: 'Yarın',
      days: 'Gün',
      quickActions: 'Hızlı İşlemler',
      edit: 'Düzenle',
      done: 'Bitti',
      periods: 'Dönemler',
      cashFlow: 'Nakit Akışı',
      recurringPayments: 'Tekrarlayan Ödemeler',
      people: 'Kişiler',
      limit: 'Limit',
      statement: 'Ekstre',
      management: 'Yönetim',
      budgetManagement: 'Bütçe Yönetimi',
      spent: 'Harcanan',
      remaining: 'Kalan',
      investment: 'Yatırım',
      portfolio: 'Portföyüm',
      portfolioSub: 'Varlık ve birikim takibi',
      totalAsset: 'Toplam Varlık',
      liveRate: 'Canlı Kur',
      upcomingPayments: 'Yaklaşan Ödemeler',
      nextFiveDays: 'Önümüzdeki 5 gün',
      today: 'Bugün',
      general: 'Genel',
      noAccount: 'Hesap yok',
      subscription: 'Abonelik',
      debt: 'Borç',
      paymentName: 'Ödeme Adı',
      monthlyAmount: 'Aylık Tutar',
      paymentDay: 'Ödeme Günü',
      totalInstallments: 'Toplam Taksit',
      paid: 'Ödenen',
      account: 'Hesap',
      addPayment: 'Ödeme ekle',
      selectCardFirst: 'Önce kart ekleyin',
      everyMonth: 'Her ay',
      installment: 'taksit',
      left: 'Kalan',
      incomeEntry: 'Gelir Girişi',
      editIncome: 'Geliri Düzenle',
      incomeSub: 'Kişi bazlı gelir kaydı oluştur',
      incomeAmount: 'Gelir Tutarı',
      description: 'Açıklama',
      date: 'Tarih',
      incomeSave: 'Gelir Kaydet',
      incomeUpdate: 'Geliri Güncelle',
      incomes: 'Gelirler',
      noIncome: 'Henüz gelir kaydı yok.',
      record: 'kayıt',
      all: 'Tümü',
      month: 'Ay',
      custom: 'Özel',
      start: 'Başlangıç',
      end: 'Bitiş',
      selectedPeriod: 'Seçili dönem',
      comfortable: 'Rahat',
      deficit: 'Açık var',
      income: 'Gelir',
      expense: 'Gider',
      movements: 'Hareketler',
      noCashFlow: 'Bu tarih aralığında beklenen nakit hareketi yok.',
      planned: 'Planlı',
      transactionDetails: 'İşlem Detayları',
      periodSummary: 'Dönem Özetleri',
      personExpenses: 'Kişi bazlı harcamalar',
      monthlyHistory: 'Aylık harcama geçmişi',
      currentMonth: 'BU AY',
      future: 'GELECEK',
      noExpense: 'Bu kişi için bu ayda harcama bulunamadı.',
      newTransaction: 'Yeni İşlem',
      editTransaction: 'İşlemi Düzenle',
      enterAmount: 'Tutarı girin',
      setDetails: 'Detayları belirleyin',
      monthlyReport: 'Aylık Rapor',
      net: 'Net',
      userBreakdown: 'Kişi Dağılımı',
      biggestTransactions: 'En Büyük İşlemler',
      noTransaction: 'Henüz işlem yok',
      ok: 'Tamam',
      success: 'Başarılı!',
      cancel: 'Vazgeç',
      delete: 'Sil'
    },
    en: {
      back: 'Back',
      menu: 'Menu',
      addExpense: 'Add Expense',
      daysToNewPeriod: 'New Period In',
      tomorrow: 'Tomorrow',
      days: 'Days',
      quickActions: 'Quick Actions',
      edit: 'Edit',
      done: 'Done',
      periods: 'Periods',
      cashFlow: 'Cash Flow',
      recurringPayments: 'Recurring Payments',
      people: 'People',
      limit: 'Limit',
      statement: 'Statement',
      management: 'Management',
      budgetManagement: 'Budget Management',
      spent: 'Spent',
      remaining: 'Remaining',
      investment: 'Investment',
      portfolio: 'Portfolio',
      portfolioSub: 'Assets and savings tracking',
      totalAsset: 'Total Assets',
      liveRate: 'Live Rate',
      upcomingPayments: 'Upcoming Payments',
      nextFiveDays: 'Next 5 days',
      today: 'Today',
      general: 'General',
      noAccount: 'No account',
      subscription: 'Subscription',
      debt: 'Debt',
      paymentName: 'Payment Name',
      monthlyAmount: 'Monthly Amount',
      paymentDay: 'Payment Day',
      totalInstallments: 'Total Installments',
      paid: 'Paid',
      account: 'Account',
      addPayment: 'Add payment',
      selectCardFirst: 'Add a card first',
      everyMonth: 'Every month',
      installment: 'installment',
      left: 'Left',
      incomeEntry: 'Income Entry',
      editIncome: 'Edit Income',
      incomeSub: 'Create income records by person',
      incomeAmount: 'Income Amount',
      description: 'Description',
      date: 'Date',
      incomeSave: 'Save Income',
      incomeUpdate: 'Update Income',
      incomes: 'Income',
      noIncome: 'No income records yet.',
      record: 'records',
      all: 'All',
      month: 'Month',
      custom: 'Custom',
      start: 'Start',
      end: 'End',
      selectedPeriod: 'Selected period',
      comfortable: 'Comfortable',
      deficit: 'Deficit',
      income: 'Income',
      expense: 'Expense',
      movements: 'Movements',
      noCashFlow: 'No expected cash movement in this date range.',
      planned: 'Planned',
      transactionDetails: 'Transaction Details',
      periodSummary: 'Period Summaries',
      personExpenses: 'Person-based expenses',
      monthlyHistory: 'Monthly spending history',
      currentMonth: 'THIS MONTH',
      future: 'FUTURE',
      noExpense: 'No expenses found for this person this month.',
      newTransaction: 'New Transaction',
      editTransaction: 'Edit Transaction',
      enterAmount: 'Enter amount',
      setDetails: 'Set details',
      monthlyReport: 'Monthly Report',
      net: 'Net',
      userBreakdown: 'User Breakdown',
      biggestTransactions: 'Largest Transactions',
      noTransaction: 'No transactions yet',
      ok: 'OK',
      success: 'Success!',
      cancel: 'Cancel',
      delete: 'Delete'
    }
  },
  welcome: {
    tips: {
      tr: [
        'Maaş yatar yatmaz önce birikim için ayırdığın tutarı kenara koy, kalanı harca.',
        'Aboneliklerini gözden geçir. Kullanmadığın dijital platformlara para ödeme.',
        'İndirim tuzağına düşme. İhtiyacın yoksa indirim kazanç değil, giderdir.',
        'Acil durum fonu oluştur. Kenarda en az 3 aylık giderin kadar nakit bulundur.'
      ],
      en: [
        'Set aside your savings first, then spend what remains.',
        'Review subscriptions you no longer use.',
        'A discount is not a saving if you did not need the item.',
        'Build an emergency fund for at least three months of expenses.'
      ]
    },
    copy: {
      tr: {
        locale: 'tr-TR',
        tipTitle: 'Günün İpucu',
        hello: 'Merhaba,',
        welcome: 'Hoş Geldin!',
        admin: 'Yönetici',
        subtitle: 'Finansal asistanın bugün senin için hazır.',
        languagePromptTitle: 'Dilini seç',
        languagePromptSub: 'Telefon diline göre otomatik seçtik. İstersen değiştirebilirsin.',
        quickMenu: 'Hızlı Menü',
        economy: 'Ekonomi',
        economySub: 'Gelir, gider ve birikim takibi',
        needs: 'İhtiyaçlar',
        needsSub: 'Alışveriş ve gereksinim listesi',
        events: 'Etkinlikler',
        eventsSub: 'Takvim, planlar ve hatırlatıcılar',
        family: 'Ailem',
        familySub: 'Aile üyeleri ve yönetim'
      },
      en: {
        locale: 'en-US',
        tipTitle: 'Money Tip',
        hello: 'Hello,',
        welcome: 'Welcome!',
        admin: 'Admin',
        subtitle: 'Your financial assistant is ready for today.',
        languagePromptTitle: 'Choose your language',
        languagePromptSub: 'We selected this based on your device language. You can change it anytime.',
        quickMenu: 'Quick Menu',
        economy: 'Economy',
        economySub: 'Income, expenses, and savings',
        needs: 'Needs',
        needsSub: 'Shopping and requirement list',
        events: 'Events',
        eventsSub: 'Calendar, plans, and reminders',
        family: 'Family',
        familySub: 'Family members and management'
      }
    }
  },
  needs: {
    commonItems: {
      tr: [
        { name: 'Süt', icon: '🥛' },
        { name: 'Ekmek', icon: '🍞' },
        { name: 'Yumurta', icon: '🥚' },
        { name: 'Peynir', icon: '🧀' },
        { name: 'Domates', icon: '🍅' },
        { name: 'Meyve', icon: '🍎' },
        { name: 'Kahve', icon: '☕' },
        { name: 'Deterjan', icon: '🧼' },
        { name: 'Tuvalet Kağıdı', icon: '🧻' },
        { name: 'Su', icon: '💧' }
      ],
      en: [
        { name: 'Milk', icon: '🥛' },
        { name: 'Bread', icon: '🍞' },
        { name: 'Eggs', icon: '🥚' },
        { name: 'Cheese', icon: '🧀' },
        { name: 'Tomatoes', icon: '🍅' },
        { name: 'Fruit', icon: '🍎' },
        { name: 'Coffee', icon: '☕' },
        { name: 'Detergent', icon: '🧼' },
        { name: 'Toilet Paper', icon: '🧻' },
        { name: 'Water', icon: '💧' }
      ]
    },
    copy: {
      tr: {
        title: 'İhtiyaç Listesi',
        placeholder: 'Ne lazım? (Örn: Süt)',
        loading: 'İhtiyaçlar hazırlanıyor...',
        empty: 'Listeniz boş.',
        completed: 'Tamamlananlar',
        familyMissing: 'Hata: Aile kimliği bulunamadı. Lütfen sayfayı yenileyin.',
        saveError: 'Hata (Kaydetme): ',
        unknownError: 'Bilinmeyen hata',
        tableMissing: "\n\nVeritabanında 'needs_list' tablosu eksik olabilir.",
        error: 'Hata: '
      },
      en: {
        title: 'Needs List',
        placeholder: 'What do you need? (Ex: Milk)',
        loading: 'Preparing your needs...',
        empty: 'Your list is empty.',
        completed: 'Completed',
        familyMissing: 'Error: Family ID was not found. Please refresh the page.',
        saveError: 'Save error: ',
        unknownError: 'Unknown error',
        tableMissing: "\n\nThe 'needs_list' table may be missing in the database.",
        error: 'Error: '
      }
    }
  },
  events: {
    tr: {
      back: 'Geri Dön',
      title: 'Etkinlik Ajandası',
      registered: 'Kayıtlı Etkinlik',
      event: 'Etkinlik',
      noPlan: 'Bugün için plan yok',
      createNew: 'Yeni bir kayıt oluştur',
      edit: 'DÜZENLE',
      newRecord: 'YENİ KAYIT',
      cancel: 'VAZGEÇ',
      titlePlaceholder: 'Etkinlik Başlığı',
      notesPlaceholder: 'Notlar (opsiyonel)',
      update: 'GÜNCELLE',
      add: 'EKLE',
      confirmTitle: 'Emin misiniz?',
      confirmSuffix: ' etkinliği silinecek. Bu işlem geri alınamaz.',
      delete: 'Sil',
      locale: 'tr-TR',
      weekdays: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    },
    en: {
      back: 'Go Back',
      title: 'Event Calendar',
      registered: 'Saved Events',
      event: 'Events',
      noPlan: 'No plans for today',
      createNew: 'Create a new event',
      edit: 'EDIT',
      newRecord: 'NEW EVENT',
      cancel: 'CANCEL',
      titlePlaceholder: 'Event Title',
      notesPlaceholder: 'Notes (optional)',
      update: 'UPDATE',
      add: 'ADD',
      confirmTitle: 'Are you sure?',
      confirmSuffix: ' will be deleted. This cannot be undone.',
      delete: 'Delete',
      locale: 'en-US',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  },
  family: {
    tr: {
      title: 'Aile Merkezi',
      defaultFamily: 'Aile Grubu',
      developerFamily: 'Geliştirici Ailesi',
      inviteCode: 'Davet Kodu',
      inviteNote: 'Bu kod ile üyeler ailenize katılabilir. Kodu yalnızca güvendiğiniz kişilerle paylaşın.',
      switchFamily: 'Aileyi Değiştir',
      switchSub: 'BAŞKA GRUBA GEÇ',
      signOut: 'Oturumu Kapat',
      signOutSub: 'GÜVENLİ ÇIKIŞ',
      footer: 'AİLE YÖNETİM MERKEZİ',
      shareText: 'AIEkonomi aile grubumuza katıl! Davet kodumuz:'
    },
    en: {
      title: 'Family Center',
      defaultFamily: 'Family Group',
      developerFamily: 'Developer Family',
      inviteCode: 'Invite Code',
      inviteNote: 'Members can join your family with this code. Share it only with people you trust.',
      switchFamily: 'Switch Family',
      switchSub: 'MOVE TO ANOTHER GROUP',
      signOut: 'Sign Out',
      signOutSub: 'SECURE SIGN OUT',
      footer: 'FAMILY MANAGEMENT CENTER',
      shareText: 'Join our AIEkonomi family group! Invite code:'
    }
  },
  settings: {
    tr: {
      management: 'Yönetim',
      fallbackFamily: 'Sistem ve Veri Yönetimi',
      developerFamily: 'Geliştirici Ailesi',
      languageTitle: 'Dil / Language',
      languageSub: 'Uygulama dili',
      currencyTitle: 'Para Birimi',
      currencySub: 'Tutarların ekranda gösterimi',
      peopleTitle: 'Kişiler',
      peopleSub: 'Bütçe sahiplerini yönet',
      cardsTitle: 'Kartlar',
      cardsSub: 'Ödeme yöntemlerini yönet',
      limitsTitle: 'Limitler',
      limitsSub: 'Aylık harcama limitlerini ayarla',
      incomesTitle: 'Gelirler',
      incomesSub: 'Kişi bazlı gelir girişi',
      notificationTitle: 'Bildirim Durumu',
      notificationActive: 'Aktif',
      enableNotifications: 'Bildirimleri Aç',
      notificationPermissionError: 'Bildirim izni alınamadı. Telefon ayarlarından uygulamanın bildirimlerine izin verdiğinizden emin olun.',
      announcementTitle: 'Aile Duyurusu',
      announcementAction: 'Duyuru Gönder',
      announcementSub: 'Tüm aileye bildirim gider',
      announcementPlaceholder: 'Mesajınızı buraya yazın...',
      announcementCancel: 'Vazgeç',
      announcementSent: 'Gönderildi!',
      announcementSendNow: 'Hemen Gönder',
      announcementError: 'Duyuru gönderilemedi. Lütfen tekrar deneyin.',
      resetTitle: 'Sıfırla',
      resetSub: 'Tüm verileri temizle',
      shareInviteText: 'AIEkonomi aile grubumuza katıl! Davet kodumuz:'
    },
    en: {
      management: 'Management',
      fallbackFamily: 'System and Data Management',
      developerFamily: 'Developer Family',
      languageTitle: 'Language',
      languageSub: 'App language',
      currencyTitle: 'Currency',
      currencySub: 'How amounts are displayed',
      peopleTitle: 'People',
      peopleSub: 'Manage budget owners',
      cardsTitle: 'Cards',
      cardsSub: 'Manage payment methods',
      limitsTitle: 'Limits',
      limitsSub: 'Set monthly spending limits',
      incomesTitle: 'Income',
      incomesSub: 'Add income by person',
      notificationTitle: 'Notification Status',
      notificationActive: 'Active',
      enableNotifications: 'Enable Notifications',
      notificationPermissionError: 'Notification permission could not be granted. Make sure notifications are allowed for the app in your phone settings.',
      announcementTitle: 'Family Announcement',
      announcementAction: 'Send Announcement',
      announcementSub: 'Notifies the whole family',
      announcementPlaceholder: 'Write your message here...',
      announcementCancel: 'Cancel',
      announcementSent: 'Sent!',
      announcementSendNow: 'Send Now',
      announcementError: 'Announcement could not be sent. Please try again.',
      resetTitle: 'Reset',
      resetSub: 'Clear all data',
      shareInviteText: 'Join our AIEkonomi family group! Invite code:'
    }
  }
};

export const getLocale = (language) => normalizeLanguage(language) === 'en' ? 'en-US' : 'tr-TR';

export const formatMoney = (value, { language = 'tr', currency = 'TRY', compact = false, maximumFractionDigits } = {}) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat(getLocale(language), {
    style: 'currency',
    currency: normalizeCurrency(currency),
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits
  }).format(amount);
};

export const formatDate = (value, { language = 'tr', ...options } = {}) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(getLocale(language), options);
};

export const getCurrencySymbol = (currency = 'TRY') => {
  return {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  }[normalizeCurrency(currency)];
};

export const translateFamilyName = (rawName, language, fallback) => {
  if (!rawName) return fallback;
  if (rawName === translations.family.tr.developerFamily) {
    return translations.family[normalizeLanguage(language)].developerFamily;
  }
  return rawName;
};
