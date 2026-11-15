-- Schema inicial per a Yule (Amic Invisible)

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS magic_links (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editions (
    id UUID PRIMARY KEY,
    year INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    budget_limit NUMERIC(10,2) NOT NULL DEFAULT 30.00,
    status VARCHAR(50) NOT NULL DEFAULT 'wishlists_open',
    drawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edition_members (
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (edition_id, user_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY,
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price_estimated NUMERIC(10,2),
    url TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incompatibilities (
    id UUID PRIMARY KEY,
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    person1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_mutual BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_diff_persons CHECK (person1_id <> person2_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY,
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_edition_giver UNIQUE (edition_id, giver_id),
    CONSTRAINT uq_edition_receiver UNIQUE (edition_id, receiver_id),
    CONSTRAINT chk_no_self_gift CHECK (giver_id <> receiver_id)
);

-- Edició inicial per defecte (Nadal 2026)
INSERT INTO editions (id, year, name, budget_limit, status) VALUES
('e0000000-0000-0000-0000-000000002026', 2026, 'Nadal 2026', 30.00, 'wishlists_open')
ON CONFLICT (year) DO NOTHING;

CREATE TABLE IF NOT EXISTS purchased_items (
    giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    is_purchased BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (giver_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(edition_id, user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_edition ON assignments(edition_id);

-- Eliminar restricció de clau única per any a editions per permetre múltiples sortejos
ALTER TABLE editions DROP CONSTRAINT IF EXISTS editions_year_key;
