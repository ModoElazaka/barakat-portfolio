/*
  script.js — كل تفاعلات الموقع العام
  ---------------------------------------------------------------
  Modules:
    scrollLock · nav · scrollSpy · reveal · countUp · carousels
    seeMore · gradingVideos · player · reviewForm · footer
  كل module مستقل ويتهيأ مرة واحدة في init() بالأسفل.
  الأجزاء اللي بتعتمد على محتوى render.js بتتحدث تاني عند حدث "mb:rendered".
  ---------------------------------------------------------------
*/
(function () {
    "use strict";

    document.documentElement.classList.remove("no-js");

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
    var isEn = function () { return document.documentElement.lang === "en"; };
    var t = function (key, fallback) {
        return (window.MB_T && window.MB_T(key)) || fallback || key;
    };
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var WHATSAPP_NUMBER = "201027064867";

    /* ============================ scroll lock ============================ */
    // عدّاد بسيط عشان لو فيه نافذتين فوق بعض، القفل ما يتفكّش بدري
    var scrollLock = (function () {
        var count = 0;
        return {
            on: function () { if (count++ === 0) document.body.classList.add("is-locked"); },
            off: function () { if (count > 0 && --count === 0) document.body.classList.remove("is-locked"); }
        };
    })();

    /* ================================ nav ================================ */
    function initNav() {
        var header = $("#header");
        var toggle = $("#menuToggle");
        var links = $("#navLinks");
        if (!header || !toggle || !links) return;

        function setOpen(open) {
            links.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            var icon = $("i", toggle);
            icon.className = open ? "fas fa-xmark" : "fas fa-bars";
        }

        toggle.addEventListener("click", function () {
            setOpen(!links.classList.contains("is-open"));
        });

        // يقفل القائمة عند الضغط على رابط أو خارجها أو Escape
        links.addEventListener("click", function (e) {
            if (e.target.closest(".nav-link")) setOpen(false);
        });
        document.addEventListener("click", function (e) {
            if (!e.target.closest(".nav")) setOpen(false);
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setOpen(false);
        });

        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 24);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ============================= scroll spy ============================ */
    var spyObserver = null;
    function initScrollSpy() {
        if (spyObserver) spyObserver.disconnect();
        var navLinks = $$("#navLinks .nav-link");
        var byId = {};
        navLinks.forEach(function (a) {
            var id = a.getAttribute("href").slice(1);
            var section = document.getElementById(id);
            if (section) byId[id] = a;
        });

        spyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (a) { a.classList.remove("active"); });
                var link = byId[entry.target.id];
                if (link) link.classList.add("active");
            });
        }, { rootMargin: "-45% 0px -50% 0px" });

        Object.keys(byId).forEach(function (id) {
            spyObserver.observe(document.getElementById(id));
        });
    }

    /* =============================== reveal ============================== */
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    function initReveal() {
        $$(".reveal:not(.show)").forEach(function (el) { revealObserver.observe(el); });
    }

    /* ============================== count up ============================= */
    function initCountUp() {
        var items = $$("[data-count]");
        if (reducedMotion || !items.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                var el = entry.target;
                var target = parseInt(el.getAttribute("data-count"), 10);
                var suffix = el.getAttribute("data-suffix") || "";
                var start = performance.now();
                var duration = 1200;
                (function step(now) {
                    var p = Math.min(1, (now - start) / duration);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * eased) + suffix;
                    if (p < 1) requestAnimationFrame(step);
                })(start);
            });
        }, { threshold: 0.6 });

        items.forEach(function (el) { io.observe(el); });
    }

    /* ============================== carousels ============================ */
    function initCarousels() {
        $$(".carousel:not([data-ready])").forEach(function (track) {
            track.setAttribute("data-ready", "");
            var category = track.closest(".category");
            var controls = category && $(".carousel-controls", category);
            var buttons = controls ? $$(".carousel-btn", controls) : [];

            function sign() {
                return getComputedStyle(track).direction === "rtl" ? -1 : 1;
            }

            function update() {
                var max = track.scrollWidth - track.clientWidth;
                var pos = Math.abs(track.scrollLeft);
                var scrollable = max > 4;
                if (controls) controls.hidden = !scrollable;
                buttons.forEach(function (btn) {
                    var dir = Number(btn.getAttribute("data-dir"));
                    btn.disabled = dir < 0 ? pos <= 2 : pos >= max - 2;
                });
            }

            buttons.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    var dir = Number(btn.getAttribute("data-dir"));
                    track.scrollBy({ left: dir * sign() * track.clientWidth * 0.8, behavior: "smooth" });
                });
            });

            track.addEventListener("scroll", update, { passive: true });
            window.addEventListener("resize", update);
            if ("ResizeObserver" in window) new ResizeObserver(update).observe(track);
            update();

            enableDragScroll(track);
        });
    }

    // سحب بالماوس على الكمبيوتر (اللمس شغال طبيعي بدون أي كود)
    function enableDragScroll(track) {
        var startX = 0;
        var startScroll = 0;
        var pointerId = null;
        var dragged = false;

        track.addEventListener("pointerdown", function (e) {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            pointerId = e.pointerId;
            startX = e.clientX;
            startScroll = track.scrollLeft;
            dragged = false;
        });

        track.addEventListener("pointermove", function (e) {
            if (e.pointerId !== pointerId) return;
            var dx = e.clientX - startX;
            if (!dragged && Math.abs(dx) > 6) {
                dragged = true;
                track.classList.add("is-dragging");
                track.setPointerCapture(pointerId);
            }
            if (dragged) track.scrollLeft = startScroll - dx;
        });

        function end() {
            if (pointerId === null) return;
            pointerId = null;
            track.classList.remove("is-dragging");
        }
        track.addEventListener("pointerup", end);
        track.addEventListener("pointercancel", end);

        // امنع "الضغط" على الفيديو لو المستخدم كان بيسحب
        track.addEventListener("click", function (e) {
            if (dragged) {
                e.preventDefault();
                e.stopPropagation();
                dragged = false;
            }
        }, true);
    }

    /* ============================== see more ============================= */
    // زر "عرض المزيد" اللي render.js بيحطه لما القسم فيه فئات أكتر من المسموح
    function format(template, values) {
        return template.replace(/\{(\w+)\}/g, function (_, k) { return values[k]; });
    }

    function updateSeeMoreLabels() {
        $$(".see-more").forEach(function (btn) {
            var open = btn.getAttribute("aria-expanded") === "true";
            $(".see-more-label", btn).textContent = open
                ? t("seeMore.less", "عرض أقل")
                : format(t("seeMore.more", "شوف أعمال أكتر — {categories} أقسام · {videos} فيديو"), {
                    categories: btn.getAttribute("data-categories"),
                    videos: btn.getAttribute("data-videos")
                });
        });
    }

    function initSeeMore() {
        document.addEventListener("click", function (e) {
            var btn = e.target.closest(".see-more");
            if (!btn) return;
            var wrap = btn.parentElement;
            var more = wrap.previousElementSibling;
            if (!more || !more.classList.contains("more-departments")) return;

            var open = btn.getAttribute("aria-expanded") !== "true";
            more.hidden = !open;
            btn.setAttribute("aria-expanded", String(open));
            updateSeeMoreLabels();

            if (open) {
                // ودّي الزائر لأول فئة جديدة عشان يحس إن فيه حاجة اتفتحت
                var first = more.firstElementChild;
                if (first) first.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
            } else {
                wrap.scrollIntoView({ behavior: "auto", block: "center" });
            }
        });
    }

    /* =========================== grading videos ========================== */
    // تشغيل فيديوهات التلوين فقط وهي ظاهرة على الشاشة (توفير بطارية وباندويدث)
    function initGradingVideos() {
        var videos = $$(".grading-item video");
        if (!videos.length) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var v = entry.target;
                if (entry.isIntersecting) {
                    if (v.preload === "none") v.preload = "auto";
                    var p = v.play();
                    if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays */ });
                } else {
                    v.pause();
                }
            });
        }, { threshold: 0.35 });
        videos.forEach(function (v) { io.observe(v); });
    }

    /* =============================== player ============================== */
    var player = (function () {
        var modal, frame, stage, titleEl, extLink, closeBtn, lastFocus;
        var HISTORY_KEY = "mbPlayer";

        function embedUrl(id, platform) {
            id = encodeURIComponent(id);
            return platform === "instagram"
                ? "https://www.instagram.com/p/" + id + "/embed/"
                : "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
        }

        function externalUrl(id, platform, type, orientation) {
            id = encodeURIComponent(id);
            if (platform === "instagram") return "https://www.instagram.com/reel/" + id + "/";
            return type === "short" && orientation === "portrait"
                ? "https://www.youtube.com/shorts/" + id
                : "https://www.youtube.com/watch?v=" + id;
        }

        function isOurHistoryEntry() {
            return !!(history.state && history.state[HISTORY_KEY]);
        }

        // orientation = الشكل الحقيقي للفيديو (portrait 9:16 / landscape 16:9)
        // ومنفصل عن type (قصير/طويل) اللي بيحدد شكل الكارت بس
        function open(id, platform, title, type, orientation) {
            if (!id) return;
            lastFocus = document.activeElement;
            type = type === "long" ? "long" : "short";
            if (orientation !== "portrait" && orientation !== "landscape") {
                orientation = type === "long" ? "landscape" : "portrait";
            }

            frame.className = "player-frame is-" + orientation + (platform === "instagram" ? " is-instagram" : "");

            var iframe = document.createElement("iframe");
            iframe.src = embedUrl(id, platform);
            iframe.title = title || "Video";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            stage.replaceChildren(iframe);

            titleEl.textContent = title || "";
            titleEl.hidden = !title;
            extLink.href = externalUrl(id, platform, type, orientation);

            // خانة في الـ history عشان زرار "رجوع" في الموبايل يقفل الفيديو بدل ما يخرج من الموقع
            if (modal.hidden && !isOurHistoryEntry()) {
                var state = {};
                state[HISTORY_KEY] = true;
                history.pushState(state, "");
            }

            modal.hidden = false;
            scrollLock.on();
            closeBtn.focus();
        }

        function teardown() {
            if (modal.hidden) return;
            modal.hidden = true;
            stage.replaceChildren(); // يوقف الفيديو فعلياً
            scrollLock.off();
            if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        }

        function close() {
            if (modal.hidden) return;
            // لو فتحنا خانة history، نرجع منها (و popstate هيقفل) عشان الـ history يفضل نضيف
            if (isOurHistoryEntry()) history.back();
            else teardown();
        }

        function init() {
            modal = $("#videoPlayerModal");
            if (!modal) return;
            frame = $("#videoPlayerContent");
            stage = $("#videoPlayerContainer");
            titleEl = $("#videoPlayerTitle");
            extLink = $("#videoExternalLink");
            closeBtn = $("#closeVideoPlayer");

            closeBtn.addEventListener("click", close);
            modal.addEventListener("click", function (e) {
                if (e.target === modal) close();
            });
            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") close();
            });
            window.addEventListener("popstate", teardown);

            // event delegation: يشتغل حتى مع الكروت اللي بتتولّد بعدين
            document.addEventListener("click", function (e) {
                var card = e.target.closest(".video-card");
                if (!card) return;
                open(
                    card.getAttribute("data-video-id"),
                    card.getAttribute("data-platform"),
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-orientation")
                );
            });
        }

        return { init: init, open: open, close: close };
    })();

    /* ============================ review form ============================ */
    function initReviewForm() {
        var modal = $("#reviewFormModal");
        var form = $("#reviewForm");
        var openBtn = $("#openReviewForm");
        if (!modal || !form || !openBtn) return;

        var stars = $$("#ratingInput button");
        var output = $("#ratingValue");
        var errorEl = $("#reviewFormError");
        var rating = 5;
        var lastFocus = null;

        function paint(value) {
            stars.forEach(function (s, i) {
                s.classList.toggle("is-on", i < value);
                s.setAttribute("aria-checked", String(i + 1 === rating));
            });
            output.textContent = value + " / 5";
        }

        stars.forEach(function (s) {
            var value = Number(s.getAttribute("data-rating"));
            s.addEventListener("click", function () { rating = value; paint(rating); });
            s.addEventListener("mouseenter", function () { paint(value); });
            s.addEventListener("mouseleave", function () { paint(rating); });
        });

        function open() {
            lastFocus = document.activeElement;
            modal.hidden = false;
            scrollLock.on();
            $("#reviewerName").focus();
        }

        function close() {
            if (modal.hidden) return;
            modal.hidden = true;
            scrollLock.off();
            form.reset();
            rating = 5;
            paint(rating);
            errorEl.hidden = true;
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        openBtn.addEventListener("click", open);
        $$("[data-close-modal]", modal).forEach(function (b) { b.addEventListener("click", close); });
        modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var nameInput = $("#reviewerName");
            var textInput = $("#reviewText");
            var name = nameInput.value.trim();
            var text = textInput.value.trim();
            if (!name || !text) {
                errorEl.hidden = false;
                (name ? textInput : nameInput).focus();
                return;
            }
            errorEl.hidden = true;

            var role = $("#reviewerTitle").value.trim();
            var project = $("#reviewProject").value;
            var lines = isEn()
                ? ["⭐ New review from the portfolio", "Name: " + name, role && "Role: " + role,
                    "Rating: " + "★".repeat(rating) + " (" + rating + "/5)", project && "Project: " + project, "", text]
                : ["⭐ تقييم جديد من الموقع", "الاسم: " + name, role && "الوظيفة: " + role,
                    "التقييم: " + "★".repeat(rating) + " (" + rating + "/5)", project && "المشروع: " + project, "", text];

            var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" +
                encodeURIComponent(lines.filter(function (l) { return l !== "" && l !== false; }).join("\n"));
            window.open(url, "_blank", "noopener");
            close();
        });

        paint(rating);
    }

    /* ================================ footer ============================= */
    function updateFooter() {
        var year = $("#year");
        if (year) year.textContent = new Date().getFullYear();

        var last = $("#last-update");
        if (last) {
            var d = new Date(document.lastModified);
            if (isNaN(d)) d = new Date();
            last.textContent = d.toLocaleDateString(isEn() ? "en-GB" : "ar-EG", {
                year: "numeric", month: "long", day: "numeric"
            });
        }
    }

    /* ================================ init =============================== */
    function onContentRendered() {
        updateSeeMoreLabels();
        initCarousels();
        initReveal();
        initScrollSpy();
    }

    function init() {
        initNav();
        initCountUp();
        initGradingVideos();
        initSeeMore();
        player.init();
        initReviewForm();
        updateFooter();
        onContentRendered();

        document.addEventListener("mb:rendered", onContentRendered);
        document.addEventListener("mb:langchange", function () {
            updateFooter();
            updateSeeMoreLabels();
        });
    }

    // للتوافق مع أي كود قديم بيستدعي playVideo مباشرة
    window.playVideo = function (id, platform, title, type, orientation) { player.open(id, platform, title, type, orientation); };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
