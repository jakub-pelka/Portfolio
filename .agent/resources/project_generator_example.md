# 🚀 Przykład użycia Project Generator

## Scenariusz: Dodajesz nowy projekt do portfolio

### Krok 1: Zbierz notatki
Rozmawiasz z samym sobą / klientem i notujesz:

```
Projekt: Dashboard analityczny dla e-commerce
Stack: Next.js 14, TypeScript, Recharts, Tailwind CSS
Czas: 2 miesiące (solo)
Status: Completed
Featured: Tak (to był mój główny projekt w Q1 2024)

Główne wyzwania:
- Optymalizacja renderowania 10k+ rekordów w tabelach
- Real-time update metryki sprzedaży (SSE)
- Responsywność wykresów na mobile

Decyzje:
- Wybrałem Recharts zamiast Chart.js bo lepsza integracja z Reactem
- SSE zamiast WebSockets bo jedno-kierunkowa komunikacja wystarczyła

Live: https://dashboard.example.com
GitHub: https://github.com/user/analytics-dashboard
```

### Krok 2: Użyj promptu
Wklej do Claude/GPT:

```
Przeczytaj plik `.agent/resources/project_generator_prompt.md` i wygeneruj 4 pliki dla projektu:

[wklej notatki z kroku 1]
```

### Krok 3: Otrzymaj gotowe pliki
AI zwróci 4 bloki kodu — skopiuj i wklej do folderu projektu:

```bash
content/projects/analytics-dashboard/
├── meta.json
├── config.ts
├── pl.mdx
└── en.mdx
```

### Krok 4: Dodaj assety (opcjonalnie)
Umieść zrzuty ekranu:

```bash
content/projects/analytics-dashboard/assets/
├── thumbnail.jpg
├── hero.jpg
└── gallery/
    ├── screenshot-1.png
    └── screenshot-2.png
```

### Krok 5: Skopiuj do public
Aby Next.js mógł serwować obrazy:

```bash
cp -r content/projects/analytics-dashboard/assets public/projects/analytics-dashboard/
```

### Krok 6: Przetestuj
```bash
npm run dev
# Otwórz http://localhost:3000/pl/projects
```

---

## 💡 Pro Tips:

1. **Trzymaj notatki w Obsidian/Notion** — łatwiej editować przed wklejeniem do AI
2. **Używaj tego samego formatu notatek** — AI nauczy się Twojego stylu
3. **Review AI output** — sprawdź czy daty się zgadzają, czy tłumaczenie EN jest naturalne
4. **Iteruj** — jeśli AI coś źle zrozumiało, doprecyzuj i wygeneruj ponownie

---

## 🔄 Aktualizacja istniejącego projektu:

Jeśli chcesz dodać nowy wpis do `process`:

```
Dodaj do projektu "analytics-dashboard" nowy wpis process:

Type: insight
Title: "SSE okazało się bardziej stabilne niż myślałem"
Content: "Po 3 miesiącach na produkcji, SSE nie sprawiło żadnych problemów z reconnect. Fallback do polling nie był potrzebny."
Date: 2024-04-15
```

AI dopisze wpis do obu plików MDX (PL + EN) w sekcji frontmatter `process`.
