// --- Supabase initialization and helpers ---
let supabaseClient = null;

async function initSupabase() {
    try {
        const url = (typeof SUPABASE_URL !== 'undefined') ? SUPABASE_URL : null;
        const key = (typeof SUPABASE_ANON_KEY !== 'undefined') ? SUPABASE_ANON_KEY : null;

        if (!url || !key) {
            console.warn('Supabase config not found. Create supabase-config.js from supabase-config.example.js');
            return;
        }

        // Ensure the Supabase library is available. If not, try to load it dynamically.
        if (typeof supabase === 'undefined') {
            console.warn('Supabase global not found. Attempting to load CDN library(s)...');
            const cdns = [
                // Prefer a local copy if you've downloaded it to MainPage/supabase.min.js
                './supabase.min.js',
                'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js',
                'https://unpkg.com/@supabase/supabase-js@2/dist/supabase.min.js',
                'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.js'
            ];
            let loaded = false;
            for (const url of cdns) {
                try {
                    await loadScript(url, 8000);
                    if (typeof supabase !== 'undefined') {
                        console.log('Loaded Supabase from', url);
                        loaded = true;
                        break;
                    }
                } catch (err) {
                    console.warn('Failed to load', url, err && err.message ? err.message : err);
                }
            }
            if (!loaded) {
                throw new Error('Supabase library failed to load from known CDNs or was blocked by network/extension.');
            }
        }

        supabaseClient = supabase.createClient(url, key);

        // quick connectivity test: try a lightweight select on a likely table
        const testTable = 'users';
        for (let attempt = 1; attempt <= 4; attempt++) {
            const { data, error } = await supabaseClient.from(testTable).select('id').limit(1);
            if (!error) {
                console.log('Supabase connected (table query OK)');
                return;
            }
            console.warn(`Supabase query attempt ${attempt} failed:`, error.message || error);
            // small backoff
            await new Promise(r => setTimeout(r, 300 * attempt));
        }
        console.error('Supabase appears unreachable after retries. Check network/credentials/CORS.');
    } catch (e) {
        console.error('Error initializing Supabase:', e);
    }
}

// Simple script loader used as a fallback when CDN wasn't loaded via HTML
function loadScript(src, timeout = 6000) {
    return new Promise((resolve, reject) => {
        try {
            const s = document.createElement('script');
            let done = false;
            const timer = setTimeout(() => {
                if (done) return;
                done = true;
                s.remove();
                reject(new Error('Script load timeout: ' + src));
            }, timeout);

            s.src = src;
            s.async = true;
            s.onload = () => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve();
            };
            s.onerror = (err) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                s.remove();
                reject(new Error('Failed to load script: ' + src));
            };
            document.head.appendChild(s);
        } catch (err) {
            reject(err);
        }
    });
}

// Call initialization before running other DOM code that may depend on Supabase
document.addEventListener('DOMContentLoaded', async () => {
    await initSupabase();
    updateAccountMenu();
});

function updateAccountMenu() {
    const user = localStorage.getItem('pbank_current_user');
    const dropdown = document.getElementById('account-dropdown');
    
    if (user) {
        // Если пользователь в системе
        const isAdmin = (user === 'admin');
        dropdown.innerHTML = `
            <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #f0f0f0">
                <span style="font-size:12px; color:#aaa">Пользователь</span><br>
                <b style="font-size:18px; color:#9013FE">${user}</b>
            </div>
            <a href="../Dashboard/dashboard.html" class="menu-link">💳 Личный кабинет</a>
            <a href="#" class="menu-link" onclick="alert('Раздел переводов в разработке')">💸 Перевести</a>
            ${isAdmin ? `<a href="../AdminPanel/admin.html" class="menu-link" style="color:#4A90E2">⚙ Админ-панель</a>` : ''}
            <hr style="border:0; border-top:1px solid #eee; margin:10px 0">
            <a href="#" onclick="logout()" style="color:red; font-size:13px; text-decoration:none; font-weight:600">Выйти из системы</a>
        `;
    } else {
        // Если гость
        dropdown.innerHTML = `
            <p style="font-size:14px; color:#666; margin-bottom:15px">Войдите, чтобы управлять счетами и картами</p>
            <a href="../Auth/auth.html" class="btn-auth-box">Войти</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('pbank_current_user');
    location.reload();
}
