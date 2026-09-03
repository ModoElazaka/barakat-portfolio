/*
  data.js
  ---------------------------------------------------------------
  هذا الملف يحتوي على كل محتوى الفيديوهات في الموقع (الأقسام،
  الفئات داخل كل قسم، والفيديوهات نفسها). يقوم render.js بقراءة
  هذا الملف وبناء الصفحة منه تلقائياً.

  لوحة التحكم (dashboard.html) تعدّل نسخة من هذه البيانات وتحفظها
  في localStorage الخاص بالمتصفح. عند الضغط على "تحميل data.js
  المحدث" من لوحة التحكم، سيتم توليد نسخة جديدة من هذا الملف
  بنفس الشكل بالضبط — يمكنك استبدال هذا الملف بها عند رفع الموقع
  حتى تظهر التغييرات لكل الزوار.
  ---------------------------------------------------------------
*/
window.SITE_DATA = {
  "sections": [
    {
      "id": "reels",
      "navLabel": "الريلز",
      "title": "Reels / Short Videos",
      "subtitle": "أعمالي في الريلز والمقاطع القصيرة",
      "departments": [
        {
          "id": "dental-videos",
          "icon": "fa-tooth",
          "title": "Dental Motion Graphics",
          "description": "مقاطع موشن جرافيك متخصصة في مجال طب الأسنان والعيادات السنية",
          "videos": [
            { "uid": "d1", "videoId": "K6mfN9dyOAY", "platform": "youtube", "type": "short", "title": "تركيبات اسنان" },
            { "uid": "d2", "videoId": "S3jNKzu0jeM", "platform": "youtube", "type": "short", "title": "تركيبات اسنان 2 بدون موسيقى" },
            { "uid": "d3", "videoId": "roTVFzth48o", "platform": "youtube", "type": "short", "title": "حلة زراعة سنان" }
          ]
        },
        {
          "id": "clinics-videos",
          "icon": "fa-stethoscope",
          "title": "Beauty Clinics Videos",
          "description": "مقاطع ترويجية وتعليمية لعيادات التجميل والتجميل الطبي",
          "videos": [
            { "uid": "c1", "videoId": "sttWYKD5EaM", "platform": "youtube", "type": "short", "title": "dr shimaa Z-clinic vid 4" },
            { "uid": "c2", "videoId": "W4MUDlYyS3c", "platform": "youtube", "type": "short", "title": "animation" },
            { "uid": "c3", "videoId": "Z0JbTdehnN8", "platform": "youtube", "type": "short", "title": "profhydro" }
          ]
        },
        {
          "id": "talking-head-videos",
          "icon": "fa-chair",
          "title": "Talking Head Videos",
          "description": "مقاطع يتحدث فيها شخص امام الكاميرا مباشرة عن شي معين",
          "videos": [
            { "uid": "t1", "videoId": "CmKgbE_9iV8", "platform": "youtube", "type": "short", "title": "patient review" },
            { "uid": "t2", "videoId": "Pu8EMSssXbw", "platform": "youtube", "type": "short", "title": "ا. خالد المحامي 1" },
            { "uid": "t3", "videoId": "HIjp2RFsImU", "platform": "youtube", "type": "short", "title": "الفارس الشهم" }
          ]
        },
        {
          "id": "motion-videos",
          "icon": "fa-film",
          "title": "Motion graphics(collage and more..)",
          "description": "مقاطع موشن جرافيك بأنواعها لفيديوهات التعليق الصوتي",
          "videos": [
            { "uid": "m1", "videoId": "ao77WZLEGyM", "platform": "youtube", "type": "short", "title": "true football player" },
            { "uid": "m2", "videoId": "XRtqupsitm8", "platform": "youtube", "type": "short", "title": "motion graphics" },
            { "uid": "m3", "videoId": "wzbFL6QYwNw", "platform": "youtube", "type": "short", "title": "collage style motion graphics video" }
          ]
        }
      ]
    },
    {
      "id": "long",
      "navLabel": "الفيديوهات الطويلة",
      "title": "Long Form Videos",
      "subtitle": "أعمالي في الفيديوهات الطويلة",
      "departments": [
        {
          "id": "long-videos",
          "icon": "",
          "title": "",
          "description": "",
          "videos": [
            { "uid": "l1", "videoId": "KOquGlZaNco", "platform": "youtube", "type": "long", "title": "استكشاف الأردن -" },
            { "uid": "l2", "videoId": "MFLcdSeWr7M", "platform": "youtube", "type": "long", "title": "مارسيلو : إزاي شاب من حارات ريو بقي معجزة في ملاعب العالم!" },
            { "uid": "l3", "videoId": "8Ybj9hDLXJg", "platform": "youtube", "type": "long", "title": "مقدمة كتاب حركاتك الخمسة القادمة" }
          ]
        }
      ]
    }
  ]
};
