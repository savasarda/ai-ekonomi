import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from workspace root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function viewLogs() {
    console.log('--- AIEkonomi Production Shield Logs ---');
    
    const { data: logs, error } = await supabase
        .from('debug_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Failed to fetch logs:', error.message);
        return;
    }

    if (logs.length === 0) {
        console.log('No recent logs found.');
        return;
    }

    logs.forEach(log => {
        const date = new Date(log.created_at).toLocaleString('tr-TR');
        console.log(`[${date}] [${log.level.toUpperCase()}] ${log.message}`);
        if (log.details) {
            console.log('Details:', JSON.stringify(log.details, null, 2));
        }
        console.log('---');
    });
}

viewLogs();
