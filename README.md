# Módulo 4: Ejercicio de Evaluación Final 

El ejercicio consiste en desarrollar un API de tema libre que permita insertar,
modificar, listar y eliminar información utilizando Express.js, Node.js y una base de datos a elegir
entre Mongo y MySQL.

## Pasos a seguir
1. **Diseño de la Base de Datos**
2. **Configuración del Servidor**
3. **API RESTful con los siguientes endpoints:**
   - Insertar una entrada en su entidad principal.
   - Leer/Listar todas las entradas existentes.
   - Actualizar una entrada existente.
   - Eliminar una entrada existente.

## Bonus
- Registro y Login

## ENDPOINTS
**Listar todos los libros**
GET /libros

**Obtener un libro por su ID**
GET /libros/:id

**Crear un libro nuevo**
POST /libros

**Actualizar un libro existente**
PUT /libros/:id

**Eliminar un libro existente**
DELETE /libros/:id

**Registro de una usuaria**
POST /registro

**Login de una usuaria**
POST /login