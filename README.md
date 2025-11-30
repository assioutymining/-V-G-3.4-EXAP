# Pyramids Gold System v2.0

نظام محاسبي متكامل لإدارة معمل فحص الذهب وعمليات البيع والشراء.

## تعليمات التثبيت والتشغيل (Installation)

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. التشغيل للتطوير (Development)
```bash
npm run dev
```

### 3. بناء نسخة الويب (GitHub Pages)
```bash
npm run build
```
ستجد الملفات الجاهزة في مجلد `dist`.

### 4. بناء نسخة سطح المكتب (Windows .exe)
تأكد من وجود جميع الملفات، ثم:
```bash
npm run electron:build
```
ستجد ملف التثبيت `.exe` في مجلد `release`.

### 5. بناء تطبيق الموبايل (Android .apk)
```bash
# تثبيت أدوات أندرويد أولاً
npm install @capacitor/android
npx cap add android

# بناء التطبيق
npm run android:build
```
سيفتح هذا الأمر Android Studio، ومن هناك يمكنك استخراج ملف APK.

## الملاحظات
- تأكد من تثبيت Node.js على جهازك.
- لتطبيق الموبايل، تحتاج إلى تثبيت Android Studio.