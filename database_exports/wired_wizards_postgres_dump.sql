--
-- PostgreSQL database dump
--

\restrict 1Kj1BX0KlOJSRI13zdb4JGd0DHcO2oTMJW7tqDCHLXeq22IRMmkxVvHN1SBaNIq

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_source_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_received_by_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_initiated_by_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_destination_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfer_items DROP CONSTRAINT IF EXISTS stock_transfer_items_transfer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_transfer_items DROP CONSTRAINT IF EXISTS stock_transfer_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_sales_agent_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_quotation_id_foreign;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.purchase_records DROP CONSTRAINT IF EXISTS purchase_records_supplier_id_foreign;
ALTER TABLE IF EXISTS ONLY public.purchase_records DROP CONSTRAINT IF EXISTS purchase_records_received_by_foreign;
ALTER TABLE IF EXISTS ONLY public.purchase_records DROP CONSTRAINT IF EXISTS purchase_records_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.purchase_record_items DROP CONSTRAINT IF EXISTS purchase_record_items_purchase_record_id_foreign;
ALTER TABLE IF EXISTS ONLY public.purchase_record_items DROP CONSTRAINT IF EXISTS purchase_record_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_foreign;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_brand_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS product_reviews_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS product_reviews_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_recorded_by_foreign;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_invoice_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_sales_agent_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_cancelled_by_foreign;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_sales_agent_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_quotation_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_order_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_foreign;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_product_id_foreign;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_location_id_foreign;
ALTER TABLE IF EXISTS ONLY public.customer_profiles DROP CONSTRAINT IF EXISTS customer_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_foreign;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_foreign;
DROP INDEX IF EXISTS public.stock_movements_reference_number_index;
DROP INDEX IF EXISTS public.stock_movements_product_id_location_id_index;
DROP INDEX IF EXISTS public.sessions_user_id_index;
DROP INDEX IF EXISTS public.sessions_last_activity_index;
DROP INDEX IF EXISTS public.products_category_id_index;
DROP INDEX IF EXISTS public.products_brand_id_index;
DROP INDEX IF EXISTS public.product_reviews_product_id_status_index;
DROP INDEX IF EXISTS public.personal_access_tokens_tokenable_type_tokenable_id_index;
DROP INDEX IF EXISTS public.personal_access_tokens_expires_at_index;
DROP INDEX IF EXISTS public.payments_and_receipts_transaction_reference_index;
DROP INDEX IF EXISTS public.payments_and_receipts_receipt_number_index;
DROP INDEX IF EXISTS public.orders_order_status_index;
DROP INDEX IF EXISTS public.orders_customer_id_index;
DROP INDEX IF EXISTS public.jobs_queue_index;
DROP INDEX IF EXISTS public.failed_jobs_connection_queue_failed_at_index;
DROP INDEX IF EXISTS public.cache_locks_expiration_index;
DROP INDEX IF EXISTS public.cache_expiration_index;
DROP INDEX IF EXISTS public.audit_logs_entity_type_entity_id_index;
DROP INDEX IF EXISTS public.audit_logs_action_index;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_product_id_unique;
ALTER TABLE IF EXISTS ONLY public.wishlists DROP CONSTRAINT IF EXISTS wishlists_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_phone_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_transfer_number_unique;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_transfer_items DROP CONSTRAINT IF EXISTS stock_transfer_items_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_quotation_number_unique;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_pkey;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_records DROP CONSTRAINT IF EXISTS purchase_records_purchase_reference_unique;
ALTER TABLE IF EXISTS ONLY public.purchase_records DROP CONSTRAINT IF EXISTS purchase_records_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_record_items DROP CONSTRAINT IF EXISTS purchase_record_items_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_slug_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_sku_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_barcode_unique;
ALTER TABLE IF EXISTS ONLY public.product_reviews DROP CONSTRAINT IF EXISTS product_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_receipt_number_unique;
ALTER TABLE IF EXISTS ONLY public.payments_and_receipts DROP CONSTRAINT IF EXISTS payments_and_receipts_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_unique;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_pkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_code_unique;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.job_batches DROP CONSTRAINT IF EXISTS job_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_unique;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_product_id_location_id_unique;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_uuid_unique;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_profiles DROP CONSTRAINT IF EXISTS customer_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.cache DROP CONSTRAINT IF EXISTS cache_pkey;
ALTER TABLE IF EXISTS ONLY public.cache_locks DROP CONSTRAINT IF EXISTS cache_locks_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_slug_unique;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS public.wishlists ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.suppliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_transfers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_transfer_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_movements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quotations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quotation_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_record_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.personal_access_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments_and_receipts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoice_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.failed_jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customer_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customer_addresses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.brands ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wishlists_id_seq;
DROP TABLE IF EXISTS public.wishlists;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP SEQUENCE IF EXISTS public.suppliers_id_seq;
DROP TABLE IF EXISTS public.suppliers;
DROP SEQUENCE IF EXISTS public.stock_transfers_id_seq;
DROP TABLE IF EXISTS public.stock_transfers;
DROP SEQUENCE IF EXISTS public.stock_transfer_items_id_seq;
DROP TABLE IF EXISTS public.stock_transfer_items;
DROP SEQUENCE IF EXISTS public.stock_movements_id_seq;
DROP TABLE IF EXISTS public.stock_movements;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.seq_tr;
DROP SEQUENCE IF EXISTS public.seq_rec;
DROP SEQUENCE IF EXISTS public.seq_quo;
DROP SEQUENCE IF EXISTS public.seq_pur;
DROP SEQUENCE IF EXISTS public.seq_ord;
DROP SEQUENCE IF EXISTS public.seq_inv;
DROP SEQUENCE IF EXISTS public.quotations_id_seq;
DROP TABLE IF EXISTS public.quotations;
DROP SEQUENCE IF EXISTS public.quotation_items_id_seq;
DROP TABLE IF EXISTS public.quotation_items;
DROP SEQUENCE IF EXISTS public.purchase_records_id_seq;
DROP TABLE IF EXISTS public.purchase_records;
DROP SEQUENCE IF EXISTS public.purchase_record_items_id_seq;
DROP TABLE IF EXISTS public.purchase_record_items;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.product_reviews_id_seq;
DROP TABLE IF EXISTS public.product_reviews;
DROP SEQUENCE IF EXISTS public.product_images_id_seq;
DROP TABLE IF EXISTS public.product_images;
DROP SEQUENCE IF EXISTS public.personal_access_tokens_id_seq;
DROP TABLE IF EXISTS public.personal_access_tokens;
DROP SEQUENCE IF EXISTS public.payments_and_receipts_id_seq;
DROP TABLE IF EXISTS public.payments_and_receipts;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP SEQUENCE IF EXISTS public.locations_id_seq;
DROP TABLE IF EXISTS public.locations;
DROP SEQUENCE IF EXISTS public.jobs_id_seq;
DROP TABLE IF EXISTS public.jobs;
DROP TABLE IF EXISTS public.job_batches;
DROP SEQUENCE IF EXISTS public.invoices_id_seq;
DROP TABLE IF EXISTS public.invoices;
DROP SEQUENCE IF EXISTS public.invoice_items_id_seq;
DROP TABLE IF EXISTS public.invoice_items;
DROP SEQUENCE IF EXISTS public.inventory_id_seq;
DROP TABLE IF EXISTS public.inventory;
DROP SEQUENCE IF EXISTS public.failed_jobs_id_seq;
DROP TABLE IF EXISTS public.failed_jobs;
DROP SEQUENCE IF EXISTS public.customer_profiles_id_seq;
DROP TABLE IF EXISTS public.customer_profiles;
DROP SEQUENCE IF EXISTS public.customer_addresses_id_seq;
DROP TABLE IF EXISTS public.customer_addresses;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.cache_locks;
DROP TABLE IF EXISTS public.cache;
DROP SEQUENCE IF EXISTS public.brands_id_seq;
DROP TABLE IF EXISTS public.brands;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    user_email character varying(255),
    action character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id bigint NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(50),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(180) NOT NULL,
    logo_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(150) NOT NULL,
    slug character varying(180) NOT NULL,
    description text,
    image_path character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    label character varying(50) DEFAULT 'Home'::character varying NOT NULL,
    county character varying(100) NOT NULL,
    town character varying(100) NOT NULL,
    physical_details text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: customer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_addresses_id_seq OWNED BY public.customer_addresses.id;


--
-- Name: customer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255),
    kra_pin character varying(50),
    customer_type character varying(50) DEFAULT 'individual'::character varying NOT NULL,
    loyalty_points integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: customer_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_profiles_id_seq OWNED BY public.customer_profiles.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    location_id bigint NOT NULL,
    quantity_on_hand integer DEFAULT 0 NOT NULL,
    quantity_reserved integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT chk_inventory_on_hand CHECK ((quantity_on_hand >= 0)),
    CONSTRAINT chk_inventory_reserved CHECK ((quantity_reserved >= 0))
);


--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_vatable boolean DEFAULT true NOT NULL,
    vat_rate numeric(5,2) DEFAULT '16'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    invoice_number character varying(100) NOT NULL,
    order_id bigint,
    quotation_id bigint,
    customer_id bigint NOT NULL,
    sales_agent_id bigint,
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    amount_paid numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    balance_due numeric(12,2) NOT NULL,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying NOT NULL,
    due_date date NOT NULL,
    pdf_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(30) NOT NULL,
    location_type character varying(50) NOT NULL,
    county character varying(100) NOT NULL,
    town character varying(100) NOT NULL,
    address text NOT NULL,
    phone character varying(30) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_vatable boolean DEFAULT true NOT NULL,
    vat_rate numeric(5,2) DEFAULT '16'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    order_number character varying(100) NOT NULL,
    customer_id bigint NOT NULL,
    sales_agent_id bigint,
    location_id bigint NOT NULL,
    order_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying(50) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    delivery_fee numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    amount_paid numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    delivery_address jsonb NOT NULL,
    cancellation_reason text,
    cancelled_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: payments_and_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments_and_receipts (
    id bigint NOT NULL,
    receipt_number character varying(100) NOT NULL,
    invoice_id bigint,
    order_id bigint,
    customer_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_reference character varying(100) NOT NULL,
    recorded_by bigint,
    notes text,
    pdf_path character varying(255),
    paid_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: payments_and_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_and_receipts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_and_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_and_receipts_id_seq OWNED BY public.payments_and_receipts.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    image_path character varying(255) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reviews (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    rating smallint NOT NULL,
    comment text NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_reviews_id_seq OWNED BY public.product_reviews.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    brand_id bigint,
    sku character varying(100) NOT NULL,
    barcode character varying(100),
    name character varying(255) NOT NULL,
    slug character varying(280) NOT NULL,
    short_description text,
    description text NOT NULL,
    buying_price numeric(12,2) NOT NULL,
    selling_price numeric(12,2) NOT NULL,
    discount_price numeric(12,2),
    warranty_period character varying(100) DEFAULT '1 Year'::character varying NOT NULL,
    datasheet_url character varying(255),
    min_stock_alert integer DEFAULT 5 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    technical_specs jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_vatable boolean DEFAULT true NOT NULL,
    vat_rate numeric(5,2) DEFAULT '16'::numeric NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_record_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_record_items (
    id bigint NOT NULL,
    purchase_record_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity_received integer NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    total_cost numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_record_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_record_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_record_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_record_items_id_seq OWNED BY public.purchase_record_items.id;


--
-- Name: purchase_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_records (
    id bigint NOT NULL,
    purchase_reference character varying(100) NOT NULL,
    supplier_id bigint NOT NULL,
    location_id bigint NOT NULL,
    total_cost numeric(14,2) NOT NULL,
    supplier_invoice_ref character varying(100),
    received_by bigint,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_records_id_seq OWNED BY public.purchase_records.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_items (
    id bigint NOT NULL,
    quotation_id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_vatable boolean DEFAULT true NOT NULL,
    vat_rate numeric(5,2) DEFAULT '16'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quotation_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    id bigint NOT NULL,
    quotation_number character varying(100) NOT NULL,
    customer_id bigint NOT NULL,
    sales_agent_id bigint,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    vat_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    delivery_fee numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    valid_until date NOT NULL,
    terms_and_conditions text,
    pdf_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quotations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: seq_inv; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_inv
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_ord; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_ord
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_pur; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_pur
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_quo; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_quo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_rec; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_rec
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_tr; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_tr
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    location_id bigint NOT NULL,
    user_id bigint,
    movement_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_after integer NOT NULL,
    reference_number character varying(100) NOT NULL,
    reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: stock_transfer_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfer_items (
    id bigint NOT NULL,
    transfer_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity_dispatched integer NOT NULL,
    quantity_received integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: stock_transfer_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transfer_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transfer_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transfer_items_id_seq OWNED BY public.stock_transfer_items.id;


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfers (
    id bigint NOT NULL,
    transfer_number character varying(100) NOT NULL,
    source_location_id bigint NOT NULL,
    destination_location_id bigint NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    initiated_by bigint,
    received_by bigint,
    notes text,
    dispatched_at timestamp(0) without time zone,
    received_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transfers_id_seq OWNED BY public.stock_transfers.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(150),
    phone character varying(50) NOT NULL,
    email character varying(150),
    address text,
    payment_terms character varying(100),
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id bigint NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    description character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255) DEFAULT 'customer'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customer_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses ALTER COLUMN id SET DEFAULT nextval('public.customer_addresses_id_seq'::regclass);


--
-- Name: customer_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_profiles ALTER COLUMN id SET DEFAULT nextval('public.customer_profiles_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments_and_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts ALTER COLUMN id SET DEFAULT nextval('public.payments_and_receipts_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN id SET DEFAULT nextval('public.product_reviews_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_record_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_record_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_record_items_id_seq'::regclass);


--
-- Name: purchase_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records ALTER COLUMN id SET DEFAULT nextval('public.purchase_records_id_seq'::regclass);


--
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: stock_transfer_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items ALTER COLUMN id SET DEFAULT nextval('public.stock_transfer_items_id_seq'::regclass);


--
-- Name: stock_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers ALTER COLUMN id SET DEFAULT nextval('public.stock_transfers_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, name, slug, logo_path, created_at, updated_at) FROM stdin;
1	Jinko Solar	jinko-solar	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
2	Growatt	growatt	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
3	Felicity Solar	felicity-solar	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
4	Deye	deye	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
5	Must Energy	must-energy	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, parent_id, name, slug, description, image_path, is_active, created_at, updated_at) FROM stdin;
1	\N	Solar Panels	solar-panels	High-efficiency Monocrystalline & Polycrystalline PV panels	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
2	\N	Solar Inverters	solar-inverters	Pure Sine Wave Off-Grid and Hybrid Inverters	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
3	\N	Solar Batteries	solar-batteries	Long-life Lithium-ion (LiFePO4) & Gel Deep Cycle Batteries	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
4	\N	Solar Water Pumps	solar-water-pumps	Submersible and surface solar pumps for irrigation & domestic use	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
5	\N	Solar Lighting & Floodlights	solar-lighting	All-in-one solar streetlights and security lighting	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
6	\N	Accessories & Cables	accessories-and-cables	MC4 connectors, 4mm-16mm PV cables, breakers & mounting brackets	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_addresses (id, user_id, label, county, town, physical_details, is_default, created_at, updated_at) FROM stdin;
1	4	Farm Installation Site	Machakos	Kathiani	Opposite AIC Church, Farm Gate 3	t	2026-10-23 05:18:41	2026-10-23 05:18:41
2	5	Home	Machakos	Machakos Town		t	2026-10-25 20:32:00	2026-10-25 20:32:00
\.


--
-- Data for Name: customer_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_profiles (id, user_id, company_name, kra_pin, customer_type, loyalty_points, notes, created_at, updated_at) FROM stdin;
1	4	Kioko Farms Ltd	A009876543M	business	150	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
2	5	\N	\N	individual	0	\N	2026-10-25 20:32:00	2026-10-25 20:32:00
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, product_id, location_id, quantity_on_hand, quantity_reserved, created_at, updated_at) FROM stdin;
1	1	1	80	0	2026-10-23 05:18:41	2026-10-23 05:18:41
2	1	2	25	0	2026-10-23 05:18:41	2026-10-23 05:18:41
3	1	3	15	0	2026-10-23 05:18:41	2026-10-23 05:18:41
4	2	1	15	0	2026-10-23 05:18:41	2026-10-23 05:18:41
6	2	3	3	0	2026-10-23 05:18:41	2026-10-23 05:18:41
7	3	1	8	0	2026-10-23 05:18:41	2026-10-23 05:18:41
8	3	2	3	0	2026-10-23 05:18:41	2026-10-23 05:18:41
9	3	3	2	0	2026-10-23 05:18:41	2026-10-23 05:18:41
10	4	1	12	0	2026-10-23 05:18:41	2026-10-23 05:18:41
11	4	2	5	0	2026-10-23 05:18:41	2026-10-23 05:18:41
12	4	3	2	0	2026-10-23 05:18:41	2026-10-23 05:18:41
13	5	1	100	0	2026-10-23 05:18:41	2026-10-23 05:18:41
14	5	2	40	0	2026-10-23 05:18:41	2026-10-23 05:18:41
15	5	3	20	0	2026-10-23 05:18:41	2026-10-23 05:18:41
16	6	1	50	0	2026-10-23 05:18:41	2026-10-23 05:18:41
17	6	2	15	0	2026-10-23 05:18:41	2026-10-23 05:18:41
5	2	2	6	1	2026-10-23 05:18:41	2026-10-25 20:32:37
18	6	3	10	2	2026-10-23 05:18:41	2026-10-25 20:55:20
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_items (id, invoice_id, product_id, product_name, sku, quantity, unit_price, total_price, created_at, updated_at, is_vatable, vat_rate, vat_amount) FROM stdin;
1	1	2	Growatt 5kW 48V Off-Grid Solar Inverter SPF 5000 ES	SOL-INV-5KW-SPF-01	1	84000.00	84000.00	2026-10-25 20:32:37	2026-10-25 20:32:37	f	0.00	0.00
2	2	6	Solar PV Double-Insulated Copper Cable 6mm² (100 Meter Roll)	SOL-ACC-6MM-CBL-100M	2	10500.00	21000.00	2026-10-25 20:55:20	2026-10-25 20:55:20	t	16.00	3360.00
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, invoice_number, order_id, quotation_id, customer_id, sales_agent_id, subtotal, discount_amount, vat_amount, total_amount, amount_paid, balance_due, payment_status, due_date, pdf_path, created_at, updated_at) FROM stdin;
1	INV-2026-000001	1	\N	5	\N	84000.00	0.00	0.00	84000.00	0.00	84000.00	unpaid	2026-11-01	\N	2026-10-25 20:32:37	2026-10-25 20:32:37
2	INV-2026-000002	2	\N	5	\N	21000.00	0.00	3360.00	24360.00	0.00	24360.00	unpaid	2026-11-01	\N	2026-10-25 20:55:20	2026-10-25 20:55:20
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, name, code, location_type, county, town, address, phone, is_active, created_at, updated_at) FROM stdin;
1	Nairobi Warehouse	NBO-WH	warehouse	Nairobi	Industrial Area	Enterprise Road, Nairobi	+254 711 000 001	t	2026-10-23 05:18:40	2026-10-23 05:18:40
2	Machakos Store	MCK-RET	retail_store	Machakos	Machakos Town	Mwatu Wa Ngoma Street, Machakos	+254 711 000 002	t	2026-10-23 05:18:40	2026-10-23 05:18:40
3	Kitui Store	KTU-RET	retail_store	Kitui	Kitui Town	Commercial Street, Kitui	+254 711 000 003	t	2026-10-23 05:18:40	2026-10-23 05:18:40
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_10_21_000001_create_customer_profiles_and_addresses_table	1
5	2026_10_21_000002_create_categories_and_brands_table	1
6	2026_10_21_000003_create_products_and_images_table	1
7	2026_10_21_000004_create_locations_and_inventory_table	1
8	2026_10_21_000005_create_stock_movements_and_transfers_table	1
9	2026_10_21_000006_create_orders_and_order_items_table	1
10	2026_10_21_000007_create_quotations_and_invoices_table	1
11	2026_10_21_000008_create_payments_and_receipts_table	1
12	2026_10_21_000009_create_suppliers_and_purchases_table	1
13	2026_10_21_000010_create_reviews_settings_and_audit_logs_table	1
14	2026_10_21_000011_create_wishlists_table	1
15	2026_10_21_000012_create_document_sequences	1
16	2026_10_21_165740_create_personal_access_tokens_table	1
17	2026_10_22_000013_add_vat_fields_to_products_and_document_items	1
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_name, sku, quantity, unit_price, total_price, created_at, updated_at, is_vatable, vat_rate, vat_amount) FROM stdin;
1	1	2	Growatt 5kW 48V Off-Grid Solar Inverter SPF 5000 ES	SOL-INV-5KW-SPF-01	1	84000.00	84000.00	2026-10-25 20:32:37	2026-10-25 20:32:37	f	0.00	0.00
2	2	6	Solar PV Double-Insulated Copper Cable 6mm² (100 Meter Roll)	SOL-ACC-6MM-CBL-100M	2	10500.00	21000.00	2026-10-25 20:55:20	2026-10-25 20:55:20	t	16.00	3360.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, customer_id, sales_agent_id, location_id, order_status, payment_status, payment_method, subtotal, discount_amount, vat_amount, delivery_fee, total_amount, amount_paid, delivery_address, cancellation_reason, cancelled_by, created_at, updated_at) FROM stdin;
1	ORD-2026-000001	5	\N	2	processing	pending	mpesa_till	84000.00	0.00	0.00	0.00	84000.00	0.00	{"town": "Machakos Town", "county": "Machakos", "physical_details": "Quickmart"}	\N	\N	2026-10-25 20:32:37	2026-10-25 20:33:47
2	ORD-2026-000002	5	\N	3	pending	pending	mpesa_till	21000.00	0.00	3360.00	0.00	24360.00	0.00	{"town": "Machakos Town", "county": "Machakos", "physical_details": "Makueni"}	\N	\N	2026-10-25 20:55:20	2026-10-25 20:55:20
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: payments_and_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments_and_receipts (id, receipt_number, invoice_id, order_id, customer_id, amount, payment_method, transaction_reference, recorded_by, notes, pdf_path, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
6	App\\Models\\User	2	auth_token	68493ec6695dfd7b5c0bc227010029a409cfc1a691414fe3483554047de70da0	["*"]	2026-10-26 16:53:25	\N	2026-10-26 16:45:03	2026-10-26 16:53:25
1	App\\Models\\User	5	auth_token	51d7d610936740dfc92865f03255728d4fdc1e4f8d8999c5474e8aa4b0fccf7a	["*"]	2026-10-25 20:32:52	\N	2026-10-25 20:32:00	2026-10-25 20:32:52
4	App\\Models\\User	1	auth_token	18ead77fe11e496f5004e1ff2d2839f5fda2d6a3d5eb79607a9085a3c91a844f	["*"]	2026-10-25 21:14:43	\N	2026-10-25 21:07:41	2026-10-25 21:14:43
5	App\\Models\\User	2	auth_token	3b4f4ff67093b6608cba55076842e9a5543265ae5759170f4f82d6ff76d5981e	["*"]	2026-10-25 21:29:19	\N	2026-10-25 21:28:57	2026-10-25 21:29:19
2	App\\Models\\User	3	auth_token	b62279de97ac4c7e9e75433396f5e14bd0e5ac1ed053ff4a41d91c3aafb2534d	["*"]	2026-10-25 20:33:48	\N	2026-10-25 20:33:16	2026-10-25 20:33:48
3	App\\Models\\User	5	auth_token	0ba0bf4cf500ebf25d9e190ecc8cc0e788fd2f20c5ce3fe6aaa2c9d21996260d	["*"]	2026-10-25 21:02:20	\N	2026-10-25 20:54:47	2026-10-25 21:02:20
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, image_path, is_primary, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_reviews (id, product_id, customer_id, rating, comment, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, brand_id, sku, barcode, name, slug, short_description, description, buying_price, selling_price, discount_price, warranty_period, datasheet_url, min_stock_alert, is_featured, is_active, technical_specs, created_at, updated_at, is_vatable, vat_rate) FROM stdin;
1	1	1	SOL-PNL-550-MONO-01	789123456001	Jinko 550W Tiger Neo N-Type Monocrystalline Solar Panel	jinko-550w-tiger-neo-solar-panel	Tier 1 high-efficiency solar panel with multi-busbar technology.	The Jinko 550W N-type panel offers up to 22.3% module efficiency with superior low-light performance. Designed to withstand extreme wind and snow loads with a 12-year product warranty and 30-year linear power warranty.	12500.00	16500.00	15500.00	12 Years	\N	10	t	t	{"weight": "28.0 kg", "cell_type": "Monocrystalline N-Type", "dimensions": "2278 x 1134 x 35 mm", "efficiency": "22.3%", "rated_power": "550W", "max_power_current_imp": "13.03A", "max_power_voltage_vmp": "42.22V", "open_circuit_voltage_voc": "50.42V"}	2026-10-23 05:18:41	2026-10-23 05:18:41	f	0.00
2	2	2	SOL-INV-5KW-SPF-01	789123456002	Growatt 5kW 48V Off-Grid Solar Inverter SPF 5000 ES	growatt-5kw-48v-off-grid-solar-inverter	Multifunctional pure sine wave inverter with integrated MPPT charge controller.	The Growatt SPF 5000 ES can operate with or without batteries. Maximum PV input voltage up to 450VDC. Supports parallel operation up to 6 units for large capacity.	68000.00	88000.00	84000.00	2 Years	\N	4	t	t	{"waveform": "Pure Sine Wave", "rated_power": "5000W / 5kVA", "surge_power": "10000VA", "max_pv_power": "6000W", "battery_voltage": "48VDC", "parallel_capability": "Yes, up to 6 units", "mppt_tracker_voltage": "120VDC - 430VDC"}	2026-10-23 05:18:41	2026-10-23 05:18:41	f	0.00
3	3	3	SOL-BAT-10KWH-LITH-01	789123456003	Felicity Solar 10kWh 48V 200Ah Wall-Mounted Lithium Battery (LiFePO4)	felicity-10kwh-48v-lithium-battery	Grade A LiFePO4 cells with built-in smart BMS and LCD screen.	Engineered for over 6,000 cycles at 80% DoD. Compatible with top inverter brands including Growatt, Deye, and Must. Wall-mounted space saving form factor.	195000.00	245000.00	235000.00	5 Years	\N	2	t	t	{"weight": "85 kg", "cycle_life": "> 6000 cycles @ 25°C", "rated_capacity": "200Ah", "cell_technology": "Lithium Iron Phosphate (LiFePO4)", "nominal_voltage": "51.2V", "usable_capacity": "10.24 kWh", "bms_communication": "CAN / RS485"}	2026-10-23 05:18:41	2026-10-23 05:18:41	f	0.00
4	4	5	SOL-PMP-1.5HP-SUB-01	789123456004	1.5HP DC Brushless Solar Submersible Water Pump Set	1-5hp-dc-brushless-solar-submersible-pump	Complete borehole pumping kit with MPPT solar pump controller.	High-head DC brushless submersible pump with stainless steel housing. Max head 110m, maximum discharge 4.5 cubic meters per hour.	42000.00	58000.00	55000.00	2 Years	\N	3	f	t	{"voltage": "110V DC", "max_flow": "4,500 L/hour", "max_head": "110 meters", "controller": "Smart MPPT Controller with water level sensors", "outlet_size": "1.25 inch", "power_rating": "1.5 HP (1100W)"}	2026-10-23 05:18:41	2026-10-23 05:18:41	f	0.00
5	5	3	SOL-LGT-300W-STREET-01	789123456005	300W All-In-One Solar Street Light with Motion Sensor & Remote	300w-all-in-one-solar-street-light	High-lumen outdoor security streetlight with radar motion sensor.	IP67 waterproof aluminum alloy body, high brightness 5730 LED beads, dusk-to-dawn operation with remote control and pole mounting hardware.	5500.00	8500.00	7800.00	2 Years	\N	15	t	t	{"lumens": "3000 LM", "battery": "3.2V 36Ah LiFePO4", "solar_panel": "6V 35W Monocrystalline", "sensor_range": "8-12 meters radar", "charging_time": "6-8 hours sunlight", "lighting_time": "12-14 hours (continuous)"}	2026-10-23 05:18:41	2026-10-23 05:18:41	t	16.00
6	6	5	SOL-ACC-6MM-CBL-100M	789123456006	Solar PV Double-Insulated Copper Cable 6mm² (100 Meter Roll)	solar-pv-cable-6mm-100m-roll	TUV certified red & black double insulated solar wire.	Flame retardant, UV resistant, halogen-free cross-linked polyethylene insulation specifically formulated for rooftop solar arrays and outdoor DC strings.	7800.00	11000.00	10500.00	5 Years	\N	20	f	t	{"conductor": "Tinned Copper Multi-strand", "roll_length": "100 meters", "cross_section": "6.0 mm²", "voltage_rating": "1500V DC", "temperature_range": "-40°C to +90°C"}	2026-10-23 05:18:41	2026-10-23 05:18:41	t	16.00
\.


--
-- Data for Name: purchase_record_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_record_items (id, purchase_record_id, product_id, quantity_received, unit_cost, total_cost, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_records (id, purchase_reference, supplier_id, location_id, total_cost, supplier_invoice_ref, received_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotation_items (id, quotation_id, product_id, product_name, sku, quantity, unit_price, total_price, created_at, updated_at, is_vatable, vat_rate, vat_amount) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotations (id, quotation_number, customer_id, sales_agent_id, status, subtotal, discount_amount, vat_amount, delivery_fee, grand_total, valid_until, terms_and_conditions, pdf_path, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, product_id, location_id, user_id, movement_type, quantity, quantity_before, quantity_after, reference_number, reason, created_at, updated_at) FROM stdin;
1	1	1	1	stock_in	80	0	80	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
2	1	2	1	stock_in	25	0	25	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
3	1	3	1	stock_in	15	0	15	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
4	2	1	1	stock_in	15	0	15	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
5	2	2	1	stock_in	6	0	6	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
6	2	3	1	stock_in	3	0	3	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
7	3	1	1	stock_in	8	0	8	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
8	3	2	1	stock_in	3	0	3	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
9	3	3	1	stock_in	2	0	2	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
10	4	1	1	stock_in	12	0	12	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
11	4	2	1	stock_in	5	0	5	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
12	4	3	1	stock_in	2	0	2	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
13	5	1	1	stock_in	100	0	100	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
14	5	2	1	stock_in	40	0	40	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
15	5	3	1	stock_in	20	0	20	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
16	6	1	1	stock_in	50	0	50	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
17	6	2	1	stock_in	15	0	15	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
18	6	3	1	stock_in	10	0	10	INIT-2026-STOCK	Initial Inventory Setup	2026-10-23 05:18:41	2026-10-23 05:18:41
\.


--
-- Data for Name: stock_transfer_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transfer_items (id, transfer_id, product_id, quantity_dispatched, quantity_received, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transfers (id, transfer_number, source_location_id, destination_location_id, status, initiated_by, received_by, notes, dispatched_at, received_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, contact_person, phone, email, address, payment_terms, notes, is_active, created_at, updated_at) FROM stdin;
1	Solar Master Distribution Ltd	David Kimani	+254 720 123 456	orders@solarmaster.co.ke	Mombasa Road, Nairobi	30 Days Net	\N	t	2026-10-23 05:18:41	2026-10-23 05:18:41
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, key, value, description, created_at, updated_at) FROM stdin;
1	company_name	Wired Wizards Engineering and General Supplies Ltd	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
2	company_tagline	Powering the Future with Reliable Solar Energy	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
3	kra_pin	P051982736Z	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
4	vat_rate	16	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
5	mpesa_till	543210	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
6	bank_name	KCB Bank Kenya	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
7	bank_account_number	1234567890	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
8	bank_account_name	Wired Wizards Engineering Ltd	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
9	contact_phone	+254 712 345 678	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
10	contact_email	info@wiredwizards.co.ke	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
11	office_address	Machakos Town & Nairobi CBD, Kenya	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
12	max_agent_discount_percent	10	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
13	delivery_fee_default	0	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, phone, role, is_active, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
1	Willy Mutunga (Director)	admin@wiredwizards.co.ke	+254700000001	super_admin	t	\N	$2y$12$GpFHu0lu8Fm8jb8udVHhZevEY6WoBOEjLAASJVflaw8wkBNTK4AVW	\N	2026-10-23 05:18:40	2026-10-23 05:18:40
2	Kennedy M. (Inventory Lead)	inventory@wiredwizards.co.ke	+254700000002	inventory_manager	t	\N	$2y$12$oQZUxOeEh3Qvf4ozLPnGjekz2JNhaUODrDnB1ZInc6FlpM0w.IZiG	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
3	Mary Ndunge (Sales Executive)	sales@wiredwizards.co.ke	+254700000003	sales_agent	t	\N	$2y$12$/BqzAbt/jm7bKczVtQgyR.kQvEmtnsechpgf5R4v.nrFdRfvuAWmi	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
4	Peter Kioko	peter@example.com	+254722334455	customer	t	\N	$2y$12$cbrr52VC6SbqneaeEXrPpu8LVw1iqqNC67YIXqdm3r1Zm/OWPXnK6	\N	2026-10-23 05:18:41	2026-10-23 05:18:41
5	Willy Mutunga	wmutunga003@gmail.com	+254742765445	customer	t	\N	$2y$12$Km3AhGL8f4biNZNuzqaFS.ZwAUMRcoXqaK68gChZjJVH9cZLOYmOW	\N	2026-10-25 20:32:00	2026-10-25 20:32:00
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, user_id, product_id, created_at, updated_at) FROM stdin;
1	5	1	2026-10-25 21:02:20	2026-10-25 21:02:20
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_id_seq', 5, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: customer_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_addresses_id_seq', 2, true);


--
-- Name: customer_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_profiles_id_seq', 2, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 18, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 2, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoices_id_seq', 2, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locations_id_seq', 3, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 17, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 2, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- Name: payments_and_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_and_receipts_id_seq', 1, false);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 6, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_id_seq', 1, false);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: purchase_record_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_record_items_id_seq', 1, false);


--
-- Name: purchase_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_records_id_seq', 1, false);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 1, false);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotations_id_seq', 1, false);


--
-- Name: seq_inv; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_inv', 2, true);


--
-- Name: seq_ord; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_ord', 2, true);


--
-- Name: seq_pur; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_pur', 1, false);


--
-- Name: seq_quo; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_quo', 1, false);


--
-- Name: seq_rec; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_rec', 1, false);


--
-- Name: seq_tr; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seq_tr', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 18, true);


--
-- Name: stock_transfer_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transfer_items_id_seq', 1, false);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transfers_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_unique UNIQUE (slug);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_profiles customer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_product_id_location_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_location_id_unique UNIQUE (product_id, location_id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: locations locations_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_code_unique UNIQUE (code);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payments_and_receipts payments_and_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_pkey PRIMARY KEY (id);


--
-- Name: payments_and_receipts payments_and_receipts_receipt_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_receipt_number_unique UNIQUE (receipt_number);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_unique UNIQUE (barcode);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: purchase_record_items purchase_record_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_record_items
    ADD CONSTRAINT purchase_record_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_records purchase_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records
    ADD CONSTRAINT purchase_records_pkey PRIMARY KEY (id);


--
-- Name: purchase_records purchase_records_purchase_reference_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records
    ADD CONSTRAINT purchase_records_purchase_reference_unique UNIQUE (purchase_reference);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quotation_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_unique UNIQUE (quotation_number);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_transfer_items stock_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_transfer_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_transfer_number_unique UNIQUE (transfer_number);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_unique UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_phone_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_unique UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_unique UNIQUE (user_id, product_id);


--
-- Name: audit_logs_action_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_index ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_type_entity_id_index ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: orders_customer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_customer_id_index ON public.orders USING btree (customer_id);


--
-- Name: orders_order_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_order_status_index ON public.orders USING btree (order_status);


--
-- Name: payments_and_receipts_receipt_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_and_receipts_receipt_number_index ON public.payments_and_receipts USING btree (receipt_number);


--
-- Name: payments_and_receipts_transaction_reference_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_and_receipts_transaction_reference_index ON public.payments_and_receipts USING btree (transaction_reference);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: product_reviews_product_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_reviews_product_id_status_index ON public.product_reviews USING btree (product_id, status);


--
-- Name: products_brand_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_brand_id_index ON public.products USING btree (brand_id);


--
-- Name: products_category_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_index ON public.products USING btree (category_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: stock_movements_product_id_location_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_product_id_location_id_index ON public.stock_movements USING btree (product_id, location_id);


--
-- Name: stock_movements_reference_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_reference_number_index ON public.stock_movements USING btree (reference_number);


--
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: categories categories_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: customer_addresses customer_addresses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: customer_profiles customer_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory inventory_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: inventory inventory_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_quotation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_quotation_id_foreign FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_sales_agent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_sales_agent_id_foreign FOREIGN KEY (sales_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_cancelled_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cancelled_by_foreign FOREIGN KEY (cancelled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: orders orders_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: orders orders_sales_agent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_sales_agent_id_foreign FOREIGN KEY (sales_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments_and_receipts payments_and_receipts_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: payments_and_receipts payments_and_receipts_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: payments_and_receipts payments_and_receipts_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: payments_and_receipts payments_and_receipts_recorded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments_and_receipts
    ADD CONSTRAINT payments_and_receipts_recorded_by_foreign FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: product_images product_images_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: purchase_record_items purchase_record_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_record_items
    ADD CONSTRAINT purchase_record_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: purchase_record_items purchase_record_items_purchase_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_record_items
    ADD CONSTRAINT purchase_record_items_purchase_record_id_foreign FOREIGN KEY (purchase_record_id) REFERENCES public.purchase_records(id) ON DELETE CASCADE;


--
-- Name: purchase_records purchase_records_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records
    ADD CONSTRAINT purchase_records_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: purchase_records purchase_records_received_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records
    ADD CONSTRAINT purchase_records_received_by_foreign FOREIGN KEY (received_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchase_records purchase_records_supplier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_records
    ADD CONSTRAINT purchase_records_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: quotation_items quotation_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: quotation_items quotation_items_quotation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_foreign FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quotations quotations_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: quotations quotations_sales_agent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_sales_agent_id_foreign FOREIGN KEY (sales_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_transfer_items stock_transfer_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: stock_transfer_items stock_transfer_items_transfer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_transfer_id_foreign FOREIGN KEY (transfer_id) REFERENCES public.stock_transfers(id) ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_destination_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_destination_location_id_foreign FOREIGN KEY (destination_location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: stock_transfers stock_transfers_initiated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_initiated_by_foreign FOREIGN KEY (initiated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_transfers stock_transfers_received_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_received_by_foreign FOREIGN KEY (received_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_transfers stock_transfers_source_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_source_location_id_foreign FOREIGN KEY (source_location_id) REFERENCES public.locations(id) ON DELETE RESTRICT;


--
-- Name: wishlists wishlists_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 1Kj1BX0KlOJSRI13zdb4JGd0DHcO2oTMJW7tqDCHLXeq22IRMmkxVvHN1SBaNIq

