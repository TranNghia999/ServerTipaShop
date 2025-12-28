import { Router } from 'express'
import ProductModel from '../models/product.modal.js'
import CategoryModel from '../models/category.modal.js'

const sitemapRouter = Router()

const SITE_URL = 'https://tipashop.com'

// GET /sitemap.xml
sitemapRouter.get('/sitemap.xml', async (request, response) => {
    try {
        const products = await ProductModel.find({}).select('_id slug updatedAt').lean()
        const categories = await CategoryModel.find({}).select('_id slug updatedAt').lean()

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>${SITE_URL}/</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
          </url>
          <url>
            <loc>${SITE_URL}/products</loc>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
          </url>`

        // Categories
        for (const cat of categories) {
            const url = cat.slug
                ? `${SITE_URL}/danh-muc/${cat.slug}`
                : `${SITE_URL}/products?catId=${cat._id}`

            xml += `
              <url>
                <loc>${url}</loc>
                <lastmod>${new Date(cat.updatedAt).toISOString()}</lastmod>
              </url>`
        }

        // Products
        for (const product of products) {
            // 👇 Dùng URL mới với slug
            const url = product.slug
                ? `${SITE_URL}/san-pham/${product.slug}`
                : `${SITE_URL}/product/${product._id}`

            xml += `
          <url>
            <loc>${url}</loc>
            <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
          </url>`
        }
        xml += `
    </urlset>`

        response.set('Content-Type', 'application/xml')
        response.send(xml)

    } catch (error) {
        console.error('Sitemap error:', error)
        response.status(500).send('Error generating sitemap')
    }
})

// GET /robots.txt
sitemapRouter.get('/robots.txt', (request, response) => {
    const robots = `User-agent: *
Allow: /
Disallow: /my-account
Disallow: /checkout
Disallow: /cart
Disallow: /my-orders
Sitemap: ${SITE_URL}/sitemap.xml`

    response.set('Content-Type', 'text/plain')
    response.send(robots)
})

export default sitemapRouter