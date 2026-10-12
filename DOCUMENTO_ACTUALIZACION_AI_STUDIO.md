# DOCUMENTO MAESTRO · ACTUALIZACIÓN DE DATOS PARA GOOGLE AI STUDIO
## Encuentra tu Grupo — Fraternidad Guerreros de la Luz
**Fecha de corte:** 9 de octubre de 2026  
**Destino:** webapp existente en AI Studio / Firebase.  
**Archivo de datos adjunto:** `src/data/padron_candidatos_2026.json`

### INSTRUCCIÓN PARA GOOGLE AI STUDIO
Actualiza la webapp **«Encuentra tu Grupo – Guerreros de la Luz»** usando el catálogo incluido, como **fuente de cotejo** y **no como reemplazo de la base instalada**. La captura actual muestra **119 grupos** y **28 centros**, mientras que este documento aporta **97 fichas de grupos** y **28 fichas de centros**. Los 22 grupos de diferencia NO deben eliminarse ni considerarse inexistentes. Verifica los registros coincidentes y conserva los que ya están correctamente publicados.

### COMPORTAMIENTO OBLIGATORIO
1. Mantén dos tipos distintos: `grupo_autoayuda` (zonas Jaguar, Tiburón, Delfín, Colibrí, Águila) y `centro_rehabilitacion` (Unidad Teocalli).
2. Usa **dos vistas/filtros y capas de mapa** diferenciadas. Teocalli en este catálogo es una **unidad de centros**, no una zona que convierta grupos homónimos en centros.
3. Haz un **cotejo en modo simulación** (dry run) contra los registros existentes. Comparar por tipo + zona/unidad + nombre normalizado + municipio. No deduplicar por teléfono, responsable ni por semejanza de nombre únicamente.
4. Si coinciden, **conserva el ID/código oficial y Firebase document ID actuales**, ubicación verificada, fotografías, WhatsApp y horarios validados. Presenta diferencias al administrador antes de actualizar campos.
5. Si no coinciden, genera una **solicitud de alta pendiente de aprobación**, sin publicarla inmediatamente.
6. **Nunca borres registros existentes en Firebase** por ausencia en este archivo.
7. **No muevas direcciones ni teléfonos del archivo interno de centros al cliente público**. En este documento se incluyen únicamente nombres/familias/localidad y están marcados como pendientes de autorización. Para centros ya publicados, conserva únicamente los campos públicos previamente autorizados.
8. Los datos de grupos tienen estado `pendiente_cotejo_con_portal`: la dirección de reunión, días y tipos de sesión son **datos declarados** por el registro; si hay desacuerdo con lo publicado, solicita aprobación humana.
9. No inventes latitud, longitud, coordenadas, horarios, municipios, redes sociales, teléfonos, ni direcciones. Un mapa sin ubicación pública verificada debe mostrar «Ubicación por confirmar» y no un marcador supuesto.
10. Conserva el buscador, filtros, botones, diseño institucional, mapa, formularios, inicio de sesión y sistema de propuestas que ya funcionan. Solo agrega importación administrada y validación.
11. Los teléfonos de líderes y responsables son **datos internos**. Nunca conviertas el celular del líder en botón público de WhatsApp sin autorización expresa.
12. Implementa la comparación y aprobación **en el backend de Firebase con reglas de seguridad**, no solamente ocultando campos con CSS o JavaScript. No insertes datos internos en el código público.
13. Mantén un registro de auditoría de cada alta/modificación: usuario, fecha, dato anterior, dato nuevo y aprobación. La aplicación deberá mostrar un resumen de nuevas fichas, coincidencias, discrepancias y pendientes.

### CRITERIOS DE COMPARACIÓN DE POSIBLES CONFUSIONES
- Un **grupo «Teocalli» de Zona Delfín** es independiente de la **Unidad Teocalli** de centros.
- El **grupo «Familia Fénix»** es distinto de la familia de centros **Fénix**.
- El **grupo «Ixil»** es distinto del centro **«Gladiadores Ixil»**.
- El **grupo «Ticul»** no equivale automáticamente al centro **«Fénix Ticul»**.
- Las 28 sedes de rehabilitación son instalaciones independientes, aunque compartan un director, familia, teléfono o localidad.

### RESUMEN DEL ARCHIVO
- **97** grupos de autoayuda en el corte histórico adjunto.
- **28** centros de rehabilitación, sin datos de contacto interno ni domicilios internos.
- **119** grupos visibles actualmente en la captura de la webapp; se deben preservar durante la conciliación.
- **28** centros visibles actualmente en la captura de la webapp.
- Jaguar (Yucatán): **43** registros del archivo.
- Tiburón: **34** registros del archivo.
- Delfín: **6** registros del archivo.
- Colibrí: **8** registros del archivo.
- Águila: **6** registros del archivo.
