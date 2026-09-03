/*
  render.js
  ---------------------------------------------------------------
  يبني هذا الملف كل الأقسام والفئات والفيديوهات في الصفحة اعتماداً
  على البيانات في data.js (أو النسخة المحفوظة محلياً من لوحة التحكم).
  ---------------------------------------------------------------
*/
(function () {
    "use strict";

    var STORAGE_KEY = "mb_site_data_v1";
    var BUILTIN_SECTION_IDS = ["reels", "long"];

    function getData() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.sections)) return parsed;
            }
        } catch (e) {
            console.warn("تعذّرت قراءة بيانات لوحة التحكم المحفوظة محلياً، سيتم استخدام data.js:", e);
        }
        return window.SITE_DATA || { sections: [] };
    }

    function escapeAttr(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function escapeHtml(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function jsStringLiteral(str) {
        return String(str == null ? "" : str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    function youtubeThumb(videoId) {
        return "https://img.youtube.com/vi/" + encodeURIComponent(videoId) + "/hqdefault.jpg";
    }

    function videoCardHTML(v) {
        var isLong = v.type === "long";
        var cardClass = isLong ? "long-video" : "reels-video";
        var thumb = v.thumbnail;
        if (!thumb) {
            thumb = v.platform === "youtube" ? youtubeThumb(v.videoId) : "";
        }
        var platformIcon = v.platform === "instagram" ? "fa-instagram" : "fa-youtube";
        var titleAttr = escapeAttr(v.title);
        var onclickTitle = jsStringLiteral(v.title || "");
        var onclickVideoId = jsStringLiteral(v.videoId || "");
        var onclickPlatform = jsStringLiteral(v.platform || "youtube");

        var thumbHTML = thumb 
            ? '<img src="' + escapeAttr(thumb) + '" alt="' + titleAttr + '" loading="lazy">'
            : '<div class="video-thumb-placeholder"><i class="fab ' + platformIcon + '"></i></div>';

        var infoHTML = isLong 
            ? '<div class="video-info"><h4>' + escapeHtml(v.title) + "</h4></div>" 
            : "";

        return (
            '<div class="video-card ' + cardClass + '">' +
            '<div class="video-thumbnail">' +
            thumbHTML +
            '<div class="video-platform-badge"><i class="fab ' + platformIcon + '"></i></div>' +
            '<div class="play-btn" onclick="playVideo(\'' + onclickVideoId + "', '" + onclickPlatform + "', '" + onclickTitle + "', '" + (isLong ? "long" : "short") + '\')">' +
            '<i class="fas fa-play"></i>' +
            "</div>" +
            '<div class="video-overlay"></div>' +
            "</div>" +
            infoHTML +
            "</div>"
        );
    }

    function departmentHTML(dep) {
        var hasHeader = dep.title && dep.title.trim().length > 0;
        var iconHTML = dep.icon ? '<i class="fas ' + escapeAttr(dep.icon) + '"></i>' : "";
        var headerHTML = "";
        if (hasHeader) {
            headerHTML =
                '<h3 class="category-title">' + iconHTML + escapeHtml(dep.title) + "</h3>" +
                (dep.description ? '<p class="category-description">' + escapeHtml(dep.description) + "</p>" : "");
        }
        var videosHTML = (dep.videos || []).map(videoCardHTML).join("");
        return (
            '<div class="category-section glass reveal" data-department-id="' + escapeAttr(dep.id) + '">' +
            headerHTML +
            '<div class="videos-grid" id="' + escapeAttr(dep.id) + '">' + videosHTML + "</div>" +
            "</div>"
        );
    }

    function sectionHTML(section) {
        return (
            '<section id="' + escapeAttr(section.id) + '" class="section">' +
            '<div class="container">' +
            '<h2 class="section-title reveal">' + escapeHtml(section.title) + "</h2>" +
            (section.subtitle ? '<p class="section-subtitle reveal">' + escapeHtml(section.subtitle) + "</p>" : "") +
            '<div id="deps-' + escapeAttr(section.id) + '">' +
            (section.departments || []).map(departmentHTML).join("") +
            "</div>" +
            "</div>" +
            "</section>"
        );
    }

    function renderNav(sections) {
        var navLinks = document.querySelector(".nav-links");
        if (!navLinks) return;

        var existing = navLinks.querySelectorAll('[data-dynamic-nav="1"]');
        for (var i = 0; i < existing.length; i++) existing[i].parentNode.removeChild(existing[i]);

        var reviewsLink = navLinks.querySelector('a[href="#reviews"]');

        sections.forEach(function (sec) {
            if (BUILTIN_SECTION_IDS.indexOf(sec.id) !== -1) return;
            var a = document.createElement("a");
            a.href = "#" + sec.id;
            a.className = "nav-link";
            a.textContent = sec.navLabel || sec.title || sec.id;
            a.setAttribute("data-dynamic-nav", "1");
            if (reviewsLink) {
                navLinks.insertBefore(a, reviewsLink);
            } else {
                navLinks.appendChild(a);
            }
        });
    }

    function render(options) {
        options = options || {};
        var data = getData();
        if (!data || !Array.isArray(data.sections)) return;

        data.sections.forEach(function (sec) {
            if (sec.id === "reels") {
                var reelsContainer = document.getElementById("reels-departments");
                if (reelsContainer) reelsContainer.innerHTML = (sec.departments || []).map(departmentHTML).join("");
            } else if (sec.id === "long") {
                var longContainer = document.getElementById("long-departments");
                if (longContainer) longContainer.innerHTML = (sec.departments || []).map(departmentHTML).join("");
            }
        });

        var dynContainer = document.getElementById("dynamic-sections-container");
        if (dynContainer) {
            var customSections = data.sections.filter(function (s) {
                return BUILTIN_SECTION_IDS.indexOf(s.id) === -1;
            });
            dynContainer.innerHTML = customSections.map(sectionHTML).join("");
        }

        renderNav(data.sections);

        if (options.immediate) {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) reveals[i].classList.add("show");
        }

        if (typeof window.setupVideoHoverEffects === "function") {
            window.setupVideoHoverEffects();
        }
    }

    window.addEventListener("storage", function (e) {
        if (e.key === STORAGE_KEY) render({ immediate: true });
    });

    window.MB_RENDER = render;
    window.MB_GET_SITE_DATA = getData;
    window.MB_STORAGE_KEY = STORAGE_KEY;

    render();
})();