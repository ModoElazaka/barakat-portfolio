/*
  render.js
  ---------------------------------------------------------------
  يبني الأقسام والفئات وبطاقات الفيديو من data.js
  (أو من النسخة المحفوظة محلياً من لوحة التحكم إن وُجدت).
  لا يحتوي على أي منطق تفاعلي — التفاعل كله في script.js.
  ---------------------------------------------------------------
*/
(function () {
    "use strict";

    var STORAGE_KEY = "mb_site_data_v1";
    // نسخة data.js اللي التعديلات المحلية اتبنت عليها
    var BASE_KEY = "mb_site_data_base_v1";
    var BUILTIN_SECTION_IDS = ["reels", "long"];
    // عدد الفئات اللي بتظهر مباشرة في كل قسم؛ الباقي ورا زر "عرض المزيد"
    // (الترتيب نفسه بيتحدد من لوحة التحكم — الأقوى فوق)
    var VISIBLE_DEPARTMENTS = 3;

    /* ---------- data ---------- */

    // بصمة data.js المنشور — لازم تكون نفس الدالة في render.js و dashboard.js
    function fingerprint(obj) {
        var s = JSON.stringify(obj || {});
        var h = 5381;
        for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        return (h >>> 0).toString(36) + "-" + s.length;
    }

    // النسخة المحلية من لوحة التحكم بتتعرض بس لو اتبنت على data.js الحالي.
    // لو data.js اتغيّر بعدها (مثلاً اتضافت فيديوهات جديدة) بنعرض data.js،
    // عشان نسخة قديمة في المتصفح ما تخفيش المحتوى الجديد.
    function getData() {
        var published = window.SITE_DATA || { sections: [] };
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw && window.localStorage.getItem(BASE_KEY) === fingerprint(published)) {
                var parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.sections)) return parsed;
            }
        } catch (e) {
            console.warn("Local dashboard data unreadable, falling back to data.js", e);
        }
        return published;
    }

    /* ---------- helpers ---------- */

    function esc(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    // يسمح فقط بأسماء أيقونات Font Awesome (fa-xxx) لتجنّب حقن classes غريبة
    function safeIcon(icon) {
        return /^fa-[a-z0-9-]+$/.test(icon || "") ? icon : "";
    }

    // شكل الفيديو الحقيقي (للمشغل): لو مش محدد، القصير طولي والطويل عرضي
    function orientationOf(v) {
        if (v.orientation === "portrait" || v.orientation === "landscape") return v.orientation;
        return v.type === "long" ? "landscape" : "portrait";
    }

    function thumbnailFor(v) {
        if (v.thumbnail) return v.thumbnail;
        if (v.platform === "youtube" && v.videoId) {
            // فيديو عرضي معروض في كارت طولي: mqdefault (16:9 بدون شرائط سودا) عشان القص يطلع نضيف
            var file = v.type !== "long" && orientationOf(v) === "landscape" ? "mqdefault" : "hqdefault";
            return "https://i.ytimg.com/vi/" + encodeURIComponent(v.videoId) + "/" + file + ".jpg";
        }
        return "";
    }

    /* ---------- templates ---------- */

    function videoCardHTML(v) {
        var isLong = v.type === "long";
        var platform = v.platform === "instagram" ? "instagram" : "youtube";
        var thumb = thumbnailFor(v);
        var title = v.title || "";

        var media = thumb
            ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallback="fa-' + platform + '">'
            : '<span class="video-thumb-placeholder"><i class="fab fa-' + platform + '"></i></span>';

        return (
            '<button type="button" class="video-card ' + (isLong ? "is-long" : "is-short") + '"' +
            ' data-video-id="' + esc(v.videoId) + '"' +
            ' data-platform="' + platform + '"' +
            ' data-type="' + (isLong ? "long" : "short") + '"' +
            ' data-orientation="' + orientationOf(v) + '"' +
            ' data-title="' + esc(title) + '"' +
            ' aria-label="' + esc(title || "Play video") + '">' +
            '<span class="video-thumb">' + media +
            '<span class="video-platform" aria-hidden="true"><i class="fab fa-' + platform + '"></i></span>' +
            '<span class="video-play" aria-hidden="true"><i class="fas fa-play"></i></span>' +
            (isLong ? "" : '<span class="video-caption">' + esc(title) + "</span>") +
            "</span>" +
            (isLong ? '<span class="video-info">' + esc(title) + "</span>" : "") +
            "</button>"
        );
    }

    function departmentHTML(dep) {
        var videos = dep.videos || [];
        if (!videos.length) return "";

        var hasTitle = dep.title && dep.title.trim();
        var icon = safeIcon(dep.icon);
        var head =
            '<div class="category-head">' +
            "<div>" +
            (hasTitle
                ? '<h3 class="category-title">' + (icon ? '<i class="fas ' + icon + '" aria-hidden="true"></i>' : "") + esc(dep.title) + "</h3>"
                : "") +
            (dep.description ? '<p class="category-desc">' + esc(dep.description) + "</p>" : "") +
            "</div>" +
            '<div class="carousel-controls" hidden>' +
            '<button type="button" class="carousel-btn" data-dir="-1" aria-label="Previous"><i class="fas fa-chevron-right"></i></button>' +
            '<button type="button" class="carousel-btn" data-dir="1" aria-label="Next"><i class="fas fa-chevron-left"></i></button>' +
            "</div>" +
            "</div>";

        return (
            '<div class="category glass reveal" data-department-id="' + esc(dep.id) + '">' +
            head +
            '<div class="carousel" id="' + esc(dep.id) + '">' + videos.map(videoCardHTML).join("") + "</div>" +
            "</div>"
        );
    }

    // يبني فئات القسم: أول VISIBLE_DEPARTMENTS ظاهرين والباقي مخفي لحد ما الزائر يطلبه.
    // الصور جوه الجزء المخفي lazy فمش بتتحمّل غير لما يفتحه.
    function departmentsHTML(departments) {
        var visible = (departments || []).filter(function (d) { return d.videos && d.videos.length; });
        var shown = visible.slice(0, VISIBLE_DEPARTMENTS).map(departmentHTML).join("");
        var rest = visible.slice(VISIBLE_DEPARTMENTS);
        if (!rest.length) return shown;

        var restVideos = rest.reduce(function (n, d) { return n + d.videos.length; }, 0);
        return (
            shown +
            '<div class="more-departments" hidden>' + rest.map(departmentHTML).join("") + "</div>" +
            '<div class="see-more-wrap">' +
            '<button type="button" class="btn btn-glass see-more" aria-expanded="false"' +
            ' data-categories="' + rest.length + '" data-videos="' + restVideos + '">' +
            '<span class="see-more-label"></span> <i class="fas fa-chevron-down" aria-hidden="true"></i>' +
            "</button>" +
            "</div>"
        );
    }

    function sectionHTML(section) {
        return (
            '<section id="' + esc(section.id) + '" class="section">' +
            '<div class="container">' +
            '<header class="section-head reveal">' +
            '<h2 class="section-title">' + esc(section.title) + "</h2>" +
            (section.subtitle ? '<p class="section-subtitle">' + esc(section.subtitle) + "</p>" : "") +
            "</header>" +
            departmentsHTML(section.departments) +
            "</div>" +
            "</section>"
        );
    }

    function renderNav(sections) {
        var nav = document.getElementById("navLinks");
        if (!nav) return;

        nav.querySelectorAll('[data-dynamic-nav]').forEach(function (a) { a.remove(); });
        var beforeReviews = nav.querySelector('a[href="#reviews"]');
        var afterReelsAnchor = nav.querySelector('a[href="#long"]'); // اللينك يتحط بعد الريلز وقبل الطويل

        sections.forEach(function (sec) {
            if (BUILTIN_SECTION_IDS.indexOf(sec.id) !== -1) return;
            var a = document.createElement("a");
            a.href = "#" + sec.id;
            a.className = "nav-link";
            a.textContent = sec.navLabel || sec.title || sec.id;
            a.setAttribute("data-dynamic-nav", "");
            var before = sec.placement === "after-reels" && afterReelsAnchor ? afterReelsAnchor : beforeReviews;
            nav.insertBefore(a, before);
        });
    }

    /* ---------- thumbnail fallback ---------- */
    // روابط صور انستقرام بتنتهي صلاحيتها؛ لو الصورة فشلت نعرض أيقونة المنصة بدلها.
    // بيتسجل هنا (قبل أي صورة) عشان ما يفوتناش خطأ تحميل بدري.
    document.addEventListener("error", function (e) {
        var img = e.target;
        if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-fallback")) return;
        var ph = document.createElement("span");
        ph.className = "video-thumb-placeholder";
        ph.innerHTML = '<i class="fab ' + esc(img.getAttribute("data-fallback")) + '"></i>';
        img.replaceWith(ph);
    }, true);

    /* ---------- render ---------- */

    function render() {
        var data = getData();
        if (!data || !Array.isArray(data.sections)) return;

        data.sections.forEach(function (sec) {
            var target = sec.id === "reels" ? "reels-departments" : sec.id === "long" ? "long-departments" : null;
            var el = target && document.getElementById(target);
            if (el) el.innerHTML = departmentsHTML(sec.departments);
        });

        // الأقسام الإضافية: placement "after-reels" تحت الريلز مباشرة، والباقي بعد الفيديوهات الطويلة
        var custom = data.sections.filter(function (s) { return BUILTIN_SECTION_IDS.indexOf(s.id) === -1; });
        var isAfterReels = function (s) { return s.placement === "after-reels"; };
        var afterReels = document.getElementById("after-reels-sections");
        var dyn = document.getElementById("dynamic-sections-container");
        if (afterReels) afterReels.innerHTML = custom.filter(isAfterReels).map(sectionHTML).join("");
        if (dyn) {
            dyn.innerHTML = custom
                .filter(function (s) { return !afterReels || !isAfterReels(s); })
                .map(sectionHTML)
                .join("");
        }

        renderNav(data.sections);
        document.dispatchEvent(new CustomEvent("mb:rendered"));
    }

    // تحديث فوري لو اتعدّلت البيانات من لوحة التحكم في تبويب آخر
    window.addEventListener("storage", function (e) {
        if (e.key === STORAGE_KEY) render();
    });

    window.MB_RENDER = render;
    window.MB_GET_SITE_DATA = getData;
    window.MB_STORAGE_KEY = STORAGE_KEY;

    render();
})();
