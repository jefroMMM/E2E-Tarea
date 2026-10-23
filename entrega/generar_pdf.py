"""Regenera el informe: python -m pip install reportlab; python entrega/generar_pdf.py"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak

folder = Path(__file__).resolve().parent
state = json.loads((folder / 'estado.json').read_text(encoding='utf-8'))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCafe', fontName='Helvetica-Bold', fontSize=28, leading=34, textColor=colors.HexColor('#36513c'), spaceAfter=20))
styles['BodyText'].fontSize = 11
styles['BodyText'].leading = 16
styles['Heading2'].textColor = colors.HexColor('#36513c')
story = []
def p(text):
    story.append(Paragraph(text, styles['BodyText']))
    story.append(Spacer(1, 12))
def title(text): story.append(Paragraph(text, styles['Heading2']))
def link(label, url):
    p(f'<b>{escape(label)}</b><br/><link href="{escape(url)}" color="#36513c">{escape(url)}</link>')
def screenshot(name, caption):
    file = folder / 'capturas' / name
    w, h = ImageReader(str(file)).getSize()
    scale = min(510 / w, 510 / h)
    story.append(Image(str(file), width=w*scale, height=h*scale))
    story.append(Spacer(1, 12))
    p(caption)
def page(): story.append(PageBreak())

story.append(Paragraph('Café de la Plaza', styles['TitleCafe']))
p('Aplicación web y pruebas de extremo a extremo con Cypress<br/>Tarea universitaria - 23 de octubre de 2026')
link('Repositorio público', 'https://github.com/jefroMMM/E2E-Tarea')
link('Ejecución exitosa de GitHub Actions verificada', state['ci_url'])
title('Resultado real')
p(escape(state['resultado']))
p('Aplicación: HTML, CSS y JavaScript. API: Node.js y Express. Persistencia: SQLite en archivo, con transacciones para guardar el pedido y descontar existencias. Los precios se manejan en centavos.')
title('Video de demostración (máximo 3 minutos)')
if state.get('video_url'): link('Ver demostración', state['video_url'])
else: p('<b>PENDIENTE:</b> el estudiante debe grabar y publicar el video. Seguir guion_video.md; verificar que el docente pueda abrir el enlace. Después, completar video_url en estado.json y regenerar este PDF con generar_pdf.py. No se ha inventado un enlace.')
p('ChatGPT y Codex fueron utilizados para apoyar el desarrollo, proponer pruebas, revisar selectores y documentación. Las pruebas tienen pasos y aserciones explícitos para facilitar su explicación.')
page()
title('1. Pedido exitoso')
p('Se reinicia la base, se agregan café y pan, y se modifica el café a 2 unidades. El total esperado es Q 48.00. Cypress inspecciona el POST, verifica HTTP 201 y el UUID visible; consulta el GET del pedido para comprobar total y líneas guardadas, y comprueba el stock actualizado.')
screenshot('02-pedido-confirmado.png', 'Captura real tomada por Cypress tras la confirmación. El identificador es único para esa ejecución; cambia al repetir la prueba.')
p('Evidencia adicional: 01-carrito-exitoso.png muestra las cantidades antes de confirmar.')
page()
title('2. Validación del carrito vacío')
p('Tras reiniciar los datos, se intenta confirmar sin productos. La interfaz muestra la validación. Cypress comprueba que el historial de POST interceptados está vacío y que GET /api/orders devuelve una lista vacía.')
screenshot('03-validacion-carrito-vacio.png', 'Captura real del mensaje de validación. No se creó ningún pedido.')
page()
title('3. Fallo controlado y recuperación')
p('Se agrega un capuchino y cy.intercept configura una sola respuesta HTTP 500 con times: 1. Cypress comprueba método, URL, cuerpo y código HTTP. El error se explica y el carrito conserva el producto y Q 22.00.')
screenshot('04-fallo-controlado.png', 'El fallo de esta solicitud es simulado. El servidor y la base de datos siguen disponibles; todavía no hay pedidos guardados.')
page()
title('3. Recuperación con la API real')
p('En el segundo intento deja de aplicarse la simulación. La API real responde 201 y guarda el pedido en SQLite. Cypress verifica el identificador, el total y que existe exactamente un pedido.')
screenshot('05-recuperacion-exitosa.png', 'Captura real del reintento completado. El carrito se vacía solamente después de recibir la confirmación.')
page()
title('Verificación, datos y estabilidad')
p(escape(state['resultado']))
p('Los archivos resultados-cypress.txt y resultados-inverso.txt contienen la salida real de las ejecuciones. verificacion-manual.md y verificacion-api.txt documentan las verificaciones adicionales. Se confirmó también la persistencia después de reiniciar el proceso del servidor.')
title('Reinicio e independencia')
p('Cada beforeEach llama POST /api/test/reset. Esta ruta existe solo con NODE_ENV=test y restaura cuatro productos y cero pedidos en data/test.sqlite. La aplicación normal usa otra base. npm run seed y npm run seed:test permiten restaurar cada base desde terminal; ambos borran los pedidos de su base.')
title('Prevención de flakiness')
p('Se usan selectores data-cy, testIsolation, alias de red registrados antes de las acciones y aserciones reintentables. No hay cy.wait con pausas numéricas. Cada recorrido prepara sus datos y también se ejecutó por separado en orden inverso. Los botones se bloquean durante la confirmación.')
title('Qué es real y qué se simula')
p('El frontend, Express, HTTP y SQLite son reales. Solo se simula el primer error HTTP 500 del tercer recorrido. El éxito, el reintento y la consulta de persistencia no usan respuestas ficticias.')
title('GitHub Actions')
link('Resultado exitoso verificado mediante API de GitHub', state['ci_url'])
p('El workflow se activa con push y pull request, instala dependencias, prepara datos, espera la API y ejecuta Cypress headless y el orden inverso. Guarda capturas y videos como artifacts incluso cuando hay fallos. El archivo github-actions.json conserva el resultado consultado y los pasos del job.')
if (folder/'capturas'/'06-github-actions.png').exists():
    page(); title('Evidencia visual de GitHub Actions'); screenshot('06-github-actions.png', 'Captura de la ejecución pública verificada. El enlace directo está en la primera página.')

def footer(canvas, doc):
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(colors.HexColor('#776e60'))
    canvas.drawString(40, 24, 'Café de la Plaza | Evidencia de la tarea')
    canvas.drawRightString(555, 24, str(doc.page))
SimpleDocTemplate(str(folder/'informe.pdf'), pagesize=(595.28,841.89), rightMargin=40,leftMargin=40,topMargin=36,bottomMargin=42).build(story,onFirstPage=footer,onLaterPages=footer)
print('Informe generado:', folder/'informe.pdf')
