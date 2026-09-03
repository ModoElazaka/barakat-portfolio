// =================== التهيئة ===================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎬 موقع Mahmoud Barakat محمل بنجاح!');

    // =================== القائمة المتحركة للجوال ===================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // إغلاق القائمة عند النقر على أي رابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // =================== تأثيرات الظهور عند التمرير ===================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // =================== تأثيرات العناصر ===================
    setupCardHoverEffects();
    setupStarRating();

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    const modal = document.getElementById('reviewFormModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeReviewForm();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeReviewForm();
            }
        });
    }

    // إعداد التمرير الأفقي للأقسام
    setupVideoSectionsScroll();
});

// تأثيرات عامة للبطاقات والصور
function setupCardHoverEffects() {
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('mouseenter', function () {
            this.style.transform = 'rotate(0deg) scale(1.05)';
            this.style.boxShadow = '0 40px 80px rgba(0, 0, 0, 0.5)';
        });

        profileImage.addEventListener('mouseleave', function () {
            this.style.transform = 'rotate(-3deg) scale(1)';
            this.style.boxShadow = 'var(--shadow-hover)';
        });
    }

    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        badge.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    document.querySelectorAll('.stat-item').forEach(stat => {
        stat.addEventListener('mouseenter', function () {
            const number = this.querySelector('.stat-number');
            if (number) {
                number.style.transform = 'scale(1.2)';
                number.style.transition = 'transform 0.3s ease';
            }
        });
        stat.addEventListener('mouseleave', function () {
            const number = this.querySelector('.stat-number');
            if (number) {
                number.style.transform = 'scale(1)';
            }
        });
    });
}

// دالة تُستدعى أيضاً من render.js بعد توليد الفيديوهات
function setupVideoHoverEffects() {
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        });
    });
}
window.setupVideoHoverEffects = setupVideoHoverEffects;

// =================== نظام التقييمات ===================
function setupStarRating() {
    const stars = document.querySelectorAll('.stars i');
    const ratingInput = document.getElementById('reviewRating');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            ratingValue.textContent = (document.documentElement.lang === 'en') ? `${rating} stars` : `${rating} نجوم`;

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });

        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                }
            });
        });

        star.addEventListener('mouseleave', function () {
            const currentRating = parseInt(ratingInput.value || 5);
            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });
}

function showReviewForm() {
    const modal = document.getElementById('reviewFormModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeReviewForm() {
    const modal = document.getElementById('reviewFormModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('reviewForm')?.reset();

        const stars = document.querySelectorAll('.stars i');
        stars.forEach((star, index) => {
            if (index < 5) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
}

function handleReviewSubmit(event) {
    event.preventDefault();
    alert((document.documentElement.lang === 'en')
        ? '🎉 Thanks for your review! It has been received successfully.'
        : '🎉 شكراً لتقييمك! تم استلام تقييمك بنجاح.');
    closeReviewForm();
}

window.showReviewForm = showReviewForm;
window.closeReviewForm = closeReviewForm;

// =================== السحب والتمرير الأفقي للأقسام ===================
function setupVideoSectionsScroll() {
    const videoSections = document.querySelectorAll('.category-section');

    videoSections.forEach(section => {
        const videosGrid = section.querySelector('.videos-grid');
        if (!videosGrid) return;

        function checkScrollable() {
            if (videosGrid.scrollWidth > videosGrid.clientWidth) {
                section.classList.add('scrollable');
            } else {
                section.classList.remove('scrollable');
            }
        }

        checkScrollable();
        window.addEventListener('resize', checkScrollable);

        setupSmoothScroll(videosGrid);
        addScrollButtons(videosGrid, section);
    });
}

function setupSmoothScroll(element) {
    let isDown = false;
    let startX, scrollLeft;

    element.addEventListener('mousedown', (e) => {
        isDown = true;
        element.classList.add('active');
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
        isDown = false;
        element.classList.remove('active');
    });

    element.addEventListener('mouseup', () => {
        isDown = false;
        element.classList.remove('active');
    });

    element.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = (x - startX) * 2;
        element.scrollLeft = scrollLeft - walk;
    });
}

function addScrollButtons(videosGrid, section) {
    if (section.querySelector('.scroll-btn.prev')) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'scroll-btn prev';
    prevBtn.setAttribute('type', 'button');
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'scroll-btn next';
    nextBtn.setAttribute('type', 'button');
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    section.style.position = 'relative';
    section.appendChild(prevBtn);
    section.appendChild(nextBtn);

    prevBtn.addEventListener('click', () => {
        videosGrid.scrollBy({ left: 300, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        videosGrid.scrollBy({ left: -300, behavior: 'smooth' });
    });
}