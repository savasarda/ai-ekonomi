import { supabase } from './supabaseClient';

/**
 * AIEkonomi Debug Logger
 * Sessizce hataları toplar ve Supabase 'debug_logs' tablosuna gönderir.
 */
export const logger = {
    async log(level, message, details = {}) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Konsola da yazalım (Geliştirme aşamasında görmen için)
            if (level === 'error') console.error(`[Shield] ${message}`, details);
            else if (level === 'warn') console.warn(`[Shield] ${message}`, details);

            await supabase.from('debug_logs').insert({
                level,
                message,
                details,
                user_id: session?.user?.id || null,
                page_url: window.location.href
            });
        } catch (e) {
            // Logger'ın kendisi hata verirse uygulamayı bozmasın
            console.warn('Logger error:', e);
        }
    },

    error(message, details) { this.log('error', message, details); },
    warn(message, details) { this.log('warn', message, details); },
    info(message, details) { this.log('info', message, details); }
};

// Global hata yakalayıcı
if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
        logger.error('Uncaught Runtime Error', {
            message,
            source,
            lineno,
            colno,
            stack: error?.stack
        });
    };

    window.onunhandledrejection = (event) => {
        logger.error('Unhandled Promise Rejection', {
            reason: event.reason
        });
    };
}
