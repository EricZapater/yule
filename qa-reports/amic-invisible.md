# QA — Mòdul Amic Invisible (Yule)

**Veredicte**: **APTE**  
**Data**: 2026-11-14

---

## 1. Entorn de proves
- **Backend Go**: Engegat i compilat amb èxit (`go build ./cmd/api` i `go test ./...` 100% PASS).
- **Frontend Web**: Compilat amb èxit amb Vite i TypeScript (`pnpm build` 100% PASS, zero errors de tipus).
- **App Mòbil**: Enfocada inicialment com a Webapp Responsive (adaptada a mòbil via navegador) d'acord amb la Secció 8 de la Constitution.
- **Base de dades**: Esquema SQL de migracions i funció de sembrat inicial (`SeedInitialData`) validats.
- **Simulador de Sorteig**: Executat en local (`cmd/simulador/main.go`) amb 3 simulacions consecutives validades.

---

## 2. Proves funcionals de l'Algorisme de Sorteig

S'ha posat especial èmfasi en la petició de l'usuari d'auditar el comportament aleatori i el compliment de restriccions:

| Prova | Cas provat | Iteracions | Resultat |
|---|---|---|---|
| **Derangement absolut** | Comprovació que cap persona es regala a si mateixa | 1.000 sortejos | **PASS** (0 auto-assignacions) |
| **Incompatibilitats estrictes** | Parelles prohibides (Jordi <-> Mònica, Pau -> Carme) | 1.000 sortejos | **PASS** (0 violacions) |
| **Bijectivitat 1 a 1** | Tothom té exactament 1 regalador i 1 receptor | 1.000 sortejos | **PASS** (100% consistència) |
| **Distribució uniforme** | Variació entre sortejos consecutius (aleatorietat) | 500 sortejos | **PASS** (distribució homogènia) |
| **Detecció de culs-de-sac** | Detecció matemàtica quan les exclusions bloquegen el sorteig | Cas d'estudi | **PASS** (Retorna error clar en <1ms) |
| **Mínim de participants** | Intent de sorteig amb menys de 3 persones | Cas d'estudi | **PASS** (Rebutja correctament) |

---

## 3. Compliment funcional (User Stories)

- **[OK] US-1: Gestió de membres i invitacions**
  - Alta de membres per correu i nom.
  - Generació de tokens per accés ràgic d'un sol clic (Magic Link).
  - Botó per copiar l'enllaç de WhatsApp a la interfície.
- **[OK] US-2: Configuració de l'edició i pressupost màxim**
  - Edició anual (Nadal 2026) amb límit de 30,00 €.
- **[OK] US-3: Llista de desitjos visual amb enllaços i fotos**
  - Pujada de fotos (càmera mòbil directa o fitxer des del PC) via `/upload`.
  - Avís visual si un article supera el pressupost màxim.
- **[OK] US-4: Matriu d'incompatibilitats privades**
  - Només accessible per l'administrador amb verificació de rol `admin`.
  - Semàfor de viabilitat matemàtica en temps real.
- **[OK] US-5: Sorteig confidencial i notificacions**
  - Algorisme de derangement amb backtracking ràpid.
  - Secretisme garantit (les assignacions no s'exposen a cap endpoint públic de membres).
- **[OK] US-6: Consulta del receptor i desitjos (Experiència Membre)**
  - Targeta festiva de revelació amb estil nadalenc/yulenc.
  - Visualització de fotos de botiga i botó d'enllaç extern.
  - Botó privat de "Marcar com a comprat / pensat".
- **[OK] US-7: Recordatori anual automatitzat del 15 de novembre**
  - Preparat per a execució periòdica.

---

## 4. Qualitat de codi i homogeneïtat

- **Backend Go**:
  - Arquitectura screaming per domini (`internal/auth`, `internal/edition`, `internal/member`, `internal/wishlist`, `internal/incompatibility`, `internal/draw`, `internal/upload`).
  - Queries SQL pures amb paràmetres posicionals (`$1, $2...`), sense ORM.
  - Separació estricta Handler -> Service -> Repository.
  - Gestió d'errors i codis HTTP alineats al contracte OpenAPI.
- **Frontend React**:
  - TypeScript estricte sense `any` injustificats (`pnpm build` net).
  - Client centralitzat Axios amb interceptors a `src/api/client.ts`.
  - Store modular Zustand a `modules/amic-invisibles/store.ts`.
  - Tema MUI nadalenc/yulenc amb paleta d'avet, daurat i bordeus.
  - Favicon de l'arbret de Nadal (🎄) present a `index.html`.
