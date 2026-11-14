# Especificació d'Èpica: Amic Invisible Familiar (Yule)

- **Mòdul**: `amic-invisible`
- **Estat**: Pendent de validació (**Checkpoint 1**)
- **Data**: 2026-11-14

---

## 1. Descripció general

Aquesta èpica cobreix tot el cicle de vida de l'Amic Invisible familiar: registre de participants, configuració del pressupost màxim per edició, creació de llistes de desitjos, definició privada d'incompatibilitats per part de l'administrador, sorteig secret garantint les exclusions, notificació per correu electrònic amb la informació del receptor i recordatori anual automatitzat cada 15 de novembre.

---

## 2. Històries d'usuari (User Stories)

### US-1: Gestió de membres, invitacions i accés sense fricció (Admin)
- **Com a** administrador familiar,
- **vull** poder donar d'alta els familiars amb el seu nom i correu,
- **per tal de** tenir censada la família i que puguin entrar amb 1 sol clic sense recordar cap contrasenya.
- **Criteris d'acceptació**:
  1. L'admin pot crear un membre indicant nom i correu electrònic.
  2. S'envia un correu d'invitació amb un **Magic Link d'accés directe** (token segur d'un sol clic).
  3. L'admin disposa d'un botó **"Copiar enllaç màgic" per enviar-lo per WhatsApp** si algun familiar no obre el correu o té problemes amb l'spam.
  4. La sessió es manté desada al dispositiu (mòbil o PC) perquè no calgui tornar a fer login cada vegada que s'obre l'app.
  5. L'admin pot activar/desactivar participants per a l'edició de l'any actual.

---

### US-2: Configuració de l'edició anual i pressupost (Admin)
- **Com a** administrador,
- **vull** definir l'edició de Nadal de l'any actual i fixar un pressupost màxim (ex: 30 €),
- **per tal que** tothom conegui el marc econòmic de referència abans de fer la seva llista.
- **Criteris d'acceptació**:
  1. L'edició té un any (ex: 2026), nom ("Nadal 2026"), pressupost màxim i estat (`Esborrany`, `Llistes obertes`, `Sortejat`, `Finalitzat`).
  2. El pressupost màxim es mostra clarament a la capçalera de l'aplicació i als correus.

---

### US-3: Llista de desitjos visual amb enllaços i fotos (Membre)
- **Com a** membre de la família,
- **vull** afegir fàcilment desitjos a la meva llista, ja sigui escrivint, posant un enllaç o **fent una foto amb la càmera del mòbil** (o pujant-la des de l'ordinador),
- **per tal que** qui em regali sàpiga exactament què vull sense complicacions tecnològiques.
- **Criteris d'acceptació**:
  1. El membre pot afegir idees amb un botó gran i clar: **Títol del regal** (obligatori).
  2. Camp opcional d'enllaç web (ex: Amazon, botiga online).
  3. **Opció de foto directa**: si s'obre des del mòbil, obre directament la càmera o la galeria; si s'obre des del PC, permet seleccionar un fitxer d'imatge.
  4. Redimensionament i compressió transparent de les fotos al client abans de pujar per garantir una càrrega immediata.
  5. Avís visual suau si s'introdueix un preu estimat superior al límit fixat per l'administrador.
  6. Si un familiar afegeix un regal després d'haver-se fet el sorteig, el seu amic invisible rep una notificació avisant del nou desig.

---

### US-4: Matriu d'incompatibilitats privades amb semàfor de viabilitat (Admin)
- **Com a** administrador,
- **vull** establir incompatibilitats entre participants amb validació en temps real,
- **per tal d'** evitar conflictes familiars garantint que el sorteig és matemàticament possible.
- **Criteris d'acceptació**:
  1. **Privacitat absoluta**: La pantalla d'incompatibilitats i els seus endpoints a l'API són accessibles **únicament** per l'administrador.
  2. L'admin pot definir regles direccionals ("X no regala a Y") o bidireccionals ("X i Y no es regalen").
  3. **Semàfor de viabilitat matemàtica**: La pantalla mostra en temps real si el sorteig és possible amb les restriccions actuals (Verd: Viable; Vermell amb explicació: "Inviable: En Pere no pot rebre regal de ningú").
  4. Bloqueig preventiu del botó de sorteig si la configuració d'exclusions no permet una solució vàlida.

---

### US-5: Sorteig confidencial i notificació per correu (Admin / Sistema)
- **Com a** administrador,
- **vull** executar el sorteig secret amb un sol botó gran i clar un cop la família està llesta,
- **per tal que** el sistema assigni automàticament els regals respectant les incompatibilitats i notifiqui tothom.
- **Criteris d'acceptació**:
  1. L'algorisme de derangement amb backtracking/flux garanteix: cap assignació a un mateix, respecte del 100% d'exclusions, i 1 regalador per 1 receptor.
  2. Si no hi ha solució viable, no es permet prémer el botó i es mostra un avís clar.
  3. Enviament immediat de correus amb estil Yule festiu:
     - Nom de la persona a qui s'ha de regalar.
     - Botó gran: "Veure la llista de desitjos d'en/na [Nom]".
  4. L'admin disposa al seu tauler d'una opció per reenviar el correu o copiar l'enllaç individual per si algú diu que no ho troba.
  5. L'admin no veu els resultats per defecte a la UI per mantenir l'emoció familiar (amb botó d'emergència "Revelar per incidència" protegit amb confirmació).

---

### US-6: Consulta del receptor i desitjos (Experiència Membre)
- **Com a** membre familiar que entra des del seu mòbil o ordinador,
- **vull** veure a qui em toca regalar i els seus desitjos de manera festiva, clara i amb botons grans,
- **per tal de** trobar la idea perfecta sense complicacions.
- **Criteris d'acceptació**:
  1. **UI 100% Nadal/Yule**: targeta nadalenca personalitzada amb efecte de desembolicar o animació càlida de revelació.
  2. Targetes grans per a cada desig:
     - Foto visible (si s'ha fet amb la càmera o pujat fitxer).
     - Títol clar i gran (ideal per llegir des de qualsevol pantalla).
     - Botó cridaner "Obrir botiga" si hi ha enllaç extern.
     - Observacions (talla, color, etc.).
  3. Botó intern personal "Marcar com a comprat" (només visible per al regalador, per portar el seu propi control mental de les compres).

---

### US-7: Recordatori anual automatitzat del 15 de novembre (Sistema)
- **Com a** administrador,
- **vull** rebre un correu automàtic cada 15 de novembre,
- **per tal de** recordar-me que és hora de preparar la campanya de Nadal, convidar nous membres i revisar incompatibilitats.
- **Criteris d'acceptació**:
  1. Tasca de cron/backend que s'activa el dia 15 de novembre.
  2. Envia un correu amb plantilla nadalenca a l'admin amb accés directe al panell de gestió.
  3. L'admin pot crear l'edició de l'any amb un sol clic si no estava creada.

---

## 3. Flux de pantalles a mockejar (Checkpoint 2)

Un cop aprovat aquest document (**Checkpoint 1**), l'Agent Mockup generarà els mockups HTML+CSS autocontinguts, responsive mòbil-primer i amb estètica 100% Nadal/Yule:
1. `mockups/amic-invisible/member-gift-assigned.html`: Revelació màgica del destinatari assignat i el seu llistat de desitjos (amb fotos, enllaços i notes).
2. `mockups/amic-invisible/member-wishlist.html`: Editor de la pròpia llista amb suport de fotos (càmera mòbil/fitxer PC), enllaços i límit econòmic.
3. `mockups/amic-invisible/admin-dashboard.html`: Tauler de control de l'administrador (membres, estat de llistes, botó per copiar enllaç màgic per WhatsApp i botó de sorteig).
4. `mockups/amic-invisible/admin-incompatibilities.html`: Matriu/selector d'exclusions privades amb semàfor visual de viabilitat matemàtica.
5. `mockups/amic-invisible/email-assignment-preview.html`: Plantilla visual del correu electrònic nadalenc que rebrà la família.
