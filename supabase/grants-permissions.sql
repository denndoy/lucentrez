-- ============================================================================
-- GRANTS & PERMISSIONS - Lucentrezn
-- This is MORE RELIABLE than RLS policies alone
-- ============================================================================

-- ============================================================================
-- REVOKE ALL DEFAULT PERMISSIONS
-- ============================================================================

-- Revoke from all client-facing roles first
REVOKE ALL PRIVILEGES ON TABLE public.products FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.gallery_images FROM public, anon, authenticated;

-- ============================================================================
-- GRANT ONLY SELECT (READ) TO PUBLIC
-- ============================================================================

-- Allow read-only access for anon and authenticated users
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.gallery_images TO anon, authenticated;

-- Keep service_role full access for server-side admin operations
GRANT ALL PRIVILEGES ON TABLE public.products TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.gallery_images TO service_role;

-- Optional hardening for future tables created by postgres in schema public
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
	REVOKE ALL ON TABLES FROM public, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
	GRANT SELECT ON TABLES TO anon, authenticated;

-- ============================================================================
-- VERIFY PERMISSIONS
-- ============================================================================

-- Run this to verify permissions:
-- SELECT * FROM information_schema.table_privileges 
-- WHERE table_name IN ('products', 'gallery_images')
--   AND grantee IN ('anon', 'authenticated', 'PUBLIC', 'service_role')
-- ORDER BY table_name, grantee, privilege_type;

-- Expected output:
-- - anon: SELECT only
-- - authenticated: SELECT only
-- - service_role: full privileges
-- - PUBLIC: no table-level privileges required
