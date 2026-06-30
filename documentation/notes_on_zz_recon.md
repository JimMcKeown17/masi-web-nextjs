Claude finding: 3 are already in the 2026 Airtable schools base (have airtable_id) but came through without a uid â Lingelethu, Msobomvu Full Service, Stephen Mazungula (all Primary). Fix: fill/repair school_uid on those 3 Airtable records, re-sync. Quick.
My answer: These have uid's in Airtable, so something must be amiss with the link. Msobomvu is SCH-00323. I wonder if the school sync should look to confirm that value.

- 12 are not in the 2026 Airtable schools base (no airtable_id; they're older school_id-only records) â mostly ECD/preschools (Baby Day Care, Kideo, Lukhanyiso, Nonkqubela, Sophakama, Thandabantwana, Emfundweni, Nceduluntu, Rise and Shine, Siyabulela) + Ben Nyathi + the "School 70" placeholder. Fix: decide which are real 2026 Masi sites, add them to the Airtable schools base (gets a uid), or retire the stale ones.
My answer: These are all real sites, however, their names are just slightly different in airtable. So I'm assuming they're showing up twice in our postgress schools backend. For example, 'Baby Daycare' (different spelling), Kideo Learning Center, Arise and Shine, Ben Nyati

However, there are a couple with exact name matches like Nonkqubela and Emfundweni. I'm not sure why they appear on your list. We probably need to get to the bottom of that.

--

Claude Findindg: Important nuance for the Zazi join: there are actually two distinct school-matching problems:
- Masi side (above): 15 Masi schools simply lack a school_uid.
- Zazi side: the ZZ backend has no native school_uid at all â it identifies schools by messy free-text (program_name in teampact_sessions_complete) and relies on a name-based mapping to Masi (sync_masi_identity). So even once the 15 are fixed, the Zazi per-school export still needs each ZZ school reliably mapped to a Masi school_uid. That mapping is the riskier half.

My answer: Yes, this is correct. However, creating a name map shouldn't be difficult and is a once off. Additional schools will not be dded to the ZZ backend. Worst case scenario, I manually create this mapping. But if you can surface the unmapped ones, I can do that mapping.

Claude Finding: 2. The ZZ â canonical reconciliation worklists
My answer: My staff is currently working on reconciling this. Until they do so, can you help me understand the implications? Is it that our school-programme-grid ONLY pulls children from the Masi canonical database and thus will undercount the actual children until they appear properly in that database?

Claude Findindg: - zazi-session-active-not-in-canonical*.csv / zazi-likely-missing-import*.csv — the supersets; zazi_reconcile.py is the script that regenerates them all.
My answer: Why aren't we suggesting adding back in all of the active-not-in-canconical? Is it b/c some of them are duplicates? I'm trying to determine exactly how you created some of these lists.