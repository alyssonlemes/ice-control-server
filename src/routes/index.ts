import { Router } from 'express';
import authController from '../modules/auth/auth.controller';
import tenantController from '../modules/tenants/tenant.controller';
import usersController from '../modules/users/user.controller';
import productsController from '../modules/products/product.controller';
import categoriesController from '../modules/categories/category.controller';
import suppliersController from '../modules/suppliers/supplier.controller';
import customersController from '../modules/customers/customer.controller';
import salesController from '../modules/sales/sale.controller';
import stockController from '../modules/stock/stock.controller';
import financialController from '../modules/financial/financial.controller';
import reportsController from '../modules/reports/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();

router.use('/api/v1/auth', authController);
router.use('/api/v1/tenants', tenantController);

// Tenant-scoped routes (require auth and tenant validation)
const tenantRouter = Router({ mergeParams: true });
tenantRouter.use(authMiddleware);
tenantRouter.use(tenantMiddleware);

tenantRouter.use('/users', usersController);
tenantRouter.use('/products', productsController);
tenantRouter.use('/categories', categoriesController);
tenantRouter.use('/suppliers', suppliersController);
tenantRouter.use('/customers', customersController);
tenantRouter.use('/sales', salesController);
tenantRouter.use('/stock', stockController);
tenantRouter.use('/financial', financialController);
tenantRouter.use('/reports', reportsController);

router.use('/api/v1/tenants/:tenantId', tenantRouter);

export default router;
