const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

async function generatePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  function addHeader(title, subtitle) {
    doc.setFillColor(27, 67, 50); // Dark Green #1b4332
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, margin, 12);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text(subtitle, margin, 20);
    }
  }

  function addFooter(pageNum, totalPages) {
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Yule - L'Amic Invisible de la Família | https://yule.ericzapater.cat", margin, pageHeight - 6);
    doc.text(`Pàgina ${pageNum} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 6);
  }

  // --- PÀGINA 1: Introducció & Pas 1 (Registre) ---
  addHeader("🎄 YULE - L'Amic Invisible Familiar", 'Guia pas a pas per a familiars (Pàgina 1 de 4)');

  let y = 35;
  doc.setTextColor(27, 67, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("1. Com registrar-se per primera vegada", margin, y);

  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const introText = [
    "Per participar a l'Amic Invisible d'aquest any, no cal recordar cap contrasenya.",
    "1. Entra a https://yule.ericzapater.cat/login des del mòbil o l'ordinador.",
    "2. Fes clic a la pestanya 'Registra't 🎁'.",
    "3. Posa el teu nom o sobrenom familiar (ex: Maria, Oncle Jordi, Avi Marc...).",
    "4. Introdueix el teu correu electrònic i prem 'Uneix-te a l'Amic Invisible 🎄'.",
    "Ja tindràs el teu compte creat i entraràs directament a l'aplicació!",
  ];
  doc.text(introText, margin, y);

  y += 34;
  const img1Path = path.join(__dirname, '../frontend/public/guide/opt/01_registre.jpg');
  if (fs.existsSync(img1Path)) {
    const img1Data = fs.readFileSync(img1Path).toString('base64');
    doc.addImage(img1Data, 'JPEG', margin + 15, y, contentWidth - 30, 140);
  }

  addFooter(1, 4);

  // --- PÀGINA 2: Pas 2 (Tornar a entrar amb Magic Link) ---
  doc.addPage();
  addHeader("🔑 Accés sense contrasenya (Magic Link)", 'Com tornar a entrar a la teva sessió (Pàgina 2 de 4)');

  y = 35;
  doc.setTextColor(27, 67, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("2. Com tornar a entrar més endavant", margin, y);

  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const step2Text = [
    "Quan vulguis consultar o afegir més regals, tens dues maneres molt fàcils d'entrar:",
    "",
    "• Opció A (Rebre enllaç per correu): A la pestanya 'Ja tens compte 🔑', escriu el teu correu i",
    "  prem 'Enviar enllaç d'accés màgic 📨'. Rebràs un correu amb un botó per entrar amb un sol clic.",
    "• Opció B (WhatsApp directe): L'administrador de la família et pot enviar el teu enllaç",
    "  personalitzat directament per WhatsApp. Només cal clicar-lo i s'obrirà la teva sessió!",
  ];
  doc.text(step2Text, margin, y);

  y += 38;
  const img2Path = path.join(__dirname, '../frontend/public/guide/opt/02_magic_link.jpg');
  if (fs.existsSync(img2Path)) {
    const img2Data = fs.readFileSync(img2Path).toString('base64');
    doc.addImage(img2Data, 'JPEG', margin + 15, y, contentWidth - 30, 140);
  }

  addFooter(2, 4);

  // --- PÀGINA 3: Pas 3 (La meva llista de desitjos) ---
  doc.addPage();
  addHeader("🎁 La teva Llista de Desitjos", 'Com indicar idees de regal a qui et toqui (Pàgina 3 de 4)');

  y = 35;
  doc.setTextColor(27, 67, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("3. Com omplir la teva llista de regals", margin, y);

  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const step3Text = [
    "A la pantalla d'inici, prem '📝 Crear la meva llista de desitjos' per afegir idees:",
    "• Títol del regal (obligatori): El que t'agradaria (ex: Llibre, jersei, bufanda...).",
    "• Preu orientatiu (€): Per ajudar a ajustar-se al pressupost màxim (ex: 30 €).",
    "• Enllaç web (opcional): L'enllaç d'Amazon o de la botiga per comprar-lo online.",
    "• Comentaris (opcional): La teva talla de roba/calçat, color preferit o botiga física.",
    "• Fotos: Pots prémer '📸 Fer Foto' per obrir la càmera del mòbil a la botiga, o '🖼️ Galeria'.",
    "💡 Si ja vas participar l'any passat, prem 'Traspassar Desitjos' per copiar-los en 1 clic!",
  ];
  doc.text(step3Text, margin, y);

  y += 42;
  const img4Path = path.join(__dirname, '../frontend/public/guide/opt/04_afegir_desig_modal.jpg');
  if (fs.existsSync(img4Path)) {
    const img4Data = fs.readFileSync(img4Path).toString('base64');
    doc.addImage(img4Data, 'JPEG', margin + 5, y, contentWidth - 10, 130);
  }

  addFooter(3, 4);

  // --- PÀGINA 4: Pas 4 (El sorteig i notificacions) ---
  doc.addPage();
  addHeader("🎉 El Sorteig i la teva Persona Assignada", 'Què rebràs quan se celebri el sorteig (Pàgina 4 de 4)');

  y = 35;
  doc.setTextColor(27, 67, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("4. Què rebràs quan se celebri el sorteig?", margin, y);

  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const step4Text = [
    "Quan tothom hagi omplert les llistes i l'administrador premi el botó de sorteig:",
    "",
    "1. Rebràs un correu electrònic festiu amb:",
    "   • El nom del familiar que t'ha tocat en secret.",
    "   • La seva llista de desitjos completa amb fotos, preus, enllaços i talles.",
    "   • El pressupost acordat per la família (ex: màxim 30,00 €).",
    "",
    "2. A l'aplicació web (https://yule.ericzapater.cat):",
    "   • Es desbloquejarà la targeta secreta del teu destinatari.",
    "   • Tindràs caselles per marcar de manera privada els regals com a 'Comprat / Pensat'",
    "     per organitzar-te les compres sense que ningú més ho vegi!",
  ];
  doc.text(step4Text, margin, y);

  y += 58;
  const img3Path = path.join(__dirname, '../frontend/public/guide/opt/03_panell_familiar.jpg');
  if (fs.existsSync(img3Path)) {
    const img3Data = fs.readFileSync(img3Path).toString('base64');
    doc.addImage(img3Data, 'JPEG', margin + 5, y, contentWidth - 10, 115);
  }

  addFooter(4, 4);

  // Desar el fitxer PDF a frontend/public/guia-familiar.pdf
  const outputPath = path.join(__dirname, '../frontend/public/guia-familiar.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

  // També copiar-lo al directori d'artefactes
  const artifactOutputPath = '/Users/eric.zapater/.gemini/antigravity/brain/0e7664d4-60f0-4396-a2bc-4f47e6c0df3e/guia-familiar.pdf';
  fs.writeFileSync(artifactOutputPath, Buffer.from(pdfBytes));

  console.log('✅ PDF generat correctament a:', outputPath);
  console.log('✅ PDF copiat a directori artefactes:', artifactOutputPath);
}

generatePDF().catch(console.error);
