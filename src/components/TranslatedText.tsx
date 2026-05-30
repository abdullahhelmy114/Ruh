"use client";

import React from "react";

interface TProps {
  children: string;
}

// مكون بسيط: النص الإنجليزي هو المفتاح، والترجمة تُجلب من ملفات JSON (أو يبقى كما هو)
// هذا يحل محل i18n/translations القديم
export function T({ children }: TProps) {
  // يمكنك لاحقاً توصيله بـ next-intl إذا أردت
  // حاليًا يعرض النص كما هو (الترجمة ستُضاف لاحقاً)
  return React.createElement(React.Fragment, null, children);
}

// تصدير افتراضي للتوافق
export default T;