# Documentación de la API

## Autenticación

Toda la API está protegida con JWT (JSON Web Token). Para acceder a las rutas protegidas, necesitas incluir el token JWT en la cabecera de la solicitud:

## Rutas Públicas

### `POST /users/register`
Registro de usuarios.

- **Body:** `{ username, email, password, first_name, last_name }`
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `400 Bad Request`, `500 Internal Server Error`

### `POST /users/login`
Inicio de sesión de usuarios.

- **Body:** `{ email, password }`
- **Respuesta exitosa:** `200 OK` con token en cookie
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `GET /categories`
Obtener todas las categorías de productos.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `500 Internal Server Error`

## Rutas Protegidas

Las rutas protegidas requieren autenticación con JWT.

### `GET /users`
Obtener todos los usuarios (requiere rol de administrador).

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`

### `GET /users/:id`
Obtener un usuario por ID.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `PUT /users/:id`
Actualizar un usuario por ID (requiere rol de administrador).

- **Body:** `{ username, email, password, first_name, last_name, admin }`
- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

### `POST /categories`
Crear una nueva categoría de productos (requiere rol de administrador).

- **Body:** `{ name, description }`
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `500 Internal Server Error`

### `POST /products`
Crear un nuevo producto (requiere rol de administrador).

- **Body:** `{ name, description, price, stock, image_url, category_id }`
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `500 Internal Server Error`

### `GET /products`
Obtener todos los productos.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `500 Internal Server Error`

### `PUT /products/:id`
Actualizar un producto por ID (requiere rol de administrador).

- **Body:** `{ name, description, price, stock, image_url, category_id }`
- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

### `DELETE /products/:id`
Eliminar un producto por ID (requiere rol de administrador).

- **Query:** `?id=<product_id>`
- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `500 Internal Server Error`

## Carritos de Compra

### `POST /carts`
Crear un carrito para un usuario.

- **Respuesta exitosa:** `201 Created` o `200 OK` si ya existe un carrito para el usuario.
- **Respuesta de error:** `401 Unauthorized`, `500 Internal Server Error`

### `GET /carts`
Obtener el carrito de un usuario.

- **Respuesta exitosa:** `200 OK` con el carrito del usuario.
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `POST /carts/items`
Agregar un ítem al carrito.

- **Body:** `{ cartId, productName, quantity }`
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `401 Unauthorized`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### `GET /carts/:cartId/items`
Obtener todos los ítems del carrito.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `PUT /carts/items/:itemId`
Actualizar un ítem del carrito.

- **Body:** `{ productName, quantity }`
- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

## Órdenes

### `POST /orders`
Crear una nueva orden para un usuario.

- **Body:** `{ total }`
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `401 Unauthorized`, `500 Internal Server Error`

### `GET /orders`
Obtener todas las órdenes de un usuario.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `PUT /orders/:orderId`
Actualizar el estado de una orden (pendiente o completada).

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `POST /orders/:orderId/items`
Agregar un ítem a una orden.

- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `401 Unauthorized`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### `GET /orders/:orderId/items`
Obtener todos los ítems de una orden.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

### `PUT /orders/items/:itemId`
Actualizar un ítem de una orden.

- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

## Middleware y Funciones Auxiliares

### `sessionChecker(req, res, next)`
Comprueba si hay una sesión activa.

- **Respuesta de error:** `401 Unauthorized`

### `isAdmin(req, res, next)`
Comprueba si el usuario es administrador.

- **Respuesta de error:** `403 Forbidden`

### `authenticateJWT(req, res, next)`
Autenticación con JSON Web Token.

- **Respuesta de error:** `401 Unauthorized`, `403 Forbidden`

