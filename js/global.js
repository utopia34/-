document.addEventListener('DOMContentLoaded', () => {
    function showNotification(message, icon = '✨') {
        const toast = document.getElementById('customToast');
        const toastMsg = document.getElementById('toastMessage');
        if (toast && toastMsg) {
            const toastIcon = toast.querySelector('.toast-icon');
            toastMsg.textContent = message;
            toastIcon.textContent = icon;
            if (message.includes('не найден') || message.includes('не совпадает')) {
                toast.style.borderLeftColor = '#ef4444';
                toastIcon.textContent = '❌';
            } else {
                toast.style.borderLeftColor = '#ff9e1b';
            }
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        } else {
            alert(message);
        }
    }

    const modalHTML = `
        <div class="status-modal-overlay" id="statusModal">
            <div class="status-modal-window">
                <button class="status-modal-close" id="closeModalCross">&times;</button>
                <div class="modal-state active" id="modalStateInput">
                    <h2>Узнать статус ремонта</h2>
                    <p class="modal-subtitle">Введите данные из вашей квитанции, чтобы проверить, на каком этапе находится ваше устройство.</p>
                    <form class="modal-form" id="modalStatusForm">
                        <div class="modal-group">
                            <label for="modalOrderNum">Номер квитанции (заказа):</label>
                            <input type="text" id="modalOrderNum" placeholder="" required>
                        </div>
                        <div class="modal-group">
                            <label for="modalPhone">Номер телефона:</label>
                            <input type="tel" id="modalPhone" placeholder="+7 (___) ___-__-__" required>
                        </div>
                        <button type="submit" class="modal-submit-btn">Проверить статус</button>
                    </form>
                    <p class="modal-hint"><strong>Где найти номер?</strong> Номер указан в правом верхнем углу квитанции.</p>
                </div>
                <div class="modal-state" id="modalStateResult">
                    <h2 id="resOrderTitle">Заказ</h2>
                    <div class="result-device-info">
                        <strong>Устройство:</strong> <span id="resDeviceName"></span>
                    </div>
                    <div class="status-badge" id="resStatusBadge">
                        <span class="status-icon"></span>
                        <span class="status-text"></span>
                    </div>
                    <div class="result-details">
                        <p><strong>Согласованная стоимость:</strong> <span id="resPrice"></span></p>
                        <p><strong>Комментарий мастера:</strong> <span id="resComment"></span></p>
                    </div>
                    <button class="modal-close-btn" id="closeModalBtn">Закрыть окно</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('statusModal');
    const stateInput = document.getElementById('modalStateInput');
    const stateResult = document.getElementById('modalStateResult');
    const form = document.getElementById('modalStatusForm');
    const phoneInput = document.getElementById('modalPhone');
    const crossClose = document.getElementById('closeModalCross');
    const btnClose = document.getElementById('closeModalBtn');

    const db_clients = [
        { id: 1, full_name: 'Алексей Петров', phone: '79991234567' },
        { id: 2, full_name: 'Мария Сидорова', phone: '79051112233' },
        { id: 3, full_name: 'Дмитрий Волков', phone: '79175554433' }
    ];

    const db_statuses = [
        { id: 1, code: 'ready', name: '🟢 ГОТОВ К ВЫДАЧЕ', icon: '🟢' },
        { id: 2, code: 'in_progress', name: '🛠 В процессе ремонта', icon: '🛠' },
        { id: 3, code: 'diagnostic', name: '🔍 На диагностике', icon: '🔍' },
        { id: 4, code: 'accepted', name: '🟡 Принят в ремонт', icon: '🟡' },
        { id: 5, code: 'parts_waiting', name: '⏳ Ожидает запчастей', icon: '⏳' }
    ];

    const db_orders = [
        {
            id: 1254,
            client_id: 1,
            device_name: 'Ноутбук ASUS VivoBook 15',
            status_id: 1,
            price: 2500,
            master_comment: 'Ремонт успешно завершен. Произведена замена кулера системы охлаждения, устройство протестировано.'
        },
        {
            id: 1255,
            client_id: 2,
            device_name: 'Смартфон iPhone 13',
            status_id: 2,
            price: 4500,
            master_comment: 'Мастер производит замену оригинального дисплейного модуля. Работа будет завершена сегодня до вечера.'
        },
        {
            id: 1256,
            client_id: 3,
            device_name: 'Игровая приставка PlayStation 5',
            status_id: 3,
            price: 0,
            master_comment: 'Устройство на рабочем столе инженера. Проверяется цепь питания материнской платы после скачка напряжения.'
        },
        {
            id: 1257,
            client_id: 1,
            device_name: 'Планшет iPad Air 2022',
            status_id: 5,
            price: 6800,
            master_comment: 'Новый аккумулятор заказан со склада поставщика. Ориентировочная дата доставки детали — четверг.'
        }
    ];

    const openModal = () => {
        stateInput.classList.add('active');
        stateResult.classList.remove('active');
        if (form) form.reset();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const statusBtns = document.querySelectorAll('#orderStatusBtn, #orderStatusBtnFooter');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    crossClose.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    phoneInput.addEventListener('input', (e) => {
        let matrix = "+7 (___) ___-__-__",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = phoneInput.value.replace(/\D/g, "");
        if (def.length >= val.length) val = def;
        phoneInput.value = matrix.replace(/./g, function(a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const orderNum = parseInt(document.getElementById('modalOrderNum').value.trim(), 10);
        const phone = document.getElementById('modalPhone').value.trim();
        const cleanPhone = phone.replace(/\D/g, "");

        const order = db_orders.find(o => o.id === orderNum);

        if (!order) {
            showNotification('Заказ с таким номером не найден.', '❌');
            return;
        }

        const client = db_clients.find(c => c.id === order.client_id);

        if (client && client.phone.slice(-10) === cleanPhone.slice(-10)) {
            const status = db_statuses.find(s => s.id === order.status_id);

            document.getElementById('resOrderTitle').textContent = `Заказ №${order.id}`;
            document.getElementById('resDeviceName').textContent = order.device_name;
            document.getElementById('resPrice').textContent = order.price === 0 ? 'Не согласована' : order.price.toLocaleString() + ' руб.';
            document.getElementById('resComment').textContent = order.master_comment;

            const badge = document.getElementById('resStatusBadge');
            badge.className = `status-badge status-${status.code}`;
            badge.querySelector('.status-icon').textContent = status.icon;
            badge.querySelector('.status-text').textContent = status.name;

            stateInput.classList.remove('active');
            stateResult.classList.add('active');
        } else {
            showNotification('Номер телефона не совпадает с указанным при приёмке.', '❌');
        }
    });

    const feedbackForm = document.getElementById('feedbackForm');

    if (feedbackForm) {
        const feedbackPhoneInput = document.getElementById('clientPhone');
        if (feedbackPhoneInput) {
            feedbackPhoneInput.addEventListener('input', (e) => {
                let matrix = "+7 (___) ___-__-__",
                    i = 0,
                    def = matrix.replace(/\D/g, ""),
                    val = feedbackPhoneInput.value.replace(/\D/g, "");
                if (def.length >= val.length) val = def;
                feedbackPhoneInput.value = matrix.replace(/./g, function(a) {
                    return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
                });
            });
        }

        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('clientName').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const message = document.getElementById('problemDesc').value.trim();

            const mockRequestData = {
                table: "feedback_requests",
                action: "INSERT",
                data: {
                    id: Math.floor(Math.random() * 1000) + 1,
                    client_name: name,
                    client_phone: phone.replace(/\D/g, ""),
                    problem_description: message || "Не указано",
                    status: "Новая",
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                }
            };

            console.log("%c[БД Эмуляция] Запрос на запись в таблицу feedback_requests:", "color: #fca311; font-weight: bold;", mockRequestData);

            showNotification(`Спасибо, ${name}! Заявка принята, мы перезвоним вам.`, '✅');

            feedbackForm.reset();
        });
    }
});

const scrollBtn = document.getElementById('scrollTopBtn');

if (scrollBtn) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
