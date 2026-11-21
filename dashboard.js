(function () {
    "use strict";

    var STORAGE_KEY = "mb_site_data_v1";
    var BASE_KEY = "mb_site_data_base_v1";          // بصمة data.js اللي التعديلات اتبنت عليه
    var STALE_BACKUP_KEY = "mb_site_data_stale_backup"; // نسخة احتياطية من تعديلات قديمة اتلغت
    var AUTH_SESSION_KEY = "mb_dashboard_auth";
    // كلمة المرور محفوظة كـ SHA-256 hash (مش نص صريح) عشان ما تظهرش في "عرض المصدر".
    // ⚠️ دي حماية بسيطة ضد الدخول العرضي فقط — الموقع static بالكامل، والتعديلات
    // نفسها بتتحفظ في متصفحك بس ولازم تنشر data.js يدوياً، فمحدش يقدر يغيّر الموقع من هنا.
    // لتغيير كلمة المرور: افتح Console في المتصفح واكتب  MB_HASH("كلمة_جديدة")
    // ثم الصق الناتج مكان القيمة دي.
    var DASHBOARD_PASSWORD_HASH = "0abe654b77bc5da7e3b86bdd7b7ca6f507557ffc2d75aefdd6008867d7351c4d";
    var BUILTIN_SECTION_IDS = ["reels", "long"];

    var siteData = null;
    var staleLocalReplaced = false;
    var uploadedThumbDataUrl = null;
    var toastTimer = null;

    /* ============================= أدوات مساعدة ============================= */

    function esc(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function cssEsc(s) {
        return window.CSS && CSS.escape ? CSS.escape(s) : s;
    }

    function genId(prefix) {
        return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function $(id) {
        return document.getElementById(id);
    }

    function extractYouTubeId(input) {
        input = (input || "").trim();
        var patterns = [
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
            /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
            /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{6,})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
            /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/
        ];
        for (var i = 0; i < patterns.length; i++) {
            var m = input.match(patterns[i]);
            if (m) return m[1];
        }
        if (/^[a-zA-Z0-9_-]{6,20}$/.test(input)) return input;
        return null;
    }

    function extractInstagramId(input) {
        input = (input || "").trim();
        var m = input.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/);
        if (m) return m[1];
        if (/^[a-zA-Z0-9_-]{5,}$/.test(input)) return input;
        return null;
    }

    function showToast(message, isError) {
        var el = $("toast");
        el.innerHTML = '<i class="fas ' + (isError ? "fa-circle-exclamation" : "fa-circle-check") + '"></i> ' + esc(message);
        el.hidden = false;
        el.classList.toggle("toast-error", !!isError);
        requestAnimationFrame(function () {
            el.classList.add("show");
        });
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove("show");
            setTimeout(function () {
                el.hidden = true;
            }, 300);
        }, 3200);
    }

    /* ============================= SHA-256 (بدون مكتبات) ============================= */
    // تطبيق صغير لـ SHA-256 بيشتغل حتى لو الصفحة مفتوحة من file:// (crypto.subtle بيحتاج https)
    function sha256(ascii) {
        function rrot(v, n) { return (v >>> n) | (v << (32 - n)); }
        var bytes = unescape(encodeURIComponent(ascii));
        var K = [], H = [], primeCounter = 0, isComposite = {};
        for (var c = 2; primeCounter < 64; c++) {
            if (!isComposite[c]) {
                for (var i = 0; i < 313; i += c) isComposite[i] = c;
                if (primeCounter < 8) H[primeCounter] = (Math.pow(c, 0.5) * 4294967296) | 0;
                K[primeCounter++] = (Math.pow(c, 1 / 3) * 4294967296) | 0;
            }
        }
        var words = [], bitLen = bytes.length * 8;
        bytes += "\x80";
        while (bytes.length % 64 - 56) bytes += "\x00";
        for (var j = 0; j < bytes.length; j++) words[j >> 2] |= bytes.charCodeAt(j) << ((3 - j) % 4) * 8;
        words[words.length] = (bitLen / 4294967296) | 0;
        words[words.length] = bitLen;
        for (var b = 0; b < words.length;) {
            var w = words.slice(b, b += 16), old = H.slice(0, 8);
            for (var r = 0; r < 64; r++) {
                var a = H[0], e = H[4];
                var w15 = w[r - 15], w2 = w[r - 2];
                var t1 = H[7] + (rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25)) + ((e & H[5]) ^ (~e & H[6])) + K[r] +
                    (w[r] = r < 16 ? w[r] : (w[r - 16] + (rrot(w15, 7) ^ rrot(w15, 18) ^ (w15 >>> 3)) + w[r - 7] +
                        (rrot(w2, 17) ^ rrot(w2, 19) ^ (w2 >>> 10))) | 0);
                var t2 = (rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
                H = [(t1 + t2) | 0].concat(H);
                H[4] = (H[4] + t1) | 0;
                H.length = 8;
            }
            for (var k = 0; k < 8; k++) H[k] = (H[k] + old[k]) | 0;
        }
        var out = "";
        for (var x = 0; x < 8; x++) for (var y = 3; y + 1; y--) {
            var byte = (H[x] >> (y * 8)) & 255;
            out += (byte < 16 ? "0" : "") + byte.toString(16);
        }
        return out;
    }
    window.MB_HASH = sha256;

    /* ============================= تحميل/حفظ البيانات ============================= */

    // بصمة data.js المنشور — لازم تكون نفس الدالة في render.js و dashboard.js
    function fingerprint(obj) {
        var s = JSON.stringify(obj || {});
        var h = 5381;
        for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        return (h >>> 0).toString(36) + "-" + s.length;
    }

    function clearLocalCopy() {
        safeRemove(localStorage, STORAGE_KEY);
        safeRemove(localStorage, BASE_KEY);
    }

    // بنستخدم التعديلات المحلية بس لو اتبنت على data.js الحالي.
    // لو data.js اتغيّر بعدها: بنعرض الجديد، والقديم بيتحفظ نسخة احتياطية (مش بيتمسح).
    function loadData() {
        var published = window.SITE_DATA || { sections: [] };
        var raw = safeGet(localStorage, STORAGE_KEY);
        if (!raw) return deepClone(published);

        var parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) { console.warn("تعذّرت قراءة البيانات المحفوظة محلياً:", e); }
        if (!parsed || !Array.isArray(parsed.sections)) {
            clearLocalCopy();
            return deepClone(published);
        }

        if (safeGet(localStorage, BASE_KEY) === fingerprint(published)) return parsed;

        if (JSON.stringify(parsed) !== JSON.stringify(published)) {
            safeSet(localStorage, STALE_BACKUP_KEY, raw);
            staleLocalReplaced = true;
        }
        clearLocalCopy();
        return deepClone(published);
    }

    // لو احتجت ترجع التعديلات القديمة: افتح Console واكتب MB_RESTORE_STALE_BACKUP()
    window.MB_RESTORE_STALE_BACKUP = function () {
        var raw = safeGet(localStorage, STALE_BACKUP_KEY);
        if (!raw) return "مفيش نسخة احتياطية.";
        safeSet(localStorage, STORAGE_KEY, raw);
        safeSet(localStorage, BASE_KEY, fingerprint(window.SITE_DATA || { sections: [] }));
        location.reload();
        return "تم الاسترجاع.";
    };

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
            localStorage.setItem(BASE_KEY, fingerprint(window.SITE_DATA || { sections: [] }));
        } catch (e) {
            showToast("تعذّر الحفظ محلياً — قد تكون الصور المرفوعة كبيرة جداً على مساحة تخزين المتصفح.", true);
            console.error(e);
            return false;
        }
        $("unsavedBadge").hidden = false;
        renderManageTree();
        refreshPreview();
        return true;
    }

    function findSection(id) {
        return siteData.sections.filter(function (s) { return s.id === id; })[0] || null;
    }

    function findDepartment(sectionId, deptId) {
        var sec = findSection(sectionId);
        if (!sec) return null;
        return sec.departments.filter(function (d) { return d.id === deptId; })[0] || null;
    }

    function findVideoLocation(uid) {
        for (var si = 0; si < siteData.sections.length; si++) {
            var sec = siteData.sections[si];
            for (var di = 0; di < sec.departments.length; di++) {
                var dep = sec.departments[di];
                for (var vi = 0; vi < dep.videos.length; vi++) {
                    if (dep.videos[vi].uid === uid) {
                        return { section: sec, department: dep, index: vi, video: dep.videos[vi] };
                    }
                }
            }
        }
        return null;
    }

    /* ============================= المعاينة المباشرة ============================= */

    function refreshPreview() {
        var frame = $("previewFrame");
        if (!frame) return;
        try {
            frame.contentWindow.location.reload();
        } catch (e) {
            frame.src = frame.src;
        }
    }

    /* ============================= التبويبات ============================= */

    function switchTab(tab) {
        document.querySelectorAll(".dash-tab").forEach(function (btn) {
            btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
        });
        ["add", "manage", "publish"].forEach(function (t) {
            $("panel-" + t).hidden = t !== tab;
        });
    }

    /* ============================= نموذج إضافة/تعديل فيديو ============================= */

    function onPlatformChange() {
        var platform = $("videoPlatform").value;
        var note = $("videoUrlNote");
        var thumbLabel = document.querySelector('#thumbnailField label');
        if (platform === "youtube") {
            note.textContent = "يقبل رابط يوتيوب كامل (فيديو / شورت) أو المعرّف مباشرة.";
            thumbLabel.textContent = "صورة مصغّرة (اختياري — تُستخرج تلقائياً من يوتيوب إن تُركت فارغة)";
        } else {
            note.textContent = "يقبل رابط ريلز/منشور انستقرام كامل أو المعرّف (shortcode) مباشرة.";
            thumbLabel.textContent = "صورة مصغّرة (يُفضّل رفعها — انستقرام لا يسمح بجلبها تلقائياً)";
        }
    }

    function showThumbPreview(src) {
        $("thumbPreviewImg").src = src;
        $("thumbPreviewWrap").hidden = false;
    }

    function hideThumbPreview() {
        $("thumbPreviewWrap").hidden = true;
        $("thumbPreviewImg").src = "";
    }

    function refreshDestinationSelectors(preserveSection, preserveDept) {
        var destSection = $("destSection");
        var prevSection = preserveSection !== undefined && preserveSection !== null ? preserveSection : destSection.value;

        destSection.innerHTML = "";
        siteData.sections.forEach(function (sec) {
            var opt = document.createElement("option");
            opt.value = sec.id;
            opt.textContent = sec.title + (sec.navLabel ? " (" + sec.navLabel + ")" : "");
            destSection.appendChild(opt);
        });
        var newOpt = document.createElement("option");
        newOpt.value = "__new__";
        newOpt.textContent = "+ إنشاء قسم جديد";
        destSection.appendChild(newOpt);

        if (prevSection === "__new__" || findSection(prevSection)) {
            destSection.value = prevSection;
        } else {
            destSection.value = siteData.sections.length ? siteData.sections[0].id : "__new__";
        }

        onDestSectionChange(preserveDept);
    }

    function onDestSectionChange(preserveDept) {
        var destSection = $("destSection");
        var destDepartment = $("destDepartment");
        var isNewSection = destSection.value === "__new__";
        $("newSectionFields").hidden = !isNewSection;

        destDepartment.innerHTML = "";
        var deptList = [];
        if (!isNewSection) {
            var sec = findSection(destSection.value);
            deptList = sec ? sec.departments : [];
        }
        deptList.forEach(function (dep) {
            var opt = document.createElement("option");
            opt.value = dep.id;
            opt.textContent = dep.title && dep.title.trim() ? dep.title : "(بدون عنوان فرعي)";
            destDepartment.appendChild(opt);
        });
        var newDeptOpt = document.createElement("option");
        newDeptOpt.value = "__new__";
        newDeptOpt.textContent = "+ إنشاء فئة جديدة";
        destDepartment.appendChild(newDeptOpt);

        if (isNewSection) {
            destDepartment.value = "__new__";
            destDepartment.disabled = true;
        } else {
            destDepartment.disabled = false;
            if (preserveDept && deptList.some(function (d) { return d.id === preserveDept; })) {
                destDepartment.value = preserveDept;
            } else if (deptList.length) {
                destDepartment.value = deptList[0].id;
            } else {
                destDepartment.value = "__new__";
            }
        }
        onDestDepartmentChange();
    }

    function onDestDepartmentChange() {
        $("newDepartmentFields").hidden = $("destDepartment").value !== "__new__";
    }

    // بنحفظ orientation بس لو اتحدد يدوياً (الافتراضي بيتحسب من النوع)
    function withOrientation(video, orientation) {
        if (orientation === "portrait" || orientation === "landscape") video.orientation = orientation;
        return video;
    }

    function resetVideoFieldsOnly() {
        $("videoOrientation").value = "";
        $("videoUrl").value = "";
        $("videoTitle").value = "";
        $("videoThumbUrl").value = "";
        $("videoThumbFile").value = "";
        uploadedThumbDataUrl = null;
        hideThumbPreview();
        $("newSectionTitle").value = "";
        $("newSectionNav").value = "";
        $("newSectionSubtitle").value = "";
        $("newDeptTitle").value = "";
        $("newDeptIcon").value = "";
        $("newDeptDesc").value = "";
        $("videoUrl").focus();
    }

    function enterEditMode(uid) {
        var loc = findVideoLocation(uid);
        if (!loc) return;
        var v = loc.video;

        $("editingUid").value = uid;
        $("videoPlatform").value = v.platform;
        $("videoType").value = v.type;
        $("videoOrientation").value = v.orientation || "";
        $("videoUrl").value = v.videoId;
        $("videoTitle").value = v.title || "";

        if (v.thumbnail && v.thumbnail.indexOf("data:") === 0) {
            uploadedThumbDataUrl = v.thumbnail;
            $("videoThumbUrl").value = "";
        } else {
            uploadedThumbDataUrl = null;
            $("videoThumbUrl").value = v.thumbnail || "";
        }
        if (v.thumbnail) showThumbPreview(v.thumbnail); else hideThumbPreview();

        onPlatformChange();
        refreshDestinationSelectors(loc.section.id, loc.department.id);

        $("addFormTitle").innerHTML = '<i class="fas fa-pen"></i> تعديل الفيديو';
        $("videoFormSubmitBtn").innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
        $("cancelEditBtn").hidden = false;

        switchTab("add");
        $("videoForm").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function exitEditMode() {
        $("editingUid").value = "";
        $("addFormTitle").innerHTML = '<i class="fas fa-plus-circle"></i> إضافة فيديو جديد';
        $("videoFormSubmitBtn").innerHTML = '<i class="fas fa-plus"></i> إضافة الفيديو';
        $("cancelEditBtn").hidden = true;
    }

    function handleVideoFormSubmit(e) {
        e.preventDefault();

        var platform = $("videoPlatform").value;
        var type = $("videoType").value;
        var orientation = $("videoOrientation").value;
        var rawUrl = $("videoUrl").value.trim();
        var title = $("videoTitle").value.trim();

        var videoId = platform === "youtube" ? extractYouTubeId(rawUrl) : extractInstagramId(rawUrl);
        if (!videoId) {
            showToast("تعذّر استخراج معرّف الفيديو من الرابط المُدخل، تحقق منه.", true);
            return;
        }
        if (!title) {
            showToast("الرجاء إدخال عنوان للفيديو.", true);
            return;
        }

        var thumbUrl = $("videoThumbUrl").value.trim();
        var thumbnail = uploadedThumbDataUrl || thumbUrl || "";

        if (platform === "instagram" && !thumbnail) {
            var proceed = window.confirm("لم تُضف صورة مصغّرة لفيديو الانستقرام، سيظهر بأيقونة بديلة بدل صورة حقيقية. متابعة؟");
            if (!proceed) return;
        }

        // القسم
        var destSectionVal = $("destSection").value;
        var targetSection;
        if (destSectionVal === "__new__") {
            var newSecTitle = $("newSectionTitle").value.trim();
            if (!newSecTitle) {
                showToast("أدخل عنوان القسم الجديد.", true);
                return;
            }
            targetSection = {
                id: genId("section"),
                navLabel: $("newSectionNav").value.trim() || newSecTitle,
                title: newSecTitle,
                subtitle: $("newSectionSubtitle").value.trim(),
                departments: []
            };
            siteData.sections.push(targetSection);
        } else {
            targetSection = findSection(destSectionVal);
            if (!targetSection) {
                showToast("حدث خطأ في تحديد القسم.", true);
                return;
            }
        }

        // الفئة
        var destDeptVal = $("destDepartment").value;
        var targetDept;
        if (destDeptVal === "__new__") {
            targetDept = {
                id: genId("dept"),
                icon: $("newDeptIcon").value.trim(),
                title: $("newDeptTitle").value.trim(),
                description: $("newDeptDesc").value.trim(),
                videos: []
            };
            targetSection.departments.push(targetDept);
        } else {
            targetDept = targetSection.departments.filter(function (d) { return d.id === destDeptVal; })[0];
            if (!targetDept) {
                showToast("حدث خطأ في تحديد الفئة.", true);
                return;
            }
        }

        var editingUid = $("editingUid").value;
        if (editingUid) {
            var loc = findVideoLocation(editingUid);
            if (loc) loc.department.videos.splice(loc.index, 1);
            targetDept.videos.push(withOrientation({ uid: editingUid, videoId: videoId, platform: platform, type: type, title: title, thumbnail: thumbnail }, orientation));
            showToast("تم حفظ تعديلات الفيديو.");
        } else {
            targetDept.videos.push(withOrientation({ uid: genId("v"), videoId: videoId, platform: platform, type: type, title: title, thumbnail: thumbnail }, orientation));
            showToast("تمت إضافة الفيديو بنجاح.");
        }

        if (!saveData()) return;
        exitEditMode();
        var savedSectionId = targetSection.id;
        var savedDeptId = targetDept.id;
        resetVideoFieldsOnly();
        refreshDestinationSelectors(savedSectionId, savedDeptId);
    }

    /* ============================= شجرة إدارة المحتوى ============================= */

    function renderManageTree() {
        var wrap = $("manageTree");
        if (!siteData.sections.length) {
            wrap.innerHTML = '<p class="empty-note">لا توجد أقسام بعد. اضغط "قسم جديد" للبدء.</p>';
            return;
        }
        wrap.innerHTML = siteData.sections.map(renderTreeSection).join("");
    }

    function renderTreeSection(sec) {
        var isBuiltin = BUILTIN_SECTION_IDS.indexOf(sec.id) !== -1;
        var videoCount = sec.departments.reduce(function (sum, d) { return sum + d.videos.length; }, 0);
        return (
            '<div class="tree-section" data-section="' + esc(sec.id) + '">' +
            '<div class="tree-section-head">' +
            '<div class="tree-section-title"><i class="fas fa-layer-group"></i> ' + esc(sec.title) +
            '<span class="tree-badge">' + sec.departments.length + " فئة · " + videoCount + ' فيديو</span>' +
            (isBuiltin ? '<span class="tree-badge">قسم أساسي</span>' : "") +
            "</div>" +
            '<div class="tree-actions">' +
            '<button class="icon-btn" data-action="edit-section" data-section="' + esc(sec.id) + '"><i class="fas fa-pen"></i> تعديل</button>' +
            '<button class="icon-btn" data-action="add-department" data-section="' + esc(sec.id) + '"><i class="fas fa-plus"></i> فئة جديدة</button>' +
            '<button class="icon-btn danger" data-action="delete-section" data-section="' + esc(sec.id) + '" ' + (isBuiltin ? 'disabled title="لا يمكن حذف الأقسام الأساسية"' : "") + '><i class="fas fa-trash"></i></button>' +
            "</div>" +
            "</div>" +
            '<div class="section-edit-slot"></div>' +
            '<div class="tree-departments">' +
            (sec.departments.length
                ? sec.departments.map(function (dep, idx) { return renderTreeDepartment(sec, dep, idx); }).join("")
                : '<p class="empty-note">لا توجد فئات في هذا القسم بعد.</p>') +
            "</div>" +
            "</div>"
        );
    }

    function renderTreeDepartment(sec, dep, idx) {
        var total = sec.departments.length;
        var ids = 'data-section="' + esc(sec.id) + '" data-dept="' + esc(dep.id) + '"';
        // الفئات بعد أول 3 بتظهر في الموقع ورا زر "عرض المزيد"
        var hiddenNote = idx >= 3 ? '<span class="tree-badge" title="تظهر في الموقع بعد الضغط على عرض المزيد">ورا "عرض المزيد"</span>' : "";
        return (
            '<div class="tree-department" data-section="' + esc(sec.id) + '" data-dept="' + esc(dep.id) + '">' +
            '<div class="tree-department-head">' +
            '<div class="tree-department-title">' +
            (dep.icon ? '<i class="fas ' + esc(dep.icon) + '"></i>' : '<i class="fas fa-folder"></i>') +
            (dep.title && dep.title.trim() ? esc(dep.title) : "(بدون عنوان فرعي)") +
            '<span class="tree-badge">' + dep.videos.length + "</span>" +
            hiddenNote +
            "</div>" +
            '<div class="tree-actions">' +
            '<button class="icon-btn" data-action="dept-up" ' + ids + ' title="تحريك لأعلى" ' + (idx === 0 ? "disabled" : "") + '><i class="fas fa-arrow-up"></i></button>' +
            '<button class="icon-btn" data-action="dept-down" ' + ids + ' title="تحريك لأسفل" ' + (idx === total - 1 ? "disabled" : "") + '><i class="fas fa-arrow-down"></i></button>' +
            '<button class="icon-btn" data-action="edit-department" data-section="' + esc(sec.id) + '" data-dept="' + esc(dep.id) + '"><i class="fas fa-pen"></i></button>' +
            '<button class="icon-btn danger" data-action="delete-department" data-section="' + esc(sec.id) + '" data-dept="' + esc(dep.id) + '"><i class="fas fa-trash"></i></button>' +
            "</div>" +
            "</div>" +
            '<div class="department-edit-slot"></div>' +
            '<div class="tree-videos">' +
            (dep.videos.length
                ? dep.videos.map(function (v, idx) { return renderTreeVideo(v, idx, dep.videos.length); }).join("")
                : '<p class="empty-note">لا توجد فيديوهات في هذه الفئة بعد.</p>') +
            "</div>" +
            "</div>"
        );
    }

    function renderTreeVideo(v, idx, total) {
        var thumb = v.thumbnail || (v.platform === "youtube" ? "https://img.youtube.com/vi/" + encodeURIComponent(v.videoId) + "/default.jpg" : "");
        var platformIcon = v.platform === "instagram" ? "fa-instagram" : "fa-youtube";
        var thumbHTML = thumb ? '<img src="' + esc(thumb) + '" alt="">' : '<i class="fab ' + platformIcon + '"></i>';
        return (
            '<div class="tree-video-row" data-uid="' + esc(v.uid) + '">' +
            '<div class="tree-video-thumb">' + thumbHTML + "</div>" +
            '<div class="tree-video-info">' +
            '<div class="v-title">' + esc(v.title) + "</div>" +
            '<div class="v-meta"><span><i class="fab ' + platformIcon + '"></i> ' + (v.platform === "instagram" ? "انستقرام" : "يوتيوب") + "</span><span>" + (v.type === "long" ? "طويل" : "قصير") + "</span>" + (v.orientation ? "<span>" + (v.orientation === "landscape" ? "عرضي 16:9" : "طولي 9:16") + "</span>" : "") + "</div>" +
            "</div>" +
            '<div class="tree-video-actions">' +
            '<button class="icon-btn" data-action="move-up" data-uid="' + esc(v.uid) + '" ' + (idx === 0 ? "disabled" : "") + '><i class="fas fa-arrow-up"></i></button>' +
            '<button class="icon-btn" data-action="move-down" data-uid="' + esc(v.uid) + '" ' + (idx === total - 1 ? "disabled" : "") + '><i class="fas fa-arrow-down"></i></button>' +
            '<button class="icon-btn" data-action="edit-video" data-uid="' + esc(v.uid) + '"><i class="fas fa-pen"></i></button>' +
            '<button class="icon-btn danger" data-action="delete-video" data-uid="' + esc(v.uid) + '"><i class="fas fa-trash"></i></button>' +
            "</div>" +
            "</div>"
        );
    }

    function toggleSectionEditForm(sectionId) {
        var sectionEl = document.querySelector('.tree-section[data-section="' + cssEsc(sectionId) + '"]');
        if (!sectionEl) return;
        var slot = sectionEl.querySelector(".section-edit-slot");
        var sec = findSection(sectionId);
        if (!sec) return;
        slot.innerHTML =
            '<div class="inline-edit-form">' +
            '<div class="field-row">' +
            '<div><label>عنوان القسم</label><input type="text" class="ie-title" value="' + esc(sec.title) + '"></div>' +
            '<div><label>اسم القسم في القائمة</label><input type="text" class="ie-nav" value="' + esc(sec.navLabel || "") + '"></div>' +
            "</div>" +
            "<div><label>وصف مختصر</label><input type=\"text\" class=\"ie-subtitle\" value=\"" + esc(sec.subtitle || "") + '"></div>' +
            '<div class="inline-edit-actions">' +
            '<button type="button" class="dash-btn small ie-save">حفظ</button>' +
            '<button type="button" class="dash-btn dash-btn-ghost small ie-cancel">إلغاء</button>' +
            "</div>" +
            "</div>";
        slot.querySelector(".ie-save").addEventListener("click", function () {
            sec.title = slot.querySelector(".ie-title").value.trim() || sec.title;
            sec.navLabel = slot.querySelector(".ie-nav").value.trim() || sec.title;
            sec.subtitle = slot.querySelector(".ie-subtitle").value.trim();
            saveData();
            refreshDestinationSelectors();
            showToast("تم تحديث القسم.");
        });
        slot.querySelector(".ie-cancel").addEventListener("click", function () {
            slot.innerHTML = "";
        });
    }

    function toggleDepartmentEditForm(sectionId, deptId) {
        var depEl = document.querySelector('.tree-department[data-section="' + cssEsc(sectionId) + '"][data-dept="' + cssEsc(deptId) + '"]');
        if (!depEl) return;
        var slot = depEl.querySelector(".department-edit-slot");
        var dep = findDepartment(sectionId, deptId);
        if (!dep) return;
        slot.innerHTML =
            '<div class="inline-edit-form">' +
            '<div class="field-row">' +
            '<div><label>عنوان الفئة</label><input type="text" class="ied-title" value="' + esc(dep.title || "") + '"></div>' +
            '<div><label>أيقونة Font Awesome</label><input type="text" class="ied-icon" value="' + esc(dep.icon || "") + '" placeholder="fa-star"></div>' +
            "</div>" +
            "<div><label>وصف</label><input type=\"text\" class=\"ied-desc\" value=\"" + esc(dep.description || "") + '"></div>' +
            '<div class="inline-edit-actions">' +
            '<button type="button" class="dash-btn small ied-save">حفظ</button>' +
            '<button type="button" class="dash-btn dash-btn-ghost small ied-cancel">إلغاء</button>' +
            "</div>" +
            "</div>";
        slot.querySelector(".ied-save").addEventListener("click", function () {
            dep.title = slot.querySelector(".ied-title").value.trim();
            dep.icon = slot.querySelector(".ied-icon").value.trim();
            dep.description = slot.querySelector(".ied-desc").value.trim();
            saveData();
            refreshDestinationSelectors();
            showToast("تم تحديث الفئة.");
        });
        slot.querySelector(".ied-cancel").addEventListener("click", function () {
            slot.innerHTML = "";
        });
    }

    function toggleAddDepartmentForm(sectionId) {
        var sectionEl = document.querySelector('.tree-section[data-section="' + cssEsc(sectionId) + '"]');
        if (!sectionEl) return;
        var slot = sectionEl.querySelector(".section-edit-slot");
        slot.innerHTML =
            '<div class="inline-edit-form">' +
            '<div class="field-row">' +
            '<div><label>عنوان الفئة (اختياري)</label><input type="text" class="nd-title"></div>' +
            '<div><label>أيقونة Font Awesome (اختياري)</label><input type="text" class="nd-icon" placeholder="fa-star"></div>' +
            "</div>" +
            '<div><label>وصف (اختياري)</label><input type="text" class="nd-desc"></div>' +
            '<div class="inline-edit-actions">' +
            '<button type="button" class="dash-btn small nd-save">إضافة الفئة</button>' +
            '<button type="button" class="dash-btn dash-btn-ghost small nd-cancel">إلغاء</button>' +
            "</div>" +
            "</div>";
        slot.querySelector(".nd-save").addEventListener("click", function () {
            var sec = findSection(sectionId);
            if (!sec) return;
            sec.departments.push({
                id: genId("dept"),
                icon: slot.querySelector(".nd-icon").value.trim(),
                title: slot.querySelector(".nd-title").value.trim(),
                description: slot.querySelector(".nd-desc").value.trim(),
                videos: []
            });
            saveData();
            refreshDestinationSelectors();
            showToast("تمت إضافة الفئة.");
        });
        slot.querySelector(".nd-cancel").addEventListener("click", function () {
            slot.innerHTML = "";
        });
    }

    function deleteSection(id) {
        if (BUILTIN_SECTION_IDS.indexOf(id) !== -1) return;
        if (!window.confirm("هل أنت متأكد من حذف هذا القسم بكل فئاته وفيديوهاته؟ لا يمكن التراجع بعد النشر.")) return;
        siteData.sections = siteData.sections.filter(function (s) { return s.id !== id; });
        saveData();
        refreshDestinationSelectors();
        showToast("تم حذف القسم.");
    }

    function deleteDepartment(sectionId, deptId) {
        if (!window.confirm("هل أنت متأكد من حذف هذه الفئة وكل الفيديوهات بداخلها؟")) return;
        var sec = findSection(sectionId);
        if (!sec) return;
        sec.departments = sec.departments.filter(function (d) { return d.id !== deptId; });
        saveData();
        refreshDestinationSelectors();
        showToast("تم حذف الفئة.");
    }

    function deleteVideo(uid) {
        if (!window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;
        var loc = findVideoLocation(uid);
        if (!loc) return;
        loc.department.videos.splice(loc.index, 1);
        saveData();
        showToast("تم حذف الفيديو.");
    }

    function moveVideo(uid, dir) {
        var loc = findVideoLocation(uid);
        if (!loc) return;
        var arr = loc.department.videos;
        var newIndex = loc.index + dir;
        if (newIndex < 0 || newIndex >= arr.length) return;
        var tmp = arr[newIndex];
        arr[newIndex] = arr[loc.index];
        arr[loc.index] = tmp;
        saveData();
    }

    function moveDepartment(sectionId, deptId, dir) {
        var sec = findSection(sectionId);
        if (!sec) return;
        var arr = sec.departments;
        var i = arr.findIndex(function (d) { return d.id === deptId; });
        var j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return;
        var tmp = arr[j];
        arr[j] = arr[i];
        arr[i] = tmp;
        saveData();
        refreshDestinationSelectors();
    }

    function handleManageTreeClick(e) {
        var btn = e.target.closest("[data-action]");
        if (!btn || btn.disabled) return;
        var action = btn.getAttribute("data-action");
        var sectionId = btn.getAttribute("data-section");
        var deptId = btn.getAttribute("data-dept");
        var uid = btn.getAttribute("data-uid");

        if (action === "edit-video") enterEditMode(uid);
        else if (action === "delete-video") deleteVideo(uid);
        else if (action === "move-up") moveVideo(uid, -1);
        else if (action === "move-down") moveVideo(uid, 1);
        else if (action === "dept-up") moveDepartment(sectionId, deptId, -1);
        else if (action === "dept-down") moveDepartment(sectionId, deptId, 1);
        else if (action === "delete-section") deleteSection(sectionId);
        else if (action === "delete-department") deleteDepartment(sectionId, deptId);
        else if (action === "edit-section") toggleSectionEditForm(sectionId);
        else if (action === "edit-department") toggleDepartmentEditForm(sectionId, deptId);
        else if (action === "add-department") toggleAddDepartmentForm(sectionId);
    }

    function handleAddSectionClick() {
        var tree = $("manageTree");
        var existing = tree.querySelector(".new-section-inline");
        if (existing) {
            existing.remove();
            return;
        }
        var div = document.createElement("div");
        div.className = "tree-section new-section-inline";
        div.innerHTML =
            '<div class="inline-edit-form">' +
            '<div class="field-row">' +
            '<div><label>عنوان القسم</label><input type="text" class="ns-title" placeholder="مثال: مشاريع 2026"></div>' +
            '<div><label>اسم القسم في القائمة</label><input type="text" class="ns-nav" placeholder="يظهر في أعلى الصفحة"></div>' +
            "</div>" +
            '<div><label>وصف مختصر (اختياري)</label><input type="text" class="ns-subtitle"></div>' +
            '<div class="inline-edit-actions">' +
            '<button type="button" class="dash-btn small ns-save">إنشاء القسم</button>' +
            '<button type="button" class="dash-btn dash-btn-ghost small ns-cancel">إلغاء</button>' +
            "</div>" +
            "</div>";
        tree.insertBefore(div, tree.firstChild);
        div.querySelector(".ns-save").addEventListener("click", function () {
            var title = div.querySelector(".ns-title").value.trim();
            if (!title) {
                showToast("أدخل عنوان القسم.", true);
                return;
            }
            var newSection = {
                id: genId("section"),
                navLabel: div.querySelector(".ns-nav").value.trim() || title,
                title: title,
                subtitle: div.querySelector(".ns-subtitle").value.trim(),
                departments: []
            };
            siteData.sections.push(newSection);
            saveData();
            refreshDestinationSelectors(newSection.id);
            showToast("تم إنشاء القسم.");
        });
        div.querySelector(".ns-cancel").addEventListener("click", function () {
            div.remove();
        });
    }

    /* ============================= تبويب النشر ============================= */

    function handleDownloadDataJs() {
        var content =
            "/*\n  data.js — تم توليده من لوحة التحكم بتاريخ " + new Date().toLocaleString("ar-EG") +
            "\n  استبدل ملف data.js في مجلد الموقع بهذا الملف، ثم أعد رفع الموقع حتى تظهر\n  التعديلات لكل الزوار.\n*/\n" +
            "window.SITE_DATA = " + JSON.stringify(siteData, null, 2) + ";\n";
        var blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "data.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        showToast("تم تحميل data.js — لا تنسَ استبداله في ملفات الموقع ثم إعادة الرفع.");
    }

    function handleResetData() {
        if (!window.confirm("سيتم إلغاء كل التعديلات المحلية غير المنشورة والعودة لآخر نسخة data.js. هل تريد المتابعة؟")) return;
        clearLocalCopy();
        siteData = deepClone(window.SITE_DATA || { sections: [] });
        $("unsavedBadge").hidden = true;
        renderManageTree();
        refreshDestinationSelectors();
        refreshPreview();
        showToast("تم استرجاع النسخة المنشورة.");
    }

    /* ============================= تهيئة لوحة التحكم ============================= */

    function initDashboard() {
        siteData = loadData();
        $("unsavedBadge").hidden = !safeGet(localStorage, STORAGE_KEY);
        if (staleLocalReplaced) {
            showToast("ملف data.js اتحدّث بعد آخر تعديلات محلية — بنعرض النسخة الجديدة، والتعديلات القديمة اتحفظت كنسخة احتياطية.");
        }

        renderManageTree();
        refreshDestinationSelectors();
        onPlatformChange();

        document.querySelectorAll(".dash-tab").forEach(function (btn) {
            btn.addEventListener("click", function () { switchTab(btn.getAttribute("data-tab")); });
        });

        $("videoPlatform").addEventListener("change", onPlatformChange);
        $("destSection").addEventListener("change", function () { onDestSectionChange(); });
        $("destDepartment").addEventListener("change", onDestDepartmentChange);

        $("videoThumbFile").addEventListener("change", function (e) {
            var file = e.target.files[0];
            if (!file) return;
            if (file.size > 3 * 1024 * 1024) {
                showToast("حجم الصورة كبير جداً (الحد الأقصى تقريباً 3 ميجابايت).", true);
                e.target.value = "";
                return;
            }
            var reader = new FileReader();
            reader.onload = function (ev) {
                uploadedThumbDataUrl = ev.target.result;
                $("videoThumbUrl").value = "";
                showThumbPreview(uploadedThumbDataUrl);
            };
            reader.readAsDataURL(file);
        });

        $("videoThumbUrl").addEventListener("input", function () {
            if (this.value.trim()) {
                uploadedThumbDataUrl = null;
                $("videoThumbFile").value = "";
                showThumbPreview(this.value.trim());
            } else if (!uploadedThumbDataUrl) {
                hideThumbPreview();
            }
        });

        $("clearThumbBtn").addEventListener("click", function () {
            uploadedThumbDataUrl = null;
            $("videoThumbUrl").value = "";
            $("videoThumbFile").value = "";
            hideThumbPreview();
        });

        $("videoForm").addEventListener("submit", handleVideoFormSubmit);
        $("cancelEditBtn").addEventListener("click", function () {
            exitEditMode();
            resetVideoFieldsOnly();
        });

        $("manageTree").addEventListener("click", handleManageTreeClick);
        $("addSectionBtn").addEventListener("click", handleAddSectionClick);

        $("downloadDataBtn").addEventListener("click", handleDownloadDataJs);
        $("resetDataBtn").addEventListener("click", handleResetData);

        $("refreshPreviewBtn").addEventListener("click", refreshPreview);

        $("logoutBtn").addEventListener("click", function () {
            safeRemove(sessionStorage, AUTH_SESSION_KEY);
            location.reload();
        });
    }

    /* ============================= بوابة الدخول ============================= */

    // بعض المتصفحات (وضع التصفح الخاص، أو إضافات حجب معينة) تمنع الوصول لـ
    // sessionStorage/localStorage وترمي خطأ عند مجرد قراءتها. لو حصل ذلك بدون
    // معالجة، كل الكود اللي بعده يتوقف عن العمل بصمت — وهيبان إن زرار "دخول"
    // "مش بيعمل حاجة". الدوال دي بتحمي من الاحتمال ده.
    function safeGet(store, key) {
        try { return store.getItem(key); } catch (e) { return null; }
    }
    function safeSet(store, key, val) {
        try { store.setItem(key, val); } catch (e) { console.warn("تعذّر الحفظ في storage:", e); }
    }
    function safeRemove(store, key) {
        try { store.removeItem(key); } catch (e) { /* تجاهل بأمان */ }
    }
    window.MB_SAFE_STORAGE = { get: safeGet, set: safeSet, remove: safeRemove };

    function showApp() {
        $("authGate").hidden = true;
        $("dashboardApp").hidden = false;
        try {
            initDashboard();
        } catch (e) {
            console.error("خطأ أثناء تحميل لوحة التحكم:", e);
            showToast("حدث خطأ غير متوقع أثناء تحميل اللوحة — افتح أدوات المطوّر (F12) → Console لمعرفة التفاصيل.", true);
        }
    }

    try {
        if (safeGet(sessionStorage, AUTH_SESSION_KEY) === "ok") {
            showApp();
        } else {
            $("authForm").addEventListener("submit", function (e) {
                e.preventDefault();
                var val = $("authPassword").value.trim();
                if (sha256(val) === DASHBOARD_PASSWORD_HASH) {
                    safeSet(sessionStorage, AUTH_SESSION_KEY, "ok");
                    showApp();
                } else {
                    $("authError").hidden = false;
                    $("authPassword").value = "";
                    $("authPassword").focus();
                }
            });
        }
    } catch (e) {
        console.error("خطأ أثناء تهيئة بوابة الدخول:", e);
    }
})();
