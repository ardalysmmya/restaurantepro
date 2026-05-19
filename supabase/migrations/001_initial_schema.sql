-- ============================================================================
-- RestaurantePro SaaS — Migración Inicial
-- Tablas: restaurants, staff, menu, recipes, ingredients, inventory,
--          tables, orders, diners, loyalty, campaigns, subscriptions
-- ============================================================================

-- ═══ EXTENSIONES ═══
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══ TIPOS ENUM ═══
DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('owner','admin','manager','chef','waiter','viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE table_status AS ENUM ('free','occupied','reserved','dirty','inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','cooking','ready','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE item_status AS ENUM ('pending','cooking','ready','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_type AS ENUM ('discount','points_multiplier','free_item','birthday','welcome');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tier AS ENUM ('starter','pro','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══ 1. RESTAURANTS ═══
CREATE TABLE IF NOT EXISTS restaurants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url    TEXT,
  hero_url    TEXT,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  timezone    TEXT DEFAULT 'America/Mexico_City',
  currency    TEXT DEFAULT 'MXN',
  tax_rate    NUMERIC(5,4) DEFAULT 0.1600,
  settings    JSONB DEFAULT '{}',
  plan        plan_tier DEFAULT 'starter',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- ═══ 2. RESTAURANT STAFF (RBAC) ═══
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          staff_role DEFAULT 'waiter',
  pin           TEXT,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view their own records"
  ON restaurant_staff FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
  ));

-- ═══ 3. MENU CATEGORIES ═══
CREATE TABLE IF NOT EXISTS menu_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INT DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- ═══ 4. DISHES ═══
CREATE TABLE IF NOT EXISTS dishes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost          NUMERIC(10,2) DEFAULT 0,
  image_url     TEXT,
  available     BOOLEAN DEFAULT true,
  allergens     TEXT[],
  tags          TEXT[],
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- ═══ 5. INGREDIENTS ═══
CREATE TABLE IF NOT EXISTS ingredients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  unit          TEXT NOT NULL DEFAULT 'g',
  cost_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  stock_qty     NUMERIC(12,4) DEFAULT 0,
  min_stock     NUMERIC(12,4) DEFAULT 5,
  supplier      TEXT,
  category      TEXT,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- ═══ 6. RECIPES (BOM) ═══
CREATE TABLE IF NOT EXISTS recipes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_id       UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  name          TEXT,
  yield_qty     INT DEFAULT 1,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dish_id)
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- ═══ 7. RECIPE INGREDIENTS ═══
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id     UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty_per_serv  NUMERIC(10,4) NOT NULL DEFAULT 0,
  unit          TEXT,
  notes         TEXT,
  UNIQUE(recipe_id, ingredient_id)
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- ═══ 8. INVENTORY MOVEMENTS ═══
CREATE TABLE IF NOT EXISTS inventory_movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty_change    NUMERIC(10,4) NOT NULL,
  type          TEXT NOT NULL DEFAULT 'manual',
  reference_type TEXT,
  reference_id   UUID,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ═══ 9. TABLES (MAPA DE MESAS) ═══
CREATE TABLE IF NOT EXISTS tables (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  capacity      INT DEFAULT 4,
  position_x    INT DEFAULT 0,
  position_y    INT DEFAULT 0,
  section       TEXT,
  status        table_status DEFAULT 'free',
  merged_with   UUID REFERENCES tables(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- ═══ 10. ORDERS ═══
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id      UUID REFERENCES tables(id) ON DELETE SET NULL,
  diner_id      UUID,
  waiter_id     UUID REFERENCES auth.users(id),
  status        order_status DEFAULT 'pending',
  subtotal      NUMERIC(10,2) DEFAULT 0,
  tax           NUMERIC(10,2) DEFAULT 0,
  total         NUMERIC(10,2) DEFAULT 0,
  notes         TEXT,
  started_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ═══ 11. ORDER ITEMS ═══
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dish_id       UUID NOT NULL REFERENCES dishes(id),
  quantity      INT DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL,
  status        item_status DEFAULT 'pending',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ═══ 12. DINERS (COMENSALES) ═══
CREATE TABLE IF NOT EXISTS diners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  birthdate     DATE,
  allergies     TEXT[],
  tags          TEXT[],
  notes         TEXT,
  visit_count   INT DEFAULT 0,
  last_visit    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diners ENABLE ROW LEVEL SECURITY;

-- FK from orders to diners (deferred because diners didn't exist yet)
ALTER TABLE orders ADD CONSTRAINT fk_orders_diner
  FOREIGN KEY (diner_id) REFERENCES diners(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS diner_favorites (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diner_id UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  dish_id  UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  UNIQUE(diner_id, dish_id)
);

ALTER TABLE diner_favorites ENABLE ROW LEVEL SECURITY;

-- ═══ 13. LOYALTY ═══
CREATE TABLE IF NOT EXISTS loyalty_points (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diner_id      UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  points        INT DEFAULT 0,
  tier          TEXT DEFAULT 'bronze',
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diner_id, restaurant_id)
);

ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diner_id      UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  points_change INT NOT NULL DEFAULT 0,
  reason        TEXT,
  reference_id  UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- ═══ 14. CAMPAIGNS ═══
CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            campaign_type DEFAULT 'discount',
  value           INT DEFAULT 10,
  min_visits      INT DEFAULT 0,
  min_points      INT DEFAULT 0,
  expires_in_days INT DEFAULT 30,
  active          BOOLEAN DEFAULT true,
  max_redemptions INT DEFAULT 0,
  current_uses    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS campaign_redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  diner_id    UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id),
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campaign_redemptions ENABLE ROW LEVEL SECURITY;

-- ═══ 15. SUBSCRIPTIONS (STRIPE) ═══
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan            plan_tier DEFAULT 'starter',
  status          TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══ FUNCIÓN: Descuento automático de inventario ═══
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  ing RECORD;
  rest_id UUID;
BEGIN
  SELECT restaurant_id INTO rest_id FROM orders WHERE id = NEW.order_id;
  IF NEW.status = 'cooking' AND OLD.status = 'pending' THEN
    FOR ing IN
      SELECT ri.ingredient_id, ri.qty_per_serv * oi.quantity AS total_qty
      FROM recipe_ingredients ri
      JOIN recipes r ON r.id = ri.recipe_id
      JOIN dishes d ON d.id = r.dish_id
      JOIN order_items oi ON oi.dish_id = d.id
      WHERE oi.id = NEW.id
    LOOP
      UPDATE ingredients
        SET stock_qty = GREATEST(0, stock_qty - ing.total_qty),
            updated_at = now()
        WHERE id = ing.ingredient_id AND stock_qty >= ing.total_qty;
      INSERT INTO inventory_movements (restaurant_id, ingredient_id, qty_change, type, reference_type, reference_id)
        VALUES (rest_id, ing.ingredient_id, -ing.total_qty, 'auto', 'order_item', NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deduct_inventory ON order_items;
CREATE TRIGGER trg_deduct_inventory
  AFTER UPDATE OF status ON order_items
  FOR EACH ROW
  WHEN (NEW.status = 'cooking' AND OLD.status = 'pending')
  EXECUTE FUNCTION deduct_inventory_on_order();

-- ═══ FUNCIÓN: Calcular márgenes de receta ═══
CREATE OR REPLACE FUNCTION calculate_dish_cost(p_dish_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(ri.qty_per_serv * i.cost_per_unit), 0)
    INTO total
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    JOIN recipes r ON r.id = ri.recipe_id
    WHERE r.dish_id = p_dish_id;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ═══ FUNCIÓN: Sumar puntos de lealtad por orden ═══
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  pts INT;
  diner_rec RECORD;
  campaign_rec RECORD;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.diner_id IS NOT NULL THEN
    pts := FLOOR(NEW.total);
    INSERT INTO loyalty_points (diner_id, restaurant_id, points)
      VALUES (NEW.diner_id, NEW.restaurant_id, pts)
      ON CONFLICT (diner_id, restaurant_id)
      DO UPDATE SET points = loyalty_points.points + pts, updated_at = now();
    INSERT INTO loyalty_transactions (diner_id, restaurant_id, points_change, reason, reference_id)
      VALUES (NEW.diner_id, NEW.restaurant_id, pts, 'order', NEW.id);
    UPDATE diners SET visit_count = visit_count + 1, last_visit = now()
      WHERE id = NEW.diner_id;
    SELECT visit_count, id INTO diner_rec FROM diners WHERE id = NEW.diner_id;
    FOR campaign_rec IN
      SELECT * FROM campaigns
      WHERE restaurant_id = NEW.restaurant_id
        AND active = true
        AND min_visits <= diner_rec.visit_count
        AND (current_uses < max_redemptions OR max_redemptions = 0)
    LOOP
      INSERT INTO campaign_redemptions (campaign_id, diner_id, order_id)
        VALUES (campaign_rec.id, NEW.diner_id, NEW.id);
      UPDATE campaigns SET current_uses = current_uses + 1 WHERE id = campaign_rec.id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_loyalty_points ON orders;
CREATE TRIGGER trg_loyalty_points
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'delivered' AND OLD.status != 'delivered')
  EXECUTE FUNCTION award_loyalty_points();

-- ═══ RLS POLICIES ═══
-- Owners and staff can read their restaurants
DROP POLICY IF EXISTS "restaurants_owner_access" ON restaurants;
CREATE POLICY "restaurants_owner_access" ON restaurants
  FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "restaurants_staff_view" ON restaurants;
CREATE POLICY "restaurants_staff_view" ON restaurants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM restaurant_staff WHERE restaurant_id = restaurants.id AND user_id = auth.uid()
  ));

-- Staff can view their own assignments
DROP POLICY IF EXISTS "restaurant_staff_self" ON restaurant_staff;
CREATE POLICY "restaurant_staff_self" ON restaurant_staff FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
  ));

-- Tenant isolation for tables with direct restaurant_id
DO $$ DECLARE t TEXT; pol TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'menu_categories','dishes','ingredients','recipes',
        'inventory_movements','tables','orders','diners',
        'loyalty_points','loyalty_transactions',
        'campaigns','subscriptions'
      )
  LOOP
    pol := format('tenant_isolation_%I', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol, t);
    EXECUTE format('
      CREATE POLICY %I ON %I
        FOR ALL USING (restaurant_id IN (
          SELECT id FROM restaurants WHERE owner_id = auth.uid()
          UNION
          SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
        ))
    ', pol, t);
  END LOOP;
END $$;

-- Policies for tables without direct restaurant_id (accessed via relations)
DROP POLICY IF EXISTS "tenant_isolation_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "tenant_isolation_recipe_ingredients" ON recipe_ingredients
  FOR ALL USING (recipe_id IN (
    SELECT id FROM recipes WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
      UNION
      SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "tenant_isolation_order_items" ON order_items;
CREATE POLICY "tenant_isolation_order_items" ON order_items
  FOR ALL USING (order_id IN (
    SELECT id FROM orders WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
      UNION
      SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "tenant_isolation_diner_favorites" ON diner_favorites;
CREATE POLICY "tenant_isolation_diner_favorites" ON diner_favorites
  FOR ALL USING (diner_id IN (
    SELECT id FROM diners WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
      UNION
      SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "tenant_isolation_campaign_redemptions" ON campaign_redemptions;
CREATE POLICY "tenant_isolation_campaign_redemptions" ON campaign_redemptions
  FOR ALL USING (campaign_id IN (
    SELECT id FROM campaigns WHERE restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
      UNION
      SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
    )
  ));

-- ═══ CONSTRAINTS ═══
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_dish_unique;
ALTER TABLE order_items ADD CONSTRAINT order_items_order_dish_unique UNIQUE (order_id, dish_id);

-- ═══ STORED PROCEDURES ═══
CREATE OR REPLACE FUNCTION recalculate_order_totals(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET
    subtotal = COALESCE((SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = p_order_id), 0),
    tax = COALESCE((SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = p_order_id), 0) * 0.16,
    total = COALESCE((SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = p_order_id), 0) * 1.16,
    updated_at = now()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_top_dishes(p_restaurant_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(dish_id UUID, dish_name TEXT, total_sold BIGINT, total_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.name, SUM(oi.quantity)::BIGINT, SUM(oi.unit_price * oi.quantity)
  FROM order_items oi
  JOIN dishes d ON d.id = oi.dish_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.restaurant_id = p_restaurant_id AND o.status = 'delivered'
  GROUP BY d.id, d.name
  ORDER BY SUM(oi.quantity) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_peak_hours(p_restaurant_id UUID)
RETURNS TABLE(hour INT, order_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT EXTRACT(HOUR FROM o.created_at)::INT, COUNT(*)::BIGINT
  FROM orders o
  WHERE o.restaurant_id = p_restaurant_id
    AND o.created_at > NOW() - INTERVAL '30 days'
  GROUP BY EXTRACT(HOUR FROM o.created_at)
  ORDER BY hour;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_profit_margins(p_restaurant_id UUID)
RETURNS TABLE(dish_id UUID, dish_name TEXT, price NUMERIC, cost NUMERIC, margin_pct NUMERIC, profit NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.name, d.price,
    COALESCE((SELECT SUM(ri.qty_per_serv * i.cost_per_unit)
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     JOIN recipes r ON r.id = ri.recipe_id
     WHERE r.dish_id = d.id), 0) AS cost,
    CASE WHEN d.price > 0
      THEN ROUND(((d.price - COALESCE((SELECT SUM(ri.qty_per_serv * i.cost_per_unit)
        FROM recipe_ingredients ri
        JOIN ingredients i ON i.id = ri.ingredient_id
        JOIN recipes r ON r.id = ri.recipe_id
        WHERE r.dish_id = d.id), 0)) / d.price) * 100, 1)
      ELSE 0 END AS margin_pct,
    d.price - COALESCE((SELECT SUM(ri.qty_per_serv * i.cost_per_unit)
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     JOIN recipes r ON r.id = ri.recipe_id
     WHERE r.dish_id = d.id), 0) AS profit
  FROM dishes d
  WHERE d.restaurant_id = p_restaurant_id
  ORDER BY margin_pct DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_restaurant_kpis(p_restaurant_id UUID)
RETURNS TABLE(
  today_revenue NUMERIC, today_orders BIGINT, today_diners BIGINT,
  avg_ticket NUMERIC, active_orders BIGINT, pending_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(total) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(DISTINCT diner_id) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE AND diner_id IS NOT NULL), 0),
    CASE WHEN (SELECT COUNT(*) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE) > 0
      THEN (SELECT SUM(total) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE) /
           (SELECT COUNT(*) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'delivered' AND created_at::DATE = CURRENT_DATE)
      ELSE 0 END,
    COALESCE((SELECT COUNT(*) FROM orders WHERE restaurant_id = p_restaurant_id AND status IN ('pending','cooking')), 0),
    COALESCE((SELECT COUNT(*) FROM orders WHERE restaurant_id = p_restaurant_id AND status = 'pending'), 0);
END;
$$ LANGUAGE plpgsql;

-- ═══ ÍNDICES ═══
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_restaurant ON ingredients(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_rest ON inventory_movements(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diners_restaurant ON diners(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_diner ON loyalty_points(diner_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
