# Pulso Mini

BUILD_NATIVE_QA_EXPORT_READY_01

MiniApp de prueba nativa (`BUILD_NATIVE_QA_01`).

URL pública: https://dreamapp.grok.me/

Tres estados grandes — Verde, Amarillo y Rojo — con selección visible, contador de interacciones y timestamp del último toque.

## Uso

1. Abre la app en un teléfono o en un viewport móvil.
2. Toca **🟢 Verde**, **🟡 Amarillo** o **🔴 Rojo**.
3. El estado queda marcado, el contador suma y aparece la hora del toque.

Marcador de QA visible: `BUILD_NATIVE_QA_01`.

## Stack

TanStack Start, React 19, Tailwind v4. Sin auth y sin base de datos. `VITE_AUTH_ENABLED=false`.

## Handoff

- Marcador de export: `BUILD_NATIVE_QA_EXPORT_READY_01`
- Public URL: https://dreamapp.grok.me/
- Repo: https://github.com/NanoCarriez/build-native-nanochief-qa-01 (`main`)

## Tests

`npm test` cubre scripts de plataforma del workspace más tests de auth/app-data.

Frontera de export: los tests que pinen prompts de skills internas de Grok Build (`.grok/skills/og/SKILL.md` y sus `references/`) **no forman parte del producto**. Ese árbol es artefacto del agente de Build, no de Pulso Mini. En un clone sin esas skills, esos tests se omiten (`skip`) en vez de fallar. No se copian skills al repo para satisfacerlos.

## Desarrollo

```sh
npm install
npm run dev
```
