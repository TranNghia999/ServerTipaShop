// route/seo.route.js

import { Router } from 'express'
import ProductModel from '../models/product.modal.js'
import CategoryModel from '../models/category.modal.js'

const seoRouter = Router()

const SITE_URL = 'https://tipashop.com'
const SITE_NAME = 'TipaShop'
const DEFAULT_IMAGE = `${SITE_URL}/logo_cty.png`

// ============================================
// HELPER: Strip HTML tags và clean text
// ============================================

function stripHtml(html) {
    if (!html) return ''

    return html
        // Xóa tất cả HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        // Xóa multiple spaces
        .replace(/\s+/g, ' ')
        // Xóa newlines
        .replace(/[\r\n]+/g, ' ')
        // Trim
        .trim()
}

function generateSeoHtml({ title, description, image, url, type = 'website', price = null }) {
    // Strip HTML và escape quotes
    const safeTitle = stripHtml(title)?.replace(/"/g, '&quot;') || SITE_NAME
    const safeDescription = stripHtml(description)?.substring(0, 160)?.replace(/"/g, '&quot;') || ''
    const safeImage = image || DEFAULT_IMAGE

    let priceMetaTags = ''
    if (price && type === 'product') {
        priceMetaTags = `
    <meta property="product:price:amount" content="${price}">
    <meta property="product:price:currency" content="VND">`
    }

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:locale" content="vi_VN">${priceMetaTags}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImage}">
    
    <!-- Zalo -->
    <meta property="zalo:official_account" content="${SITE_NAME}">
    
    <!-- Canonical -->
    <link rel="canonical" href="${url}">
    
    <!-- Redirect to React app after bots read meta -->
    <script>
        if (!/facebookexternalhit|twitterbot|linkedinbot|whatsapp|zalo|viber|telegram|slackbot/i.test(navigator.userAgent)) {
            window.location.replace("${url}");
        }
    </script>
</head>
<body>
    <h1>${safeTitle}</h1>
    <img src="${safeImage}" alt="${safeTitle}" style="max-width:100%;">
    <p>${safeDescription}</p>
    <a href="${url}">Xem chi tiết tại ${SITE_NAME}</a>
</body>
</html>`
}

// ============================================
// SEO: Sản phẩm
// ============================================

seoRouter.get('/product/:slug', async (req, res) => {
    try {
        const { slug } = req.params
        const product = await ProductModel.findOne({ slug })

        if (!product) {
            return res.status(404).send('Không tìm thấy sản phẩm')
        }

        const title = `${product.name} - Mua online chính hãng | ${SITE_NAME}`

        // Ưu tiên description, nếu không có thì dùng describe (đã strip HTML)
        const rawDescription = product.description || product.describe || ''
        const description = stripHtml(rawDescription)
            || `Mua ${product.name} chính hãng giá tốt tại ${SITE_NAME}. Giao hàng toàn quốc, bảo hành chính hãng.`

        const image = product.images?.[0] || DEFAULT_IMAGE
        const url = `${SITE_URL}/san-pham/${slug}`
        const price = product.price

        const html = generateSeoHtml({
            title,
            description,
            image,
            url,
            type: 'product',
            price
        })

        res.set('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('SEO Product Error:', error.message)
        res.status(500).send('Lỗi server')
    }
})

// ============================================
// SEO: Danh mục cấp 1
// ============================================

seoRouter.get('/category/:slug', async (req, res) => {
    try {
        const { slug } = req.params
        const category = await CategoryModel.findOne({ slug })

        if (!category) {
            return res.status(404).send('Không tìm thấy danh mục')
        }

        const title = `${category.name} - Mua online chính hãng | ${SITE_NAME}`
        const description = stripHtml(category.description)
            || `Mua ${category.name} chính hãng giá tốt tại ${SITE_NAME}. Giao hàng toàn quốc, bảo hành chính hãng.`
        const image = category.images?.[0] || DEFAULT_IMAGE
        const url = `${SITE_URL}/danh-muc/${slug}`

        const html = generateSeoHtml({
            title,
            description,
            image,
            url,
            type: 'website'
        })

        res.set('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('SEO Category Error:', error.message)
        res.status(500).send('Lỗi server')
    }
})

// ============================================
// SEO: Danh mục cấp 2
// ============================================

seoRouter.get('/category/:catSlug/:subSlug', async (req, res) => {
    try {
        const { catSlug, subSlug } = req.params

        const parentCat = await CategoryModel.findOne({
            slug: catSlug,
            parentId: null
        })

        if (!parentCat) {
            return res.status(404).send('Không tìm thấy danh mục cha')
        }

        const subCategory = await CategoryModel.findOne({
            slug: subSlug,
            parentId: parentCat._id
        })

        if (!subCategory) {
            return res.status(404).send('Không tìm thấy danh mục con')
        }

        const title = `${subCategory.name} - ${parentCat.name} | ${SITE_NAME}`
        const description = stripHtml(subCategory.description)
            || `Mua ${subCategory.name} thuộc ${parentCat.name} chính hãng giá tốt tại ${SITE_NAME}. Giao hàng toàn quốc.`
        const image = subCategory.images?.[0] || parentCat.images?.[0] || DEFAULT_IMAGE
        const url = `${SITE_URL}/danh-muc/${catSlug}/${subSlug}`

        const html = generateSeoHtml({
            title,
            description,
            image,
            url,
            type: 'website'
        })

        res.set('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('SEO SubCategory Error:', error.message)
        res.status(500).send('Lỗi server')
    }
})

// ============================================
// SEO: Danh mục cấp 3
// ============================================

seoRouter.get('/category/:catSlug/:subSlug/:thirdSlug', async (req, res) => {
    try {
        const { catSlug, subSlug, thirdSlug } = req.params

        const rootCat = await CategoryModel.findOne({
            slug: catSlug,
            parentId: null
        })

        if (!rootCat) {
            return res.status(404).send('Không tìm thấy danh mục cấp 1')
        }

        const subCat = await CategoryModel.findOne({
            slug: subSlug,
            parentId: rootCat._id
        })

        if (!subCat) {
            return res.status(404).send('Không tìm thấy danh mục cấp 2')
        }

        const thirdCat = await CategoryModel.findOne({
            slug: thirdSlug,
            parentId: subCat._id
        })

        if (!thirdCat) {
            return res.status(404).send('Không tìm thấy danh mục cấp 3')
        }

        const title = `${thirdCat.name} - ${subCat.name} - ${rootCat.name} | ${SITE_NAME}`
        const description = stripHtml(thirdCat.description)
            || `Mua ${thirdCat.name} thuộc ${subCat.name} chính hãng giá tốt tại ${SITE_NAME}. Giao hàng toàn quốc.`
        const image = thirdCat.images?.[0] || subCat.images?.[0] || rootCat.images?.[0] || DEFAULT_IMAGE
        const url = `${SITE_URL}/danh-muc/${catSlug}/${subSlug}/${thirdSlug}`

        const html = generateSeoHtml({
            title,
            description,
            image,
            url,
            type: 'website'
        })

        res.set('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('SEO ThirdCategory Error:', error.message)
        res.status(500).send('Lỗi server')
    }
})

// ============================================
// SEO: Trang chủ
// ============================================

seoRouter.get('/home', async (req, res) => {
    try {
        const title = `${SITE_NAME} - Phụ tùng ô tô, dầu nhớt, lốp xe chính hãng giá tốt`
        const description = `Mua phụ tùng ô tô, dầu nhớt, lốp xe chính hãng giá rẻ nhất Việt Nam. Giao hàng toàn quốc, miễn phí ship đơn từ 200k.`
        const image = DEFAULT_IMAGE
        const url = SITE_URL

        const html = generateSeoHtml({
            title,
            description,
            image,
            url,
            type: 'website'
        })

        res.set('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('SEO Home Error:', error.message)
        res.status(500).send('Lỗi server')
    }
})

export default seoRouter