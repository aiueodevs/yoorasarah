import Image from "next/image";
import { type Product } from "../../../lib/api";
import { BagIcon } from "../../icons";
import { SiteLink } from "../../shared/site-link";

const arrivalSlugs = [
  "/hijab-1544/naura-oval-8249",
  "/dress/clara-dress-5254",
  "/abaya-2481/beyza-abaya-9167",
  "/dress/yoora-dress-9662",
  "/dress/medina-dress-8751",
  "/dress/yume-striped-dress-5604"
];

const bestSellerSlugs = [
  "/dress/bella-dress-4179",
  "/dress/yoora-dress-9662",
  "/abaya-2481/beyza-abaya-9167",
  "/hijab-1544/bergo-syar-i-6103"
];

export function EditorialHome({ products }: { products: Product[] }) {
  const arrivalProducts = pickProducts(products, arrivalSlugs, 6);
  const bestSellerProducts = pickProducts(products, bestSellerSlugs, 4, (product) => product.isBestSeller);
  const spotlightProduct = pickProduct(products, "/dress/medina-dress-8751") ?? products[0];
  const collectionEdits = buildCollectionEdits(products);

  if (!spotlightProduct) {
    return (
      <section className="bg-[#fffaf7] px-5 py-16 text-center text-[#4f3e38]">
        <p className="micro-label">Katalog</p>
        <h1 className="display-title mt-3 text-[42px]">Produk belum tersedia.</h1>
      </section>
    );
  }

  return (
    <div className="bg-[#fffaf7] text-[#4f3e38]">
      <section className="w-full overflow-hidden bg-[#fffaf7]">
        <HeroEditorial />
        <NewArrivals products={arrivalProducts} />
        <CollectionEdits edits={collectionEdits} products={products} />
        <SignatureSpotlight product={spotlightProduct} />
        <BestSellerEdit products={bestSellerProducts} />
        <StylistCallout />
      </section>
    </div>
  );
}

function HeroEditorial() {
  return (
    <section className="editorial-hero relative overflow-hidden bg-[#fbf7f2]">
      <div className="absolute left-[-20%] top-[28%] z-10 h-[76px] w-[82%] -rotate-[15deg] rounded-[999px] bg-[#e5d4cb]/55 sm:h-[94px] lg:h-[112px]" />
      <div className="absolute right-[-18%] top-[18%] z-10 h-[112px] w-[72%] rotate-[18deg] rounded-[999px] bg-[#c9ada2]/42 sm:h-[132px] lg:h-[152px]" />
      <div className="absolute left-[18%] bottom-[4%] z-10 h-[64px] w-[48%] rotate-[16deg] rounded-[999px] bg-[#efe3dc]/70 sm:h-[76px] lg:h-[88px]" />

      <h1 className="editorial-brand-title editorial-brand-fill pointer-events-none absolute left-1/2 top-[39%] z-20 w-max whitespace-nowrap">
        YOORA SARAH
      </h1>

      <figure className="absolute inset-x-0 bottom-0 top-0 z-30">
        <Image
          src="/assets/editorial-hero-cutout.png"
          alt="Yoora Sarah editorial look"
          fill
          priority
          quality={82}
          sizes="(min-width: 1024px) 840px, 100vw"
          className="origin-bottom scale-[1.02] object-contain object-bottom sm:scale-[1.04] lg:scale-[1.06] xl:scale-[1.08]"
        />
      </figure>
      <div className="absolute inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-[#fffdfb]/76 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-40 h-44 bg-gradient-to-t from-[#fbf7f2] via-[#fbf7f2]/76 to-transparent" />
      <span
        aria-hidden="true"
        className="editorial-brand-title editorial-brand-outline pointer-events-none absolute left-1/2 top-[39%] z-[45] w-max whitespace-nowrap"
      >
        YOORA SARAH
      </span>

    </section>
  );
}

function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#fffaf7] px-5 py-12 sm:px-10 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-[92rem] text-center">
        <h2 className="font-sans text-[28px] font-bold leading-none text-[#4f3e38] sm:text-[34px]">New Arrivals</h2>
        <p className="mx-auto mt-4 hidden max-w-2xl text-[14px] font-medium leading-6 text-[#765d54] sm:block">
          Koleksi terbaru dengan tampilan lembut, rapi, dan mudah dipakai untuk aktivitas harian.
        </p>
      </div>

      <div className="mx-auto mt-9 grid max-w-[92rem] gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ArrivalCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

function CollectionEdits({ edits, products }: { edits: ReturnType<typeof buildCollectionEdits>; products: Product[] }) {
  return (
    <section className="bg-[#fbf4ee] px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#927064]">Shop The Edit</p>
          <h2 className="mt-3 font-display text-[36px] font-medium leading-none text-[#4f3e38] sm:text-[50px]">Koleksi Pilihan</h2>
        </div>
        <p className="w-full max-w-[calc(100vw-64px)] text-[13px] font-medium leading-6 text-[#765d54] sm:max-w-md">
          Masuk dari kategori favorit, lalu pilih warna dan ukuran yang paling pas untuk gaya harianmu.
        </p>
      </div>

      <div className="mx-auto mt-9 grid max-w-[92rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {edits.map((edit) => (
          <SiteLink key={edit.href} href={edit.href} className="group block h-full overflow-hidden rounded-lg border border-[#eaded5] bg-white transition hover:-translate-y-0.5 hover:border-[#dec9bd]">
            <div className={`relative h-[286px] overflow-hidden border-b border-[#eaded5] ${edit.tone}`}>
              <Image
                src={edit.product.image}
                alt={edit.title}
                fill
                quality={72}
                sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 92vw"
                className="object-contain object-bottom p-5 mix-blend-multiply transition duration-500 group-hover:scale-[1.025]"
              />
            </div>
            <div className="min-h-[148px] bg-[#fff7f2] p-5">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
                <h3 className="min-w-0 font-display text-[27px] font-medium leading-none text-[#4f3e38]">{edit.title}</h3>
                <span className="shrink-0 rounded-full border border-[#eaded5] bg-[#fffaf7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#755b52]">
                  {countLabelForHref(products, edit.href)}
                </span>
              </div>
              <p className="mt-4 max-w-[calc(100vw-84px)] break-words text-[13px] font-medium leading-6 text-[#765d54] sm:max-w-none">{edit.copy}</p>
            </div>
          </SiteLink>
        ))}
      </div>
    </section>
  );
}

function SignatureSpotlight({ product }: { product: Product }) {
  return (
    <section className="bg-[#fffaf7] px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
      <div className="mx-auto grid max-w-[92rem] gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <SiteLink href={product.slug} className="group relative min-h-[520px] overflow-hidden rounded-lg border border-[#eaded5] bg-white lg:min-h-[560px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            quality={72}
            sizes="(min-width: 1024px) 610px, 92vw"
            className="object-contain object-bottom p-8 mix-blend-multiply transition duration-500 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/78 to-transparent" />
          <span className="absolute bottom-7 left-7 font-sans text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#755b52]">Signature Product</span>
        </SiteLink>

        <div className="flex min-h-[520px] flex-col justify-between rounded-lg border border-[#eaded5] bg-white px-6 py-8 sm:px-8 lg:min-h-[560px] lg:px-10">
          <div>
            <p className="font-sans text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#927064]">Medina Dress</p>
            <h2 className="mt-5 max-w-[calc(100vw-84px)] break-words font-display text-[34px] font-medium leading-[0.98] text-[#4f3e38] sm:max-w-none sm:text-[54px] sm:leading-none">
              Elegan, adem, dan jatuhnya rapi.
            </h2>
            <p className="mt-6 max-w-[calc(100vw-84px)] break-words text-[14px] font-medium leading-7 text-[#765d54] sm:max-w-none">
              Medina Dress dibuat untuk tampilan yang tenang tapi tetap berkelas. Kainnya jatuh lembut, pilihan warnanya luas, dan mudah dipakai untuk momen spesial maupun kegiatan harian.
            </p>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-2 gap-3">
              {["14 Warna", "All Occasion", "Flowing Fabric", "Size S-XL"].map((item) => (
                <span key={item} className="rounded-lg border border-[#eaded5] bg-[#fffaf7] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f3e38]">
                  {item}
                </span>
              ))}
            </div>
            <SiteLink
              href={product.slug}
              className="mt-7 inline-flex rounded-full bg-[#4f3e38] px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#fffaf7] transition hover:-translate-y-0.5 hover:bg-[#6c5047]"
            >
              Lihat Detail
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function BestSellerEdit({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#fbf4ee] px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#927064]">Most Loved</p>
          <h2 className="mt-3 font-sans text-[30px] font-bold leading-none text-[#4f3e38] sm:text-[34px]">Best Seller Edit</h2>
        </div>
        <SiteLink href="/best-seller" className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#4f3e38] transition hover:text-[#8f6b5f]">
          Lihat Semua
        </SiteLink>
      </div>

      <div className="mx-auto mt-9 grid max-w-[92rem] gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <CompactProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

function CompactProductCard({ product }: { product: Product }) {
  return (
    <SiteLink href={product.slug} className="group block h-full overflow-hidden rounded-lg border border-[#eaded5] bg-white transition hover:-translate-y-0.5 hover:border-[#dec9bd]">
      <div className="relative h-[310px] overflow-hidden border-b border-[#eaded5] bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          quality={72}
          sizes="(min-width: 1024px) 250px, (min-width: 640px) 45vw, 92vw"
          className="object-contain object-bottom p-5 mix-blend-multiply transition duration-500 group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex min-h-[106px] items-end justify-between gap-4 bg-[#51403A] px-4 py-5">
        <div>
          <h3 className="font-display text-[16px] font-medium leading-tight text-[#fffaf7]">{product.name}</h3>
          <p className="mt-1 font-sans text-[12px] font-bold text-[#fffaf7]/90">{product.price}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/40 text-[#fffaf7] transition group-hover:-translate-y-0.5">
          <BagIcon className="h-4 w-4" />
        </span>
      </div>
    </SiteLink>
  );
}

function StylistCallout() {
  return (
    <section className="bg-[#fffaf7] px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
      <div className="mx-auto grid max-w-[92rem] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-lg border border-[#eaded5] bg-white px-6 py-8 sm:px-9 sm:py-10">
          <p className="font-sans text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#927064]">AI Stylist</p>
          <h2 className="mt-5 max-w-[300px] break-words font-display text-[32px] font-medium leading-[1.02] text-[#4f3e38] sm:max-w-none sm:text-[54px] sm:leading-none">
            Bantu pilih warna dan look yang paling cocok.
          </h2>
          <p className="mt-6 max-w-[300px] break-words text-[14px] font-medium leading-7 text-[#765d54] sm:max-w-xl">
            Cari rekomendasi warna, padu padan dress, hijab, dan aksesori dalam satu tempat.
          </p>
          <SiteLink
            href="/stylist"
            className="mt-8 inline-flex rounded-full bg-[#4f3e38] px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#fffaf7] transition hover:-translate-y-0.5 hover:bg-[#6c5047]"
          >
            Buka Stylist
          </SiteLink>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <MiniCallout href="/one-set-5182" title="One Set" copy="Look lengkap yang praktis dan siap dipakai." />
          <MiniCallout href="/pages/panduan-ukuran" title="Panduan Ukuran" copy="Cek ukuran supaya pilihanmu lebih nyaman." />
        </div>
      </div>
    </section>
  );
}

function MiniCallout({ copy, href, title }: { copy: string; href: string; title: string }) {
  return (
    <SiteLink href={href} className="group flex min-h-[190px] flex-col justify-between rounded-lg border border-[#eaded5] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#dec9bd]">
      <div>
        <h3 className="font-display text-[30px] font-medium leading-none text-[#4f3e38]">{title}</h3>
        <p className="mt-4 text-[13px] font-medium leading-6 text-[#765d54]">{copy}</p>
      </div>
      <span className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#4f3e38] transition group-hover:text-[#8f6b5f]">Explore</span>
    </SiteLink>
  );
}

function ArrivalCard({ product }: { product: Product }) {
  return (
    <SiteLink href={product.slug} className="group block h-full overflow-hidden rounded-lg border border-[#eaded5] bg-white transition hover:-translate-y-0.5 hover:border-[#dec9bd]">
      <div className="relative h-[330px] overflow-hidden border-b border-[#eaded5] bg-white sm:h-[350px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          quality={72}
          sizes="(min-width: 1024px) 330px, (min-width: 768px) 45vw, 92vw"
          className="object-contain object-bottom p-5 mix-blend-multiply transition duration-500 group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex min-h-[108px] items-end justify-between gap-4 bg-[#51403A] px-4 py-5">
        <div>
          <h3 className="font-display text-[16px] font-medium leading-tight text-[#fffaf7] sm:text-[17px]">{product.name}</h3>
          <p className="mt-1 font-sans text-[12px] font-bold leading-none text-[#fffaf7]/90">{product.price}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/40 text-[#fffaf7] transition group-hover:-translate-y-0.5">
          <BagIcon className="h-4 w-4" />
        </span>
      </div>
    </SiteLink>
  );
}

function pickProduct(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

function pickProducts(products: Product[], slugs: string[], limit: number, filter?: (product: Product) => boolean) {
  const picked = slugs.map((slug) => pickProduct(products, slug)).filter(Boolean) as Product[];
  const fallback = products.filter((product) => (filter ? filter(product) : true));
  return [...picked, ...fallback.filter((product) => !picked.some((item) => item.slug === product.slug))].slice(0, limit);
}

function buildCollectionEdits(products: Product[]) {
  const configs = [
    { title: "Dress", href: "/dress", copy: "Siluet lembut untuk acara dan harian.", slug: "/dress/safiyyah-sora-dress-5068", categorySlug: "dress" },
    { title: "Abaya", href: "/abaya-2481", copy: "Layer formal dengan detail tenang.", slug: "/abaya-2481/beyza-abaya-9167", categorySlug: "abaya-2481" },
    { title: "Hijab", href: "/hijab-1544", copy: "Hijab rapi dalam warna natural.", slug: "/hijab-1544/naura-oval-8249", categorySlug: "hijab-1544" },
    { title: "Kids", href: "/kids-9967", copy: "Busana manis untuk si kecil.", slug: "/kids-9967/bella-kids-dress-4339", categorySlug: "kids-9967" }
  ];

  return configs
    .map((config) => ({
      ...config,
      product: pickProduct(products, config.slug) ?? products.find((product) => product.categorySlug === config.categorySlug),
      tone: "bg-white"
    }))
    .filter((edit): edit is typeof edit & { product: Product } => Boolean(edit.product));
}

function countLabelForHref(products: Product[], href: string) {
  const categorySlug = href.replace(/^\/+/, "");
  const count = products.filter((product) => product.categorySlug === categorySlug).length;
  return count ? `${count} Produk` : "View";
}
