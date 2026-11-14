# Security — Mòdul Amic Invisible (Yule)

**Veredicte**: **SEGUR**  
**Data**: 2026-11-14

---

## 1. Vector d'autenticació i sessions
- **Mecanisme Magic Link**: Utilitza generació de tokens amb aleatorietat criptogràfica forta (`crypto/rand` de 128 bits), amb caducitat estricta (24h) i marcatge d'un sol ús (`used_at`).
- **Signatura JWT**: Emissió de tokens JWT signats amb HMAC-SHA256, verificació d'integritat de claims i caducitat.
- **Tancament de sessió**: La invalidació al client elimina el token de `localStorage`, i el backend rebutja peticions sense token vàlid.

---

## 2. Control d'accés i prevenció d'IDOR (Insecure Direct Object Reference)
- **Privacitat absoluta d'Incompatibilitats**:
  - Els endpoints `/incompatibilities` i `/incompatibilities/check-viability` estan protegits pel middleware `shared.RequireAdmin()`.
  - Els membres ordinaris reben `403 Forbidden` si intenten consultar o modificar exclusions.
- **Secretisme del Sorteig**:
  - L'endpoint `/assignment` no exposa paràmetres de cerca ni IDs d'altres usuaris.
  - El backend obté l'ID directament del token JWT (`c.Get(ContextUserID)`).
  - La query SQL filtra exclusivament `WHERE a.edition_id = $1 AND a.giver_id = $2`.
  - No hi ha cap endpoint públic que llisti les parelles del sorteig.
- **Protecció de la Llista de Desitjos**:
  - Les modificacions i eliminacions d'articles (`PUT` / `DELETE /wishlist/:item_id`) exigeixen tant l'ID de l'article com l'ID de l'usuari autenticat (`WHERE id = $1 AND user_id = $2`), evitant que un usuari manipuli la llista d'un altre.

---

## 3. Prevenció d'Injeccions SQL
- Totes les consultes a PostgreSQL utilitzen exclusivament paràmetres posicionals preparats (`$1, $2, $3...`).
- Cap query es construeix mitjançant concatenació o formatació de strings (`fmt.Sprintf`), garantint immunitat contra SQL Injection.

---

## 4. Pujada de Fitxers i Validació d'Entrada
- L'endpoint `/upload` valida l'extensió per llista blanca estricta (`.jpg`, `.jpeg`, `.png`, `.webp`).
- Es reanomenen els fitxers amb UUID aleatori generat pel servidor, eliminant qualsevol risc de *Path Traversal* (`../`).
- Els fitxers es desen al directori dedicat `uploads/photos/`.

---

## 5. Gestió de Secrets
- Cap secret de producció ni contrasenya real no està codificat en dur al repositori.
- Les claus i connexions admeten variables d'entorn (`JWT_SECRET`, `DATABASE_URL`, `PORT`).
