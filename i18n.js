/*
  i18n.js
  ---------------------------------------------------------------
  يبدّل هذا الملف نصوص واجهة الموقع الثابتة بين العربية والإنجليزية.

  ملاحظة مهمة: هذا يترجم فقط النصوص الثابتة في تصميم الموقع (القوائم،
  العناوين، النماذج، الفوتر). لا يترجم:
  - عناوين الفيديوهات (من data.js / لوحة التحكم)
  - آراء العملاء ونصوصها (لأنها اقتباسات حقيقية من أشخاص حقيقيين)
  - أي قسم جديد يُضاف من لوحة التحكم (لأنه نص كتبه محمود بلغة واحدة فقط)
  ---------------------------------------------------------------
*/
(function () {
    "use strict";

    var LANG_KEY = "mb_site_lang";

    var TRANSLATIONS = {
        ar: {
            "nav.home": "الرئيسية",
            "nav.about": "عنّي",
            "nav.reels": "الريلز",
            "nav.long": "الفيديوهات الطويلة",
            "nav.reviews": "التقييمات",
            "nav.contact": "تواصل معي",

            "hero.intro": "محرر فيديو وموشن ديزاينر وصانع محتوى، متخصص في إنتاج فيديوهات قصيرة وطويلة بجودة عالية تناسب المنصات المختلفة. أمتلك خبرة في العمل مع عيادات طبية، علامات تجارية، وصناع محتوى من دول متعددة. أؤمن أن الفيديو الناجح لا يعتمد فقط على المونتاج، بل على فهم الرسالة وتحويلها إلى تجربة بصرية مؤثرة.",
            "hero.stat.years": "سنوات خبرة",
            "hero.stat.projects": "مشروع في 2025",
            "hero.stat.ontime": "تسليم في الوقت",
            "hero.stat.creativity": "إبداع مستمر",
            "hero.specialties.title": "تخصصاتي",
            "hero.specialties.1": "تحرير الفيديو الاحترافي",
            "hero.specialties.2": "تصميم موشن جرافيك",
            "hero.specialties.3": "صناعة الريلز والمحتوى القصير",
            "hero.specialties.4": "المحتوى التعليمي والتوضيحي",
            "hero.international.title": "العمل الدولي",
            "hero.country.eg": "مصر",
            "hero.country.sa": "السعودية",
            "hero.country.ae": "الإمارات",
            "hero.country.bh": "البحرين",
            "hero.badge.edu": "صانع محتوى تعليمي",
            "hero.badge.projects": "102 مشروع منجز في 2025",
            "hero.badge.ontime": "تسليم في الوقت المحدد",
            "hero.badge.editor": "محرر فيديو معتمد",
            "hero.worksNote": "جميع الأعمال المعروضه هي جزء صغير فقط من اعمالي التي راقت لي وليس بالضروره ان تكون راقت لك , لذا ان كنت تبحث عن شئ معين لا تتردد بمراسلتي",

            "reels.subtitle": "أعمالي في الريلز والمقاطع القصيرة",
            "long.subtitle": "أعمالي في الفيديوهات الطويلة",

            "reviews.title": "تقييمات العملاء",
            "reviews.subtitle": "ماذا قالوا عن أعمالي",
            "reviews.stats.title": "إحصائيات التقييمات",
            "reviews.stats.avg": "متوسط التقييم",
            "reviews.stats.clients": "عميل راضٍ",
            "reviews.stats.repeat": "مشاريع متكررة",
            "reviews.share.title": "شارك تجربتك",
            "reviews.share.text": "شارك تجربتك في العمل معي وساعد الآخرين في اتخاذ القرار",
            "reviews.share.button": "أضف تقييمك",

            "modal.title": "أضف تقييمك",
            "modal.name.label": "اسمك",
            "modal.name.placeholder": "ادخل اسمك",
            "modal.role.label": "وظيفتك/تخصصك",
            "modal.role.placeholder": "مثال: طبيب أسنان، مدير تسويق، إلخ",
            "modal.rating.label": "التقييم",
            "modal.rating.default": "5 نجوم",
            "modal.text.label": "تقييمك",
            "modal.text.placeholder": "اكتب تقييمك عن تجربة العمل معي...",
            "modal.project.label": "نوع المشروع",
            "modal.project.placeholder": "اختر نوع المشروع",
            "modal.submit": "نشر التقييم",
            "modal.cancel": "إلغاء",

            "contact.title": "تواصل معي",
            "contact.subtitle": "للمشاريع والتعاون والاستفسارات",
            "contact.email.label": "البريد الإلكتروني",
            "contact.phone.label": "الهاتف / واتساب",

            "footer.rights": "جميع الحقوق محفوظة.",
            "footer.tagline": "صنع بإبداع ❤️",
            "footer.version": "الإصدار 2.0 | تم التحديث:",
            "footer.dashboard": "لوحة التحكم",

            "player.loading": "جاري تحميل الفيديو...",
            "player.error.title": "تعذّر تشغيل الفيديو هنا",
            "player.error.generic": "قد يكون صاحب الفيديو قيّد تشغيله خارج منصته، أو أن هناك مشكلة مؤقتة. جرّب مشاهدته مباشرة من المصدر:",
            "player.watchOn": "مشاهدة على المنصة الأصلية"
        },
        en: {
            "nav.home": "Home",
            "nav.about": "About",
            "nav.reels": "Reels",
            "nav.long": "Long Videos",
            "nav.reviews": "Reviews",
            "nav.contact": "Contact",

            "hero.intro": "Video editor, motion designer, and content creator specializing in high-quality short and long-form videos for different platforms. I have experience working with medical clinics, brands, and content creators from multiple countries. I believe a successful video isn't just about editing — it's about understanding the message and turning it into an impactful visual experience.",
            "hero.stat.years": "Years experience",
            "hero.stat.projects": "Projects in 2025",
            "hero.stat.ontime": "On-time delivery",
            "hero.stat.creativity": "Continuous creativity",
            "hero.specialties.title": "My Specialties",
            "hero.specialties.1": "Professional video editing",
            "hero.specialties.2": "Motion graphics design",
            "hero.specialties.3": "Reels & short-form content",
            "hero.specialties.4": "Educational & explainer content",
            "hero.international.title": "International Work",
            "hero.country.eg": "Egypt",
            "hero.country.sa": "Saudi Arabia",
            "hero.country.ae": "UAE",
            "hero.country.bh": "Bahrain",
            "hero.badge.edu": "Educational content creator",
            "hero.badge.projects": "102 projects completed in 2025",
            "hero.badge.ontime": "On-time delivery",
            "hero.badge.editor": "Certified video editor",
            "hero.worksNote": "Everything shown here is just a small part of the work I've enjoyed doing — it won't necessarily match what you're looking for, so if you have something specific in mind, don't hesitate to reach out.",

            "reels.subtitle": "My reels and short-form work",
            "long.subtitle": "My long-form video work",

            "reviews.title": "Client Reviews",
            "reviews.subtitle": "What they said about my work",
            "reviews.stats.title": "Review Statistics",
            "reviews.stats.avg": "Average rating",
            "reviews.stats.clients": "Happy clients",
            "reviews.stats.repeat": "Repeat projects",
            "reviews.share.title": "Share your experience",
            "reviews.share.text": "Share your experience working with me and help others decide",
            "reviews.share.button": "Add your review",

            "modal.title": "Add Your Review",
            "modal.name.label": "Your name",
            "modal.name.placeholder": "Enter your name",
            "modal.role.label": "Your role / specialty",
            "modal.role.placeholder": "e.g. Dentist, Marketing Manager, etc.",
            "modal.rating.label": "Rating",
            "modal.rating.default": "5 stars",
            "modal.text.label": "Your review",
            "modal.text.placeholder": "Write about your experience working with me...",
            "modal.project.label": "Project type",
            "modal.project.placeholder": "Select project type",
            "modal.submit": "Post Review",
            "modal.cancel": "Cancel",

            "contact.title": "Contact Me",
            "contact.subtitle": "For projects, collaborations, and inquiries",
            "contact.email.label": "Email",
            "contact.phone.label": "Phone / WhatsApp",

            "footer.rights": "All rights reserved.",
            "footer.tagline": "Made with creativity ❤️",
            "footer.version": "Version 2.0 | Last updated:",
            "footer.dashboard": "Dashboard",

            "player.loading": "Loading video...",
            "player.error.title": "This video can't be played here",
            "player.error.generic": "The video owner may have restricted playback outside their platform, or there's a temporary issue. Try watching it directly from the source:",
            "player.watchOn": "Watch on original platform"
        }
    };

    function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSet(key, val) {
        try { localStorage.setItem(key, val); } catch (e) { /* تجاهل بأمان */ }
    }

    function applyLanguage(lang) {
        var dict = TRANSLATIONS[lang] || TRANSLATIONS.ar;
        var isEn = lang === "en";

        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", isEn ? "ltr" : "rtl");

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            if (dict[key] != null) el.textContent = dict[key];
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var key = el.getAttribute("data-i18n-placeholder");
            if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
        });

        var label = document.getElementById("langToggleLabel");
        if (label) label.textContent = isEn ? "عربي" : "EN";

        var toggleBtn = document.getElementById("langToggle");
        if (toggleBtn) toggleBtn.setAttribute("title", isEn ? "التبديل للعربية" : "Switch to English");

        window.MB_LANG = lang;
    }

    function currentLang() {
        return safeGet(LANG_KEY) === "en" ? "en" : "ar";
    }

    function init() {
        applyLanguage(currentLang());

        var toggleBtn = document.getElementById("langToggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", function () {
                var next = currentLang() === "en" ? "ar" : "en";
                safeSet(LANG_KEY, next);
                applyLanguage(next);
            });
        }
    }

    window.MB_APPLY_LANGUAGE = applyLanguage;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
