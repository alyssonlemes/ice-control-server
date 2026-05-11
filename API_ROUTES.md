# API — Rotas e Payloads

**Arquivo de montagem de rotas:** [src/routes/index.ts](src/routes/index.ts#L1-L34)

> Observação: rotas sob `/api/v1/tenants/:tenantId` usam `authMiddleware` e `tenantMiddleware`; muitos endpoints exigem `requirePermission`.

---

## Auth

- **POST** `/api/v1/auth/login`

  Payload:
  ```json
  {
    "email": "user@example.com",
    "password": "senha123"
  }
  ```

- **POST** `/api/v1/auth/refresh`

  Payload:
  ```json
  { "refreshToken": "string" }
  ```

- **POST** `/api/v1/auth/logout`

  - Sem payload (retorna `204`)

---

## Tenants

- **POST** `/api/v1/tenants`

  Payload:
  ```json
  {
    "name": "Empresa X",
    "email": "contato@empresa.com",
    "adminName": "Admin",
    "adminPassword": "senhaAdmin"
  }
  ```

---

## Rotas com prefixo `/api/v1/tenants/:tenantId` (requer auth + tenant)

### Users

- **GET** `/api/v1/tenants/:tenantId/users` — listar
- **POST** `/api/v1/tenants/:tenantId/users` — criar

  Payload:
  ```json
  {
    "name": "Nome",
    "email": "user@ex.com",
    "password": "senha",
    "permissions": ["users.read","products.write"]
  }
  ```

- **PATCH** `/api/v1/tenants/:tenantId/users/:userId` — atualizar (patch)
- **DELETE** `/api/v1/tenants/:tenantId/users/:userId` — deletar

### Products

- **GET** `/api/v1/tenants/:tenantId/products` — listar (aceita query params)
- **GET** `/api/v1/tenants/:tenantId/products/:productId` — obter
- **POST** `/api/v1/tenants/:tenantId/products` — criar

  Payload (schema):
  ```json
  {
    "name": "Produto A",
    "categoryId": "uuid-or-null",
    "costPrice": 10.5,
    "salePrice": 15.0,
    "unit": "un",
    "minStockAlert": 5,
    "description": "Opcional"
  }
  ```

- **PATCH** `/api/v1/tenants/:tenantId/products/:productId` — atualizar
- **DELETE** `/api/v1/tenants/:tenantId/products/:productId` — deletar

### Categories

- **GET** `/api/v1/tenants/:tenantId/categories`
- **POST** `/api/v1/tenants/:tenantId/categories` — criar

  Payload:
  ```json
  { "name": "Bebidas", "parentId": "uuid-or-null" }
  ```

- **PATCH** `/api/v1/tenants/:tenantId/categories/:categoryId`
- **DELETE** `/api/v1/tenants/:tenantId/categories/:categoryId`

### Suppliers

- **GET** `/api/v1/tenants/:tenantId/suppliers`
- **POST** `/api/v1/tenants/:tenantId/suppliers` — criar

  Payload:
  ```json
  {
    "name": "Fornecedor X",
    "contactName": "Contato",
    "email": "forn@ex.com",
    "phone": "1234",
    "paymentTerms": "30d",
    "address": "Rua, 123"
  }
  ```

- **PATCH** `/api/v1/tenants/:tenantId/suppliers/:supplierId`
- **DELETE** `/api/v1/tenants/:tenantId/suppliers/:supplierId`

### Customers

- **GET** `/api/v1/tenants/:tenantId/customers` — listar
- **POST** `/api/v1/tenants/:tenantId/customers` — criar

  Payload:
  ```json
  {
    "name": "Cliente Y",
    "email": "cli@ex.com",
    "phone": "1234",
    "address": "Endereço"
  }
  ```

- **GET** `/api/v1/tenants/:tenantId/customers/:customerId/orders` — listar pedidos do cliente
- **PATCH** `/api/v1/tenants/:tenantId/customers/:customerId` — atualizar
- **DELETE** `/api/v1/tenants/:tenantId/customers/:customerId` — deletar

### Sales

- **GET** `/api/v1/tenants/:tenantId/sales` — listar
- **POST** `/api/v1/tenants/:tenantId/sales` — criar

  Payload (schema):
  ```json
  {
    "customerId": "uuid-or-null",
    "items": [
      { "productId": "uuid", "quantity": 2, "unitPrice": 10.0, "discount": 0.0 }
    ],
    "discount": 5.0,
    "couponCode": "CUPOM",
    "paymentMethod": "cash"
  }
  ```

- **PATCH** `/api/v1/tenants/:tenantId/sales/:saleId/cancel` — cancelar venda

### Stock

- **GET** `/api/v1/tenants/:tenantId/stock` — listar
- **POST** `/api/v1/tenants/:tenantId/stock/movements` — criar movimento

  Payload (schema):
  ```json
  {
    "productId": "uuid",
    "type": "in | out | adjustment",
    "quantity": 5,
    "reason": "Motivo (opcional)",
    "supplierId": "uuid-or-null"
  }
  ```

- **GET** `/api/v1/tenants/:tenantId/stock/movements` — listar movimentos

### Financial

- **GET** `/api/v1/tenants/:tenantId/financial/cashier` — ver caixa (query `date`)
- **POST** `/api/v1/tenants/:tenantId/financial/cashier/open` — abrir caixa

  Payload:
  ```json
  { "openingBalance": 100.0 }
  ```

- **POST** `/api/v1/tenants/:tenantId/financial/cashier/close` — fechar caixa

  Body example:
  ```json
  { "date": "2026-05-10" }
  ```

- **GET** `/api/v1/tenants/:tenantId/financial/expenses` — listar
- **POST** `/api/v1/tenants/:tenantId/financial/expenses` — criar

  Payload: corpo passado diretamente para `createExpense` (exemplo):
  ```json
  { "amount": 10.0, "description": "Compra de suprimentos" }
  ```

- **GET** `/api/v1/tenants/:tenantId/financial/accounts-receivable`
- **GET** `/api/v1/tenants/:tenantId/financial/accounts-payable`

### Reports

- **GET** `/api/v1/tenants/:tenantId/reports/best-sellers`
- **GET** `/api/v1/tenants/:tenantId/reports/sales-by-period`
- **GET** `/api/v1/tenants/:tenantId/reports/profit-margin`
- **GET** `/api/v1/tenants/:tenantId/reports/cash-flow`

---

Se quiser, posso:
- gerar um arquivo OpenAPI/Swagger com esses schemas; ou
- ajustar o Markdown (ex.: incluir exemplos de respostas, códigos de status ou esquemas mais detalhados).
