import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Masa & Sipariş",
    description:
      "Masaları, siparişleri ve mutfak akışını tek bir merkezden yönetin.",
  },
  {
    number: "02",
    title: "Kasa Yönetimi",
    description:
      "Ödemeleri, açık hesapları ve gün sonu operasyonunu sade bir ekranda yönetin.",
  },
  {
    number: "03",
    title: "Stok & Satın Alma",
    description:
      "İşletmenin gerçek operasyonunu ölçülebilir verilerle yönetmek için tasarlanıyor.",
  },
  {
    number: "04",
    title: "Tek Merkez",
    description:
      "Dağınık araçlar yerine işletmenin günlük operasyonunu tek sistemde birleştirin.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#18231d]">
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_80%_15%,rgba(197,162,82,0.20),transparent_28%),radial-gradient(circle_at_15%_25%,rgba(35,65,49,0.12),transparent_30%)]" />

        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3427] text-sm font-black text-[#d9b86c] shadow-lg shadow-[#1d3427]/10">
              İ
            </span>
            <span className="text-xl font-black tracking-[0.18em] text-[#1d3427]">
              İŞLETMECİ
            </span>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#1d3427]/15 bg-white/70 px-5 py-2.5 text-sm font-bold text-[#1d3427] backdrop-blur transition hover:bg-white"
          >
            Giriş Yap
          </Link>
        </nav>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9cba9] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#65705f] backdrop-blur">
              Restoran operasyonunun yeni merkezi
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#17241c] sm:text-6xl lg:text-7xl">
              İşletmenizi
              <span className="block text-[#b28a3e]">tek sistemden</span>
              yönetin.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d675f] sm:text-xl">
              İşletmeci; masa, sipariş ve kasa operasyonunu sadeleştiren,
              restoranların günlük işleyişini tek merkezde toplamaya odaklanan
              yeni nesil işletme platformudur.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-[#1d3427] px-7 py-4 text-center text-sm font-extrabold text-white shadow-xl shadow-[#1d3427]/15 transition hover:-translate-y-0.5 hover:bg-[#274936]"
              >
                İşletme Paneline Gir
              </Link>
              <a
                href="#sistem"
                className="rounded-2xl border border-[#1d3427]/15 bg-white px-7 py-4 text-center text-sm font-extrabold text-[#1d3427] transition hover:-translate-y-0.5 hover:border-[#b28a3e]/40"
              >
                Sistemi Keşfet
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#6c756d]">
              <span>✓ Masa yönetimi</span>
              <span>✓ Sipariş yönetimi</span>
              <span>✓ Kasa yönetimi</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#c5a252]/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-[#1d3427] p-3 shadow-2xl shadow-[#1d3427]/20">
              <div className="rounded-[1.5rem] bg-[#f8f6f1] p-5 sm:p-7">
                <div className="flex items-center justify-between border-b border-[#dfe1da] pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a928a]">
                      İşletme Paneli
                    </p>
                    <p className="mt-1 text-xl font-black text-[#1d3427]">
                      Bugünkü Operasyon
                    </p>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-[#b28a3e] shadow-[0_0_0_6px_rgba(178,138,62,0.12)]" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-[#8a928a]">Açık Masa</p>
                    <p className="mt-2 text-3xl font-black text-[#1d3427]">08</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-[#8a928a]">Aktif Sipariş</p>
                    <p className="mt-2 text-3xl font-black text-[#1d3427]">14</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-[#1d3427]">Sipariş Akışı</p>
                    <span className="rounded-full bg-[#eef3ed] px-2.5 py-1 text-[10px] font-bold text-[#477052]">
                      CANLI
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Masa 4", "Masa 7", "Masa 9"].map((table, index) => (
                      <div
                        key={table}
                        className="flex items-center justify-between rounded-xl bg-[#f7f7f3] px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d3427] text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="text-sm font-bold text-[#344138]">{table}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#8a928a]">
                          Hazırlanıyor
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sistem" className="border-y border-[#dedbd2] bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b28a3e]">
              Sistem
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#1d3427] sm:text-4xl">
              Günlük operasyonu karmaşıklaştırmadan yönetin.
            </h2>
            <p className="mt-5 leading-7 text-[#687168]">
              İşletmeci, işletmenin günlük ihtiyaçlarından yola çıkarak
              geliştiriliyor. Amaç daha fazla ekran değil; daha az karmaşa,
              daha net operasyon.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-3xl border border-[#e3e1da] bg-[#faf9f6] p-6 transition hover:-translate-y-1 hover:border-[#cdbb91] hover:shadow-lg hover:shadow-[#1d3427]/5"
              >
                <span className="text-xs font-black tracking-[0.18em] text-[#b28a3e]">
                  {feature.number}
                </span>
                <h3 className="mt-10 text-lg font-black text-[#1d3427]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#707870]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1d3427] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d9b86c]">
              Gerçek işletmeden doğuyor
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Önce Nonna'da. Sonra daha fazla işletmede.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/65">
              İşletmeci, gerçek restoran operasyonu içinde test edilerek
              geliştirilen ve farklı işletmelere ölçeklenmek üzere tasarlanan
              bir platformdur.
            </p>
          </div>

          <Link
            href="/login"
            className="shrink-0 rounded-2xl bg-[#d9b86c] px-7 py-4 text-center text-sm font-black text-[#1d3427] transition hover:bg-[#e4c982]"
          >
            Panele Giriş Yap
          </Link>
        </div>
      </section>

      <footer className="bg-[#14251c] px-6 py-8 text-center text-xs font-semibold text-white/45">
        © 2026 İşletmeci — Restoran Operasyon Platformu
      </footer>
    </main>
  );
}
