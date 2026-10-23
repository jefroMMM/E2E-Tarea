# Estado de la entrega

- Repositorio público: https://github.com/jefroMMM/E2E-Tarea
- GitHub Actions verificado con resultado **success**: https://github.com/jefroMMM/E2E-Tarea/actions/runs/40037388136
- Esa ejecución pasó instalación, TypeScript, seed, los tres recorridos y el orden inverso. Publicó el artifact `evidencia-cypress` con capturas y videos (aproximadamente 3.45 MB). Para descargarlo, iniciar sesión en GitHub.
- Resultado consultado por la API: `github-actions.json`. Captura real: `capturas/06-github-actions.png`.
- Local: `npm ci`, TypeScript y `npm run test:e2e` correctos (3/3). `npm run test:reverse` correcto (03, 02, 01; cada caso en su propio proceso).
- Persistencia real, cantidades inválidas, stock, operaciones del carrito y reinicio del servidor comprobados; ver `verificacion-manual.md` y `verificacion-api.txt`.
- `resultados-cypress.txt` y `resultados-inverso.txt` son salidas reales de terminal; solo se normalizan los espacios al final de línea.
- `informe.pdf` tiene siete páginas y fue renderizado y revisado visualmente. Las imágenes originales están en `capturas/` para verlas a mayor tamaño.

## Único apartado pendiente: video del estudiante

1. Seguir `guion_video.md` y grabar un video de máximo 3 minutos. Las terminales y Cypress deben estar preparados antes de grabar.
2. Publicarlo en una plataforma que el docente pueda abrir. Comprobar el acceso en ventana privada.
3. Agregar aquí el enlace y completar `video_url` en `entrega/estado.json`.
4. Regenerar el PDF desde la raíz del repositorio:

```bash
python -m pip install reportlab
python entrega/generar_pdf.py
```

Python y ReportLab solo se necesitan para regenerar el informe, no para ejecutar la aplicación ni Cypress.

5. Revisar el PDF y publicar la actualización:

```bash
git add entrega
git commit -m "Agrega enlace al video de demostracion"
git push
```

6. Entregar el PDF actualizado y el enlace público del repositorio. No se ha inventado un video ni su URL.

Enlace al video: **PENDIENTE de grabación y publicación por el estudiante**.
