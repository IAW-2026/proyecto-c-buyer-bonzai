# Bonzai — Buyer App

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8-wwxMvS)


Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión Bonzai.

Esta app corresponde al rol del comprador en los proyectos de tipo **B (Delivery)** y **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

## Link al deploy de producción

https://proyecto-c-buyer-bonzai.vercel.app

## Usuarios disponibles para pruebas

| Usuario                    | Contraseña |
| -------------------------- | ---------- |
| `buyer+clerk_test@iaw.com` | `iawuser#` |

## Instrucciones para utilizar o evaluar la aplicación

No aplica.

## Descripción del proyecto

Bonzai es un marketplace de plantas y accesorios de jardinería desarrollado como parte del Proyecto IAW 2026. Esta aplicación corresponde al rol de **comprador (Buyer)** dentro de un proyecto tipo C (Marketplace).

La plataforma permite a los usuarios navegar por un catálogo de productos, visualizar su descripción e imágenes, y realizar compras simuladas a través de una pasarela de pago integrada. Los usuarios pueden registrarse e iniciar sesión mediante Clerk, acceder a su historial de compras y gestionar sus datos de perfil.

El diseño sigue una línea visual editorial de alta gama, con un enfoque centrado en las plantas, buscando transmitir calma, amplitud y una experiencia premium. La interfaz es data-driven, preparada para consumir productos desde una API externa en el futuro.

Actualmente la aplicación funciona con datos estáticos y simula flujos de compra completos, sentando las bases para la integración con la aplicación Seller y el backend de productos. También utiliza inteligencia artificial para generar las descripciones de cada uno de los productos.

## Notas para la corrección

- No se implementó un panel de administración ni se exponen endpoints porque se identificó que no era necesario para la aplicación de comprador.
- Los endpoints de productos no están conectados; el pago está simulado al final de la pasarela.
- Los botones de "solicitar reembolso" no tienen lógica integrada aún.
- Los productos y el historial de compras son datos estáticos.
- A futuro se debe implementar debounce y un número mínimo de caracteres para consultar productos al endpoint de la Seller app.
- No se controla stock ni productos suspendidos aún; depende de la conexión con el endpoint correspondiente.
- Se utiliza `unstable_cache` para cachear la respuesta de la IA; se migrará a la nueva API `'use cache'` de Next.js en un futuro.
