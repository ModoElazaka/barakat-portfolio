// =================== التهيئة ===================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎬 موقع Hoda محمل بنجاح!');

    // =================== القائمة المتحركة للجوال ===================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
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

    // =================== تأثيرات Hover ===================
    // تأثيرات للصورة
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

    // تأثيرات للبادجات
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });

        badge.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // تأثيرات للإحصائيات
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

    // تأثيرات للفيديوهات
    setupVideoHoverEffects();

    // تحميل بيانات الفيديوهات
    displaySampleVideos();
});

// =================== تأثيرات Hover للفيديوهات ===================
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

// =================== بيانات الفيديوهات الثابتة ===================
function displaySampleVideos() {
    // بيانات الفيديوهات المرجعية
    const sampleVideos = {
        dental: [
            {
                id: "WC8_VLThbKI",
                platform: "youtube",
                thumbnail: "https://img.youtube.com/vi/WC8_VLThbKI/hqdefault.jpg",
                title: "فيديو طب الأسنان المرجعي"
            }
        ],
        clinics: [
            {
                id: "C0DPdy98e4c",
                platform: "youtube",
                thumbnail: "https://img.youtube.com/vi/C0DPdy98e4c/hqdefault.jpg",
                title: "فيديو عيادة تجميل"
            }
        ],
        motion: [
            {
                id: "dQw4w9WgXcQ",
                platform: "youtube",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                title: "موشن جرافيك مع تعليق صوتي"
            }
        ],
        longVideos: [
            {
                id: "9bZkp7q19f0",
                platform: "youtube",
                thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
                title: "فيديو طويل توضيحي للمشاريع الكبيرة",
                showTitle: true
            }
        ]
    };

    console.log('📺 بيانات الفيديوهات المرجعية جاهزة:', sampleVideos);
}

// =================== دالة لإضافة فيديو جديد ===================
function addNewVideo(category, videoData) {
    // هذه دالة مساعدة يمكن استخدامها لإضافة فيديوهات جديدة يدوياً
    console.log(`➕ إضافة فيديو جديد في قسم ${category}:`, videoData);

    // مثال على استخدام:
    /*
    const newVideo = {
        id: "VIDEO_ID_HERE",
        platform: "youtube", // أو "instagram"
        thumbnail: "URL_TO_THUMBNAIL",
        title: "عنوان الفيديو"
    };
    addNewVideo("dental", newVideo);
    */
}

// =================== دالة توليد كود الفيديو ===================
function generateVideoHTML(videoData, category) {
    // توليد كود HTML لفيديو جديد
    const isLongVideo = category === 'longVideos';

    return `
        <div class="video-card ${isLongVideo ? 'long-video' : 'reels-video'}">
            <div class="video-thumbnail">
                <img src="${videoData.thumbnail}" 
                     alt="${videoData.title}" 
                     loading="lazy">
                <div class="play-btn" onclick="playVideo('${videoData.id}', '${videoData.platform}', '${videoData.title}')">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-overlay"></div>
            </div>
            ${isLongVideo && videoData.showTitle ? `
                <div class="video-info">
                    <h4>${videoData.title}</h4>
                </div>
            ` : ''}
            <div class="video-help">
                <i class="fas fa-info-circle"></i> فيديو مضافة يدوياً
            </div>
        </div>
    `;
}

// =================== قسم التقييمات ===================

// إعداد النجوم للتقييم
function setupStarRating() {
    const stars = document.querySelectorAll('.stars i');
    const ratingInput = document.getElementById('reviewRating');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            ratingValue.textContent = `${rating} نجوم`;

            // تحديث النجوم
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

        // تأثير hover
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
            const currentRating = parseInt(ratingInput.value);

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

// عرض نموذج إضافة تقييم
function showReviewForm() {
    const modal = document.getElementById('reviewFormModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// إغلاق نموذج إضافة تقييم
function closeReviewForm() {
    const modal = document.getElementById('reviewFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('reviewForm').reset();

    // إعادة تعيين النجوم
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

// معالجة إرسال التقييم
function handleReviewSubmit(event) {
    event.preventDefault();

    const reviewerName = document.getElementById('reviewerName').value;
    const reviewerTitle = document.getElementById('reviewerTitle').value;
    const reviewRating = parseInt(document.getElementById('reviewRating').value);
    const reviewText = document.getElementById('reviewText').value;
    const reviewProject = document.getElementById('reviewProject').value;

    // يمكنك هنا إرسال البيانات لخادم أو حفظها محلياً
    console.log('📝 تقييم جديد:', {
        reviewerName,
        reviewerTitle,
        reviewRating,
        reviewText,
        reviewProject,
        date: new Date().toLocaleDateString('ar-EG')
    });

    // عرض رسالة نجاح
    alert('🎉 شكراً لتقييمك! تم استلام تقييمك بنجاح.');

    // إغلاق النموذج
    closeReviewForm();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    // إعداد النجوم
    setupStarRating();

    // إعداد نموذج التقييم
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    // إغلاق النموذج عند النقر خارج المحتوى
    const modal = document.getElementById('reviewFormModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeReviewForm();
            }
        });

        // إغلاق بالزر ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeReviewForm();
            }
        });
    }

    // تأثيرات للبطاقات
    setupReviewCardsEffects();
});

// تأثيرات لبطاقات التقييمات
function setupReviewCardsEffects() {
    document.querySelectorAll('.review-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// دالة لإضافة تقييم جديد (للاستخدام اليدوي)
function addReviewToPage(reviewData) {
    /*
    reviewData يجب أن يكون كائن يحتوي على:
    {
        name: "اسم العميل",
        title: "وظيفته/تخصصه",
        rating: 5, // من 1-5
        text: "نص التقييم",
        project: "نوع المشروع",
        date: "التاريخ"
    }
    */

    const reviewsContainer = document.querySelector('.reviews-container');
    if (!reviewsContainer) return;

    const newReview = document.createElement('div');
    newReview.className = 'review-card';
    newReview.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="reviewer-details">
                    <h4>${reviewData.name}</h4>
                    <span class="reviewer-title">${reviewData.title}</span>
                </div>
            </div>
            <div class="review-rating">
                ${getStarsHTML(reviewData.rating)}
                <span class="rating-text">${reviewData.rating}/5</span>
            </div>
        </div>
        
        <div class="review-content">
            <p class="review-text">${reviewData.text}</p>
        </div>
        
        <div class="review-footer">
            <span class="review-date">
                <i class="fas fa-calendar"></i> ${reviewData.date}
            </span>
            <span class="review-project">
                <i class="fas fa-video"></i> ${reviewData.project}
            </span>
        </div>
    `;

    reviewsContainer.appendChild(newReview);
    setupReviewCardsEffects();
}

// دالة مساعدة لإنشاء النجوم
function getStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    return starsHTML;
}

// مثال على استخدام إضافة تقييم يدوياً
/*
const newReview = {
    name: "أحمد محمد",
    title: "صاحب مركز تدريب",
    rating: 5,
    text: "عمل ممتاز واحترافية عالية في التسليم والتنفيذ.",
    project: "دورة تدريبية",
    date: "يناير 2024"
};
addReviewToPage(newReview);
*/


// =================== تحسينات الـ Scroll للفيديوهات ===================

// إعداد الـ Scroll للأقسام
function setupVideoSectionsScroll() {
    const videoSections = document.querySelectorAll('.category-section');

    videoSections.forEach(section => {
        const videosGrid = section.querySelector('.videos-grid');

        if (!videosGrid) return;

        // التحقق إذا كان هناك تمرير أفقي متاح
        function checkScrollable() {
            const isScrollable = videosGrid.scrollWidth > videosGrid.clientWidth;

            if (isScrollable) {
                section.classList.add('scrollable');
                addScrollHint(section);
            } else {
                section.classList.remove('scrollable');
                removeScrollHint(section);
            }
        }

        // إضافة تلميحات التمرير
        function addScrollHint(sectionElement) {
            if (!sectionElement.querySelector('.scroll-hint')) {
                const hint = document.createElement('div');
                hint.className = 'scroll-hint';
                hint.innerHTML = '<i class="fas fa-arrow-left"></i> اسحب لرؤية المزيد';
                sectionElement.appendChild(hint);
            }
        }

        function removeScrollHint(sectionElement) {
            const hint = sectionElement.querySelector('.scroll-hint');
            if (hint) {
                hint.remove();
            }
        }

        // التحقق عند تحميل الصفحة وعند تغيير الحجم
        checkScrollable();
        window.addEventListener('resize', checkScrollable);

        // تأثيرات التمرير السلس
        setupSmoothScroll(videosGrid);

        // إضافة أزرار التنقل للتمرير (اختياري)
        addScrollButtons(videosGrid, section);
    });
}

// إعداد التمرير السلس
function setupSmoothScroll(element) {
    let isDown = false;
    let startX;
    let scrollLeft;

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

    // دعم اللمس للأجهزة المحمولة
    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
    });

    element.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const x = e.touches[0].pageX - element.offsetLeft;
        const walk = (x - startX) * 2;
        element.scrollLeft = scrollLeft - walk;
    });
}

// إضافة أزرار التنقل للتمرير (اختياري)
function addScrollButtons(videosGrid, section) {
    // إزالة أي أزرار موجودة مسبقاً
    const existingPrev = section.querySelector('.scroll-btn.prev');
    const existingNext = section.querySelector('.scroll-btn.next');
    if (existingPrev) existingPrev.remove();
    if (existingNext) existingNext.remove();

    // إنشاء أزرار التنقل
    const prevBtn = document.createElement('button');
    prevBtn.className = 'scroll-btn prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    prevBtn.title = 'السابق';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'scroll-btn next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    nextBtn.title = 'التالي';

    // إضافة الأزرار إلى القسم
    section.style.position = 'relative';
    section.appendChild(prevBtn);
    section.appendChild(nextBtn);

    // أحداث النقر على الأزرار
    prevBtn.addEventListener('click', () => {
        videosGrid.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        videosGrid.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    // إظهار/إخفاء الأزرار بناءً على موضع التمرير
    function updateButtons() {
        const scrollLeft = videosGrid.scrollLeft;
        const scrollWidth = videosGrid.scrollWidth;
        const clientWidth = videosGrid.clientWidth;

        prevBtn.style.opacity = scrollLeft > 0 ? '1' : '0.3';
        nextBtn.style.opacity = scrollLeft < (scrollWidth - clientWidth - 10) ? '1' : '0.3';
    }

    videosGrid.addEventListener('scroll', updateButtons);
    updateButtons();

    // إخفاء الأزرار على الشاشات الكبيرة
    const mediaQuery = window.matchMedia('(min-width: 769px)');
    function handleMediaChange(e) {
        if (e.matches) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }

    mediaQuery.addListener(handleMediaChange);
    handleMediaChange(mediaQuery);
}

// تحديث تنسيقات أزرار التنقل
const scrollButtonsStyles = `
    .scroll-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
    }
    
    .scroll-btn:hover {
        background: rgba(59, 130, 246, 0.9);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    
    .scroll-btn.prev {
        right: 10px;
    }
    
    .scroll-btn.next {
        left: 10px;
    }
    
    @media (max-width: 768px) {
        .scroll-btn {
            display: flex;
        }
    }
    
    @media (min-width: 769px) {
        .scroll-btn {
            display: none;
        }
    }
`;

// إضافة الأنماط لأزرار التنقل
const styleSheet = document.createElement('style');
styleSheet.textContent = scrollButtonsStyles;
document.head.appendChild(styleSheet);

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    setupVideoSectionsScroll();

    // تحديث بعد تحميل الفيديوهات
    setTimeout(setupVideoSectionsScroll, 1000);
});

// تحديث عند تغيير حجم النافذة
window.addEventListener('resize', function () {
    setTimeout(setupVideoSectionsScroll, 300);
});

