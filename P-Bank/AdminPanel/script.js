const SUPABASE_URL = 'https://ggteikachpyvrvwzuprm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8kBJEESLUExfeHcaeVDr2Q_xCUFpO7k';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadUsers() {
    const user = localStorage.getItem('pbank_current_user');
    if (user !== 'admin') { window.location.href = '../MainPage/index.html'; return; }

    const { data: users, error } = await supabaseClient.from('users').select('*');
    if (error) return console.error(error);

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    users.forEach(u => {
        if(u.username === 'admin') return;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.username}</td>
            <td>${(u.balance || 0).toLocaleString()} П-₽</td>
            <td><input type="number" id="in-${u.username}" placeholder="Сумма"></td>
            <td><button class="btn-save" onclick="updateBal('${u.username}')">Ок</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.updateBal = async (name) => {
    const val = parseInt(document.getElementById('in-'+name).value);
    if (isNaN(val)) return alert('Введите число');
    
    const { error } = await supabaseClient.from('users').update({ balance: val }).eq('username', name);
    if (!error) {
        alert('Баланс для ' + name + ' обновлен!');
        loadUsers();
    }
};

loadUsers();
