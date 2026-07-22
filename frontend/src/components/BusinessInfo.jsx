// İşletmeler için tanıtım/süreç sayfası — "Hakkımızda" ile aynı estetik.
// Amaç: bir işletmenin Artı'da baştan sona nasıl çalıştığını anlatmak
// (başvuru → onay → günlük kutu şablonu → otomatik yayın → WhatsApp ekstra
// → müşteri siparişi → QR teslim → hakediş). İçerik gerçek akışla birebir.
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, CalendarClock, Boxes, MessageCircle, ShoppingBag, QrCode, Banknote,
  ShieldCheck, TrendingUp, Leaf, Users, ArrowRight, Lock, RefreshCw,
} from 'lucide-react';

// Scroll'da görünürken aşağıdan yukarı süzülerek beliren kart animasyonu.
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};
const viewport = { once: true, amount: 0.25 };

const VALUES = [
  { icon: TrendingUp, title: 'Ek gelir', text: 'Gün sonunda elinizde kalacak taze ürünleri çöpe atmak yerine ek gelire dönüştürün.' },
  { icon: Leaf, title: 'Sıfır israf', text: 'Kurtardığınız her kutu, doğaya salınacak karbonu ve su israfını doğrudan azaltır.' },
  { icon: Users, title: 'Yeni müşteri', text: 'Çevrenizdeki binlerce Artı kullanıcısı işletmenizi keşfeder, sadık müşteriye dönüşür.' },
  { icon: RefreshCw, title: 'Kolay operasyon', text: 'Bir kez ayarlayın, sistem her gün otomatik yayınlasın. Her gün tek tek uğraşmak yok.' },
];

const STEPS = [
  {
    icon: ClipboardCheck, tag: 'ADIM 1', title: 'Başvuru & Onay',
    text: 'İşletme bilgilerinizle (adres, il/ilçe, vergi bilgileri) kaydolun. Ekibimiz başvurunuzu inceleyip onaylar. Vergi numaranız KVKK uyumlu şekilde şifreli saklanır — panelde yalnızca yetkiliye açılır.',
  },
  {
    icon: CalendarClock, tag: 'ADIM 2', title: 'Günlük kutunuzu bir kez ayarlayın',
    text: 'Günlük kutu adedinizi, hakediş fiyatınızı, teslim saatlerinizi ve kutu içeriğinizi bir kez belirlersiniz. Her gün sisteme tek tek girmenize gerek kalmaz.',
  },
  {
    icon: Boxes, tag: 'ADIM 3', title: 'Sistem her gün otomatik yayınlar',
    text: 'Belirlediğiniz şablona göre sürpriz kutularınız her gün otomatik olarak keşfet sayfasında listelenir. Siz mutfağınıza odaklanın, yayını sistem üstlensin.',
  },
  {
    icon: MessageCircle, tag: 'ADIM 4', title: 'WhatsApp ekstra kutu sorar',
    text: 'Teslim saatinden birkaç saat önce WhatsApp\'tan "Bugün ekstra kutunuz var mı?" mesajı gelir. "Evet, 5" derseniz o günün kutu adedi anında güncellenir. Fazla ürününüz varsa tek mesajla değerlendirin.',
  },
  {
    icon: ShoppingBag, tag: 'ADIM 5', title: 'Müşteri sipariş verir & öder',
    text: 'Çevrenizdeki müşteriler kutunuzu keşfeder, uygulama üzerinden güvenle ödemesini yapar. Ödeme onaylanınca müşteriye teslim QR kodu oluşturulur.',
  },
  {
    icon: QrCode, tag: 'ADIM 6', title: 'QR ile teslim',
    text: 'Müşteri geldiğinde QR kodunu okutursunuz, kutuyu teslim edersiniz. Stok anında ve güvenli şekilde düşer; aynı kod ikinci kez kullanılamaz.',
  },
  {
    icon: Banknote, tag: 'ADIM 7', title: 'Hakedişinizi alın',
    text: 'Her satıştan hakedişiniz birikir ve düzenli ödeme döneminde IBAN\'ınıza yatırılır. Tüm hakediş geçmişinizi panelden anlık takip edersiniz.',
  },
];

const TRUST = [
  { icon: TrendingUp, title: 'Şeffaf kazanç', text: 'Hakediş fiyatınızı siz belirlersiniz. Müşteri bunun üzerine küçük bir platform komisyonu öder — siz her zaman belirlediğiniz net tutarı alırsınız.' },
  { icon: Lock, title: 'KVKK & şifreleme', text: 'Vergi numaranız gibi kritik bilgiler AES-256 ile şifreli saklanır. Verileriniz güvende.' },
  { icon: ShieldCheck, title: 'IBAN onay koruması', text: 'Banka bilgisi (IBAN) değişikliği güvenlik gereği yönetici onayından geçer; hesabınız ele geçse bile ödeme başka yere yönlendirilemez.' },
  { icon: Users, title: 'Güvenli ekip paneli', text: 'Çalışanlarınıza sınırlı yetki verin, çok cihazlı oturumları görün ve tek tıkla güvenli çıkış yapın.' },
];

export default function BusinessInfo() {
  return (
    <div className="bg-[#faf8f5] min-h-screen text-emerald-950">
      {/* Hero — arka plan görseli + koyu overlay (nav ve metin okunur kalır) */}
      <div className="relative isolate overflow-hidden">
        <img
          src="/food_bread.jpg" alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden loading="eager"
        />
        {/* okunabilirlik için degrade örtü */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/70 to-emerald-950/90" aria-hidden />
        <div className="relative z-10 pt-40 pb-24 lg:pt-48 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto text-center px-6">
            <span className="text-emerald-200 font-extrabold uppercase tracking-widest text-[11px] block mb-5">İŞ ORTAĞIMIZ OLUN</span>
            <h1 className="font-logo text-5xl lg:text-7xl font-medium text-white tracking-tight leading-[1.05] drop-shadow-sm">
              Gıda fazlanızı gelire dönüştürün
            </h1>
            <p className="text-white/90 text-lg lg:text-2xl mt-6 font-light max-w-2xl mx-auto leading-relaxed">
              Fırın, kafe, market, restoran… Gün sonunda elinizde kalanı israf etmeyin. Artı ile ek gelir kazanın, yeni müşterilere ulaşın, gezegene katkı sağlayın.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/business" state={{ mode: 'register' }}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-brand-dark font-bold text-sm px-9 py-4 rounded-full shadow-lg transition duration-300 transform hover:-translate-y-0.5"
              >
                Hemen başvurun <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/business" state={{ mode: 'login' }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-9 py-4 rounded-full border border-white/40 transition duration-300"
              >
                Mağaza girişi
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Neden Artı? */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 mt-16 lg:mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
              className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-brand mb-5">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-emerald-950 mb-2">{title}</h3>
              <p className="text-emerald-950/70 text-sm font-light leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Nasıl çalışır — süreç */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pt-24 lg:pt-36">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand font-extrabold uppercase tracking-widest text-[11px] block mb-4">NASIL ÇALIŞIR</span>
          <h2 className="font-logo text-4xl lg:text-5xl font-medium text-emerald-950 leading-tight tracking-tight">
            Başvurudan hakedişe, adım adım
          </h2>
          <p className="text-emerald-950/70 text-base lg:text-lg mt-5 font-light leading-relaxed">
            Kurulumu bir kez yaparsınız; günlük operasyonu Artı otomatikleştirir. İşte işletmenizin uçtan uca yolculuğu.
          </p>
        </div>

        <div className="relative">
          {/* dikey çizgi (masaüstü) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-emerald-100 -translate-x-1/2" aria-hidden />
          <div className="space-y-8 lg:space-y-0">
            {STEPS.map(({ icon: Icon, tag, title, text }, i) => (
              <div key={tag} className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                {/* Kart */}
                <div className={`relative ${i % 2 ? 'lg:pl-16' : 'lg:pr-16'} lg:py-8`}>
                  <motion.div
                    initial={{ opacity: 0, x: i % 2 ? 48 : -48 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewport}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100/60 hover:shadow-2xl transition-shadow duration-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="text-brand font-extrabold uppercase tracking-widest text-[10px] block">{tag}</span>
                        <h3 className="font-logo text-2xl font-medium text-emerald-950 leading-tight">{title}</h3>
                      </div>
                    </div>
                    <p className="text-emerald-950/75 text-[15px] font-light leading-relaxed">{text}</p>
                  </motion.div>
                  {/* orta nokta (masaüstü) */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${i % 2 ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} h-4 w-4 rounded-full bg-brand ring-4 ring-[#faf8f5]`} aria-hidden />
                </div>
                {/* boş taraf (masaüstü hizalama) */}
                <div className="hidden lg:block" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Güven & kazanç */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pt-24 lg:pt-36">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-brand font-extrabold uppercase tracking-widest text-[11px] block mb-4">GÜVEN & KAZANÇ</span>
          <h2 className="font-logo text-4xl lg:text-5xl font-medium text-emerald-950 leading-tight tracking-tight">
            Kazancınız şeffaf, bilgileriniz güvende
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRUST.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
              className="flex items-start gap-5 bg-white rounded-3xl p-7 shadow-sm border border-gray-100/70 hover:shadow-lg transition-shadow duration-500"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-brand">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-emerald-950 mb-1.5">{title}</h3>
                <p className="text-emerald-950/70 text-sm font-light leading-relaxed">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-24 lg:py-36">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-8 py-16 lg:px-20 lg:py-24 text-center shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-logo text-3xl lg:text-5xl font-medium text-white leading-tight tracking-tight">
              Mahallenizde israfı önlemeye bugün başlayın
            </h2>
            <p className="text-white/85 text-base lg:text-lg mt-5 font-light leading-relaxed">
              Başvurunuzu birkaç dakikada tamamlayın. Onaydan sonra ilk sürpriz kutunuzu yayınlamak için hazırsınız.
            </p>
            <Link
              to="/business" state={{ mode: 'register' }}
              className="mt-9 inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-brand-dark font-bold text-sm px-10 py-4 rounded-full shadow-lg transition duration-300 transform hover:-translate-y-0.5"
            >
              İş ortağımız olun <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
