# Generate Project Files

**Opis:** Generuje komplet plików projektu (meta.json, config.ts, pl.mdx, en.mdx) na podstawie notatek/rozmowy.

---

## Instrukcje dla AI:

1. **Przeczytaj prompt template:**
   - Otwórz `.agent/resources/project_generator_prompt.md`
   - Zapoznaj się ze strukturą plików i zasadami generowania

2. **Zbierz dane od użytkownika:**
   - Jeśli użytkownik podał notatki — użyj ich
   - Jeśli nie — zadaj pytania:
     - Nazwa projektu i krótki opis?
     - Stack technologiczny?
     - Czas trwania i rola?
     - Status (completed/in-progress/archived)?
     - Główne wyzwania/decyzje?
     - Linki (live, GitHub)?

3. **Wygeneruj 4 pliki:**
   - `meta.json` — metadane projektu
   - `config.ts` — konfiguracja wizualna
   - `pl.mdx` — polska treść
   - `en.mdx` — angielskie tłumaczenie

4. **Zwróć w formacie gotowym do wklejenia:**
   - Każdy plik w osobnym bloku kodu
   - Dodaj nagłówki z nazwami plików
   - Podpowiedz ścieżkę docelową: `content/projects/[slug]/`

5. **Po wygenerowaniu:**
   - Zapytaj czy użytkownik chce zapisać pliki automatycznie
   - Jeśli tak — użyj Write tool do stworzenia struktury folderów
   - Jeśli nie — użytkownik skopiuje ręcznie

---

## Przykład wywołania:

**User:**
```
/generate-project

Dashboard analityczny, Next.js + TypeScript, 2 miesiące solo.
Główne wyzwanie: optymalizacja renderowania 10k rekordów.
Live: dashboard.example.com, GitHub: github.com/user/dashboard
```

**AI:**
1. Czyta `.agent/resources/project_generator_prompt.md`
2. Generuje 4 pliki według wzorca
3. Zwraca bloki kodu z plikami
4. Pyta: "Zapisać automatycznie do `content/projects/analytics-dashboard/`?"

---

## Tips:

- Używaj tego workflow po rozmowie o projekcie
- Możesz wygenerować szkic i dopiero potem editować ręcznie
- Jeśli nie wiesz jak wypełnić `facts` lub `process` — pomiń, AI doda sugestie
