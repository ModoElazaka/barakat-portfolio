/*
  i18n.js — تبديل نصوص الواجهة الثابتة بين العربية والإنجليزية
  ---------------------------------------------------------------
  - أي عنصر عليه data-i18n="key" بيتبدل نصه.
  - أي input عليه data-i18n-placeholder="key" بيتبدل الـ placeholder.
  - لا يترجم: عناوين الفيديوهات (data.js) ولا آراء العملاء (اقتباسات حقيقية).
  - API: window.MB_T(key) · window.MB_APPLY_LANGUAGE(lang) · حدث "mb:langchange"
  ---------------------------------------------------------------
*/
(function () {
    "use strict";

    var LANG_KEY = "mb_site_lang";

    var TRANSLATIONS = {
        ar: {
            "a11y.skip": "تخطَّ إلى المحتوى",

            "nav.home": "الرئيسية",
            "nav.grading": "تلوين",
            "nav.reels": "الريلز",
            "nav.long": "الفيديوهات الطويلة",
            "nav.reviews": "التقييمات",
            "nav.contact": "تواصل معي",
            "nav.menu": "القائمة",

            "hero.available": "متاح لمشاريع جديدة",
            "hero.intro": "محرر فيديو وموشن ديزاينر وصانع محتوى، متخصص في إنتاج فيديوهات قصيرة وطويلة بجودة عالية تناسب المنصات المختلفة. أمتلك خبرة في العمل مع عيادات طبية، علامات تجارية، وصناع محتوى من دول متعددة. أؤمن أن الفيديو الناجح لا يعتمد فقط على المونتاج، بل على فهم الرسالة وتحويلها إلى تجربة بصرية مؤثرة.",
            "hero.cta.work": "شاهد أعمالي",
            "hero.cta.contact": "ابدأ مشروعك",
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
            "hero.tools.title": "أدواتي",
            "hero.worksNote": "جميع الأعمال المعروضة هي جزء صغير فقط من أعمالي التي راقت لي، وليس بالضرورة أن تكون راقت لك؛ لذا إن كنت تبحث عن شيء معيّن لا تتردد في مراسلتي.",

            "grading.subtitle": "شوف الفرق — قبل وبعد التلوين",
            "grading.desc": "كل التلوين والتصحيحات تمت على DaVinci Resolve",
            "reels.subtitle": "أعمالي في الريلز والمقاطع القصيرة",
            "seeMore.more": "شوف أعمال أكتر — {categories} أقسام · {videos} فيديو",
            "seeMore.less": "عرض أقل",
            "long.subtitle": "أعمالي في الفيديوهات الطويلة",

            "reviews.title": "تقييمات العملاء",
            "reviews.subtitle": "ماذا قالوا عن أعمالي",
            "reviews.firstTry": "تم قبول المشروع من أول مرة بدون أي تعديلات",
            "reviews.stats.avg": "متوسط التقييم",
            "reviews.stats.clients": "عميل راضٍ",
            "reviews.stats.repeat": "مشاريع متكررة",
            "reviews.share.title": "شارك تجربتك",
            "reviews.share.text": "اشتغلت معايا قبل كده؟ تقييمك بيساعد غيرك ياخد القرار.",
            "reviews.share.button": "أضف تقييمك",

            "modal.title": "أضف تقييمك",
            "modal.hint": "هيتفتح واتساب برسالة جاهزة فيها تقييمك — اضغط إرسال وخلاص.",
            "modal.name.label": "اسمك",
            "modal.name.placeholder": "ادخل اسمك",
            "modal.role.label": "وظيفتك/تخصصك",
            "modal.role.placeholder": "مثال: طبيب أسنان، مدير تسويق",
            "modal.rating.label": "التقييم",
            "modal.text.label": "تقييمك",
            "modal.text.placeholder": "اكتب تقييمك عن تجربة العمل معي...",
            "modal.project.label": "نوع المشروع",
            "modal.project.placeholder": "اختر نوع المشروع",
            "modal.error": "من فضلك اكتب اسمك وتقييمك.",
            "modal.submit": "إرسال التقييم",
            "modal.cancel": "إلغاء",
            "modal.close": "إغلاق",

            "contact.title": "تواصل معي",
            "contact.subtitle": "للمشاريع والتعاون والاستفسارات",
            "contact.email.label": "البريد الإلكتروني",
            "contact.phone.label": "الهاتف / واتساب",

            "footer.rights": "جميع الحقوق محفوظة.",
            "footer.version": "الإصدار 3.0 · آخر تحديث:",

            "player.watchOn": "مشاهدة على المنصة الأصلية"
        },
        en: {
            "a11y.skip": "Skip to content",

            "nav.home": "Home",
            "nav.grading": "Grading",
            "nav.reels": "Reels",
            "nav.long": "Long Videos",
            "nav.reviews": "Reviews",
            "nav.contact": "Contact",
            "nav.menu": "Menu",

            "hero.available": "Available for new projects",
            "hero.intro": "Video editor, motion designer, and content creator specializing in high-quality short and long-form videos for different platforms. I have experience working with medical clinics, brands, and content creators from multiple countries. I believe a successful video isn't just about editing — it's about understanding the message and turning it into an impactful visual experience.",
            "hero.cta.work": "See my work",
            "hero.cta.contact": "Start a project",
            "hero.stat.years": "Years experience",
            "hero.stat.projects": "Projects in 2025",
            "hero.stat.ontime": "On-time delivery",
            "hero.stat.creativity": "Endless creativity",
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
            "hero.tools.title": "My Tools",
            "hero.worksNote": "Everything shown here is just a small part of the work I've enjoyed doing — it won't necessarily match what you're looking for, so if you have something specific in mind, don't hesitate to reach out.",

            "grading.subtitle": "See the difference — before & after grading",
            "grading.desc": "All grades and corrections made in DaVinci Resolve",
            "reels.subtitle": "My reels and short-form work",
            "seeMore.more": "See more work — {categories} categories · {videos} videos",
            "seeMore.less": "Show less",
            "long.subtitle": "My long-form video work",

            "reviews.title": "Client Reviews",
            "reviews.subtitle": "What they said about my work",
            "reviews.firstTry": "Project approved on the first try — zero revisions",
            "reviews.stats.avg": "Average rating",
            "reviews.stats.clients": "Happy clients",
            "reviews.stats.repeat": "Repeat projects",
            "reviews.share.title": "Share your experience",
            "reviews.share.text": "Worked with me before? Your review helps others decide.",
            "reviews.share.button": "Add your review",

            "modal.title": "Add Your Review",
            "modal.hint": "WhatsApp will open with your review ready — just hit send.",
            "modal.name.label": "Your name",
            "modal.name.placeholder": "Enter your name",
            "modal.role.label": "Your role / specialty",
            "modal.role.placeholder": "e.g. Dentist, Marketing Manager",
            "modal.rating.label": "Rating",
            "modal.text.label": "Your review",
            "modal.text.placeholder": "Write about your experience working with me...",
            "modal.project.label": "Project type",
            "modal.project.placeholder": "Select project type",
            "modal.error": "Please enter your name and your review.",
            "modal.submit": "Send review",
            "modal.cancel": "Cancel",
            "modal.close": "Close",

            "contact.title": "Contact Me",
            "contact.subtitle": "For projects, collaborations, and inquiries",
            "contact.email.label": "Email",
            "contact.phone.label": "Phone / WhatsApp",

            "footer.rights": "All rights reserved.",
            "footer.version": "Version 3.0 · Last updated:",

            "player.watchOn": "Watch on original platform"
        }
    };

    function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSet(key, val) {
        try { localStorage.setItem(key, val); } catch (e) { /* private mode: ignore */ }
    }

    var current = safeGet(LANG_KEY) === "en" ? "en" : "ar";

    function translate(key) {
        var dict = TRANSLATIONS[current] || TRANSLATIONS.ar;
        return dict[key];
    }

    function applyLanguage(lang) {
        current = lang === "en" ? "en" : "ar";
        var isEn = current === "en";
        var root = document.documentElement;

        root.lang = current;
        root.dir = isEn ? "ltr" : "rtl";

        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var value = translate(el.getAttribute("data-i18n"));
            if (value != null) el.textContent = value;
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            var value = translate(el.getAttribute("data-i18n-placeholder"));
            if (value != null) el.setAttribute("placeholder", value);
        });
        document.querySelectorAll(".icon-close").forEach(function (el) {
            el.setAttribute("aria-label", translate("modal.close"));
        });
        var menu = document.getElementById("menuToggle");
        if (menu) menu.setAttribute("aria-label", translate("nav.menu"));

        var label = document.getElementById("langToggleLabel");
        if (label) label.textContent = isEn ? "عربي" : "EN";
        var toggle = document.getElementById("langToggle");
        if (toggle) toggle.title = isEn ? "التبديل للعربية" : "Switch to English";

        window.MB_LANG = current;
        document.dispatchEvent(new CustomEvent("mb:langchange", { detail: { lang: current } }));
    }

    function init() {
        applyLanguage(current);
        var toggle = document.getElementById("langToggle");
        if (toggle) {
            toggle.addEventListener("click", function () {
                var next = current === "en" ? "ar" : "en";
                safeSet(LANG_KEY, next);
                applyLanguage(next);
            });
        }
    }

    window.MB_T = translate;
    window.MB_APPLY_LANGUAGE = applyLanguage;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
