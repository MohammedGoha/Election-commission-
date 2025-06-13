export const handleApiError = (response: Response, logout: () => void): void => {
  if (!response.ok) {
    if (response.status === 401) {
      logout(); // Token expired or invalid
      throw new Error("تم تسجيل الخروج تلقائيًا. الرجاء تسجيل الدخول مجددًا.");
    }

    if (response.status === 404) {
      throw new Error("المورد غير موجود (404).");
    }

    throw new Error(`حدث خطأ أثناء تحميل البيانات: ${response.statusText}`);
  }
};
export function translateDetailKeyToArabic(key: string): string {
  const translations: Record<string, string> = {
    voter_id: 'رقم الناخب',
    election_id: 'معرف الانتخابات',
    candidate_id: 'معرف المرشح',
    old_status: 'الحالة السابقة',
    new_status: 'الحالة الجديدة',
    updated_by: 'تم التحديث بواسطة',
    changed_by: 'تم التغيير بواسطة',
    computed_by: 'تم الحساب بواسطة',
    reason: 'السبب',
    user_id: 'معرف المستخدم',
    creator_id: 'معرف المنشئ',
    candidate_count: 'عدد المرشحين',
    eligible_governorates: 'المحافظات',
    role: 'الدور',
    votes: 'عدد الأصوات',
    governorate: 'المحافظة',
    name: 'الاسم',
    phone: 'رقم الهاتف',
    timestamp: 'التوقيت',
    tx_id: 'معرف المعاملة',
    block_number: 'رقم الكتلة'
  };

  return translations[key] || key;
}

