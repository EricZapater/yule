# Especificació Funcional de Producte — Yule (Amic Invisible Familiar)

Aquest document defineix el domini, les entitats, els rols i els fluxos de negoci de l'aplicació **Yule**, d'acord amb la `constitution.md`.

---

## 1. Visió general del producte

**Yule** és una aplicació web pensada per gestionar l'Amic Invisible familiar anual amb una experiència càlida, màgica i festiva (estètica 100% nadalenca/yulenca en tota l'aplicació: verds avet profunds, daurats càlids, vermells cirera/bordeus, textures de fusta, motius de vesc i flocs de neu subtils).

L'objectiu principal és **l'extrema simplicitat d'ús** per a qualsevol perfil familiar (fins i tot usuaris d'edat avançada o amb nul·la experiència tecnològica), eliminant qualsevol fricció:
- **Sense contrasenyes feixugues**: Accés mitjançant **Magic Link per correu d'un sol clic** (i opció per a l'admin de copiar l'enllaç per WhatsApp si el familiar no mira el correu).
- **Llista de regals súper visual**: Es poden afegir enllaços web o **fer una foto directament des del mòbil** (a la botiga o catàleg) o pujar-la des del PC.
- **Matriu d'incompatibilitats privada**: Només visible per l'admin, amb semàfor de viabilitat matemàtica en temps real.
- **Sorteig automàtic confidencial**: Notificació per correu i revelació màgica a la web.
- **Recordatori anual automàtic del 15 de novembre**: Per posar la maquinària en marxa sense que l'admin se n'oblidi.

---

## 2. Rols i permisos

### 2.1 Administrador (Admin)
- Gestió de les edicions anuals (Nadal de l'any en curs, definició del pressupost màxim).
- Convidar nous membres familiars i donar d'alta/baixa membres.
- **Configurar incompatibilitats**: definir parelles o direccions no permeses (ex: A no pot regalar a B, o exclusions mútues). **Aquesta informació és estrictament confidencial i només visible per l'admin.**
- Engegar el procés de sorteig quan tothom està llest.
- Rebre el correu de recordatori automàtic del 15 de novembre per iniciar l'edició de l'any.

### 2.2 Membre familiar (Usuari)
- Accedir al seu perfil i consultar la seva assignació (un cop realitzat el sorteig).
- Omplir i modificar la seva pròpia llista de desitjos (enllaços, descripcions, preus aproximats) respectant el pressupost màxim.
- Consultar la llista de desitjos de la persona que li ha tocat regalar (i MAI de qui li fa el regal a ell ni de la resta).
- Rebre el correu amb el resultat secret del seu sorteig.

---

## 3. Entitats de domini principals

1. **User / Member**
   - `id`, `name`, `email`, `role` (`admin` | `member`), `avatar_url`, `created_at`, `updated_at`.
2. **Edition (Edició anual)**
   - `id`, `year` (ex: 2026), `name` (ex: "Nadal 2026"), `budget_limit` (ex: 30.00 €), `status` (`draft` | `wishlists_open` | `drawn` | `closed`), `drawn_at`.
3. **WishlistItem (Article de la llista)**
   - `id`, `edition_id`, `user_id`, `title`, `url` (opcional), `image_url` (foto feta amb càmera de mòbil o pujada des de PC), `notes`, `estimated_price`, `order_index`.
   - *Tractament d'imatges*: compressió automàtica al navegador/backend per a càrrega instantània i estalvi d'espai.
4. **Incompatibility (Regla d'exclusió)**
   - `id`, `edition_id` o global, `giver_id`, `receiver_id`, `notes`.
   - *Nota de seguretat*: Aquesta taula i els seus endpoints estan reservats 100% al rol Admin.
5. **Assignment (Assignació secreta del sorteig)**
   - `id`, `edition_id`, `giver_id`, `receiver_id`, `created_at`, `email_sent_at`.
   - *Nota de seguretat*: Els membres normals NOMÉS tenen accés al seu propi `giver_id` (sabent el seu `receiver_id`). No tenen accés a la llista completa d'assignacions ni tan sols l'admin pot veure les assignacions a la UI per mantenir la màgia i el secret (opcionalment amb mode 'revelar' només per incidències de suport si l'admin ho demana explícitament).

---

## 4. Fluxos de negoci clau

### 4.1 Registre i invitacions
1. L'admin convida membres mitjançant el seu correu electrònic (amb un enllaç màgic o registre per contrasenya).
2. El membre accedeix a l'app i confirma el seu nom i dades bàsiques.

### 4.2 Llista de desitjos
1. Cada membre entra a la seva fitxa de l'edició activa.
2. Afegeix enllaços a botigues o regals desitjats amb una descripció breu i preu aproximat (avisant visualment si supera el pressupost màxim de l'edició).
3. L'admin pot consultar l'estat d'ompliment de cada membre (ex: "3 regals afegits", "pendent") sense necessitat de llegir-los si vol preservar sorpreses.

### 4.3 Gestió d'incompatibilitats
1. Pantalla exclusiva d'Admin amb matriu o selector d'exclusions:
   - Exclusions direccionals: "X no pot regalar a Y".
   - Exclusions bidireccionals: "X i Y no es regalen mútuament" (parelles convivents que ja es fan regals privats, persones amb conflictes, o repeticions de l'any anterior).

### 4.4 Sorteig i Algorisme d'Assignació
1. Condicions prèvies: Mínim 3 membres, cadascun amb incompatibilitats compatibles (hi ha d'haver solució matemàtica possible).
2. Algorisme de permutació/bipartite matching (derangement amb restriccions):
   - Cap membre es regala a si mateix.
   - Es respecten totes les incompatibilitats.
   - Es garanteix una única assignació per persona (1 regalador -> 1 receptor).
3. Confirmació de l'admin: engegar sorteig.
4. Generació de les assignacions en base de dades.
5. Enviament asíncron de correus electrònics a tots els participants amb:
   - Nom de la persona que li ha tocat.
   - Pressupost màxim de l'edició.
   - Enllaç directe i llistat de desitjos del receptor.

### 4.5 Automatització anual (15 de Novembre)
- Un cronjob o tasca programada del backend s'executa el 15 de novembre a les 09:00h.
- Comprova si s'ha creat l'edició d'aquell any. Si no, en crea un esborrany i envia un correu a l'Admin:
  - Recordatori per revisar la llista de familiars.
  - Enllaç per convidar noves parelles/membres o marcar baixes temporals.
  - Enllaç per revisar les incompatibilitats.

---

## 5. Disseny i Identitat Visual (Yule / Nadal)
- **Paleta de colors**:
  - Fons: tons càlids, crema suau o fosc hivernal elegant (Dark Mode nadalenc opcional).
  - Colors primaris: Verd pi/avet (`#1b4332`, `#2d6a4f`).
  - Colors secundaris / accents: Vermell nadalenc profund (`#9d0208`, `#ba181b`), or càlid (`#d4af37`, `#e9c46a`).
  - Tipografia: Serif càlida per a títols festius combinada amb Sans-Serif moderna i neta per a la UI.
- **Tocs Yule**: elements visuals hivernals subtils (branques de vesc, flocs de neu, espelmes o motius festius sense recarregar la interfície).

---

## 6. Decisions d'abast (Constitution Secció 8)

1. **Plataforma**: Inicialment **Webapp responsive** (desktop + mòbil al navegador). El monorepo manté l'estructura compatible amb React Native per si més endavant es vol generar la build d'app nativa mòbil.
2. **Autenticació**: Magic Links per email o Email + Contrasenya senzilla (facilitat d'accés per a gent gran o familiars poc tecnològics).
3. **Multi-família vs Monofamília**: Dissenyat inicialment per a la família de l'usuari (single-group o multi-grup senzill preparat a nivell de schema).
4. **Servei d'emails**: Backend amb suport SMTP configurable (ex: Resend, Mailgun, o SMTP estàndard).
