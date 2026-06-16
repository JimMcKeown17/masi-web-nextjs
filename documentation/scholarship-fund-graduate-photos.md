# Scholarship Fund — graduate photo convert list

The redesigned Scholarship Fund page (`/programs/top-learners`) renders a gold monogram
tile wherever a real graduate portrait is not yet present. To switch a portrait on:

1. Convert the graduate's PNG (in Google Drive) to **webp**.
2. Upload it to **Google Cloud Storage** at the path in the table below
   (bucket = `NEXT_PUBLIC_GCS_BUCKET_NAME`, folder `images/Graduates/`).
3. In the component, **uncomment the `image:` line** for that graduate (the exact line is
   already in the file, commented, with the right path).

No code changes beyond uncommenting are needed: `GraduatePortrait` shows the photo when
`image` is set and the monogram tile otherwise.

## webp specs
- Portrait orientation. The carousel renders at ~520px tall, the featured strip at 3:4.
- Target **~700–800px wide**, quality ~80, aim for **< 120 KB**.
- Faces are anchored to the top (`object-top`), so head-and-shoulders framing is safest.

## Carousel — `src/components/programs/top-learners/graduate-stories-section.tsx`

| Graduate | Qualification | Source magazine | Target path (GCS) |
|---|---|---|---|
| Babalwa Otola | Marine Engineering | 2025 | `images/Graduates/babalwa-otola.webp` |
| Esethu Ndlungwana | Bachelor of Science | 2024 | `images/Graduates/esethu-ndlungwane.webp` |
| Pilani Nama | National Diploma, Analytical Chemistry | 2024 | `images/Graduates/pilani-nama.webp` |
| Sanelisiwe Shiyani | BCom Accounting | 2024 | `images/Graduates/sanelise-shiyani.webp` |
| Aphelele Njajula | Diploma, Analytical Chemistry | 2024 | `images/Graduates/aphelele-njajula.webp` |
| Sibabalwe Magala | Advanced Diploma, Economics | 2025 | `images/Graduates/sibabalwe-magala.webp` |

## Featured strip — `src/components/programs/top-learners/featured-graduate-section.tsx`

| Graduate | Qualification | Source magazine | Target path (GCS) |
|---|---|---|---|
| Aphiwe Magaya | MSc Applied Mathematics | 2024 | `images/Graduates/aphiwe-magaya.webp` |

## Pillar strips — `src/components/programs/top-learners/pillars-section.tsx`

These two use generic, illustrative photos (`tl-photo-2.webp`, `tl-photo-3.webp`), not the
quoted graduate, so a name caption is deliberately not shown. Swapping them is **optional**:

- **Houses of Excellence** — quote is Amlindile Maneli (Diploma in Management, 2024). A
  candid photo inside a House of Excellence works best here.
- **Girls Scholarship Fund** — quote is Pontso Lekaba (BEng Tech Electrical Engineering,
  2025). A portrait of a young woman graduate works best here.

If you do want to feature the quoted person's own photo in a pillar, convert it the same
way and replace the `image` path in `PILLARS`.

## Quote accuracy
All quotes are the graduates' own words from the magazines, lightly trimmed. Before going
live, give them one read against the source PDFs in case any wording should be adjusted.
