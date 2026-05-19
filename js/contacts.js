document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('userName').value.trim();
            const phone = document.getElementById('userPhone').value.trim();
            const agreement = document.getElementById('agreementCheckbox').checked;

            if (!name || !phone || !agreement) {
                alert('Пожалуйста, заполните обязательные поля и согласие на обработку данных.');
                return;
            }

            alert(`Спасибо, ${name}! Ваша заявка успешно отправлена. Мы свяжемся с вами по телефону ${phone} в течение 10 минут.`);
            contactForm.reset();
        });
    }
});