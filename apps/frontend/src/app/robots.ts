import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://remodely-crm.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/dashboard/*',
        '/auth/*',
        '/billing/*',
        '/api/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
