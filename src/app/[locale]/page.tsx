import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { PostsList } from '@/components/PostsList'
import { SectionTitle } from '@/components/SectionTitle'
import { bio } from '@/config/bio'
import { siteConfig } from '@/config/site'
import { isLocale } from '@/i18n/routing'
import { getAllPosts } from '@/lib/posts'

type Params = Promise<{ locale: string }>

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)

  const t = await getTranslations()
  const posts = await getAllPosts(locale)

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <Header />

      <main className="flex-1 pb-24 pt-12 sm:pt-20">
        <section className="mb-16">
          <Logo />
          <p className="mt-6 max-w-prose font-display text-lg italic text-ink/75">
            {t('site.tagline')}
          </p>
        </section>

        <section className="mb-20">
          <SectionTitle>{t('home.sectionAbout')}</SectionTitle>
          <div className="space-y-5 text-justify leading-relaxed text-ink/90 hyphens-auto">
            {/* Portrait near the bio. basePath is prefixed manually because a plain
                <img> on static export doesn't get it the way next/image/Link do. */}
            <img
              src={`${siteConfig.basePath}/images/alessio.jpg`}
              alt={siteConfig.authorName}
              width={900}
              height={1200}
              className="mx-auto mb-5 block w-44 rounded-lg sm:float-right sm:mx-0 sm:mb-2 sm:ml-6 sm:w-52"
            />
            {bio[locale].map((para) => (
              <p key={para.id}>{para.text}</p>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>{t('home.sectionWritings')}</SectionTitle>
          <PostsList posts={posts} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
