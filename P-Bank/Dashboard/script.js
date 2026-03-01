document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('pbank_current_user');
    const users = JSON.parse(localStorage.getItem('pbank_users')) || {};

    // 1. Проверка входа
    if (!user || !users[user]) {
        window.location.href = '../Auth/auth.html';
        return;
    }

    // 2. Отображение данных
    document.getElementById('nav-username').innerText = user;
    document.getElementById('welcome-name').innerText = user;
    document.getElementById('card-holder-name').innerText = user.toUpperCase();
    
    // Форматирование баланса (добавляем пробелы в числа)
    const balance = users[user].balance || 0;
    document.getElementById('balance-amount').innerText = balance.toLocaleString();

    // 3. Дата
    const options = { day: 'numeric', month: 'long' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('ru-RU', options);
});

function logout() {
    localStorage.removeItem('pbank_current_user');
    window.location.href = '../MainPage/index.html';
}

function openTransfer() {
    // В будущем тут можно сделать полноценное окно
    const target = prompt("Введите логин получателя:");
    if (target) {
        alert("Функция перевода в СП-Союзе временно на тех-обслуживании. Попробуйте позже!");
    }
}
