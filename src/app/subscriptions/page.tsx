import { sql } from '@/lib/db/client';
import PayPalButton from '@/components/PayPalButton';
import { Card, CardContent } from '@/components/ui/card';

// دالة جلب الخطط من قاعدة البيانات (أو fallback ثابت)
async function getPlans() {
  try {
    const result = await sql`
      SELECT id, name, price, duration, max_courses
      FROM subscription_plans
      WHERE active = true
      ORDER BY price ASC
    `;
    if (result && result.length > 0) {
      return result.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        duration: plan.duration,
        max_courses: plan.max_courses || 3,
      }));
    }
    // fallback إذا الجدول فاضي أو غير موجود
    return [
      { id: '1', name: 'الخطة الشهرية', price: 99, duration: '3 أشهر', max_courses: 3 },
      { id: '2', name: 'الخطة النصف سنوية', price: 179, duration: '6 أشهر', max_courses: 5 },
    ];
  } catch {
    return [
      { id: '1', name: 'الخطة الشهرية', price: 99, duration: '3 أشهر', max_courses: 3 },
    ];
  }
}

export default async function SubscriptionsPage() {
  const plans = await getPlans();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-foreground mb-8">خطط الاشتراك</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-card border-border p-8 text-center">
              <CardContent>
                <h2 className="text-2xl font-semibold text-foreground">{plan.name}</h2>
                <p className="text-muted-foreground mt-2">{plan.duration}</p>
                <p className="text-5xl font-bold text-primary my-6">${plan.price}</p>
                <p className="text-muted-foreground mb-6">
                  وصول لـ {plan.max_courses} كورسات من اختيارك
                </p>
                <PayPalButton
                  amount={plan.price.toFixed(2)}
                  onSuccess={async (details) => {
                    'use client'; // هذا السطر ضروري لأنه داخل async callback
                    try {
                      const res = await fetch('/api/payment/capture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          orderID: details.orderID,
                          payerID: details.payerID,
                          type: 'subscription',
                          plan_id: plan.id,
                        }),
                      });
                      const data = await res.json();
                      if (data.redirect) window.location.href = data.redirect;
                      else alert(data.error || 'فشل تأكيد الدفع');
                    } catch {
                      alert('خطأ في الشبكة');
                    }
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}