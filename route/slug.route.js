import { Router } from 'express'
import ProductModel from '../models/product.modal.js'
import CategoryModel from '../models/category.modal.js'
import { generateSlug } from '../utils/generateSlug.js'

const slugRouter = Router()

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCategoryLevel(category) {
    if (!category.parentId) {
        return 1
    }

    const parent = await CategoryModel.findById(category.parentId)
    if (!parent || !parent.parentId) {
        return 2
    }

    return 3
}

async function getCategoryChain(category) {
    const chain = {
        current: category,
        parent: null,
        root: null
    }

    if (!category.parentId) {
        return chain
    }

    const parent = await CategoryModel.findById(category.parentId)
    if (!parent) {
        return chain
    }

    if (!parent.parentId) {
        chain.parent = parent
        chain.root = parent
    } else {
        chain.parent = parent
        const root = await CategoryModel.findById(parent.parentId)
        chain.root = root
    }

    return chain
}

// ============================================
// PRODUCT APIs
// ============================================

slugRouter.get('/product/:slug', async (req, res) => {
    try {
        const { slug } = req.params

        const product = await ProductModel.findOne({ slug }).populate('category')

        if (!product) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy sản phẩm'
            })
        }

        return res.status(200).json({
            error: false,
            success: true,
            product
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

slugRouter.get('/check-product/:oldSlug', async (req, res) => {
    try {
        const { oldSlug } = req.params

        const product = await ProductModel.findOne({ slug: oldSlug })

        if (product) {
            return res.status(200).json({
                error: false,
                found: true,
                newUrl: `/san-pham/${product.slug}`
            })
        }

        return res.status(404).json({
            error: true,
            found: false
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

// ============================================
// 👇 PRODUCTS BY CATEGORY - ĐẶT TRƯỚC CATEGORY ROUTES
// ============================================

// Route này phải đặt TRƯỚC /category/:slug để không bị conflict
slugRouter.get('/products-by-category/:slug', async (req, res) => {
    try {
        const { slug } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20

        const category = await CategoryModel.findOne({ slug })

        if (!category) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục'
            })
        }

        const level = await getCategoryLevel(category)
        let query = {}

        if (level === 1) {
            query = { catId: category._id.toString() }
        } else if (level === 2) {
            query = { subCatId: category._id.toString() }
        } else {
            query = { thirdsubCatId: category._id.toString() }
        }

        console.log('=== DEBUG PRODUCTS BY CATEGORY ===')
        console.log('Slug:', slug)
        console.log('Category:', category.name)
        console.log('Category ID:', category._id.toString())
        console.log('Level:', level)
        console.log('Query:', query)

        const products = await ProductModel.find(query)
            .populate('category')
            .skip((page - 1) * limit)
            .limit(limit)

        const total = await ProductModel.countDocuments(query)

        console.log('Found products:', products.length)

        return res.status(200).json({
            error: false,
            success: true,
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.log('Error:', error.message)
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

// ============================================
// CATEGORY APIs
// ============================================

// GET /api/slug/category/:slug - Danh mục cấp 1 (hoặc bất kỳ)
slugRouter.get('/category/:slug', async (req, res) => {
    try {
        const { slug } = req.params

        const category = await CategoryModel.findOne({ slug })

        if (!category) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục'
            })
        }

        const chain = await getCategoryChain(category)
        const level = await getCategoryLevel(category)
        const children = await CategoryModel.find({ parentId: category._id })

        return res.status(200).json({
            error: false,
            success: true,
            category: chain.current,
            parentCategory: chain.parent,
            rootCategory: chain.root,
            children,
            level
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

// GET /api/slug/category/:catSlug/:subSlug - Danh mục cấp 2
slugRouter.get('/category/:catSlug/:subSlug', async (req, res) => {
    try {
        const { catSlug, subSlug } = req.params

        const rootCat = await CategoryModel.findOne({
            slug: catSlug,
            parentId: null
        })

        if (!rootCat) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục cha'
            })
        }

        const subCategory = await CategoryModel.findOne({
            slug: subSlug,
            parentId: rootCat._id
        })

        if (!subCategory) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục con'
            })
        }

        const children = await CategoryModel.find({ parentId: subCategory._id })

        return res.status(200).json({
            error: false,
            success: true,
            category: subCategory,
            parentCategory: rootCat,
            rootCategory: rootCat,
            children,
            level: 2
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

// GET /api/slug/category/:catSlug/:subSlug/:thirdSlug - Danh mục cấp 3
slugRouter.get('/category/:catSlug/:subSlug/:thirdSlug', async (req, res) => {
    try {
        const { catSlug, subSlug, thirdSlug } = req.params

        const rootCat = await CategoryModel.findOne({
            slug: catSlug,
            parentId: null
        })

        if (!rootCat) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục cấp 1'
            })
        }

        const subCategory = await CategoryModel.findOne({
            slug: subSlug,
            parentId: rootCat._id
        })

        if (!subCategory) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục cấp 2'
            })
        }

        const thirdCategory = await CategoryModel.findOne({
            slug: thirdSlug,
            parentId: subCategory._id
        })

        if (!thirdCategory) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy danh mục cấp 3'
            })
        }

        return res.status(200).json({
            error: false,
            success: true,
            category: thirdCategory,
            parentCategory: subCategory,
            rootCategory: rootCat,
            children: [],
            level: 3
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

// ============================================
// GENERATE SLUGS
// ============================================

slugRouter.post('/generate-all-slugs', async (req, res) => {
    try {
        const products = await ProductModel.find({ slug: { $exists: false } })

        for (const product of products) {
            let slug = generateSlug(product.name)

            let existingSlug = await ProductModel.findOne({ slug })
            let counter = 1
            while (existingSlug && existingSlug._id.toString() !== product._id.toString()) {
                slug = `${generateSlug(product.name)}-${counter}`
                existingSlug = await ProductModel.findOne({ slug })
                counter++
            }

            await ProductModel.updateOne(
                { _id: product._id },
                { $set: { slug } }
            )
        }

        const categories = await CategoryModel.find({ slug: { $exists: false } })

        for (const category of categories) {
            let slug = generateSlug(category.name)

            let existingSlug = await CategoryModel.findOne({ slug })
            let counter = 1
            while (existingSlug && existingSlug._id.toString() !== category._id.toString()) {
                slug = `${generateSlug(category.name)}-${counter}`
                existingSlug = await CategoryModel.findOne({ slug })
                counter++
            }

            await CategoryModel.updateOne(
                { _id: category._id },
                { $set: { slug } }
            )
        }

        return res.status(200).json({
            error: false,
            message: `Đã tạo slug cho ${products.length} sản phẩm và ${categories.length} danh mục`
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        })
    }
})

export default slugRouter