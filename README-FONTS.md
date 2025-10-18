Using Proxima Nova Black in this project

This project prefers the commercial font "Proxima Nova Black" for headings and primary UI text. Proxima Nova is a licensed font and is not included in this repository.

To enable the font locally or on a deployed site, follow these steps:

1. Acquire a license
   - Purchase or obtain Proxima Nova from a licensed vendor (e.g., Adobe Fonts, MyFonts, or your organization's font license).

2. Add webfont files
   - Place the WOFF2 (recommended) or WOFF/TTF files into a `fonts/` directory at the project root.
   - Example filenames used by the CSS (you can rename or adjust the @font-face accordingly):
     - `fonts/ProximaNova-Black.woff2`

3. Confirm the paths
   - The stylesheet `style.css` includes an `@font-face` that looks for `./fonts/ProximaNova-Black.woff2`.
   - If you use different filenames or subfolders, update the `src` path in the `@font-face` rule.

4. Fallbacks
   - If the font is not available or blocked, the CSS will fall back to `Proxima Nova` (system), `Avenir`, then `Arial`.

5. Alternative: Host via a font service
   - If you have access to Adobe Fonts or another webfont provider with Proxima Nova licensed for web use, follow their instructions to embed the font and remove or adapt the local `@font-face`.

License note
- Do not commit commercial font files to public repositories unless your license explicitly permits redistribution. Keep licensed font files out of public VCS or use private package hosting.

If you want, I can:
- Update the `@font-face` to use multiple weights (e.g., regular, bold) if you provide the files.
- Switch to a free alternative (e.g., Montserrat or Poppins) and add it via Google Fonts if you'd prefer not to manage licensing.
