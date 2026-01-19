export const initialData = {
    users: [
        { id: 'u1', name: 'Arda', color: 'bg-blue-100 text-blue-800' },
        { id: 'u2', name: 'Gamze', color: 'bg-pink-100 text-pink-800' },
    ],
    accounts: [
        { id: 'a1', userId: 'u1', name: 'Garanti' },
        { id: 'a2', userId: 'u1', name: 'OLD Yapıkredi' },
        { id: 'a3', userId: 'u1', name: 'New Yapıkredi' },
        { id: 'a4', userId: 'u2', name: 'Garanti' },
        { id: 'a5', userId: 'u2', name: 'Yapıkredi' },
    ],
    transactions: [
        // Arda Garanti
        { id: 't1', accountId: 'a1', amount: 54529.82, date: '2025-12-21', description: 'Güncel Dönem Borcu', type: 'debt' },
        { id: 't2', accountId: 'a1', amount: 4898.60, date: '2026-02-01', description: 'Şubat Taksiti', type: 'installment' },
        { id: 't3', accountId: 'a1', amount: 4898.60, date: '2026-03-01', description: 'Mart Taksiti', type: 'installment' },

        // Gamze Garanti
        { id: 't4', accountId: 'a4', amount: 13095.60, date: '2025-12-21', description: 'Güncel Dönem Borcu', type: 'debt' },
        { id: 't5', accountId: 'a4', amount: 2304.54, date: '2026-02-01', description: 'Şubat Taksiti', type: 'installment' },

        // Gamze Yapıkredi
        { id: 't6', accountId: 'a5', amount: 55.00, date: '2025-12-21', description: 'Güncel Dönem Borcu', type: 'debt' },
    ]
};
