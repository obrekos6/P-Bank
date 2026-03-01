// ТВОИ КЛЮЧИ SUPABASE
const SUPABASE_URL = 'https://ggteikachpyvrvwzuprm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8kBJEESLUExfeHcaeVDr2Q_xCUFpO7k';

// Инициализация клиента (ВАЖНО: библиотека должна быть загружена в HTML)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("П-Банк: Система авторизации запущена!");

    const form = document.getElementById('auth-form');
    const passInput = document.getElementById('password');
    const toggleImg = document.getElementById('toggle-pass-img');
    const toggleLink = document.getElementById('toggle-link');
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('submit-btn');

    let isLogin = true;

    // 1. ЛОГИКА ГЛАЗА (Показать/Скрыть пароль)
    if (toggleImg) {
        toggleImg.onclick = () => {
            console.log("Нажат глаз");
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            // Проверь, чтобы файлы show.png и hide.png были в папке Auth
            toggleImg.src = isPass ? 'hide.png' : 'show.png';
        };
    }

    // 2. ПЕРЕКЛЮЧЕНИЕ РЕЖИМА (Вход / Регистрация)
    toggleLink.onclick = () => {
        isLogin = !isLogin;
        document.getElementById('auth-title').innerText = isLogin ? 'Вход в П-Банк' : 'Регистрация';
        submitBtn.innerText = isLogin ? 'Войти' : 'Создать';
        document.getElementById('toggle-text').innerText = isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?';
        toggleLink.innerText = isLogin ? 'Зарегистрироваться' : 'Войти';
        errorMsg.innerText = '';
    };

    // 3. ОТПРАВКА ФОРМЫ (Связь с базой данных)
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Загрузка...';
        errorMsg.innerText = '';

        const user = document.getElementById('username').value.trim();
        const pass = passInput.value;

        try {
            if (isLogin) {
                // ЛОГИКА ВХОДА
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('username', user)
                    .single();

                if (data && data.password === pass) {
                    console.log("Успешный вход!");
                    localStorage.setItem('pbank_current_user', user);
                    // Перенаправление в зависимости от роли
                    window.location.href = (user === 'admin') ? '../AdminPanel/admin.html' : '../MainPage/index.html';
                } else {
                    errorMsg.innerText = 'Неверный логин или пароль';
                }
            } else {
                // ЛОГИКА РЕГИСТРАЦИИ
                // Сначала проверяем, не занят ли логин
                const { data: checkUser } = await supabaseClient
                    .from('users')
                    .select('username')
                    .eq('username', user)
                    .single();
                
                if (checkUser) {
                    errorMsg.innerText = 'Этот логин уже занят';
                } else {
                    // Создаем нового пользователя с балансом 0
                    const { error: regError } = await supabaseClient
                        .from('users')
                        .insert([{ username: user, password: pass, balance: 0 }]);
                    
                    if (regError) throw regError;
                    
                    console.log("Регистрация успешна!");
                    localStorage.setItem('pbank_current_user', user);
                    window.location.href = '../MainPage/index.html';
                }
            }
        } catch (err) {
            console.error("Критическая ошибка:", err);
            errorMsg.innerText = 'Ошибка связи с облаком П-Банка';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = isLogin ? 'Войти' : 'Создать';
        }
    };
});
