import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/seller/', '/dashboard/', '/membership/'],
    },
    sitemap: 'https://fotoluvstudio.com/sitemap.xml',
  }
}
