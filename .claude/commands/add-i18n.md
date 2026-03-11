# Add i18n translations

Add translation keys for `$ARGUMENTS` (feature or page name).

## Steps

1. Read `client/src/i18n/en.ts` and `client/src/i18n/ar.ts` to understand the key structure
2. Search for any hardcoded English strings in the target page/component files
3. Add corresponding keys to both `en.ts` and `ar.ts`
   - Use nested keys matching the module/page name (e.g., `inventory.stockLevel`)
   - Arabic translations must be proper Arabic, not transliterated
4. Replace all hardcoded strings in components with `t('key', lang)` calls
5. Ensure RTL layout is properly handled for Arabic content
6. Run `pnpm lint` to verify
